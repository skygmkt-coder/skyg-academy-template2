import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/engines/catalog/types";
import type { Profile } from "@/lib/engines/auth/types";
import type { Order, OrderStatus, Payment, PaymentMethod, PaymentStatus, PaymentWithOrder, StudentPayment } from "@/lib/engines/commerce/types";

const orderColumns = "id,user_id,product_id,status,total_mxn_cents,created_at,updated_at";
const paymentColumns = "id,order_id,method,status,proof_url,approved_by,approved_at,rejection_reason,created_at,updated_at";

type PaymentApprovalRpcClient = {
  rpc(
    fn: "approve_manual_payment_transaction",
    args: { p_payment_id: string; p_admin_id: string }
  ): {
    single(): Promise<{
      data: { payment_id: string; order_id: string };
      error: { message: string } | null;
    }>;
  };
};

function orderStatus(status: string): OrderStatus {
  return status === "paid" || status === "cancelled" ? status : "pending";
}
function paymentStatus(status: string): PaymentStatus {
  return status === "approved" || status === "rejected" ? status : "pending_review";
}
function paymentMethod(method: string): PaymentMethod {
  return method === "dimo" ? "dimo" : "transferencia";
}
function mapOrder(row: { id: string; user_id: string; product_id: string; status: string; total_mxn_cents: number; created_at: string; updated_at: string }): Order {
  return { id: row.id, userId: row.user_id, productId: row.product_id, status: orderStatus(row.status), totalMxnCents: row.total_mxn_cents, createdAt: row.created_at, updatedAt: row.updated_at };
}
function mapPayment(row: { id: string; order_id: string; method: string; status: string; proof_url: string | null; approved_by: string | null; approved_at: string | null; rejection_reason: string | null; created_at: string; updated_at: string }): Payment {
  return { id: row.id, orderId: row.order_id, method: paymentMethod(row.method), status: paymentStatus(row.status), proofUrl: row.proof_url, approvedBy: row.approved_by, approvedAt: row.approved_at, rejectionReason: row.rejection_reason, createdAt: row.created_at, updatedAt: row.updated_at };
}
function mapProduct(row: unknown): Product | null {
  if (!row || typeof row !== "object") return null;
  const p = row as { id: string; title: string; slug: string; type: string; subtitle: string | null; description: string | null; cover_image_url: string | null; price_mxn_cents: number; is_published: boolean; created_at: string; updated_at: string };
  return { id: p.id, title: p.title, slug: p.slug, type: p.type === "taller" ? "taller" : "curso", subtitle: p.subtitle, description: p.description, coverImageUrl: p.cover_image_url, priceMxnCents: p.price_mxn_cents, isPublished: p.is_published, createdAt: p.created_at, updatedAt: p.updated_at };
}
function mapProfile(row: unknown): Profile | null {
  if (!row || typeof row !== "object") return null;
  const p = row as { id: string; email: string; full_name: string | null; role: "admin" | "student" };
  return { id: p.id, email: p.email, fullName: p.full_name, role: p.role };
}

export async function createOrder(input: { userId: string; productId: string; totalMxnCents: number }): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").insert({ user_id: input.userId, product_id: input.productId, total_mxn_cents: input.totalMxnCents, status: "pending" }).select(orderColumns).single();
  if (error) throw new Error(`Unable to create order: ${error.message}`);
  return mapOrder(data);
}

export async function createPayment(input: { orderId: string; method: PaymentMethod; proofUrl: string }): Promise<Payment> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").insert({ order_id: input.orderId, method: input.method, proof_url: input.proofUrl, status: "pending_review" }).select(paymentColumns).single();
  if (error) throw new Error(`Unable to create payment: ${error.message}`);
  return mapPayment(data);
}

export async function retryPayment(input: { paymentId: string; method: PaymentMethod; proofUrl: string }): Promise<Payment> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").update({ method: input.method, proof_url: input.proofUrl, status: "pending_review", rejection_reason: null }).eq("id", input.paymentId).eq("status", "rejected").select(paymentColumns).single();
  if (error) throw new Error(`Unable to retry payment: ${error.message}`);
  return mapPayment(data);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", orderId).select(orderColumns).single();
  if (error) throw new Error(`Unable to update order: ${error.message}`);
  return mapOrder(data);
}

export async function approvePaymentTransaction(input: {
  paymentId: string;
  adminId: string;
}): Promise<{ paymentId: string; orderId: string }> {
  const supabase = await createClient();
  const rpcClient = supabase as unknown as PaymentApprovalRpcClient;
  const { data, error } = await rpcClient
    .rpc("approve_manual_payment_transaction", {
      p_payment_id: input.paymentId,
      p_admin_id: input.adminId
    })
    .single();

  if (error) throw new Error(`Unable to approve payment transaction: ${error.message}`);

  return { paymentId: data.payment_id, orderId: data.order_id };
}

export async function rejectPayment(paymentId: string, reason: string): Promise<Payment> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").update({ status: "rejected", rejection_reason: reason }).eq("id", paymentId).eq("status", "pending_review").select(paymentColumns).single();
  if (error) throw new Error(`Unable to reject payment: ${error.message}`);
  return mapPayment(data);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select(orderColumns).eq("id", orderId).maybeSingle();
  if (error) throw new Error(`Unable to load order: ${error.message}`);
  return data ? mapOrder(data) : null;
}

export async function listStudentPayments(userId: string): Promise<StudentPayment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").select(`${paymentColumns}, orders!inner(${orderColumns}, products(${productSelect}))`).eq("orders.user_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to list payments: ${error.message}`);
  return data.map((row) => ({ ...mapPayment(row), order: { ...mapOrder(row.orders), product: mapProduct(row.orders.products) } }));
}

export async function listAdminPayments(status?: PaymentStatus): Promise<PaymentWithOrder[]> {
  const supabase = await createClient();
  let query = supabase.from("payments").select(`${paymentColumns}, orders!inner(${orderColumns}, products(${productSelect}), profiles(${profileSelect}))`).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to list admin payments: ${error.message}`);
  return data.map((row) => ({ ...mapPayment(row), order: { ...mapOrder(row.orders), product: mapProduct(row.orders.products), student: mapProfile(row.orders.profiles) } }));
}


export async function getPendingReviewPaymentForProduct(input: { userId: string; productId: string }): Promise<Payment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").select(`${paymentColumns}, orders!inner(user_id,product_id)`).eq("orders.user_id", input.userId).eq("orders.product_id", input.productId).eq("status", "pending_review").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`Unable to load pending payment: ${error.message}`);
  return data ? mapPayment(data) : null;
}

export async function getRejectedPaymentForProduct(input: { userId: string; productId: string }): Promise<Payment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").select(`${paymentColumns}, orders!inner(user_id,product_id)`).eq("orders.user_id", input.UserId).eq("orders.product_id", input.productId).eq("status", "rejected").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`Unable to load rejected payment: ${error.message}`);
  return data ? mapPayment(data) : null;
}

const productSelect = "id,title,slug,type,subtitle,description,cover_image_url,price_mxn_cents,is_published,created_at,updated_at";
const profileSelect = "id,email,full_name,role";
