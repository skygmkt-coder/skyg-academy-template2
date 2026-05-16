"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { AuthActionState } from "@/lib/engines/auth/types";
import {
  loginSchema,
  recoverPasswordSchema,
  registerSchema
} from "@/lib/engines/auth/validation";
import {
  sendPasswordRecovery,
  signInWithPassword,
  signUpWithPassword
} from "@/lib/engines/auth/service";

const errorState = (message: string): AuthActionState => ({
  status: "error",
  message
});

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function getOrigin(): Promise<string> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return origin ?? `${protocol}://${host ?? "localhost:3000"}`;
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password")
  });

  if (!parsed.success) {
    return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  try {
    await signInWithPassword(parsed.data);
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos iniciar sesion.");
  }

  revalidatePath("/", "layout");
  redirect("/mis-productos");
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formValue(formData, "fullName"),
    email: formValue(formData, "email"),
    password: formValue(formData, "password")
  });

  if (!parsed.success) {
    return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  try {
    await signUpWithPassword(parsed.data, await getOrigin());
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos crear tu cuenta.");
  }

  return {
    status: "success",
    message: "Revisa tu correo para verificar tu cuenta."
  };
}

export async function recoverPasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = recoverPasswordSchema.safeParse({
    email: formValue(formData, "email")
  });

  if (!parsed.success) {
    return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  try {
    await sendPasswordRecovery(parsed.data, await getOrigin());
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos enviar el correo.");
  }

  return {
    status: "success",
    message: "Si el correo existe, recibiras instrucciones para recuperar el acceso."
  };
}
