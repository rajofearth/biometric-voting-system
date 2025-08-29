"use server";

import { validatedAction } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import { LoginSchema, SignUpSchema, OTPSchema } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { PrismaClient } from "@/generated/prisma";
import axios from "axios";

const prisma = new PrismaClient();

// Helper function to send OTP via TextBee
const sendOTPViaTextBee = async (phoneNumber: string, code: string) => {
  try {
    const BASE_URL = 'https://api.textbee.dev/api/v1';
    const API_KEY = process.env.SMS_API_KEY;
    const DEVICE_ID = process.env.DEVICE_ID;

    if (!API_KEY || !DEVICE_ID) {
      throw new Error('SMS API credentials not configured');
    }

    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
      {
        recipients: [phoneNumber],
        message: `Your OTP for biometric voting system is: ${code}. Valid for 5 minutes.`
      },
      { 
        headers: { 
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log(`OTP sent to ${phoneNumber}: ${code}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

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

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send OTP via TextBee
    await sendOTPViaTextBee(phoneNumber, otp);

    // Store temporary data in session for verification
    // We'll use the better-auth phone number plugin's session management
    const { data: otpData, error: otpError } = await authClient.phoneNumber.sendOtp({
      phoneNumber,
    });

    if (otpError) {
      return { error: otpError.message || "Failed to send OTP" };
    }

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

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send OTP via TextBee
    await sendOTPViaTextBee(user.phoneNumber, otp);

    // Use better-auth phone number plugin for session management
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

// New function to handle user creation after OTP verification
export const createUserAfterOTP = validatedAction(SignUpSchema, async (data) => {
  const { aadharNumber, name, phoneNumber } = data;

  try {
    // Create user in database
    const user = await prisma.user.create({
      data: {
        aadharNumber,
        name,
        phoneNumber,
        phoneVerified: true,
      }
    });

    return { success: true, user };
  } catch (error) {
    console.error("User creation error:", error);
    return { error: "Failed to create user account" };
  }
});