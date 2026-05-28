"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type LandingMobileMenuProps = {
  links: Array<{ href: string; label: string }>;
};

export function LandingMobileMenu({ links }: LandingMobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/12 bg-white/8 text-white backdrop-blur md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menu"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-x-3 top-3 rounded-lg border border-white/12 bg-slate-950/96 p-4 text-white shadow-float">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">Navegacion</span>
              <button
                type="button"
                aria-label="Cerrar menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/12 bg-white/8"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <nav className="mt-5 grid gap-2" aria-label="Navegacion movil">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-medium text-slate-200"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-md bg-white px-3 py-3 text-sm font-semibold text-slate-950"
                onClick={() => setOpen(false)}
              >
                Entrar
              </Link>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
