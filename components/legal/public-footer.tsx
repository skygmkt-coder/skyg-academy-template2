import Link from "next/link";

import type { BrandSettings } from "@/lib/engines/branding/types";

type PublicFooterProps = {
  brand: BrandSettings;
  navigationLinks?: Array<{ href: string; label: string }>;
};

const legalLinks = [
  { href: "/legal/privacy", label: "Privacidad" },
  { href: "/legal/terms", label: "Terminos" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/disclaimer", label: "Aviso Legal" }
];

export function PublicFooter({ brand, navigationLinks = [] }: PublicFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-4 py-10 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{brand.brandName}</p>
          {brand.legalName ? <p className="mt-1 text-sm">{brand.legalName}</p> : null}
          {brand.legalEmail ? <p className="mt-1 text-sm">{brand.legalEmail}</p> : null}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm sm:justify-end">
          {navigationLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
