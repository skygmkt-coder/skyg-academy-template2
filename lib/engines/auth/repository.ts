import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/engines/auth/types";

function mapProfile(row: {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "student";
}): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role
  };
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`);
  }

  return data ? mapProfile(data) : null;
}

export async function listStudentProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("role", "student")
    .order("email", { ascending: true });

  if (error) {
    throw new Error(`Unable to list students: ${error.message}`);
  }

  return data.map(mapProfile);
}
