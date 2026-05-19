"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireUser } from "@/lib/engines/auth/helpers";
import { completeCoursePlayerLesson } from "@/lib/engines/learning/course-player";
import { canManageCourseEnrollment, enrollUserToCourse, revokeCourseAccess } from "@/lib/engines/learning/enrollments";
import {
  completeLesson,
  grantManualEnrollment,
  revokeManualEnrollment
} from "@/lib/engines/learning/service";
import type { LearningActionState } from "@/lib/engines/learning/types";
import {
  completeCoursePlayerLessonSchema,
  completeLessonSchema,
  enrollUserToCourseSchema,
  grantEnrollmentSchema,
  revokeCourseAccessSchema,
  revokeEnrollmentSchema
} from "@/lib/engines/learning/validation";

const successState = (message: string): LearningActionState => ({ status: "success", message });
const errorState = (message: string): LearningActionState => ({ status: "error", message });

function stringFromForm(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function grantEnrollmentAction(
  _previousState: LearningActionState,
  formData: FormData
): Promise<LearningActionState> {
  const auth = await requireAdmin();
  const parsed = grantEnrollmentSchema.safeParse({
    productId: stringFromForm(formData, "productId"),
    userId: stringFromForm(formData, "userId"),
    expiresAt: stringFromForm(formData, "expiresAt"),
    grantedReason: stringFromForm(formData, "grantedReason")
  });

  if (!parsed.success) {
    return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  try {
    await grantManualEnrollment(parsed.data, auth.user.id);
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos otorgar acceso.");
  }

  revalidatePath(`/admin/productos/${parsed.data.productId}`);
  revalidatePath("/mis-productos");
  return successState("Acceso otorgado y validado.");
}

export async function revokeEnrollmentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = revokeEnrollmentSchema.safeParse({
    productId: stringFromForm(formData, "productId"),
    enrollmentId: stringFromForm(formData, "enrollmentId")
  });

  if (!parsed.success) {
    throw new Error("Enrollment invalido.");
  }

  await revokeManualEnrollment(parsed.data);
  revalidatePath(`/admin/productos/${parsed.data.productId}`);
  revalidatePath("/mis-productos");
}

export async function completeLessonAction(formData: FormData): Promise<void> {
  const auth = await requireUser();
  const parsed = completeLessonSchema.safeParse({
    productSlug: stringFromForm(formData, "productSlug"),
    lessonSlug: stringFromForm(formData, "lessonSlug"),
    productId: stringFromForm(formData, "productId"),
    lessonId: stringFromForm(formData, "lessonId")
  });

  if (!parsed.success) {
    throw new Error("Leccion invalida.");
  }

  await completeLesson({
    auth,
    productId: parsed.data.productId,
    lessonId: parsed.data.lessonId
  });

  revalidatePath("/mis-productos");
  revalidatePath(`/aprender/${parsed.data.productSlug}`);
  revalidatePath(`/aprender/${parsed.data.productSlug}/${parsed.data.lessonSlug}`);
  redirect(`/aprender/${parsed.data.productSlug}/${parsed.data.lessonSlug}`);
}

export async function completeCoursePlayerLessonAction(formData: FormData): Promise<void> {
  const auth = await requireUser();
  const parsed = completeCoursePlayerLessonSchema.safeParse({
    courseId: stringFromForm(formData, "courseId"),
    lessonId: stringFromForm(formData, "lessonId")
  });

  if (!parsed.success) {
    throw new Error("Leccion invalida.");
  }

  await completeCoursePlayerLesson({
    auth,
    courseId: parsed.data.courseId,
    lessonId: parsed.data.lessonId
  });

  revalidatePath("/mis-productos");
  revalidatePath(`/learn/${parsed.data.courseId}`);
  redirect(`/learn/${parsed.data.courseId}?lesson=${parsed.data.lessonId}`);
}

export async function enrollUserToCourseAction(formData: FormData): Promise<void> {
  const auth = await requireUser();
  const parsed = enrollUserToCourseSchema.safeParse({
    courseId: stringFromForm(formData, "courseId"),
    userId: stringFromForm(formData, "userId"),
    expiresAt: stringFromForm(formData, "expiresAt"),
    paymentProvider: stringFromForm(formData, "paymentProvider"),
    paymentReference: stringFromForm(formData, "paymentReference")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Enrollment invalido.");
  }

  if (!(await canManageCourseEnrollment(auth, parsed.data.courseId))) {
    throw new Error("No tienes permisos para administrar alumnos de este curso.");
  }

  await enrollUserToCourse({
    courseId: parsed.data.courseId,
    userId: parsed.data.userId,
    enrolledBy: auth.user.id,
    expiresAt: parsed.data.expiresAt,
    paymentProvider: parsed.data.paymentProvider,
    paymentReference: parsed.data.paymentReference
  });

  revalidatePath(`/admin/cursos/${parsed.data.courseId}`);
  revalidatePath(`/learn/${parsed.data.courseId}`);
  revalidatePath("/mis-productos");
}

export async function revokeCourseAccessAction(formData: FormData): Promise<void> {
  const auth = await requireUser();
  const parsed = revokeCourseAccessSchema.safeParse({
    courseId: stringFromForm(formData, "courseId"),
    enrollmentId: stringFromForm(formData, "enrollmentId")
  });

  if (!parsed.success) {
    throw new Error("Enrollment invalido.");
  }

  if (!(await canManageCourseEnrollment(auth, parsed.data.courseId))) {
    throw new Error("No tienes permisos para revocar acceso de este curso.");
  }

  await revokeCourseAccess(parsed.data);
  revalidatePath(`/admin/cursos/${parsed.data.courseId}`);
  revalidatePath(`/learn/${parsed.data.courseId}`);
  revalidatePath("/mis-productos");
}
