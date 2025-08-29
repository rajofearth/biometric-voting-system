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
      const res = await verifyFace({}, fd) as { success?: boolean; error?: string; similarity?: number };
      if ((res as any)?.error) {
        toast.error((res as any).error);
        return;
      }
      if (res?.success) {
        toast.success(`Face verified! Distance: ${(res.similarity || 0).toFixed(4)}`);
        router.push("/dashboard");
      } else {
        toast.error(`Face mismatch. Distance: ${(res.similarity || 0).toFixed(4)}. Try again.`);
      }
    } finally {
      setLoading(false);
    }
  }, [video, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Face Verification</h1>
      <FaceCamera onReady={onReady} className="w-[320px] h-[240px] rounded-lg border" />
      <Button onClick={onVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </Button>
      <p className="text-sm text-muted-foreground">Ensure good lighting and keep your face centered.</p>
    </div>
  );
}


