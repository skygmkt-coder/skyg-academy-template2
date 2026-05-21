import type { AuthenticatedUser } from "@/lib/engines/auth/types";
import type { AdminEnrollment, Enrollment } from "@/lib/engines/learning/types";
import { getActiveEnrollment, listEnrollmentsByProductId, revokeEnrollment } from "@/lib/engines/learning/repository";
import { recordAuditEvent } from "@/src/audit";
import { canAdminOrOwnCourse, enrollmentAuditMetadata, getServerSupabaseClient } from "@/src/services";

export async function checkCourseAccess(auth: AuthenticatedUser, courseId: string): Promise<boolean> {
  if (await canAdminOrOwnCourse(auth, courseId)) {
    return true;
  }

  const enrollment = await getActiveEnrollment(auth.user.id, courseId);
  return Boolean(enrollment);
}

export async function canManageCourseEnrollment(auth: AuthenticatedUser, courseId: string): Promise<boolean> {
  return canAdminOrOwnCourse(auth, courseId);
}

export async function enrollUserToCourse(input: {
  courseId: string;
  userId: string;
  enrolledBy: string;
  expiresAt: string | null;
  paymentProvider?: string | null;
  paymentReference?: string | null;
}): Promise<Enrollment> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("enrollments")
    .upsert(
      {
        user_id: input.userId,
        course_id: input.courseId,
        product_id: input.courseId,
        status: "active",
        enrolled_at: new Date().toISOString(),
        expires_at: input.expiresAt,
        payment_provider: input.paymentProvider ?? "manual",
        payment_reference: input.paymentReference ?? null,
        granted_by: input.enrolledBy,
        granted_reason: "manual"
      },
      { onConflict: "user_id,course_id" }
    )
    .select("id,user_id,course_id,product_id,status,enrolled_at,expires_at,payment_provider,payment_reference,granted_by,granted_reason,created_at,updated_at")
    .single();

  if (error) {
    throw new Error(`Unable to enroll user: ${error.message}`);
  }

  const validated = await getActiveEnrollment(input.userId, input.courseId);

  if (!validated || validated.id !== data.id) {
    throw new Error("No pudimos validar el acceso activo.");
  }

  await recordAuditEvent({
    eventType: "enrollment.grant",
    actorUserId: input.enrolledBy,
    targetType: "enrollment",
    targetId: validated.id,
    courseId: input.courseId,
    metadata: enrollmentAuditMetadata({
      targetUserId: input.userId,
      paymentProvider: input.paymentProvider ?? "manual",
      paymentReference: input.paymentReference ?? null,
      expiresAt: input.expiresAt
    })
  });

  return validated;
}

export async function revokeCourseAccess(input: { enrollmentId: string; courseId: string; revokedBy?: string | null }): Promise<Enrollment> {
  const enrollment = await revokeEnrollment(input.enrollmentId);

  if (enrollment.courseId !== input.courseId || enrollment.status !== "revoked") {
    throw new Error("No pudimos validar la revocacion de acceso.");
  }

  await recordAuditEvent({
    eventType: "enrollment.revoke",
    actorUserId: input.revokedBy,
    targetType: "enrollment",
    targetId: enrollment.id,
    courseId: input.courseId,
    metadata: enrollmentAuditMetadata({
      targetUserId: enrollment.userId,
      previousStatus: "active"
    })
  });

  return enrollment;
}

export async function listCourseEnrollments(courseId: string): Promise<AdminEnrollment[]> {
  return listEnrollmentsByProductId(courseId);
}
