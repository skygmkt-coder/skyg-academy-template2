import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { LoginInput, RecoverPasswordInput, RegisterInput } from "@/lib/engines/auth/validation";

export async function signInWithPassword(input: LoginInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password
  });

  if (error) {
    throw new Error("No pudimos iniciar sesion con esos datos.");
  }
}

export async function signUpWithPassword(input: RegisterInput, origin: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        full_name: input.fullName
      }
    }
  });

  if (error) {
    throw new Error("No pudimos crear tu cuenta. Revisa tus datos e intenta de nuevo.");
  }
}

export async function sendPasswordRecovery(input: RecoverPasswordInput, origin: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${origin}/auth/confirm`
  });

  if (error) {
    throw new Error("No pudimos enviar el correo de recuperacion.");
  }
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
