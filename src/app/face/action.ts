"use server";

import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const DescriptorSchema = z.object({
  descriptor: z.array(z.number()).min(128).max(128),
});

const FACE_COOKIE = "fv";

export async function enrollFace(_: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" } as const;

  const payload = formData.get("payload");
  if (typeof payload !== "string") return { error: "Invalid payload" } as const;

  const parsed = DescriptorSchema.safeParse(JSON.parse(payload));
  if (!parsed.success) return { error: "Invalid descriptor" } as const;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { faceDescriptor: JSON.stringify(parsed.data.descriptor) },
  });

  return { success: true } as const;
}

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

export async function verifyFace(_: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" } as const;

  const payload = formData.get("payload");
  if (typeof payload !== "string") return { error: "Invalid payload" } as const;

  const parsed = DescriptorSchema.safeParse(JSON.parse(payload));
  if (!parsed.success) return { error: "Invalid descriptor" } as const;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { faceDescriptor: true },
  });

  if (!user?.faceDescriptor) return { error: "No enrolled face" } as const;

  const stored = JSON.parse(user.faceDescriptor) as number[];
  const distance = euclideanDistance(stored, parsed.data.descriptor);
  // Lower distance = more similar faces
  // Typical thresholds: 0.2-0.4 for same person, 0.6+ for different people
  // We want distance < 0.4 for strict verification
  const passed = distance < 0.4;
  
  console.log(`Face verification - Distance: ${distance.toFixed(4)}, Threshold: 0.4, Passed: ${passed}`);
  console.log(`Stored descriptor length: ${stored.length}, Current descriptor length: ${parsed.data.descriptor.length}`);

  if (!passed) return { success: false, similarity: distance } as const;

  const c = await cookies();
  c.set(`${FACE_COOKIE}:${session.session.id}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastFaceVerified: new Date() },
  });

  return { success: true, similarity: distance } as const;
}

export async function isSessionFaceVerified() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return false;
  const c = await cookies();
  return c.get(`fv:${session.session.id}`)?.value === "1";
}


