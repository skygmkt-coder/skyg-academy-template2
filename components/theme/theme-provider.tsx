import type { CSSProperties, ReactNode } from "react";

import { hexToRgbTriplet } from "@/lib/engines/branding/service";
import type { BrandSettings } from "@/lib/engines/branding/types";

type ThemeProviderProps = {
  brand: BrandSettings;
  children: ReactNode;
};

type ThemeStyle = CSSProperties & {
  "--color-primary": string;
  "--color-accent": string;
};

export function ThemeProvider({ brand, children }: ThemeProviderProps) {
  const style: ThemeStyle = {
    "--color-primary": hexToRgbTriplet(brand.primaryColor),
    "--color-accent": hexToRgbTriplet(brand.accentColor)
  };

  return <div style={style}>{children}</div>;
}
