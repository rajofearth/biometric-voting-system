"use server";

import { headers } from "next/headers";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type UpdateProfileImageResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function updateProfileImage(formData: FormData): Promise<UpdateProfileImageResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided" };
  }

  if (file.size === 0) {
    return { success: false, error: "Empty file" };
  }

  const allowedMime = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ]);
  if (!allowedMime.has(file.type)) {
    return { success: false, error: "Unsupported file type" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {}

  const extFromName = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const extFromType = file.type.split("/").pop();
  const extension = (extFromName || extFromType || "png").toLowerCase();
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "");
  const fileName = `${session.user.id}-${Date.now()}.${safeExtension}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/${fileName}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: publicUrl },
  });

  return { success: true, url: publicUrl };
}

export type DeleteAccountResult = {
  success: boolean;
  error?: string;
};

export async function deleteAccount(): Promise<DeleteAccountResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get user data before deletion to clean up files
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    });

    // Clean up profile image file if it exists
    if (user?.image && user.image.startsWith('/uploads/')) {
      try {
        const imagePath = path.join(process.cwd(), "public", user.image);
        await fs.unlink(imagePath);
      } catch (fileError) {
        // Log but don't fail the deletion if file cleanup fails
        console.warn('Failed to delete profile image file:', fileError);
      }
    }

    // Delete user and all related data (cascade delete will handle sessions and accounts)
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    // Sign out the user (this will also invalidate the session)
    await auth.api.signOut({
      headers: await headers()
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: "Failed to delete account. Please try again." };
  }
}


