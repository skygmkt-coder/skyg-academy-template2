import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/types";
import { getSupabaseServerEnv } from "@/lib/supabase/env-server";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseServerEnv();

  return createServerClient<Database>(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies. Middleware refreshes sessions.
          }
        }
      }
    }
  );
}
