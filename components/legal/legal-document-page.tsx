import Link from "next/link";

import { PublicFooter } from "@/components/legal/public-footer";
import type { BrandSettings } from "@/lib/engines/branding/types";

type LegalDocumentPageProps = {
  brand: BrandSettings;
  title: string;
  eyebrow: string;
  content: string;
  updatedAt: string;
};

function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return "Sin fecha registrada";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function LegalDocumentPage({ brand, content, eyebrow, title, updatedAt }: LegalDocumentPageProps) {
  const hasContent = content.trim().length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-semibold text-slate-950">
              {brand.brandName.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-sm font-semibold text-white">{brand.brandName}</span>
          </Link>
          <Link href="/cursos" className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200">
            Cursos
          </Link>
        </div>
      </header>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 text-sm leading-6 text-slate-400">Ultima actualizacion: {formatUpdatedAt(updatedAt)}</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5 text-sm leading-6 text-slate-300 shadow-soft">
              <p className="font-semibold text-white">{brand.legalName || brand.brandName}</p>
              {brand.taxId ? <p className="mt-2">Tax ID: {brand.taxId}</p> : null}
              {[brand.address, brand.state, brand.country].filter(Boolean).length > 0 ? (
                <p className="mt-2">{[brand.address, brand.state, brand.country].filter(Boolean).join(", ")}</p>
              ) : null}
              {brand.legalEmail ? <p className="mt-2">{brand.legalEmail}</p> : null}
            </div>
          </aside>

          <article className="rounded-lg border border-white/10 bg-white p-6 text-slate-950 shadow-float sm:p-8 lg:p-10">
            {hasContent ? (
              <div className="whitespace-pre-line text-sm leading-7 text-slate-700">{content}</div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-950">Documento pendiente de configurar</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  El contenido se mostrara aqui cuando el administrador lo guarde desde el panel legal del workspace.
                </p>
              </div>
            )}
          </article>
        </div>
      </section>

      <PublicFooter brand={brand} />
    </main>
  );
}
