import Image from "next/image";

import type { BrandSettings } from "@/lib/engines/branding/types";

type BrandMarkProps = {
  brand: BrandSettings;
  compact?: boolean;
};

export function BrandMark({ brand, compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      {brand.logoUrl ? (
        <Image
          src={brand.logoUrl}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 rounded object-contain"
        />
      ) : (
        <div aria-hidden className="h-9 w-9 rounded bg-brand-primary" />
      )}
      {compact ? null : <span className="truncate text-base font-semibold text-ink-primary">{brand.brandName}</span>}
    </div>
  );
}
