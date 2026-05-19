import type { NextConfig } from "next";

import { SUPABASE_IMAGE_REMOTE_PATTERN } from "./src/config/providers";
import { getOptionalSupabaseUrl } from "./src/env/server";

function getSupabaseImageHostname(): string | undefined {
  const supabaseUrl = getOptionalSupabaseUrl();

  if (!supabaseUrl) {
    return undefined;
  }

  return new URL(supabaseUrl).hostname;
}

const supabaseImageHostname = getSupabaseImageHostname();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: supabaseImageHostname
      ? [
          {
            ...SUPABASE_IMAGE_REMOTE_PATTERN,
            hostname: supabaseImageHostname
          }
        ]
      : []
  }
};

export default nextConfig;
