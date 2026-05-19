import { createClient } from "@/lib/supabase/server";
import type {
  AdminEnrollment,
  Enrollment,
  EnrollmentStatus,
  LessonProgress
} from "@/lib/engines/learning/types";
import type { Profile } from "@/lib/engines/auth/types";

type EnrollmentRow = {
  id: string;
  user_id: string;
  course_id: string;
  product_id: string;
  status: string;
  enrolled_at: string;
  expires_at: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  granted_by: string | null;
  granted_reason: string | null;
  created_at: string;
  updated_at: string;
};

type ProgressRow = {
  id: string;
  user_id: string;
  product_id: string;
  lesson_id: string;
  is_completed: boolean;
  last_viewed_at: string | null;
  completed_at: string | null;
};

function mapEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    productId: row.product_id,
    status: normalizeEnrollmentStatus(row.status),
    enrolledAt: row.enrolled_at,
    expiresAt: row.expires_at,
    paymentProvider: row.payment_provider,
    paymentReference: row.payment_reference,
    grantedBy: row.granted_by,
    grantedReason: row.granted_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapProgress(row: ProgressRow): LessonProgress {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    lessonId: row.lesson_id,
    isCompleted: row.is_completed,
    lastViewedAt: row.last_viewed_at,
    completedAt: row.completed_at
  };
}

function normalizeEnrollmentStatus(status: string): EnrollmentStatus {
  if (status === "expired" || status === "revoked") {
    return status;
  }

  return "active";
}

const enrollmentColumns =
  "id,user_id,course_id,product_id,status,enrolled_at,expires_at,payment_provider,payment_reference,granted_by,granted_reason,created_at,updated_at";
const progressColumns =
  "id,user_id,product_id,lesson_id,is_completed,last_viewed_at,completed_at";

export async function getActiveEnrollment(userId: string, productId: string): Promise<Enrollment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(enrollmentColumns)
    .eq("user_id", userId)
    .eq("status", "active")
    .or(`course_id.eq.${productId},product_id.eq.${productId}`)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load enrollment: ${error.message}`);
  }

  return data ? mapEnrollment(data as EnrollmentRow) : null;
}

export async function listActiveEnrollmentsForUser(userId: string): Promise<Enrollment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(enrollmentColumns)
    .eq("user_id", userId)
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("enrolled_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list enrollments: ${error.message}`);
  }

  return (data as EnrollmentRow[]).map(mapEnrollment);
}

export async function listEnrollmentsByProductId(productId: string): Promise<AdminEnrollment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(`${enrollmentColumns}, profiles:profiles!enrollments_user_id_fkey(id,email,full_name,role)`)
    .or(`course_id.eq.${productId},product_id.eq.${productId}`)
    .order("enrolled_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list product enrollments: ${error.message}`);
  }

  return data.map((row) => ({
    ...mapEnrollment(row as EnrollmentRow),
    student: mapProfile(row.profiles)
  }));
}

export async function grantEnrollment(input: {
  userId: string;
  productId: string;
  grantedBy: string;
  expiresAt: string | null;
  grantedReason: string | null;
}): Promise<Enrollment> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .upsert(
      {
        user_id: input.userId,
        course_id: input.productId,
        product_id: input.productId,
        status: "active",
        enrolled_at: new Date().toISOString(),
        expires_at: input.expiresAt,
        payment_provider: null,
        payment_reference: null,
        granted_by: input.grantedBy,
        granted_reason: input.grantedReason
      },
      { onConflict: "user_id,course_id" }
    )
    .select(enrollmentColumns)
    .single();

  if (error) {
    throw new Error(`Unable to grant enrollment: ${error.message}`);
  }

  return mapEnrollment(data as EnrollmentRow);
}

export async function revokeEnrollment(enrollmentId: string): Promise<Enrollment> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({ status: "revoked" })
    .eq("id", enrollmentId)
    .select(enrollmentColumns)
    .single();

  if (error) {
    throw new Error(`Unable to revoke enrollment: ${error.message}`);
  }

  return mapEnrollment(data as EnrollmentRow);
}

export async function listProgressForProduct(userId: string, productId: string): Promise<LessonProgress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select(progressColumns)
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(`Unable to load progress: ${error.message}`);
  }

  return data.map(mapProgress);
}

export async function markLessonViewed(input: {
  userId: string;
  productId: string;
  lessonId: string;
}): Promise<LessonProgress> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: input.userId,
        product_id: input.productId,
        lesson_id: input.lessonId,
        last_viewed_at: new Date().toISOString()
      },
      { onConflict: "user_id,lesson_id" }
    )
    .select(progressColumns)
    .single();

  if (error) {
    throw new Error(`Unable to mark lesson viewed: ${error.message}`);
  }

  return mapProgress(data);
}

export async function markLessonCompleted(input: {
  userId: string;
  productId: string;
  lessonId: string;
}): Promise<LessonProgress> {
  const now = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: input.userId,
        product_id: input.productId,
        lesson_id: input.lessonId,
        is_completed: true,
        completed_at: now,
        last_viewed_at: now
      },
      { onConflict: "user_id,lesson_id" }
    )
    .select(progressColumns)
    .single();

  if (error) {
    throw new Error(`Unable to mark lesson completed: ${error.message}`);
  }

  return mapProgress(data);
}

function mapProfile(row: unknown): Profile | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const profile = row as {
    id: string;
    email: string;
    full_name: string | null;
    role: "admin" | "student";
  };

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role
  };
}
