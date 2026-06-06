import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/types";
import { getSupabaseServerEnv } from "@/lib/supabase/env-server";

const protectedPrefixes = ["/admin", "/mis-productos", "/aprender", "/learn", "/checkout", "/onboarding"];
const authPrefixes = ["/login", "/registro", "/recuperar"];
const USER_LOOKUP_TIMEOUT_MS = 2_000;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function safeNextPath(value: string | null): string | null {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  if (authPrefixes.some((prefix) => value === prefix || value.startsWith(`${prefix}?`))) return null;
  return value;
}

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

function loginRedirect(request: NextRequest): NextResponse {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(redirectUrl);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => matchesPrefix(pathname, prefix));
  const isAuthPage = authPrefixes.some((prefix) => matchesPrefix(pathname, prefix));

  if (!isProtected && !isAuthPage) {
    return response;
  }

  if (!hasSupabaseAuthCookie(request)) {
    return isProtected ? loginRedirect(request) : response;
  }

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

  const userResult = await Promise.race([
    supabase.auth.getUser(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), USER_LOOKUP_TIMEOUT_MS))
  ]);
  const user = userResult?.data.user ?? null;

  if (isProtected && !user) {
    return loginRedirect(request);
  }

  if (isAuthPage && user) {
    const target = safeNextPath(request.nextUrl.searchParams.get("next")) ?? "/mis-productos";
    return NextResponse.redirect(new URL(target, request.nextUrl.origin));
  }

  return response;
}
