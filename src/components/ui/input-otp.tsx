"use client"

import * as React from "react"
import { OTPInput, SlotProps } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentProps<typeof OTPInput>>(
  ({ className, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center", className)}
      {...props}
    />
  )
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<React.ElementRef<"div">, SlotProps & { className?: string }>(
  ({ char, hasFakeCaret, isActive, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative h-10 w-10 text-center text-base font-medium",
          "border border-border rounded-md",
          "focus-within:z-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-background",
          isActive && "z-10 ring-2 ring-ring ring-offset-background",
          className
        )}
        {...props}
      >
        <div className="flex h-full w-full items-center justify-center">
          {char}
        </div>
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
            <div className="h-4 w-px bg-foreground duration-150" />
          </div>
        )}
      </div>
    )
  }
)
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentProps<"div">>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <Dot />
    </div>
  )
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }