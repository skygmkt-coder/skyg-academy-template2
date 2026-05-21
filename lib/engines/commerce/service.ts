import crypto from "node:crypto";

import type { AuthenticatedUser } from "@/lib/engines/auth/types";
import { getPublicProductPage } from "@/lib/engines/catalog/service";
import {
  approvePaymentTransaction,
  createOrder,
  createPayment,
  getPendingReviewPaymentForProduct,
  getRejectedPaymentForProduct,
  listAdminPayments,
  listStudentPayments,
  rejectPayment,
  retryPayment,
} from "@/lib/engines/commerce/repository";
import type { CheckoutIntent, PaymentStatus, PaymentWithOrder, StudentPayment } from "@/lib/engines/commerce/types";
import type { PaymentProofUploadInput, SubmitManualPaymentInput } from "@/lib/engines/commerce/validation";
import { EXTENSION_BY_CONTENT_TYPE, STORAGE_BUCKETS, STORAGE_SIGNED_URL_TTL_SECONDS } from "@/src/config";
import { recordAuditEvent } from "@/src/audit";
import { createStorageSignedReadUrl, createStorageSignedUpload, findPendingPaymentForApproval, paymentApprovalAuditMetadata } from "@/src/services";

const proofBucket = STORAGE_BUCKETS.PAYMENT_PROOFS;

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
  const paymentForApproval = findPendingPaymentForApproval(payments, input.paymentId);

  if (!paymentForApproval) {
    throw new Error("El pago ya no esta pendiente de revision.");
  }

  const result = await approvePaymentTransaction(input);

  if (result.paymentId !== input.paymentId || result.orderId !== paymentForApproval.orderId) {
    throw new Error("No pudimos validar la aprobacion transaccional del pago.");
  }

  await recordAuditEvent({
    eventType: "payment.approve",
    actorUserId: input.adminId,
    targetType: "payment",
    targetId: input.paymentId,
    courseId: paymentForApproval.order.product?.id ?? paymentForApproval.order.productId,
    metadata: paymentApprovalAuditMetadata(paymentForApproval)
  });
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
  const extension = EXTENSION_BY_CONTENT_TYPE[input.contentType];

  if (!extension) {
    throw new Error("Formato de comprobante no permitido.");
  }

  const path = `${auth.user.id}/${crypto.randomUUID()}.${extension}`;
  const upload = await createStorageSignedUpload({
    bucket: proofBucket,
    path,
    errorMessage: "No pudimos crear la carga del comprobante."
  });

  return { bucket: proofBucket, path, token: upload.token, signedUrl: upload.signedUrl, proofUrl: path };
}

export async function createSignedPaymentProofReadUrl(path: string): Promise<string> {
  try {
    return await createStorageSignedReadUrl({
      bucket: proofBucket,
      path,
      expiresIn: STORAGE_SIGNED_URL_TTL_SECONDS.PAYMENT_PROOF,
      errorMessage: "No pudimos abrir el comprobante."
    });
  } catch {
    return "#";
  }
}
