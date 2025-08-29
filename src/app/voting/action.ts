"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validatedAction } from "@/lib/action-helpers";
import crypto from "crypto";

// Schema for casting a vote
const CastVoteSchema = z.object({
  candidateId: z.string().uuid(),
});

// Schema for vote verification
const VerifyVoteSchema = z.object({
  voteToken: z.string(),
});

// Get user's constituency and candidates
export async function getUserVotingData() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        constituencyId: true,
        hasVoted: true,
        voteToken: true,
        constituency: {
          select: {
            id: true,
            name: true,
            state: true,
            candidates: {
              select: {
                id: true,
                name: true,
                party: true,
                symbol: true,
                photo: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (!user.constituencyId) {
      return { error: "No constituency assigned" };
    }

    return {
      success: true,
      data: {
        constituency: user.constituency,
        hasVoted: user.hasVoted,
        voteToken: user.voteToken,
      },
    };
  } catch (error) {
    console.error("Error getting voting data:", error);
    return { error: "Failed to get voting data" };
  }
}

// Cast a vote
export const castVote = validatedAction(CastVoteSchema, async (data) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }

  const { candidateId } = data;

  try {
    // Check if user has already voted
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        constituencyId: true,
        hasVoted: true,
        voteToken: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.hasVoted) {
      return { error: "You have already voted" };
    }

    if (!user.constituencyId) {
      return { error: "No constituency assigned" };
    }

    // Verify candidate exists and belongs to user's constituency
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        constituencyId: user.constituencyId,
      },
    });

    if (!candidate) {
      return { error: "Invalid candidate" };
    }

    // Generate unique vote token
    const voteToken = crypto.randomBytes(32).toString('hex');

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Create the vote record
      await tx.vote.create({
        data: {
          voteToken,
          candidateId,
          constituencyId: user.constituencyId,
        },
      });

      // Update user to mark as voted and store vote token
      await tx.user.update({
        where: { id: user.id },
        data: {
          hasVoted: true,
          voteToken,
        },
      });

      // Update constituency total voters count
      await tx.constituency.update({
        where: { id: user.constituencyId },
        data: {
          totalVoters: {
            increment: 1,
          },
        },
      });
    });

    return { 
      success: true, 
      voteToken,
      message: "Vote cast successfully" 
    };
  } catch (error) {
    console.error("Error casting vote:", error);
    return { error: "Failed to cast vote" };
  }
});

// Verify a vote (without revealing who voted)
export const verifyVote = validatedAction(VerifyVoteSchema, async (data) => {
  const { voteToken } = data;

  try {
    const vote = await prisma.vote.findUnique({
      where: { voteToken },
      select: {
        id: true,
        createdAt: true,
        candidate: {
          select: {
            name: true,
            party: true,
          },
        },
        constituency: {
          select: {
            name: true,
            state: true,
          },
        },
      },
    });

    if (!vote) {
      return { error: "Invalid vote token" };
    }

    return {
      success: true,
      data: {
        candidateName: vote.candidate.name,
        party: vote.candidate.party,
        constituency: vote.constituency.name,
        state: vote.constituency.state,
        votedAt: vote.createdAt,
      },
    };
  } catch (error) {
    console.error("Error verifying vote:", error);
    return { error: "Failed to verify vote" };
  }
});

// Get election results (admin function)
export async function getElectionResults() {
  try {
    const results = await prisma.constituency.findMany({
      select: {
        id: true,
        name: true,
        state: true,
        totalVoters: true,
        candidates: {
          select: {
            id: true,
            name: true,
            party: true,
            symbol: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: results.map(constituency => ({
        ...constituency,
        candidates: constituency.candidates.map(candidate => ({
          ...candidate,
          voteCount: candidate._count.votes,
        })),
      })),
    };
  } catch (error) {
    console.error("Error getting election results:", error);
    return { error: "Failed to get election results" };
  }
}

// Assign constituency to user (admin function)
export async function assignConstituency(userId: string, constituencyId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { constituencyId },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Error assigning constituency:", error);
    return { error: "Failed to assign constituency" };
  }
}
