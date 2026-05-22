"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Search, X } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import type { DashboardNavGroup } from "@/components/layout/dashboard-navigation";
import type { BrandSettings } from "@/lib/engines/branding/types";
import type { Profile } from "@/lib/engines/auth/types";

type DashboardShellProps = {
  brand: BrandSettings;
  profile: Profile;
  navigation: DashboardNavGroup[];
  children: ReactNode;
};

const breadcrumbLabels: Record<string, string> = {
  admin: "Admin",
  cursos: "Cursos",
  productos: "Productos",
  pagos: "Pagos",
  "mis-productos": "Mis productos",
  learn: "Aprender"
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(profile: Profile) {
  const source = profile.fullName || profile.email;
  return source
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const label = breadcrumbLabels[segment] ?? (segment.length > 10 ? "Detalle" : segment);
      return { href, label };
    });
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumbs" className="hidden min-w-0 items-center gap-1 text-sm text-ink-muted md:flex">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.href} className="flex min-w-0 items-center gap-1">
            {index > 0 ? <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink-muted/70" /> : null}
            {isLast ? (
              <span className="truncate font-medium text-ink-secondary">{crumb.label}</span>
            ) : (
              <Link className="truncate hover:text-ink-primary" href={crumb.href}>
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function NavigationContent({
  navigation,
  pathname,
  onNavigate
}: {
  navigation: DashboardNavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Navegacion principal" className="space-y-6">
      {navigation.map((group) => (
        <section key={group.label} className="space-y-2">
          <p className="px-2 text-[0.7rem] font-semibold uppercase tracking-normal text-ink-muted">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={`${group.label}-${item.href}-${item.label}`}
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex min-h-10 items-center gap-3 rounded-md px-2.5 py-2 text-sm transition ${
                    active
                      ? "bg-brand-primary text-white shadow-soft"
                      : "text-ink-secondary hover:bg-surface-muted hover:text-ink-primary"
                  }`}
                >
                  <Icon
                    aria-hidden
                    className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-ink-muted group-hover:text-ink-primary"}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{item.label}</span>
                    {item.description ? (
                      <span className={`block truncate text-xs ${active ? "text-white/75" : "text-ink-muted"}`}>
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

export function DashboardShell({ brand, profile, navigation, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = getInitials(profile);

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line-subtle bg-surface-base/95 px-4 py-5 shadow-soft backdrop-blur xl:block">
        <div className="mb-8 px-2">
          <BrandMark brand={brand} />
        </div>
        <NavigationContent navigation={navigation} pathname={pathname} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Cerrar navegacion"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(22rem,88vw)] border-r border-line-subtle bg-surface-base px-4 py-5 shadow-float">
            <div className="mb-8 flex items-center justify-between gap-4 px-2">
              <BrandMark brand={brand} />
              <button
                type="button"
                aria-label="Cerrar menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line-subtle bg-surface-raised text-ink-secondary"
                onClick={() => setMobileOpen(false)}
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <NavigationContent navigation={navigation} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-line-subtle bg-surface-canvas/88 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Abrir menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line-subtle bg-surface-base text-ink-secondary xl:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu aria-hidden className="h-4 w-4" />
              </button>
              <div className="xl:hidden">
                <BrandMark brand={brand} compact />
              </div>
              <Breadcrumbs pathname={pathname} />
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
              <div className="hidden min-h-9 w-64 items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-3 text-sm text-ink-muted shadow-soft md:flex">
                <Search aria-hidden className="h-4 w-4" />
                <span className="truncate">Buscar cursos, alumnos, pagos...</span>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-primary text-xs font-semibold text-surface-base">
                {initials || "U"}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
