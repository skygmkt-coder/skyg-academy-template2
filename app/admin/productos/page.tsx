import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { createProductDraftAction } from "@/lib/engines/catalog/actions";
import { formatMxn } from "@/lib/engines/catalog/helpers";
import { listAdminProducts } from "@/lib/engines/catalog/service";
import { requireAdmin } from "@/lib/engines/auth/helpers";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listAdminProducts();

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Catalogo"
        title="Productos"
        description="Administra el catalogo legacy que convive con la nueva experiencia de cursos."
        actions={
        <form action={createProductDraftAction} className="flex gap-2">
          <label className="sr-only" htmlFor="new-product-title">
            Nuevo producto
          </label>
          <input
            id="new-product-title"
            name="title"
            required
            placeholder="Nuevo producto"
            className="min-h-10 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm text-ink-primary shadow-soft"
          />
          <button type="submit" className="min-h-10 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft">
            Crear draft
          </button>
        </form>
        }
      />
      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-surface-base p-8 text-sm text-ink-secondary shadow-soft">
          No hay productos todavia.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface-base shadow-soft">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/productos/${product.id}`}
              className="grid gap-2 border-b border-line-subtle p-4 transition last:border-0 hover:bg-surface-muted md:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <h2 className="font-semibold text-ink-primary">{product.title}</h2>
                <p className="text-sm text-ink-secondary">/{product.slug}</p>
              </div>
              <span className="text-sm text-ink-secondary">{formatMxn(product.priceMxnCents)}</span>
              <span className={`text-sm font-medium ${product.isPublished ? "text-emerald-700" : "text-ink-muted"}`}>
                {product.isPublished ? "Publicado" : "Draft"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
