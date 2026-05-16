import crypto from "node:crypto";

import type { AuthenticatedUser } from "@/lib/engines/auth/types";
import { getPublicProductPage } from "@/lib/engines/catalog/service";
import { createClient } from "@/lib/supabase/server";
import { unlockEnrollmentFromCommerce } from "@/lib/engines/learning/service";
import {
  approvePayment,
  createOrder,
  createPayment,
  getOrderById,
  getPendingReviewPaymentForProduct,
  getRejectedPaymentForProduct,
  listAdminPayments,
  listStudentPayments,
  rejectPayment,
  retryPayment,
  updateOrderStatus
} from "@/lib/engines/commerce/repository";
import type { CheckoutIntent, PaymentStatus, PaymentWithOrder, StudentPayment } from "@/lib/engines/commerce/types";
import type { PaymentProofUploadInput, SubmitManualPaymentInput } from "@/lib/engines/commerce/validation";

const proofBucket = "payment-proofs";

export async function getCheckoutIntent(auth: AuthenticatedUser, slug: string): Promise<CheckoutIntent | null> {
  const product = await getPublicProductPage(slug);
  if (!product) return null;
  const payments = await listStudentPayments(auth.user.id);
  return {
    product,
    payments: payments.filter((payment) => payment.order.productId === product.id)
  };
}

export async function submitManualPayment(auth: AuthenticatedUser, input: SubmitManualPaymentInput): Promise<StudentPayment[]> {
  const product = await getPublicProductPage(input.productSlug);
  if (!product || product.id !== input.productId) {
    throw new Error("Producto invalido.");
  }

  const pending = await getPendingReviewPaymentForProduct({ userId: auth.user.id, productId: product.id });
  if (pending) {
    throw new Error("Ya tienes un comprobante pendiente de revision para este producto.");
  }

  const rejected = await getRejectedPaymentForProduct({ userId: auth.user.id, productId: product.id });
  if (rejected) {
    await retryPayment({ paymentId: rejected.id, method: input.method, proofUrl: input.proofUrl });
  } else {
    const order = await createOrder({ userId: auth.user.id, productId: product.id, totalMxnCents: product.priceMxnCents });
    await createPayment({ orderId: order.id, method: input.method, proofUrl: input.proofUrl });
  }

  const persisted = await listStudentPayments(auth.user.id);
  const hasPending = persisted.some((payment) => payment.order.productId === product.id && payment.status === "pending_review");
  if (!hasPending) {
    throw new Error("No pudimos validar el pago pendiente.");
  }
  return persisted;
}

export async function listPaymentsForStudent(userId: string): Promise<StudentPayment[]> {
  return listStudentPayments(userId);
}

export async function listPaymentsForAdmin(status?: PaymentStatus): Promise<PaymentWithOrder[]> {
  return listAdminPayments(status);
}

export async function approveManualPayment(input: { paymentId: string; adminId: string }): Promise<void> {
  const payments = await listAdminPayments("pending_review");
  const paymentForApproval = payments.find((payment) => payment.id === input.paymentId);
  if (!paymentForApproval) {
    throw new Error("El pago ya no esta pendiente de revision.");
  }

  const order = await getOrderById(paymentForApproval.orderId);
  if (!order || order.status !== "pending") throw new Error("Orden pendiente no encontrada.");

  await updateOrderStatus(order.id, "paid");
  await unlockEnrollmentFromCommerce({
    userId: order.userId,
    productId: order.productId,
    grantedBy: input.adminId,
    grantedReason: `Pago aprobado ${paymentForApproval.id}`
  });
  const payment = await approvePayment(input.paymentId, input.adminId);

  const paidOrder = await getOrderById(order.id);
  if (!paidOrder || paidOrder.status !== "paid" || payment.status !== "approved") {
    throw new Error("No pudimos validar la aprobacion del pago.");
  }
}

export async function rejectManualPayment(input: { paymentId: string; reason: string }): Promise<void> {
  const payment = await rejectPayment(input.paymentId, input.reason);
  if (payment.status !== "rejected") {
    throw new Error("No pudimos validar el rechazo del pago.");
  }
}

export async function createSignedPaymentProofUpload(auth: AuthenticatedUser, input: PaymentProofUploadInput): Promise<{
  bucket: string;
  path: string;
  token: string;
  signedUrl: string;
  proofUrl: string;
}> {
  const supabase = await createClient();
  const extension = input.fileName.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${auth.user.id}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage.from(proofBucket).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "No pudimos crear la carga del comprobante.");
  return { bucket: proofBucket, path, token: data.token, signedUrl: data.signedUrl, proofUrl: path };
}

export async function createSignedPaymentProofReadUrl(path: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(proofBucket).createSignedUrl(path, 300);
  if (error || !data) return "#";
  return data.signedUrl;
}
