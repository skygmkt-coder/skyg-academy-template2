import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export default async function PrivacyPolicyPage() {
  const brand = await getActiveBrandSettings();

  return (
    <LegalDocumentPage
      brand={brand}
      eyebrow="Legal"
      title="Politica de privacidad"
      content={brand.privacyPolicy}
      updatedAt={brand.privacyUpdatedAt}
    />
  );
}
