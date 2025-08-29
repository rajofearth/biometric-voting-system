import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { PrismaClient } from "@/generated/prisma";
import { nextCookies } from "better-auth/next-js";
import axios from "axios";

const prisma = new PrismaClient();

const sendOTP = async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
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

export const auth = betterAuth({
  phoneNumber: {
    enabled: true,
    sendOTP,
    signUpOnVerification: {
      getTempEmail: (phoneNumber: string) => {
        return `${phoneNumber}@voting-system.com`;
      },
      getTempName: (phoneNumber: string) => {
        return phoneNumber;
      }
    },
    requireVerification: true,
    otpLength: 6,
    expiresIn: 300, // 5 minutes
  },
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  user: {
    additionalFields: {
      aadharNumber: { type: "string" },
      phoneNumber: { type: "string" },
      phoneVerified: { type: "boolean" },
    },
  },
  plugins: [nextCookies()],
});