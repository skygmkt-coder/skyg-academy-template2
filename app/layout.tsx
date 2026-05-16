import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export const metadata: Metadata = {
  title: "SaaS Platform",
  description: "Production SaaS foundation"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const brand = await getActiveBrandSettings();

  return (
    <html lang="es">
      <body>
        <ThemeProvider brand={brand}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
