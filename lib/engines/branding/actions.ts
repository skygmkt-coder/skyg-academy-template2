"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/engines/auth/helpers";
import { legalSettingsFormSchema } from "@/lib/engines/branding/validation";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateLegalSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = legalSettingsFormSchema.safeParse({
    legalName: formString(formData, "legalName"),
    taxId: formString(formData, "taxId"),
    country: formString(formData, "country"),
    state: formString(formData, "state"),
    address: formString(formData, "address"),
    legalEmail: formString(formData, "legalEmail"),
    privacyPolicy: formString(formData, "privacyPolicy"),
    termsConditions: formString(formData, "termsConditions"),
    cookiesPolicy: formString(formData, "cookiesPolicy"),
    legalNotice: formString(formData, "legalNotice")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Configuracion legal invalida.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brand_settings")
    .update({
      legal_name: parsed.data.legalName,
      tax_id: parsed.data.taxId,
      country: parsed.data.country,
      state: parsed.data.state,
      address: parsed.data.address,
      legal_email: parsed.data.legalEmail,
      privacy_policy: parsed.data.privacyPolicy,
      terms_conditions: parsed.data.termsConditions,
      cookies_policy: parsed.data.cookiesPolicy,
      legal_notice: parsed.data.legalNotice
    })
    .eq("id", true);

  if (error) {
    throw new Error(`No pudimos guardar la configuracion legal: ${error.message}`);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/legal");
  revalidatePath("/legal/privacy");
  revalidatePath("/legal/terms");
  revalidatePath("/legal/cookies");
  revalidatePath("/legal/disclaimer");
  revalidatePath("/");
}
