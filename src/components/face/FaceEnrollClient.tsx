"use client";

import { useCallback, useState } from "react";
import FaceCamera from "./FaceCamera";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { computeDescriptor, loadModels } from "./faceApi";
import { enrollFace } from "@/app/face/action";
import { useRouter } from "next/navigation";

export default function FaceEnrollClient() {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);
  const router = useRouter();

  const onReady = useCallback(async (v: HTMLVideoElement) => {
    await loadModels();
    setVideo(v);
  }, []);

  const onCapture = useCallback(async () => {
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
      const res = await enrollFace({}, fd);
      if ('error' in res) {
        toast.error(res.error);
      } else {
        toast.success("Face enrolled successfully");
        // Mark enrollment as complete
        setEnrollmentComplete(true);
        // Navigate to face verification after a short delay
        setTimeout(() => {
          router.push("/face/verify");
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  }, [video, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Enroll Your Face</h1>
      {!enrollmentComplete && (
        <FaceCamera 
          onReady={onReady} 
          className="w-[320px] h-[240px] rounded-lg border" 
        />
      )}
      {enrollmentComplete && (
        <div className="w-[320px] h-[240px] rounded-lg border bg-green-500/20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-green-500 font-semibold">✓ Enrollment Successful!</p>
            <p className="text-sm text-muted-foreground">Redirecting to verification...</p>
          </div>
        </div>
      )}
      <Button onClick={onCapture} disabled={loading || enrollmentComplete}>
        {loading ? "Saving..." : "Enroll"}
      </Button>
    </div>
  );
}