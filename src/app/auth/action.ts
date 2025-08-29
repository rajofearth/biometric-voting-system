"use server";

import { validatedAction } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import { LoginSchema, SignUpSchema } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { textbeeService } from "@/lib/textbee";
import { z } from "zod";

export const signUpEmail = validatedAction(SignUpSchema, async (data) => {
  const { email, password, firstName, lastName } = data;

  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: `${firstName} ${lastName}`,
    },
  });

  return { success: true };
});

export const loginEmail = validatedAction(LoginSchema, async (data) => {
  const { email, password } = data;

  await auth.api.signInEmail({
    body: { email, password },
  });

  return { success: true };
});

// Aadhar-based authentication schemas
const AadharSignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  aadharNumber: z.string().regex(/^\d{12}$/, "Aadhar number must be 12 digits"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
});

const AadharSignInSchema = z.object({
  aadharNumber: z.string().regex(/^\d{12}$/, "Aadhar number must be 12 digits"),
});

// Update user details after phone verification
export const updateUserDetails = validatedAction(z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  aadharNumber: z.string().regex(/^\d{12}$/, "Aadhar number must be 12 digits"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
}), async (data) => {
  const { name, aadharNumber, phoneNumber } = data;

  try {
    // Find user by phone number (since they just verified it)
    const user = await prisma.user.findFirst({
      where: { phoneNumber },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Update user with details
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        aadharNumber: aadharNumber.trim(),
        name: name.trim(),
        phoneNumberVerified: true
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user details:", error);
    return { error: "Failed to update user details" };
  }
});

export const sendAadharOTP = validatedAction(AadharSignInSchema, async (data) => {
  const { aadharNumber } = data;

  // Find user by Aadhar number
  const user = await prisma.user.findUnique({
    where: { aadharNumber },
    select: { phoneNumber: true, phoneNumberVerified: true }
  });

  if (!user) {
    return { error: "No account found with this Aadhar number" };
  }

  if (!user.phoneNumber) {
    return { error: "No phone number associated with this Aadhar number" };
  }

  if (!user.phoneNumberVerified) {
    return { error: "Phone number not verified. Please contact support." };
  }

  // Send OTP using better-auth phone number plugin
  try {
    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber: user.phoneNumber }
    });
    return { success: true, phoneNumber: user.phoneNumber };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { error: "Failed to send OTP. Please try again." };
  }
});

export const verifyAadharOTP = validatedAction(z.object({
  aadharNumber: z.string(),
  code: z.string().length(6, "OTP must be 6 digits"),
}), async (data) => {
  const { aadharNumber, code } = data;

  // Find user by Aadhar number
  const user = await prisma.user.findUnique({
    where: { aadharNumber },
    select: { id: true, phoneNumber: true }
  });

  if (!user) {
    return { error: "No account found with this Aadhar number" };
  }

  if (!user.phoneNumber) {
    return { error: "No phone number associated with this Aadhar number" };
  }

  // Verify OTP using better-auth
  try {
    const isVerified = await auth.api.verifyPhoneNumber({
      body: {
        phoneNumber: user.phoneNumber,
        code: code,
        disableSession: false,
      },
    });

    if (isVerified) {
      return { success: true };
    } else {
      return { error: "Invalid OTP code" };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { error: "Failed to verify OTP" };
  }
});