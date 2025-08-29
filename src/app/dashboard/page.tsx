import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FACE_VERIFICATION } from "@/lib/constants";
import AvatarUploader from "@/components/avatar-uploader";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/50 backdrop-blur-sm border-border/50 rounded-lg p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Biometric Voting System!
              </h1>
              <p className="text-muted-foreground">
                You are successfully authenticated and ready to vote
              </p>
            </div>
            <form action={async () => {
              "use server";
              await auth.api.signOut({
                headers: await headers()
              });
              redirect("/auth");
            }}>
              <Button 
                type="submit"
                variant="outline" 
                className="border-border/50 text-foreground hover:bg-muted"
              >
                Sign Out
              </Button>
            </form>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-2">Voter Information</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Name:</strong> {session.user.name}</p>
                <p><strong>Aadhar Number:</strong> {session.user.aadharNumber || "Not available"}</p>
                <p><strong>Phone Number:</strong> {session.user.phoneNumber || "Not available"}</p>
                <p><strong>Phone Verified:</strong> {session.user.phoneVerified ? "Yes" : "No"}</p>
                <p><strong>User ID:</strong> {session.user.id}</p>
                <p><strong>Created:</strong> {new Date(session.user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-2">Authentication Status</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Session ID:</strong> {session.session.id}</p>
                <p><strong>Expires:</strong> {new Date(session.session.expiresAt).toLocaleString()}</p>
                <p><strong>Face Enrolled:</strong> {user.faceDescriptor ? "Yes" : "No"}</p>
                <p><strong>Face Verified:</strong> {isFaceVerified ? "Yes" : "No"}</p>
                <p><strong>IP Address:</strong> {session.session.ipAddress || "Not available"}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-muted/50 rounded-lg p-4 border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-2">Profile Image</h3>
            <AvatarUploader src={session.user.image ?? null} alt="Profile" />
          </div>

          <div className="mt-6 bg-green-50 dark:bg-green-950/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Ready to Vote</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Your identity has been verified through Aadhar, OTP, and face recognition. You can now proceed to cast your vote.
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Cast Vote
            </Button>
          </div>

          <div className="mt-6 bg-red-50 dark:bg-red-950/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <DeleteAccountDialog />
          </div>
        </div>
      </div>
    </div>
  );
}
