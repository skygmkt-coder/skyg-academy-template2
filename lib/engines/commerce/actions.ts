"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireUser } from "@/lib/engines/auth/helpers";
import { approveManualPayment, rejectManualPayment, submitManualPayment } from "@/lib/engines/commerce/service";
import { approvePaymentSchema, rejectPaymentSchema, submitManualPaymentSchema } from "@/lib/engines/commerce/validation";
import type { CommerceActionState } from "@/lib/engines/commerce/types";

const errorState = (message: string): CommerceActionState => ({ status: "error", message });
const successState = (message: string): CommerceActionState => ({ status: "success", message });

function stringFromForm(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitManualPaymentAction(_previousState: CommerceActionState, formData: FormData): Promise<CommerceActionState> {
  const auth = await requireUser();
  const parsed = submitManualPaymentSchema.safeParse({
    productId: stringFromForm(formData, "productId"),
    productSlug: stringFromForm(formData, "productSlug"),
    method: stringFromForm(formData, "method"),
    proofUrl: stringFromForm(formData, "proofUrl")
  });
  if (!parsed.success) return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");

  try {
    await submitManualPayment(auth, parsed.data);
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos enviar el pago.");
  }

  revalidatePath(`/checkout/${parsed.data.productSlug}`);
  revalidatePath("/mis-productos");
  return successState("Comprobante enviado a revision.");
}

export async function approvePaymentAction(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  const parsed = approvePaymentSchema.safeParse({ paymentId: stringFromForm(formData, "paymentId") });
  if (!parsed.success) throw new Error("Pago invalido.");
  await approveManualPayment({ paymentId: parsed.data.paymentId, adminId: auth.user.id });
  revalidatePath("/admin/pagos");
  revalidatePath("/mis-productos");
  redirect("/admin/pagos");
}

export async function rejectPaymentAction(_previousState: CommerceActionState, formData: FormData): Promise<CommerceActionState> {
  await requireAdmin();
  const parsed = rejectPaymentSchema.safeParse({
    paymentId: stringFromForm(formData, "paymentId"),
    rejectionReason: stringFromForm(formData, "rejectionReason")
  });
  if (!parsed.success) return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  try {
    await rejectManualPayment({ paymentId: parsed.data.paymentId, reason: parsed.data.rejectionReason });
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos rechazar el pago.");
  }
  revalidatePath("/admin/pagos");
  revalidatePath("/mis-productos");
  return successState("Pago rechazado.");
}
