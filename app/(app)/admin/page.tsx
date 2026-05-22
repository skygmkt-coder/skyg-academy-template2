import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/engines/auth/helpers";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Administracion"
        description="La base protegida de administracion esta lista. Gestiona cursos, productos y pagos desde un panel unificado."
        actions={
          <Link
            href="/admin/cursos"
            className="inline-flex min-h-10 items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            Ir a cursos
          </Link>
        }
      />
      <Link
        href="/admin/productos"
        className="inline-flex min-h-10 items-center rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary shadow-soft"
      >
        Ir a productos
      </Link>
    </section>
  );
}
