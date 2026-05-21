import type { PaymentWithOrder } from "@/lib/engines/commerce/types";

export function findPendingPaymentForApproval(payments: PaymentWithOrder[], paymentId: string): PaymentWithOrder | null {
  return payments.find((payment) => payment.id === paymentId) ?? null;
}

export function paymentApprovalAuditMetadata(payment: PaymentWithOrder): Record<string, string | number> {
  return {
    orderId: payment.orderId,
    productId: payment.order.productId,
    studentUserId: payment.order.userId,
    method: payment.method,
    totalMxnCents: payment.order.totalMxnCents
  };
}
