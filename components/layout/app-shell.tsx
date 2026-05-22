import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDashboardNavigation } from "@/components/layout/dashboard-navigation";
import type { BrandSettings } from "@/lib/engines/branding/types";
import type { Profile } from "@/lib/engines/auth/types";

type AppShellProps = {
  brand: BrandSettings;
  profile: Profile;
  children: ReactNode;
};

export function AppShell({ brand, profile, children }: AppShellProps) {
  const navigation = getDashboardNavigation(profile);

  return <DashboardShell brand={brand} profile={profile} navigation={navigation}>{children}</DashboardShell>;
}
