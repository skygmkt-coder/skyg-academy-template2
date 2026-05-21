import { createClient } from "@/lib/supabase/server";

export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getServerSupabaseClient(): Promise<ServerSupabaseClient> {
  return createClient();
}

export type MaybeSingleResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;
export type SingleResult<T> = Promise<{ data: T; error: { message: string } | null }>;
