import { getPublicEnv, getOptionalPublicAppUrl, getOptionalSupabaseUrl } from "./public";
import { readOptionalEnvValue } from "./validation";

export type ServerEnv = {
  public: ReturnType<typeof getPublicEnv>;
  supabaseServiceRoleKey?: string;
};

export function getServerEnv(): ServerEnv {
  return {
    public: getPublicEnv(),
    supabaseServiceRoleKey: readOptionalEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")
  };
}

export function getSupabaseServerEnv(): {
  url: string;
  publishableKey: string;
} {
  const env = getServerEnv().public;
  return { url: env.supabaseUrl, publishableKey: env.supabasePublishableKey };
}

export { getOptionalPublicAppUrl, getOptionalSupabaseUrl };
