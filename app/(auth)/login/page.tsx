import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

function safeNextPath(value: string | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/mis-productos";
  if (["/login", "/registro", "/recuperar"].some((path) => value === path || value.startsWith(`${path}?`))) {
    return "/mis-productos";
  }
  return value;
}

function errorMessage(error: string | undefined): string | null {
  if (error === "missing_code") return "El enlace de confirmacion no incluye un codigo valido.";
  if (error === "invalid_or_expired_code") return "El enlace expiro o ya fue utilizado. Solicita uno nuevo.";
  return null;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const brand = await getActiveBrandSettings();
  const { next, error } = await searchParams;
  const message = errorMessage(error);

  return (
    <AuthCard brand={brand} title="Entrar" subtitle="Accede a tu cuenta para continuar.">
      {message ? (
        <p role="alert" className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {message}
        </p>
      ) : null}
      <LoginForm nextPath={safeNextPath(next)} />
    </AuthCard>
  );
}
