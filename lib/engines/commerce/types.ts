import type { Profile } from "@/lib/engines/auth/types";
import type { Product } from "@/lib/engines/catalog/types";

export type OrderStatus = "pending" | "paid" | "cancelled";
export type PaymentMethod = "transferencia" | "dimo";
export type PaymentStatus = "pending_review" | "approved" | "rejected";

export type Order = {
  id: string;
  userId: string;
  productId: string;
  status: OrderStatus;
  totalMxnCents: number;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  proofUrl: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentWithOrder = Payment & {
  order: Order & { product: Product | null; student: Profile | null };
};

export type StudentPayment = Payment & {
  order: Order & { product: Product | null };
};

export type CheckoutIntent = {
  product: Product;
  payments: StudentPayment[];
};

export type CommerceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};
