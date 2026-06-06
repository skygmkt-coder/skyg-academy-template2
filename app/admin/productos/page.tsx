import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

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
          <div className="flex flex-col gap-3 border-b border-line-subtle bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-primary">{products.length} productos</p>
              <p className="mt-1 text-xs text-ink-muted">Seleccion multiple y borrado masivo estan pendientes de conectar a una accion destructiva segura.</p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-muted opacity-70"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
              Bulk delete pendiente
            </button>
          </div>
          {products.map((product) => (
            <article key={product.id} className="grid gap-3 border-b border-line-subtle p-4 transition last:border-0 hover:bg-surface-muted md:grid-cols-[auto_1fr_auto_auto] md:items-center">
              <input type="checkbox" disabled aria-label={`Seleccionar ${product.title}`} className="mt-1 h-4 w-4 rounded border-line-subtle md:mt-0" />
              <div>
                <h2 className="font-semibold text-ink-primary">{product.title}</h2>
                <p className="text-sm text-ink-secondary">/{product.slug}</p>
              </div>
              <span className="text-sm text-ink-secondary">{formatMxn(product.priceMxnCents)}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${product.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-surface-muted text-ink-muted"}`}>
                  {product.isPublished ? "Publicado" : "Draft"}
                </span>
                <Link href={`/admin/productos/${product.id}`} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-secondary">
                  <Pencil aria-hidden className="h-4 w-4" />
                  Edit
                </Link>
                {product.isPublished ? (
                  <Link href={`/productos/${product.slug}`} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-secondary">
                    <ExternalLink aria-hidden className="h-4 w-4" />
                    Revisar
                  </Link>
                ) : null}
                <button type="button" disabled className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-muted opacity-70">
                  <Trash2 aria-hidden className="h-4 w-4" />
                  Delete pendiente
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
