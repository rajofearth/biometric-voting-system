"use server";

import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { FACE_VERIFICATION, FACE_DETECTION } from "@/lib/constants";
import type { FaceVerificationResult, FaceEnrollmentResult } from "@/lib/types";

const DescriptorSchema = z.object({
  descriptor: z.array(z.number()).length(FACE_DETECTION.DESCRIPTOR_LENGTH),
});



export async function enrollFace(_: unknown, formData: FormData): Promise<FaceEnrollmentResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const payload = formData.get("payload");
  if (typeof payload !== "string") return { error: "Invalid payload" };

  const parsed = DescriptorSchema.safeParse(JSON.parse(payload));
  if (!parsed.success) return { error: "Invalid descriptor" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { faceDescriptor: JSON.stringify(parsed.data.descriptor) },
  });

  return { success: true };
}

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

export async function verifyFace(_: unknown, formData: FormData): Promise<FaceVerificationResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const payload = formData.get("payload");
  if (typeof payload !== "string") return { error: "Invalid payload" };

  const parsed = DescriptorSchema.safeParse(JSON.parse(payload));
  if (!parsed.success) return { error: "Invalid descriptor" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { faceDescriptor: true },
  });

  if (!user?.faceDescriptor) return { error: "No enrolled face" };

  const stored = JSON.parse(user.faceDescriptor) as number[];
  const distance = euclideanDistance(stored, parsed.data.descriptor);
  // Lower distance = more similar faces
  // Typical thresholds: 0.2-0.4 for same person, 0.6+ for different people
  const passed = distance < FACE_VERIFICATION.EUCLIDEAN_THRESHOLD;
  
  // Log verification attempt for debugging
  console.log(`Face verification - Distance: ${distance.toFixed(4)}, Threshold: ${FACE_VERIFICATION.EUCLIDEAN_THRESHOLD}, Passed: ${passed}`);

  if (!passed) return { success: false, similarity: distance };

  const c = await cookies();
  c.set(`${FACE_VERIFICATION.COOKIE_NAME}:${session.session.id}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: FACE_VERIFICATION.COOKIE_MAX_AGE,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastFaceVerified: new Date() },
  });

  return { success: true, similarity: distance };
}

export async function isSessionFaceVerified() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return false;
  const c = await cookies();
  return c.get(`${FACE_VERIFICATION.COOKIE_NAME}:${session.session.id}`)?.value === "1";
}