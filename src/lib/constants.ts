// Face verification constants
export const FACE_VERIFICATION = {
  EUCLIDEAN_THRESHOLD: 0.4,
  COOKIE_NAME: "fv",
  COOKIE_MAX_AGE: 60 * 30, // 30 minutes
} as const;

// Face detection constants
export const FACE_DETECTION = {
  INPUT_SIZE: 224,
  SCORE_THRESHOLD: 0.7,
  DESCRIPTOR_LENGTH: 128,
} as const;
