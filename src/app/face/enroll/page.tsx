import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FaceEnrollClient from "@/components/face/FaceEnrollClient";
import { prisma } from "@/lib/prisma";

export default async function EnrollPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { faceDescriptor: true } });
  if (user?.faceDescriptor) redirect("/face/verify");

  return <FaceEnrollClient />;
}


