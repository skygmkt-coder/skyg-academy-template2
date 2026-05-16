import Link from "next/link";

import { requireAdmin } from "@/lib/engines/auth/helpers";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <section className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Admin</p>
      <h1 className="text-2xl font-semibold text-slate-950">Administracion</h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">
        La base protegida de administracion esta lista. El catalogo se gestiona desde productos.
      </p>
      <Link
        href="/admin/productos"
        className="inline-flex min-h-11 items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
      >
        Ir a productos
      </Link>
    </section>
  );
}
