"use client";

import Link from "next/link";
import { useActionState } from "react";

import { recoverPasswordAction } from "@/lib/engines/auth/actions";
import type { AuthActionState } from "@/lib/engines/auth/types";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export function RecoverForm() {
  const [state, formAction] = useActionState(recoverPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        Correo
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
      </label>
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-md px-3 py-2 text-sm ${
            state.status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton pendingText="Enviando...">Enviar instrucciones</SubmitButton>
      <p className="text-sm text-slate-600">
        Recordaste tu contrasena?{" "}
        <Link className="font-medium text-brand-primary" href="/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
