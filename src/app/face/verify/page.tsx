import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSessionFaceVerified } from "@/app/face/action";
import FaceVerifyClient from "@/components/face/FaceVerifyClient";
import { prisma } from "@/lib/prisma";

export default async function VerifyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const verified = await isSessionFaceVerified();
  if (verified) redirect("/dashboard");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { faceDescriptor: true } });
  if (!user?.faceDescriptor) redirect("/face/enroll");

  return <FaceVerifyClient />;
}


