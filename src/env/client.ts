"use client";

import { getPublicEnv } from "./public";

export function getClientEnv() {
  return getPublicEnv();
}

export function getSupabaseBrowserEnv(): {
  url: string;
  publishableKey: string;
} {
  const env = getClientEnv();
  return { url: env.supabaseUrl, publishableKey: env.supabasePublishableKey };
}
