"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";
import { sendAadharOTP, verifyAadharOTP } from "@/app/auth/action";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [aadharNumber, setAadharNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"aadhar" | "otp">("aadhar");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  const handleSendOTP = async () => {
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

    setLoading(true);
    try {
      const result = await sendAadharOTP({ aadharNumber: aadharNumber.trim() });
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setPhoneNumber(result.phoneNumber || "");
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
      }
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
      const result = await verifyAadharOTP({ 
        aadharNumber: aadharNumber.trim(),
        code: otp.trim()
      });
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("Successfully signed in!");
        router.push("/face/verify");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      if (error?.message?.includes("Too many attempts")) {
        toast.error("Too many attempts. Please request a new OTP.");
        setStep("aadhar");
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
      const result = await sendAadharOTP({ aadharNumber: aadharNumber.trim() });
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
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
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAadhar = () => {
    setStep("aadhar");
    setOtp("");
    setCountdown(0);
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
          Sign In
        </Button>
        
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="ghost"
            onClick={handleBackToAadhar}
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

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Sign In with Aadhar</h3>
        <p className="text-sm text-muted-foreground">
          Enter your Aadhar number to receive a verification code
        </p>
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
          className="text-center bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border"
        />
        <p className="text-xs text-muted-foreground text-center">
          12-digit Aadhar number without spaces
        </p>
      </div>
      
      <Button
        onClick={handleSendOTP}
        disabled={loading || !aadharNumber.trim() || aadharNumber.length !== 12}
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Verification Code
      </Button>
    </div>
  );
}