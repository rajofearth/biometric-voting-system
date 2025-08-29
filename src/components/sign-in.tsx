"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useTransition, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginWithAadhar, verifyOTP } from "@/app/auth/action";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [isPending, startTransition] = useTransition();
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const router = useRouter();

  const handleAadharSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await loginWithAadhar({}, formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setPhoneNumber(result.phoneNumber);
        setAadharNumber(formData.get("aadharNumber") as string);
        setOtpSent(true);
        toast.success(result.message);
      }
    });
  };

  const handleOTPSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await verifyOTP({}, formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("Successfully signed in!");
        router.push("/face/verify");
      }
    });
  };

  const handleResendOTP = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("aadharNumber", aadharNumber);
      
      const result = await loginWithAadhar({}, formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("OTP resent successfully!");
      }
    });
  };

  if (!otpSent) {
    return (
      <form action={handleAadharSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aadharNumber" className="text-foreground">
            Aadhar Number
          </Label>
          <Input
            id="aadharNumber"
            name="aadharNumber"
            type="text"
            placeholder="123456789012"
            maxLength={12}
            pattern="\d{12}"
            required
            className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border"
          />
          <p className="text-xs text-muted-foreground">
            Enter your 12-digit Aadhar number
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : null}
          Send OTP
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          OTP sent to {phoneNumber}
        </p>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={handleResendOTP}
          disabled={isPending}
          className="text-xs"
        >
          Resend OTP
        </Button>
      </div>

      <form action={handleOTPSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp" className="text-foreground">
            Enter OTP
          </Label>
          <InputOTP
            value={otpValue}
            onChange={(value) => {
              setOtpValue(value);
              // Auto-submit when 6 digits are entered
              if (value.length === 6) {
                const formData = new FormData();
                formData.append("code", value);
                handleOTPSubmit(formData);
              }
            }}
            maxLength={6}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2">
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} />
                ))}
              </InputOTPGroup>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your phone
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || otpValue.length !== 6}
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : null}
          Verify OTP
        </Button>
      </form>
    </div>
  );
}