import { z } from "zod";

export const AadharSchema = z.object({
  aadharNumber: z.string()
    .length(12, "Aadhar number must be exactly 12 digits")
    .regex(/^\d{12}$/, "Aadhar number must contain only digits"),
});

export const PhoneNumberSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format"),
});

export const SignUpSchema = z.object({
  aadharNumber: z.string()
    .length(12, "Aadhar number must be exactly 12 digits")
    .regex(/^\d{12}$/, "Aadhar number must contain only digits"),
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format"),
});

export const LoginSchema = z.object({
  aadharNumber: z.string()
    .length(12, "Aadhar number must be exactly 12 digits")
    .regex(/^\d{12}$/, "Aadhar number must contain only digits"),
});

export const OTPSchema = z.object({
  code: z.string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

// Face verification types
export type FaceVerificationResult = 
  | { success: true; similarity: number }
  | { success: false; similarity: number }
  | { error: string };

export type FaceEnrollmentResult = 
  | { success: true }
  | { error: string };