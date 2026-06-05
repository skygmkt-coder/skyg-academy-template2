import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export default async function TermsConditionsPage() {
  const brand = await getActiveBrandSettings();

  return (
    <LegalDocumentPage
      brand={brand}
      eyebrow="Legal"
      title="Terminos y condiciones"
      content={brand.termsConditions}
      updatedAt={brand.termsUpdatedAt}
    />
  );
}
