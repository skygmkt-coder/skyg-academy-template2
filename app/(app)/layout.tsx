import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/engines/auth/helpers";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const [{ profile }, brand] = await Promise.all([requireUser(), getActiveBrandSettings()]);

  return (
    <AppShell brand={brand} profile={profile}>
      {children}
    </AppShell>
  );
}
