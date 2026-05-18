"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/types";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env-client";

export function createClient() {
  const { url, publishableKey } = getSupabaseBrowserEnv();

  return createBrowserClient<Database>(url, publishableKey);
}
