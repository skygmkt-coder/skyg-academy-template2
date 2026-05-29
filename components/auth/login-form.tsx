"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/lib/engines/auth/actions";
import type { AuthActionState } from "@/lib/engines/auth/types";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export function LoginForm({ nextPath = "/mis-productos" }: { nextPath?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
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
      <label className="block text-sm font-medium text-slate-700">
        Contrasena
        <input
          required
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
      </label>
      {state.status === "error" ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <SubmitButton pendingText="Entrando...">Entrar</SubmitButton>
      <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:justify-between">
        <Link className="font-medium text-brand-primary" href="/registro">
          Crear cuenta
        </Link>
        <Link className="font-medium text-brand-primary" href="/recuperar">
          Recuperar acceso
        </Link>
      </div>
    </form>
  );
}
