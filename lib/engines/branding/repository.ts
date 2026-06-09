import { createClient } from "@/lib/supabase/server";
import type { BrandSettings } from "@/lib/engines/branding/types";
import { DATA_FETCH_TIMEOUT_MS, safeData, withTimeout } from "@/src/services/performance";

function fallbackBrandSettings(): BrandSettings {
  const now = new Date(0).toISOString();

  return {
    brandName: "SaaS Platform",
    logoUrl: null,
    primaryColor: "#0c60a0",
    accentColor: "#14b8a6",
    legalName: "",
    taxId: "",
    country: "",
    state: "",
    address: "",
    legalEmail: "",
    privacyPolicy: "",
    termsConditions: "",
    cookiesPolicy: "",
    legalNotice: "",
    privacyUpdatedAt: now,
    termsUpdatedAt: now,
    cookiesUpdatedAt: now,
    legalNoticeUpdatedAt: now
  };
}

export async function getBrandSettings(): Promise<BrandSettings> {
  return safeData({
    label: "brand_settings",
    fallback: fallbackBrandSettings(),
    timeoutMs: DATA_FETCH_TIMEOUT_MS.BRAND_SETTINGS,
    load: async () => {
      const supabase = await createClient();
      const { data, error } = await withTimeout(
        supabase
          .from("brand_settings")
          .select("brand_name,logo_url,primary_color,accent_color,legal_name,tax_id,country,state,address,legal_email,privacy_policy,terms_conditions,cookies_policy,legal_notice,privacy_updated_at,terms_updated_at,cookies_updated_at,legal_notice_updated_at")
          .single(),
        DATA_FETCH_TIMEOUT_MS.BRAND_SETTINGS,
        "brand_settings query"
      );

      if (error || !data) {
        return fallbackBrandSettings();
      }

      return {
        brandName: data.brand_name,
        logoUrl: data.logo_url,
        primaryColor: data.primary_color,
        accentColor: data.accent_color,
        legalName: data.legal_name ?? "",
        taxId: data.tax_id ?? "",
        country: data.country ?? "",
        state: data.state ?? "",
        address: data.address ?? "",
        legalEmail: data.legal_email ?? "",
        privacyPolicy: data.privacy_policy ?? "",
        termsConditions: data.terms_conditions ?? "",
        cookiesPolicy: data.cookies_policy ?? "",
        legalNotice: data.legal_notice ?? "",
        privacyUpdatedAt: data.privacy_updated_at ?? new Date(0).toISOString(),
        termsUpdatedAt: data.terms_updated_at ?? new Date(0).toISOString(),
        cookiesUpdatedAt: data.cookies_updated_at ?? new Date(0).toISOString(),
        legalNoticeUpdatedAt: data.legal_notice_updated_at ?? new Date(0).toISOString()
      };
    }
  });
}
