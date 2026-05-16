import { z } from "zod";

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color invalido");

export const brandSettingsSchema = z.object({
  brandName: z.string().trim().min(1).max(120),
  logoUrl: z.string().url().nullable(),
  primaryColor: hexColorSchema,
  accentColor: hexColorSchema
});
