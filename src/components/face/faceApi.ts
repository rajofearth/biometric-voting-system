"use client";

import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;

export async function loadModels(base = "/models") {
  if (modelsLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(base);
  await faceapi.nets.faceLandmark68Net.loadFromUri(base);
  await faceapi.nets.faceRecognitionNet.loadFromUri(base);
  modelsLoaded = true;
}

export async function computeDescriptor(video: HTMLVideoElement): Promise<number[] | null> {
  try {
    // Ensure video is playing and has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Video not ready yet");
      return null;
    }

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 224, 
        scoreThreshold: 0.7 // Higher threshold for better face detection
      }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection?.descriptor) {
      console.warn("No face detected or descriptor extraction failed");
      return null;
    }

    const descriptor = Array.from(detection.descriptor);
    console.log("Face detected, descriptor length:", descriptor.length);
    return descriptor;
  } catch (error) {
    console.error("Error computing face descriptor:", error);
    return null;
  }
}


