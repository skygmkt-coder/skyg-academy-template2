import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export default async function CookiesPolicyPage() {
  const brand = await getActiveBrandSettings();

  return (
    <LegalDocumentPage
      brand={brand}
      eyebrow="Legal"
      title="Politica de cookies"
      content={brand.cookiesPolicy}
      updatedAt={brand.cookiesUpdatedAt}
    />
  );
}
