import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { ProductCard } from "@/components/catalog/product-card";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";
import { listPublicProducts } from "@/lib/engines/catalog/service";

export default async function HomePage() {
  const [brand, products] = await Promise.all([getActiveBrandSettings(), listPublicProducts()]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <BrandMark brand={brand} />
          <Link className="text-sm font-medium text-brand-primary" href="/login">
            Entrar
          </Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">{brand.brandName}</p>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 md:text-5xl">
            Aprende con productos digitales claros y accionables.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Explora cursos y talleres publicados por el equipo.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">Catalogo disponible</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">{products.length}</p>
          <p className="mt-2 text-sm text-slate-600">Productos publicados</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Productos</h2>
            <p className="mt-1 text-sm text-slate-600">Cursos y talleres disponibles.</p>
          </div>
        </div>
        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
            Todavia no hay productos publicados.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
