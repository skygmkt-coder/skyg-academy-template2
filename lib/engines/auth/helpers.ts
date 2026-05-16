import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/engines/auth/repository";
import type { AuthenticatedUser, Profile } from "@/lib/engines/auth/types";

export async function requireUser(): Promise<AuthenticatedUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const profile = await getProfileById(user.id);

  if (!profile) {
    redirect("/login");
  }

  return { user, profile };
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
