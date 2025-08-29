import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";
import { nextCookies } from "better-auth/next-js";
import { phoneNumber } from "better-auth/plugins";
import { textbeeService } from "./textbee";

const prisma = new PrismaClient();

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    async sendResetPassword({ user, url, token }, request) {
      // TODO: Implement email sending for password reset
      console.log(`Password reset email for ${user.email}: ${url}`);
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  user: {
    additionalFields: {
      // Add any additional user fields here if needed
    },
  },
  plugins: [
    nextCookies(),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, request) => {
        const result = await textbeeService.sendOTP(phoneNumber, code);
        if (!result.success) {
          throw new Error(`Failed to send OTP: ${result.error}`);
        }
      },
      sendPasswordResetOTP: async ({ phoneNumber, code }, request) => {
        const result = await textbeeService.sendOTP(phoneNumber, code);
        if (!result.success) {
          throw new Error(`Failed to send password reset OTP: ${result.error}`);
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber.replace(/[^0-9]/g, '')}@temp.sunx.com`;
        },
        getTempName: (phoneNumber) => {
          // We'll update this with the actual name from the form
          return `User ${phoneNumber}`;
        },
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      allowedAttempts: 3,
      requireVerification: true,
    }),
  ],
});