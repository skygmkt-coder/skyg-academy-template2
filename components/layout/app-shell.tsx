import type { ReactNode } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import type { BrandSettings } from "@/lib/engines/branding/types";
import type { Profile } from "@/lib/engines/auth/types";

type AppShellProps = {
  brand: BrandSettings;
  profile: Profile;
  children: ReactNode;
};

export function AppShell({ brand, profile, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <BrandMark brand={brand} />
          <nav aria-label="Navegacion principal" className="flex items-center gap-3 text-sm">
            {profile.role === "admin" ? (
              <>
                <Link className="font-medium text-slate-700 hover:text-brand-primary" href="/admin">
                  Admin
                </Link>
                <Link className="font-medium text-slate-700 hover:text-brand-primary" href="/admin/productos">
                  Productos
                </Link>
                <Link className="font-medium text-slate-700 hover:text-brand-primary" href="/admin/pagos">
                  Pagos
                </Link>
              </>
            ) : null}
            <Link className="font-medium text-slate-700 hover:text-brand-primary" href="/mis-productos">
              Mis productos
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
