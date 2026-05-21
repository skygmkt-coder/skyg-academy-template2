import type { AuthenticatedUser, Profile } from "@/lib/engines/auth/types";
import { createSignedPaymentProofReadUrl } from "@/lib/engines/commerce/service";
import { canManageCourseEnrollment, enrollUserToCourse } from "@/lib/engines/learning/enrollments";
import type {
  AdminPaymentProof,
  CoursePaymentSettings,
  PaymentProofStatus,
  PaymentType,
  StudentPaymentProof
} from "@/lib/engines/learning/types";
import type { UpdateCoursePaymentSettingsInput } from "@/lib/engines/learning/validation";
import { createClient } from "@/lib/supabase/server";
import { COURSE_PAYMENT_TYPES, PAYMENT_PROVIDERS, PAYMENT_PROOF_STATUSES } from "@/src/config";
import { recordAuditEvent } from "@/src/audit";

type QueryBuilder = {
  select: (columns: string) => QueryBuilder;
  insert: (values: Record<string, unknown>) => QueryBuilder;
  update: (values: Record<string, unknown>) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  neq: (column: string, value: unknown) => QueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder;
  limit: (count: number) => QueryBuilder;
  maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
  single: () => Promise<{ data: unknown; error: { message: string } | null }>;
  then: Promise<{ data: unknown; error: { message: string } | null }>["then"];
};

type UntypedClient = {
  from: (table: string) => QueryBuilder;
};

type PaymentSettingsRow = {
  id: string;
  payment_type: string | null;
  dimo_url: string | null;
  transfer_bank: string | null;
  transfer_clabe: string | null;
  transfer_owner: string | null;
  payment_notes: string | null;
};

type PaymentProofRow = {
  id: string;
  user_id: string;
  course_id: string;
  image_url: string;
  notes: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: unknown;
};

const settingsColumns = "id,payment_type,dimo_url,transfer_bank,transfer_clabe,transfer_owner,payment_notes";
const proofColumns = "id,user_id,course_id,image_url,notes,status,reviewed_by,reviewed_at,created_at";

export async function getCoursePaymentSettings(courseId: string): Promise<CoursePaymentSettings> {
  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("courses")
    .select(settingsColumns)
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load payment settings: ${error.message}`);
  }

  if (!data) {
    throw new Error("Curso no encontrado.");
  }

  return mapSettings(data as PaymentSettingsRow);
}

export async function updateCoursePaymentSettings(
  auth: AuthenticatedUser,
  input: UpdateCoursePaymentSettingsInput
): Promise<CoursePaymentSettings> {
  if (!(await canManageCourseEnrollment(auth, input.courseId))) {
    throw new Error("No tienes permisos para administrar pagos de este curso.");
  }

  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("products")
    .update({
      payment_type: input.paymentType,
      dimo_url: input.dimoUrl,
      transfer_bank: input.transferBank,
      transfer_clabe: input.transferClabe,
      transfer_owner: input.transferOwner,
      payment_notes: input.paymentNotes
    })
    .eq("id", input.courseId)
    .eq("type", "curso")
    .select(settingsColumns)
    .single();

  if (error) {
    throw new Error(`Unable to update payment settings: ${error.message}`);
  }

  return mapSettings(data as PaymentSettingsRow);
}

export async function listStudentPaymentProofs(userId: string, courseId: string): Promise<StudentPaymentProof[]> {
  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("payment_proofs")
    .select(proofColumns)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load payment proofs: ${error.message}`);
  }

  return ((data ?? []) as PaymentProofRow[]).map(mapStudentProof);
}

