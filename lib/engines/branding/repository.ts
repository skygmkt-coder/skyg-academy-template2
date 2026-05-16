import { createClient } from "@/lib/supabase/server";
import type { BrandSettings } from "@/lib/engines/branding/types";

function fallbackBrandSettings(): BrandSettings {
  return {
    brandName: "SaaS Platform",
    logoUrl: null,
    primaryColor: "#0c60a0",
    accentColor: "#14b8a6"
  };
}

export async function getBrandSettings(): Promise<BrandSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_settings")
    .select("brand_name,logo_url,primary_color,accent_color")
    .single();

  if (error || !data) {
    return fallbackBrandSettings();
  }

  return {
    brandName: data.brand_name,
    logoUrl: data.logo_url,
    primaryColor: data.primary_color,
    accentColor: data.accent_color
  };
}
