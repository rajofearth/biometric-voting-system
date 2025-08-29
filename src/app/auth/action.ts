"use server";

import { validatedAction } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import { LoginSchema, SignUpSchema, OTPSchema } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const signUpWithAadhar = validatedAction(SignUpSchema, async (data) => {
  const { aadharNumber, name, phoneNumber } = data;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { aadharNumber }
    });

    if (existingUser) {
      return { error: "An account with this Aadhar number already exists" };
    }

    // Send OTP to the phone number
    const { data: otpData, error: otpError } = await authClient.phoneNumber.sendOtp({
      phoneNumber,
    });

    if (otpError) {
      return { error: otpError.message || "Failed to send OTP" };
    }

    // Store temporary data in session for verification
    // This will be handled by the phone number plugin
    return { 
      success: true, 
      message: "OTP sent successfully. Please check your phone and enter the code.",
      phoneNumber,
      aadharNumber,
      name
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Failed to initiate sign up process" };
  }
});

export const loginWithAadhar = validatedAction(LoginSchema, async (data) => {
  const { aadharNumber } = data;

  try {
    // Find user by Aadhar number
    const user = await prisma.user.findUnique({
      where: { aadharNumber }
    });
    
    if (!user) {
      return { error: "No account found with this Aadhar number" };
    }

    // Send OTP to the user's phone number
    const { data: otpData, error: otpError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: user.phoneNumber,
    });

    if (otpError) {
      return { error: otpError.message || "Failed to send OTP" };
    }

    return { 
      success: true, 
      message: "OTP sent successfully. Please check your phone and enter the code.",
      phoneNumber: user.phoneNumber,
      userId: user.id
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to initiate login process" };
  }
});

export const verifyOTP = validatedAction(OTPSchema, async (data) => {
  const { code } = data;

  try {
    // Verify OTP using the phone number plugin
    const { data: verifyData, error: verifyError } = await authClient.phoneNumber.verify({
      code,
      phoneNumber: "", // This will be handled by the session
    });

    if (verifyError) {
      return { error: verifyError.message || "Invalid OTP" };
    }

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { error: "Failed to verify OTP" };
  }
});