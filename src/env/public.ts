import { assertValidEnv, readOptionalEnvValue, type EnvDefinition } from "./validation";

export const publicEnvDefinitions = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: true, format: "url", public: true },
  { key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", required: true, public: true },
  { key: "NEXT_PUBLIC_APP_URL", required: false, format: "url", public: true }
] as const satisfies readonly EnvDefinition[];

export type PublicEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  appUrl?: string;
};

export function getPublicEnv(): PublicEnv {
  const raw = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  };

  const env = assertValidEnv(raw, publicEnvDefinitions, "public");

  return {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL!,
    supabasePublishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    appUrl: env.NEXT_PUBLIC_APP_URL
  };
}

export function getOptionalPublicAppUrl(): string | undefined {
  return readOptionalEnvValue(process.env.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL", "url");
}

export function getOptionalSupabaseUrl(): string | undefined {
  return readOptionalEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL", "url");
}
