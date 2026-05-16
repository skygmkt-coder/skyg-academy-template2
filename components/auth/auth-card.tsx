import type { ReactNode } from "react";

import { BrandMark } from "@/components/layout/brand-mark";
import type { BrandSettings } from "@/lib/engines/branding/types";

type AuthCardProps = {
  brand: BrandSettings;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ brand, title, subtitle, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <BrandMark brand={brand} />
        <div className="mt-8">
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
