import Link from "next/link";

import { createProductDraftAction } from "@/lib/engines/catalog/actions";
import { formatMxn } from "@/lib/engines/catalog/helpers";
import { listAdminProducts } from "@/lib/engines/catalog/service";
import { requireAdmin } from "@/lib/engines/auth/helpers";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listAdminProducts();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Catalogo</p>
          <h1 className="text-2xl font-semibold text-slate-950">Productos</h1>
        </div>
        <form action={createProductDraftAction} className="flex gap-2">
          <label className="sr-only" htmlFor="new-product-title">
            Nuevo producto
          </label>
          <input
            id="new-product-title"
            name="title"
            required
            placeholder="Nuevo producto"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="min-h-11 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
            Crear draft
          </button>
        </form>
      </div>
      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          No hay productos todavia.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/productos/${product.id}`}
              className="grid gap-2 border-b border-slate-200 p-4 last:border-0 md:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <h2 className="font-semibold text-slate-950">{product.title}</h2>
                <p className="text-sm text-slate-600">/{product.slug}</p>
              </div>
              <span className="text-sm text-slate-700">{formatMxn(product.priceMxnCents)}</span>
              <span className={`text-sm font-medium ${product.isPublished ? "text-emerald-700" : "text-slate-500"}`}>
                {product.isPublished ? "Publicado" : "Draft"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
