import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export default async function LegalNoticePage() {
  const brand = await getActiveBrandSettings();

  return (
    <LegalDocumentPage
      brand={brand}
      eyebrow="Legal"
      title="Aviso legal"
      content={brand.legalNotice}
      updatedAt={brand.legalNoticeUpdatedAt}
    />
  );
}
