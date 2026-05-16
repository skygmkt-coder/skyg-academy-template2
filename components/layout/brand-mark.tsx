import Image from "next/image";

import type { BrandSettings } from "@/lib/engines/branding/types";

type BrandMarkProps = {
  brand: BrandSettings;
};

export function BrandMark({ brand }: BrandMarkProps) {
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
      <span className="text-base font-semibold text-slate-950">{brand.brandName}</span>
    </div>
  );
}
