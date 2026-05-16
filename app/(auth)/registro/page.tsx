import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export default async function RegisterPage() {
  const brand = await getActiveBrandSettings();

  return (
    <AuthCard brand={brand} title="Crear cuenta" subtitle="Registra tu acceso con correo y contrasena.">
      <RegisterForm />
    </AuthCard>
  );
}
