"use client";

import { FACE_DETECTION } from "@/lib/constants";

let modelsLoaded = false;
let faceapi: any = null;

// Dynamically import face-api only on the client side
async function getFaceApi() {
  if (typeof window === 'undefined') {
    throw new Error('Face API is only available on the client side');
  }
  
  if (!faceapi) {
    faceapi = await import("@vladmandic/face-api");
  }
  
  return faceapi;
}

export async function loadModels(base = "/models") {
  if (modelsLoaded) return;
  
  try {
    const faceApi = await getFaceApi();
    await faceApi.nets.tinyFaceDetector.loadFromUri(base);
    await faceApi.nets.faceLandmark68Net.loadFromUri(base);
    await faceApi.nets.faceRecognitionNet.loadFromUri(base);
    modelsLoaded = true;
  } catch (error) {
    console.error("Error loading face models:", error);
    throw error;
  }
}

export async function computeDescriptor(video: HTMLVideoElement): Promise<number[] | null> {
  try {
    // Ensure video is playing and has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Video not ready yet");
      return null;
    }

    const faceApi = await getFaceApi();
    
    const detection = await faceApi
      .detectSingleFace(video, new faceApi.TinyFaceDetectorOptions({ 
        inputSize: FACE_DETECTION.INPUT_SIZE, 
        scoreThreshold: FACE_DETECTION.SCORE_THRESHOLD
      }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection?.descriptor) {
      console.warn("No face detected or descriptor extraction failed");
      return null;
    }

    const descriptor = Array.from(detection.descriptor);
    return descriptor;
  } catch (error) {
    console.error("Error computing face descriptor:", error);
    return null;
  }
}