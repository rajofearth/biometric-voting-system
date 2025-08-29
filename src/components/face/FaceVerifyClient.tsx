"use client";

import { useCallback, useState } from "react";
import FaceCamera from "./FaceCamera";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { computeDescriptor, loadModels } from "./faceApi";
import { verifyFace } from "@/app/face/action";
import { useRouter } from "next/navigation";

export default function FaceVerifyClient() {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const router = useRouter();

  const onReady = useCallback(async (v: HTMLVideoElement) => {
    await loadModels();
    setVideo(v);
  }, []);

  const onVerify = useCallback(async () => {
    if (!video) return;
    setLoading(true);
    try {
      // Small delay to ensure video is stable
      await new Promise(resolve => setTimeout(resolve, 500));
      const d = await computeDescriptor(video);
      if (!d) {
        toast.error("No face detected. Please align your face and try again.");
        return;
      }
      const fd = new FormData();
      fd.set("payload", JSON.stringify({ descriptor: d }));
      const res = await verifyFace({}, fd);
      if ('error' in res) {
        toast.error(res.error);
        return;
      }
      if (res.success) {
        toast.success(`Face verified! Distance: ${res.similarity.toFixed(4)}`);
        // Mark verification as complete
        setVerificationComplete(true);
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        toast.error(`Face mismatch. Distance: ${res.similarity.toFixed(4)}. Try again.`);
      }
    } finally {
      setLoading(false);
    }
  }, [video, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Face Verification</h1>
      {!verificationComplete && (
        <FaceCamera 
          onReady={onReady} 
          className="w-[320px] h-[240px] rounded-lg border" 
        />
      )}
      {verificationComplete && (
        <div className="w-[320px] h-[240px] rounded-lg border bg-green-500/20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-green-500 font-semibold">✓ Verification Successful!</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
      <Button onClick={onVerify} disabled={loading || verificationComplete}>
        {loading ? "Verifying..." : "Verify"}
      </Button>
      <p className="text-sm text-muted-foreground">Ensure good lighting and keep your face centered.</p>
    </div>
  );
}