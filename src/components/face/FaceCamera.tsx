"use client";

import { useEffect, useRef, useCallback } from "react";

type Props = {
  onReady?: (video: HTMLVideoElement) => void;
  className?: string;
};

export default function FaceCamera({ onReady, className }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }, 
        audio: false 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready before playing
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            onReady?.(videoRef.current!);
          } catch (error) {
            console.error("Failed to play video:", error);
          }
        };
      }
    } catch (error) {
      console.error("Failed to start camera:", error);
    }
  }, [onReady]);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  return <video ref={videoRef} className={className} playsInline muted autoPlay />;
}


