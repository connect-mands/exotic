"use client";

import { BadgeCheck, Loader2, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormIconField } from "@/components/ui/form-icon-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
} from "@/lib/whatsapp-otp-client";
import {
  isValidIndianMobile,
  normalizeIndianMobile,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 60;
const heroInputClass = "quote-form-input";

interface WhatsAppOtpFieldProps {
  variant: "hero" | "default";
  inputId: string;
  error?: string;
  phoneValue: string;
  phoneInput: UseFormRegisterReturn;
  triggerPhoneValidation: () => Promise<boolean>;
  onVerifiedChange: (verified: boolean) => void;
}

export function WhatsAppOtpField({
  variant,
  inputId,
  error,
  phoneValue,
  phoneInput,
  triggerPhoneValidation,
  onVerifiedChange,
}: WhatsAppOtpFieldProps) {
  const isHero = variant === "hero";
  const otpId = `${inputId}-otp`;
  const normalizedPhone = normalizeIndianMobile(phoneValue);
  const previousVerified = useRef(false);

  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "verifying" | "verified"
  >("idle");
  const [otp, setOtp] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [verifiedFor, setVerifiedFor] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [info, setInfo] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const isVerified =
    status === "verified" &&
    verifiedFor !== null &&
    verifiedFor === normalizedPhone;

  useEffect(() => {
    if (previousVerified.current !== isVerified) {
      previousVerified.current = isVerified;
      onVerifiedChange(isVerified);
    }
  }, [isVerified, onVerifiedChange]);

  useEffect(() => {
    if (verifiedFor && normalizedPhone !== verifiedFor) {
      setStatus("idle");
      setVerifiedFor(null);
      setSentTo(null);
      setOtp("");
      setResendIn(0);
      setInfo(null);
      setOtpError(null);
      return;
    }

    if (sentTo && normalizedPhone !== sentTo && status !== "verified") {
      setStatus("idle");
      setSentTo(null);
      setOtp("");
      setResendIn(0);
      setInfo(null);
      setOtpError(null);
    }
  }, [normalizedPhone, sentTo, status, verifiedFor]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => {
      setResendIn((seconds) => seconds - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function handleSendOtp() {
    setOtpError(null);
    setInfo(null);

    const valid = await triggerPhoneValidation();
    if (!valid) {
      return;
    }

    const phone = normalizeIndianMobile(phoneValue);
    if (!isValidIndianMobile(phone)) {
      setOtpError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setStatus("sending");
    const result = await sendWhatsAppOtp(phone);

    if (!result.ok) {
      if (result.retryAfterSeconds) {
        setResendIn(result.retryAfterSeconds);
      }
      setStatus(sentTo === phone ? "sent" : "idle");
      setOtpError(result.error ?? "Unable to send OTP");
      return;
    }

    setSentTo(phone);
    setStatus("sent");
    setOtp("");
    setResendIn(RESEND_SECONDS);
    setInfo(result.message ?? "OTP sent to your WhatsApp number");
  }

  async function handleVerifyOtp(code = otp) {
    if (status === "verifying" || isVerified) return;

    const digits = code.replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6) {
      setOtpError("Enter the 6-digit OTP sent on WhatsApp");
      return;
    }

    const phone = normalizeIndianMobile(phoneValue);
    setOtpError(null);
    setStatus("verifying");
    const result = await verifyWhatsAppOtp(phone, digits);

    if (!result.ok) {
      setStatus("sent");
      if (result.retryAfterSeconds) {
        setResendIn(result.retryAfterSeconds);
      }
      setOtpError(result.error ?? "Incorrect OTP. Please try again.");
      return;
    }

    setVerifiedFor(phone);
    setStatus("verified");
    setInfo(result.message ?? "WhatsApp number verified");
    setOtp("");
    setResendIn(0);
  }

  function onOtpChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    setOtpError(null);
    if (digits.length === 6) {
      void handleVerifyOtp(digits);
    }
  }

  const showOtpInput =
    (status === "sent" || status === "verifying") && !isVerified;
  const sending = status === "sending";
  const verifying = status === "verifying";
  const otpPending = showOtpInput || sending;

  const sideStatus = isVerified ? (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 font-semibold text-green-700",
        isHero ? "h-11 w-[7.25rem] text-[11px]" : "h-10 min-w-[7.5rem] text-xs"
      )}
      role="status"
    >
      <BadgeCheck className="size-4" aria-hidden />
      Verified
    </span>
  ) : otpPending ? (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-[#2081a1]/30 bg-[#2081a1]/5 px-2 text-center font-semibold leading-tight text-[#1a6a85]",
        isHero ? "h-11 w-[7.25rem] text-[11px]" : "h-10 min-w-[7.5rem] text-xs"
      )}
    >
      {sending ? "Sending…" : "OTP sent"}
    </span>
  ) : (
    <button
      type="button"
      onClick={() => void handleSendOtp()}
      disabled={sending}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-[#2081a1] bg-white px-2 text-center font-semibold leading-tight text-[#2081a1] transition-colors hover:bg-[#2081a1]/5 disabled:cursor-not-allowed disabled:opacity-60",
        isHero ? "h-11 w-[7.25rem] text-[11px]" : "h-10 min-w-[7.5rem] px-3 text-xs"
      )}
    >
      Verify WhatsApp Number
    </button>
  );

  const otpControls = showOtpInput ? (
    <div className="space-y-2">
      <div className={cn("flex items-start gap-2", isHero && "pt-0.5")}>
        <div className="min-w-0 flex-1 space-y-1">
          {isHero ? null : (
            <Label htmlFor={otpId} className="text-xs text-gray-600">
              Enter 6-digit OTP
            </Label>
          )}
          <Input
            id={otpId}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder={isHero ? "Enter 6-digit OTP" : "6-digit OTP"}
            value={otp}
            onChange={(event) => onOtpChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleVerifyOtp();
              }
            }}
            className={cn(
              isHero ? heroInputClass : "h-10 bg-white",
              isHero && "!pl-3 tracking-[0.35em]"
            )}
            aria-invalid={!!otpError}
            aria-describedby={`${otpId}-status`}
            disabled={verifying}
          />
        </div>
        <Button
          type="button"
          onClick={() => void handleVerifyOtp()}
          disabled={verifying || otp.length !== 6}
          className={cn(
            "shrink-0 bg-[#2081a1] text-white hover:bg-[#1a6a85]",
            isHero ? "h-11 px-3 text-xs" : "h-10 px-3 text-xs"
          )}
        >
          {verifying ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Verifying
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>
      </div>
      <p className="text-[11px] text-gray-500">
        {resendIn > 0 ? (
          <>Resend OTP in {resendIn}s</>
        ) : (
          <button
            type="button"
            className="font-semibold text-[#2081a1] underline-offset-2 hover:underline disabled:opacity-60"
            onClick={() => void handleSendOtp()}
            disabled={sending}
          >
            Resend OTP
          </button>
        )}
      </p>
    </div>
  ) : null;

  const messages = (
    <div id={`${otpId}-status`} className="space-y-1" aria-live="polite">
      {otpError ? (
        <p className="text-[11px] font-medium text-red-600" role="alert">
          {otpError}
        </p>
      ) : null}
      {info && !otpError ? (
        <p
          className={cn(
            "text-[11px] font-medium",
            isVerified ? "text-green-700" : "text-[#1a6a85]"
          )}
        >
          {info}
        </p>
      ) : null}
    </div>
  );

  if (isHero) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <FormIconField
            icon={Phone}
            variant="hero"
            error={error}
            className="min-w-0 flex-1"
          >
            <Input
              id={inputId}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="WhatsApp Number"
              className={heroInputClass}
              {...phoneInput}
            />
          </FormIconField>
          {sideStatus}
        </div>
        {otpControls}
        {messages}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={inputId}>WhatsApp / Mobile Number</Label>
        <div className="flex items-start gap-2">
          <Input
            id={inputId}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className="h-10 min-w-0 flex-1 bg-white"
            {...phoneInput}
          />
          {sideStatus}
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
      {otpControls}
      {messages}
    </div>
  );
}
