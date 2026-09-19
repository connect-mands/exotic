"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Calendar,
  Check,
  Loader2,
  Mail,
  MapPin,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { destinationOptions, destinations } from "@/config/destinations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormIconField } from "@/components/ui/form-icon-field";
import { WhatsAppOtpField } from "@/components/forms/whatsapp-otp-field";
import {
  durationToShort,
  packageSelectPrimary,
  packageSelectSecondary,
  packagesByDuration,
  uniquePackageDurations,
} from "@/lib/package-form";
import { enquirySchema, type EnquiryFormValues } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { DestinationConfig, DestinationSlug } from "@/types/destination";

interface EnquiryFormProps {
  destination: DestinationConfig;
  defaultPackageId?: string;
  onSuccess?: () => void;
  className?: string;
  variant?: "default" | "hero";
  /** Stack duration + package dropdowns in one column (popup form) */
  stackPackageDropdowns?: boolean;
  /** Unique id so hero + popup forms do not clash (duplicate dropdown options) */
  formId?: string;
}

const heroInputClass = "quote-form-input";
const heroSelectClass = "quote-form-select w-full text-left";

export function EnquiryForm({
  destination,
  defaultPackageId,
  onSuccess,
  className,
  variant = "default",
  stackPackageDropdowns = false,
  formId: formIdProp,
}: EnquiryFormProps) {
  const isHero = variant === "hero";
  const autoFormId = useId();
  const formId = formIdProp ?? (isHero ? "hero" : "modal");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [activeSlug, setActiveSlug] = useState<DestinationSlug>(destination.slug);

  const packageDurations = uniquePackageDurations(destination.packages);
  const initialPackage =
    destination.packages.find((p) => p.id === defaultPackageId) ??
    destination.packages[0];
  const [travelDuration, setTravelDuration] = useState(
    initialPackage?.duration ?? packageDurations[0] ?? ""
  );

  const activeDestination =
    activeSlug === destination.slug
      ? destination
      : destinations[activeSlug];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      city: "",
      persons: "",
      destination: destination.slug,
      packageId: defaultPackageId ?? destination.packages[0]?.id ?? "",
      flightBooked: "no",
    },
  });

  const watchedPackageId = watch("packageId");
  const watchedMobile = watch("mobile");

  useEffect(() => {
    if (defaultPackageId) setValue("packageId", defaultPackageId);
  }, [defaultPackageId, setValue]);

  useEffect(() => {
    const pkg = destination.packages.find((p) => p.id === watchedPackageId);
    if (pkg && pkg.duration !== travelDuration) {
      setTravelDuration(pkg.duration);
    }
  }, [watchedPackageId, destination.packages, travelDuration]);

  useEffect(() => {
    const pkg = destination.packages.find((p) => p.id === defaultPackageId);
    if (pkg) setTravelDuration(pkg.duration);
  }, [defaultPackageId, destination.packages]);

  useEffect(() => {
    if (!isHero) {
      setValue("destination", activeSlug);
      const first = activeDestination.packages[0]?.id;
      if (first) setValue("packageId", first);
    }
  }, [activeSlug, activeDestination.packages, setValue, isHero]);

  async function onSubmit(values: EnquiryFormValues) {
    if (!whatsappVerified) {
      setSubmitError("Please verify your WhatsApp number before submitting.");
      return;
    }

    setSubmitError(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send enquiry");
      }
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded border border-green-300 bg-green-50 p-4 text-center text-green-900"
        role="status"
      >
        <p className="font-semibold">Email has been sent successfully!</p>
        <p className="mt-1 text-sm">We will contact you shortly.</p>
      </div>
    );
  }

  const flightField = (
    <fieldset className={cn("space-y-2.5", isHero && "pt-1")}>
      <legend
        className={cn(
          "mb-1 font-medium text-gray-700",
          isHero ? "text-xs" : "text-sm font-semibold text-gray-800"
        )}
      >
        Have you booked your flight/train?
      </legend>
      <Controller
        name="flightBooked"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-6">
            {(["yes", "no"] as const).map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                {isHero ? (
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border-2 transition-colors",
                      field.value === value
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-400 bg-white"
                    )}
                  >
                    {field.value === value && (
                      <span className="size-1.5 rounded-full bg-white" />
                    )}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex size-[18px] items-center justify-center rounded-[3px] border-2 transition-colors",
                      field.value === value
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-400 bg-white"
                    )}
                  >
                    {field.value === value && (
                      <Check className="size-3 stroke-[3]" />
                    )}
                  </span>
                )}
                <input
                  type="radio"
                  className="sr-only"
                  checked={field.value === value}
                  onChange={() => field.onChange(value)}
                />
                {value === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
        )}
      />
      {errors.flightBooked && (
        <p className="text-xs text-red-600">{errors.flightBooked.message}</p>
      )}
    </fieldset>
  );

  const packagesForDuration = packagesByDuration(
    destination.packages,
    travelDuration || (packageDurations[0] ?? "")
  );

  if (isHero) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("space-y-3", className)}
        noValidate
      >
        <input type="hidden" {...register("destination")} />

        <div className="grid grid-cols-2 gap-3">
          <FormIconField icon={User} variant="hero" error={errors.fullName?.message}>
            <Input
              id="fullName"
              placeholder="Your Name"
              className={heroInputClass}
              {...register("fullName")}
            />
          </FormIconField>
          <FormIconField icon={Mail} variant="hero" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="Email Address (optional)"
              className={heroInputClass}
              {...register("email")}
            />
          </FormIconField>
        </div>

        <WhatsAppOtpField
          variant="hero"
          inputId={`${formId}-mobile`}
          error={errors.mobile?.message}
          phoneValue={watchedMobile}
          phoneInput={register("mobile")}
          triggerPhoneValidation={() => trigger("mobile")}
          onVerifiedChange={setWhatsappVerified}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormIconField icon={MapPin} variant="hero" error={errors.city?.message}>
            <Input
              id={`${formId}-city`}
              placeholder="Your City"
              className={heroInputClass}
              {...register("city")}
            />
          </FormIconField>
          <FormIconField icon={Users} variant="hero" error={errors.persons?.message}>
            <Input
              id={`${formId}-persons`}
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              placeholder="No. of Persons"
              className={heroInputClass}
              aria-invalid={!!errors.persons}
              {...register("persons")}
            />
          </FormIconField>
        </div>

        <Controller
          name="packageId"
          control={control}
          render={({ field }) => (
            <div
              className={cn(
                "gap-3",
                stackPackageDropdowns ? "flex flex-col" : "grid grid-cols-2"
              )}
            >
              <FormIconField icon={Calendar} variant="hero">
                <Select
                  key={`${formId}-${autoFormId}-duration`}
                  value={travelDuration}
                  onValueChange={(duration) => {
                    if (!duration) return;
                    setTravelDuration(duration);
                    const first = packagesByDuration(
                      destination.packages,
                      duration
                    )[0];
                    if (first) field.onChange(first.id);
                  }}
                >
                  <SelectTrigger className={heroSelectClass}>
                    <SelectValue placeholder="Travel Duration" />
                  </SelectTrigger>
                  <SelectContent sideOffset={6}>
                    {packageDurations.map((d) => (
                      <SelectItem key={`${formId}-dur-${d}`} value={d}>
                        <span className="font-semibold text-gray-900">
                          {durationToShort(d)}
                        </span>
                        <span className="text-xs text-gray-500">{d}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormIconField>
              <FormIconField
                icon={Calendar}
                variant="hero"
                error={errors.packageId?.message}
              >
                <Select
                  key={`${formId}-${autoFormId}-package`}
                  value={field.value}
                  onValueChange={(value) => {
                    if (!value) return;
                    field.onChange(value);
                    const pkg = destination.packages.find(
                      (p) => p.id === value
                    );
                    if (pkg) setTravelDuration(pkg.duration);
                  }}
                >
                  <SelectTrigger className={heroSelectClass}>
                    <SelectValue placeholder="Choose Package" />
                  </SelectTrigger>
                  <SelectContent sideOffset={6}>
                    {packagesForDuration.map((pkg) => (
                      <SelectItem
                        key={`${formId}-pkg-${pkg.id}`}
                        value={pkg.id}
                      >
                        <span className="font-semibold text-gray-900">
                          {packageSelectPrimary(pkg)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {packageSelectSecondary(pkg)} · from ₹
                          {pkg.priceFrom}/-
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormIconField>
            </div>
          )}
        />

        {flightField}

        <div className="quote-form-privacy">
          <Shield className="mt-0.5 size-4 shrink-0 text-gray-400" aria-hidden />
          <p>
            100% Privacy Guaranteed. Your information is safe with us and will
            never be shared.
          </p>
        </div>

        {submitError && (
          <p className="text-xs font-medium text-red-600" role="alert">
            {submitError}
          </p>
        )}

        {!whatsappVerified && (
          <p className="text-[11px] font-medium text-gray-500">
            Verify your WhatsApp number to send this enquiry.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !whatsappVerified}
          className="quote-form-submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              SEND ENQUIRY
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-3", className)}
      noValidate
    >
      <div className="space-y-1">
        <Label htmlFor="fullName-modal">Full Name</Label>
        <Input id="fullName-modal" className="h-10 bg-white" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email-modal">Email Address (optional)</Label>
        <Input
          id="email-modal"
          type="email"
          className="h-10 bg-white"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <WhatsAppOtpField
        variant="default"
        inputId={`${formId}-mobile`}
        error={errors.mobile?.message}
        phoneValue={watchedMobile}
        phoneInput={register("mobile")}
        triggerPhoneValidation={() => trigger("mobile")}
        onVerifiedChange={setWhatsappVerified}
      />

      <div className="space-y-1">
        <Label htmlFor={`${formId}-city`}>Your City</Label>
        <Input id={`${formId}-city`} className="h-10 bg-white" {...register("city")} />
        {errors.city && (
          <p className="text-xs text-red-600">{errors.city.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="persons-modal">Number of Persons</Label>
        <Input
          id="persons-modal"
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          placeholder="No. of Persons"
          className="h-10 bg-white"
          aria-invalid={!!errors.persons}
          {...register("persons")}
        />
        {errors.persons && (
          <p className="text-xs text-red-600">{errors.persons.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Destination</Label>
        <Controller
          name="destination"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v);
                setActiveSlug(v as DestinationSlug);
              }}
            >
              <SelectTrigger className="h-10 w-full bg-white">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {destinationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1">
        <Label>Choose your Package</Label>
        <Controller
          name="packageId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-10 w-full bg-white">
                <SelectValue placeholder="Choose your package" />
              </SelectTrigger>
              <SelectContent sideOffset={6}>
                {activeDestination.packages.map((pkg) => (
                  <SelectItem key={`${formId}-modal-${pkg.id}`} value={pkg.id}>
                    <span className="font-semibold text-gray-900">
                      {packageSelectPrimary(pkg)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {packageSelectSecondary(pkg)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.packageId && (
          <p className="text-xs text-red-600">{errors.packageId.message}</p>
        )}
      </div>

      {flightField}

      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      {!whatsappVerified && (
        <p className="text-xs font-medium text-gray-500">
          Verify your WhatsApp number to send this enquiry.
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !whatsappVerified}
        className="h-11 w-full rounded-full bg-[var(--brand-teal)] font-bold uppercase text-white hover:bg-[var(--brand-teal-dark)]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          "Send Enquiry"
        )}
      </Button>
    </form>
  );
}