export async function listCoursePaymentProofs(auth: AuthenticatedUser, courseId: string): Promise<AdminPaymentProof[]> {
  if (!(await canManageCourseEnrollment(auth, courseId))) {
    throw new Error("No tienes permisos para ver comprobantes de este curso.");
  }

  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("payment_proofs")
    .select(`${proofColumns}, profiles:profiles!payment_proofs_user_id_fkey(id,email,full_name,role)`)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load course payment proofs: ${error.message}`);
  }

  const rows = (data ?? []) as PaymentProofRow[];
  return Promise.all(
    rows.map(async (row) => ({
      ...mapStudentProof(row),
      userId: row.user_id,
      student: mapProfile(row.profiles),
      signedImageUrl: await createSignedPaymentProofReadUrl(row.image_url)
    }))
  );
}

export async function submitCoursePaymentProof(input: {
  auth: AuthenticatedUser;
  courseId: string;
  imageUrl: string;
  notes: string | null;
}): Promise<StudentPaymentProof> {
  const settings = await getCoursePaymentSettings(input.courseId);
  if (settings.paymentType === "free") {
    throw new Error("Este curso es gratis y no requiere comprobante.");
  }

  const existing = await listStudentPaymentProofs(input.auth.user.id, input.courseId);
  if (existing.some((proof) => proof.status === "pending")) {
    throw new Error("Ya tienes un comprobante pendiente de revision.");
  }

  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("payment_proofs")
    .insert({
      user_id: input.auth.user.id,
      course_id: input.courseId,
      image_url: input.imageUrl,
      notes: input.notes,
      status: "pending"
    })
    .select(proofColumns)
    .single();

  if (error) {
    throw new Error(`Unable to submit payment proof: ${error.message}`);
  }

  return mapStudentProof(data as PaymentProofRow);
}

export async function approveCoursePaymentProof(input: {
  auth: AuthenticatedUser;
  courseId: string;
  proofId: string;
}): Promise<void> {
  if (!(await canManageCourseEnrollment(input.auth, input.courseId))) {
    throw new Error("No tienes permisos para aprobar este comprobante.");
  }

  const proof = await getReviewableProof(input.proofId, input.courseId);
  const db = (await createClient()) as unknown as UntypedClient;
  const { error } = await db
    .from("payment_proofs")
    .update({ status: "approved", reviewed_by: input.auth.user.id, reviewed_at: new Date().toISOString() })
    .eq("id", input.proofId)
    .eq("course_id", input.courseId)
    .select(proofColumns)
    .single();

  if (error) {
    throw new Error(`Unable to approve payment proof: ${error.message}`);
  }

  await enrollUserToCourse({
    courseId: input.courseId,
    userId: proof.user_id,
    enrolledBy: input.auth.user.id,
    expiresAt: null,
    paymentProvider: PAYMENT_PROVIDERS.MANUAL_PROOF,
    paymentReference: input.proofId
  });

  await recordAuditEvent({
    eventType: "course_payment_proof.approve",
    actorUserId: input.auth.user.id,
    targetType: "payment_proof",
    targetId: input.proofId,
    courseId: input.courseId,
    metadata: {
      studentUserId: proof.user_id,
      imageUrl: proof.image_url
    }
  });
}

export async function rejectCoursePaymentProof(input: {
  auth: AuthenticatedUser;
  courseId: string;
  proofId: string;
}): Promise<void> {
  if (!(await canManageCourseEnrollment(input.auth, input.courseId))) {
    throw new Error("No tienes permisos para rechazar este comprobante.");
  }

  await getReviewableProof(input.proofId, input.courseId);
  const db = (await createClient()) as unknown as UntypedClient;
  const { error } = await db
    .from("payment_proofs")
    .update({ status: "rejected", reviewed_by: input.auth.user.id, reviewed_at: new Date().toISOString() })
    .eq("id", input.proofId)
    .eq("course_id", input.courseId)
    .select(proofColumns)
    .single();

  if (error) {
    throw new Error(`Unable to reject payment proof: ${error.message}`);
  }
}

export async function enrollFreeCourse(auth: AuthenticatedUser, courseId: string): Promise<void> {
  const settings = await getCoursePaymentSettings(courseId);
  if (settings.paymentType !== "free") {
    throw new Error("Este curso requiere validacion de pago.");
  }

  await enrollUserToCourse({
    courseId,
    userId: auth.user.id,
    enrolledBy: auth.user.id,
    expiresAt: null,
    paymentProvider: PAYMENT_PROVIDERS.FREE,
    paymentReference: PAYMENT_PROVIDERS.SELF_ENROLLMENT
  });
}

async function getReviewableProof(proofId: string, courseId: string): Promise<PaymentProofRow> {
  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("payment_proofs")
    .select(proofColumns)
    .eq("id", proofId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load payment proof: ${error.message}`);
  }

  if (!data) {
    throw new Error("Comprobante no encontrado.");
  }

  return data as PaymentProofRow;
}

function mapSettings(row: PaymentSettingsRow): CoursePaymentSettings {
  return {
    courseId: row.id,
    paymentType: normalizePaymentType(row.payment_type),
    dimoUrl: row.dimo_url,
    transferBank: row.transfer_bank,
    transferClabe: row.transfer_clabe,
    transferOwner: row.transfer_owner,
    paymentNotes: row.payment_notes
  };
}

function mapStudentProof(row: PaymentProofRow): StudentPaymentProof {
  return {
    id: row.id,
    courseId: row.course_id,
    imageUrl: row.image_url,
    notes: row.notes,
    status: normalizePaymentProofStatus(row.status),
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at
  };
}

function normalizePaymentType(value: string | null): PaymentType {
  if (COURSE_PAYMENT_TYPES.includes(value as PaymentType) && value !== "free") return value as PaymentType;
  return "free";
}

function normalizePaymentProofStatus(value: string): PaymentProofStatus {
  if (PAYMENT_PROOF_STATUSES.includes(value as PaymentProofStatus) && value !== "pending") return value as PaymentProofStatus;
  return "pending";
}

function mapProfile(row: unknown): Profile | null {
  if (!row || typeof row !== "object") return null;
  const profile = Array.isArray(row) ? row[0] : row;
  if (!profile || typeof profile !== "object") return null;
  const typed = profile as { id: string; email: string; full_name: string | null; role: "admin" | "student" };
  return { id: typed.id, email: typed.email, fullName: typed.full_name, role: typed.role };
}
