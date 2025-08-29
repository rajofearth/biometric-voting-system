import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FACE_VERIFICATION } from "@/lib/constants";
import { getUserVotingData } from "@/app/voting/action";
import EVMClient from "@/components/evm-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect("/auth");
  }

  // Enforce enrollment-first flow and active face verification for this session
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { faceDescriptor: true } });
  if (!user?.faceDescriptor) {
    redirect("/face/enroll");
  }

  const c = await cookies();
  const isFaceVerified = c.get(`${FACE_VERIFICATION.COOKIE_NAME}:${session.session.id}`)?.value === "1";
  if (!isFaceVerified) {
    redirect("/face/verify");
  }

  // Get user's voting data
  const votingData = await getUserVotingData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <EVMClient votingData={votingData} />
    </div>
  );
}
