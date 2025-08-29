# Face Verification System

This document describes the face verification system integrated into the biometric voting application.

## Overview

The face verification system uses face-api.js to provide secure biometric authentication. Users must enroll their face during sign-up and verify their identity during login.

## Architecture

### Components

- **FaceCamera**: Reusable camera component for face capture
- **FaceEnrollClient**: Enrollment interface for new users
- **FaceVerifyClient**: Verification interface for returning users
- **faceApi**: Utility functions for face detection and descriptor extraction

### Server Actions

- **enrollFace**: Stores face descriptor in database
- **verifyFace**: Compares current face with stored descriptor
- **isSessionFaceVerified**: Checks if current session is face-verified

### Database Schema

```sql
-- Added to User model
faceDescriptor   String?   -- JSON stringified 128-dimensional descriptor
lastFaceVerified DateTime? -- Timestamp of last successful verification
```

## Configuration

### Constants (`src/lib/constants.ts`)

```typescript
FACE_VERIFICATION = {
  EUCLIDEAN_THRESHOLD: 0.4,    // Distance threshold for verification
  COOKIE_NAME: "fv",           // Session verification cookie
  COOKIE_MAX_AGE: 60 * 30,     // 30 minutes validity
}

FACE_DETECTION = {
  INPUT_SIZE: 224,             // Face detection input size
  SCORE_THRESHOLD: 0.7,        // Face detection confidence
  DESCRIPTOR_LENGTH: 128,      // Face descriptor dimensions
}
```

## Flow

1. **Sign In**: User enters credentials → redirected to `/face/verify`
2. **Enrollment Check**: If no face enrolled → redirected to `/face/enroll`
3. **Face Verification**: Camera captures face → compares with stored descriptor
4. **Success**: Sets verification cookie → redirects to `/dashboard`
5. **Failure**: Shows error → user can retry

## Security

- **Euclidean Distance**: Uses proper distance metric for face comparison
- **Session-Scoped Cookies**: Verification tied to specific session
- **Strict Thresholds**: Configurable distance thresholds for accuracy
- **Server-Side Processing**: All verification logic on server

## Models Required

Download face-api.js models to `public/models/`:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model`

## Usage

```typescript
// Enroll face
const result = await enrollFace({}, formData);

// Verify face
const result = await verifyFace({}, formData);

// Check session verification
const isVerified = await isSessionFaceVerified();
```

## Troubleshooting

- **Video not playing**: Ensure HTTPS in production
- **Face not detected**: Check lighting and camera positioning
- **False positives**: Adjust `EUCLIDEAN_THRESHOLD` in constants
- **Model loading**: Verify models are in `public/models/` directory
