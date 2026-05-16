import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@/lib/supabase/types";

export type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
};

export type AuthenticatedUser = {
  user: User;
  profile: Profile;
};

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};
