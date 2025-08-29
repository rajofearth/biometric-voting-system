"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Shield, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { updateUserDetails } from "@/app/auth/action";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [name, setName] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "phone" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const handleNextToPhone = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!aadharNumber.trim()) {
      toast.error("Please enter your Aadhar number");
      return;
    }

    // Validate Aadhar number (12 digits)
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadharNumber.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 12-digit Aadhar number");
      return;
    }

    setStep("phone");
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber: phoneNumber.trim(),
      });
      
      setStep("otp");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP code");
      return;
    }

    setLoading(true);
    try {
      const isVerified = await authClient.phoneNumber.verify({
        phoneNumber: phoneNumber.trim(),
        code: otp.trim(),
        disableSession: false,
      });

      if (isVerified) {
        // Update user details with name and Aadhar number
        const updateResult = await updateUserDetails({
          name: name.trim(),
          aadharNumber: aadharNumber.trim(),
          phoneNumber: phoneNumber.trim(),
        });

        if (updateResult?.error) {
          toast.error(updateResult.error);
        } else {
          toast.success("Account created successfully!");
          router.push("/dashboard");
        }
      } else {
        toast.error("Invalid OTP code. Please try again.");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      if (error?.message?.includes("Too many attempts")) {
        toast.error("Too many attempts. Please request a new OTP.");
        setStep("phone");
        setOtp("");
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber: phoneNumber.trim(),
      });
      
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setCountdown(0);
  };

  const handleBackToDetails = () => {
    setStep("details");
  };

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Enter Verification Code</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a 6-digit code to {phoneNumber}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border"
          />
        </div>
        
        <Button
          onClick={handleVerifyOTP}
          disabled={loading || !otp.trim()}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
        
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="ghost"
            onClick={handleBackToPhone}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleResendOTP}
            disabled={loading || countdown > 0}
            className="text-muted-foreground hover:text-foreground"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "phone") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Enter Phone Number</h3>
          <p className="text-sm text-muted-foreground">
            We'll send a verification code to your phone
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="text-center bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border"
          />
        </div>
        
        <Button
          onClick={handleSendOTP}
          disabled={loading || !phoneNumber.trim()}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Verification Code
        </Button>

        <Button
          variant="ghost"
          onClick={handleBackToDetails}
          disabled={loading}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          ← Back to Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Create Your Account</h3>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="aadhar">Aadhar Number</Label>
        <Input
          id="aadhar"
          type="text"
          placeholder="123456789012"
          value={aadharNumber}
          onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
          maxLength={12}
          className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border"
        />
        <p className="text-xs text-muted-foreground">
          12-digit Aadhar number without spaces
        </p>
      </div>
      
      <Button
        onClick={handleNextToPhone}
        disabled={!name.trim() || !aadharNumber.trim() || aadharNumber.length !== 12}
        className="w-full"
      >
        Next
      </Button>
    </div>
  );
}