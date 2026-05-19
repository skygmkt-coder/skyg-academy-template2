import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/engines/auth/repository";
import type { AuthenticatedUser, Profile } from "@/lib/engines/auth/types";

export async function getOptionalUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getProfileById(user.id);
  return profile ? { user, profile } : null;
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const auth = await getOptionalUser();

  if (!auth) {
    redirect("/login");
  }

  return auth;
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const auth = await requireUser();

  if (auth.profile.role !== "admin") {
    redirect("/mis-productos");
  }

  return auth;
}

export function isAdmin(profile: Profile): boolean {
  return profile.role === "admin";
}
