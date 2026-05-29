import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/types";
import { getSupabaseServerEnv } from "@/lib/supabase/env-server";

const protectedPrefixes = ["/admin", "/mis-productos", "/aprender", "/learn", "/checkout", "/onboarding"];
const authPrefixes = ["/login", "/registro", "/recuperar"];

function safeNextPath(value: string | null): string | null {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  if (authPrefixes.some((prefix) => value === prefix || value.startsWith(`${prefix}?`))) return null;
  return value;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseServerEnv();

  const supabase = createServerClient<Database>(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = authPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && user) {
    const target = safeNextPath(request.nextUrl.searchParams.get("next")) ?? "/mis-productos";
    return NextResponse.redirect(new URL(target, request.nextUrl.origin));
  }

  return response;
}
