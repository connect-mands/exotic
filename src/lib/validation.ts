import { z } from "zod";

export const enquirySchema = z.object({
  fullName: z
    .string()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z
    .string()
    .transform((val) => val.replace(/\D/g, "").slice(-10))
    .pipe(
      z
        .string()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    ),
  city: z.string().min(2, "Please enter your city").max(80),
  persons: z
    .string()
    .min(1, "Please enter number of persons")
    .refine((val) => /^\d+$/.test(val.trim()), {
      message: "Enter a valid whole number",
    })
    .refine((val) => {
      const n = Number(val.trim());
      return n >= 1 && n <= 99;
    }, "Enter a number between 1 and 99"),
  destination: z.string().min(1, "Please select a destination"),
  packageId: z.string().min(1, "Please choose your package"),
  flightBooked: z.enum(["yes", "no"], {
    message: "Please select flight/train booking status",
  }),
});

export const compactEnquirySchema = z.object({
  packageId: z.string().min(1, "Please choose your package"),
  flightBooked: z.enum(["yes", "no"], {
    message: "Please select flight/train booking status",
  }),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;
export type CompactEnquiryValues = z.infer<typeof compactEnquirySchema>;
