import { AuthCard } from "@/components/auth/auth-card";
import { RecoverForm } from "@/components/auth/recover-form";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

export default async function RecoverPage() {
  const brand = await getActiveBrandSettings();

  return (
    <AuthCard brand={brand} title="Recuperar acceso" subtitle="Te enviaremos un enlace seguro a tu correo.">
      <RecoverForm />
    </AuthCard>
  );
}
