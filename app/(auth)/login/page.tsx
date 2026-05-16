import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export default async function LoginPage() {
  const brand = await getActiveBrandSettings();

  return (
    <AuthCard brand={brand} title="Entrar" subtitle="Accede a tu cuenta para continuar.">
      <LoginForm />
    </AuthCard>
  );
}
