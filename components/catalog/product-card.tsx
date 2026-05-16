import Image from "next/image";
import Link from "next/link";

import { formatMxn } from "@/lib/engines/catalog/helpers";
import type { Product } from "@/lib/engines/catalog/types";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="relative aspect-[16/9] bg-slate-200">
          {product.coverImageUrl ? (
            <Image src={product.coverImageUrl} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
          ) : null}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded bg-brand-accent/10 px-2 py-1 text-xs font-medium text-slate-700">
              {product.type}
            </span>
            <span className="text-sm font-semibold text-slate-950">{formatMxn(product.priceMxnCents)}</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-950">{product.title}</h2>
          {product.subtitle ? <p className="text-sm leading-6 text-slate-600">{product.subtitle}</p> : null}
        </div>
      </Link>
    </article>
  );
}
