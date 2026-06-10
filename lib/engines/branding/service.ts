import { cache } from "react";

import { brandSettingsSchema } from "@/lib/engines/branding/validation";
import { getBrandSettings as getBrandSettingsFromRepository } from "@/lib/engines/branding/repository";
import type { BrandSettings } from "@/lib/engines/branding/types";

export const getActiveBrandSettings = cache(async (): Promise<BrandSettings> => {
  const settings = await getBrandSettingsFromRepository();
  return brandSettingsSchema.parse(settings);
});

export function hexToRgbTriplet(hex: string): string {
  const normalized = hex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}
