import { z } from "zod";

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color invalido");

export const brandSettingsSchema = z.object({
  brandName: z.string().trim().min(1).max(120),
  logoUrl: z.string().url().nullable(),
  primaryColor: hexColorSchema,
  accentColor: hexColorSchema,
  legalName: z.string().max(240),
  taxId: z.string().max(80),
  country: z.string().max(120),
  state: z.string().max(120),
  address: z.string().max(1000),
  legalEmail: z.string().max(240),
  privacyPolicy: z.string().max(80000),
  termsConditions: z.string().max(80000),
  cookiesPolicy: z.string().max(80000),
  legalNotice: z.string().max(80000),
  privacyUpdatedAt: z.string(),
  termsUpdatedAt: z.string(),
  cookiesUpdatedAt: z.string(),
  legalNoticeUpdatedAt: z.string()
});

export const legalSettingsFormSchema = z.object({
  legalName: z.string().trim().max(240),
  taxId: z.string().trim().max(80),
  country: z.string().trim().max(120),
  state: z.string().trim().max(120),
  address: z.string().trim().max(1000),
  legalEmail: z
    .string()
    .trim()
    .max(240)
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Email legal invalido."),
  privacyPolicy: z.string().max(80000),
  termsConditions: z.string().max(80000),
  cookiesPolicy: z.string().max(80000),
  legalNotice: z.string().max(80000)
});
