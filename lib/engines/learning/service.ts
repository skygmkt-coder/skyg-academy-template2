import { notFound, redirect } from "next/navigation";

import { listStudentProfiles } from "@/lib/engines/auth/repository";
import type { AuthenticatedUser, Profile } from "@/lib/engines/auth/types";
import { getAdminProductEditor, getProductForLearning } from "@/lib/engines/catalog/service";
import type { Lesson } from "@/lib/engines/catalog/types";
import {
  getActiveEnrollment,
  grantEnrollment,
  listActiveEnrollmentsForUser,
  listEnrollmentsByProductId,
  listProgressForProduct,
  markLessonCompleted,
  markLessonViewed,
  revokeEnrollment
} from "@/lib/engines/learning/repository";
import type {
  AdminEnrollment,
  Enrollment,
  LearningExperience,
  ProductProgress,
  StudentProductAccess
} from "@/lib/engines/learning/types";
import type {
  GrantEnrollmentInput,
  RevokeEnrollmentInput
} from "@/lib/engines/learning/validation";

export async function listStudentProducts(auth: AuthenticatedUser): Promise<StudentProductAccess[]> {
  const enrollments = await listActiveEnrollmentsForUser(auth.user.id);

  const access: Array<StudentProductAccess | null> = await Promise.all(
    enrollments.map(async (enrollment) => {
      const product = await getAdminProductEditor(enrollment.productId);

      if (!product) {
        return null;
      }

      const progressRows = await listProgressForProduct(auth.user.id, product.id);

      return {
        product,
        enrollment,
        progress: calculateProgress(product.id, product.lessons, progressRows)
      };
    })
  );

  return access.filter((item): item is StudentProductAccess => item !== null);
}

export async function getLearningExperience(input: {
  auth: AuthenticatedUser;
  productSlug: string;
  lessonSlug?: string;
  markViewed: boolean;
}): Promise<LearningExperience> {
  const product = await getProductForLearning(input.productSlug);

  if (!product) {
    notFound();
  }

  const hasAccess = await canAccessProduct(input.auth, product.id);

  if (!hasAccess) {
    redirect("/mis-productos");
  }

  const lessons = product.lessons.toSorted((first, second) => first.displayOrder - second.displayOrder);
  const activeLesson = resolveActiveLesson(lessons, input.lessonSlug);

  if (lessons.length > 0 && !activeLesson) {
    notFound();
  }

  if (!input.lessonSlug && activeLesson) {
    redirect(`/aprender/${product.slug}/${activeLesson.slug}`);
  }

  if (activeLesson && input.markViewed) {
    await markLessonViewed({
      userId: input.auth.user.id,
      productId: product.id,
      lessonId: activeLesson.id
    });
  }

  const progressRows = await listProgressForProduct(input.auth.user.id, product.id);
  const activeIndex = activeLesson
    ? lessons.findIndex((lesson) => lesson.id === activeLesson.id)
    : -1;

  return {
    product,
    activeLessonSlug: activeLesson?.slug ?? null,
    previousLessonSlug: activeIndex > 0 ? lessons[activeIndex - 1]?.slug ?? null : null,
    nextLessonSlug:
      activeIndex >= 0 && activeIndex < lessons.length - 1
        ? lessons[activeIndex + 1]?.slug ?? null
        : null,
    progress: calculateProgress(product.id, lessons, progressRows),
    completedLessonIds: progressRows
      .filter((progress) => progress.isCompleted)
      .map((progress) => progress.lessonId),
    hasAccess
  };
}

export async function getAdminEnrollmentPanel(productId: string): Promise<{
  enrollments: AdminEnrollment[];
  students: Profile[];
}> {
  const [enrollments, students] = await Promise.all([
    listEnrollmentsByProductId(productId),
    listStudentProfiles()
  ]);

  return { enrollments, students };
}

export async function grantManualEnrollment(input: GrantEnrollmentInput, grantedBy: string): Promise<Enrollment> {
  const enrollment = await grantEnrollment({
    userId: input.userId,
    productId: input.productId,
    grantedBy,
    expiresAt: input.expiresAt,
    grantedReason: input.grantedReason
  });

  const validated = await getActiveEnrollment(input.userId, input.productId);

  if (!validated || validated.id !== enrollment.id) {
    throw new Error("No pudimos validar el acceso activo.");
  }

  return enrollment;
}

export async function revokeManualEnrollment(input: RevokeEnrollmentInput): Promise<Enrollment> {
  const enrollment = await revokeEnrollment(input.enrollmentId);

  if (enrollment.status !== "revoked") {
    throw new Error("No pudimos validar la revocacion.");
  }

  return enrollment;
}

export async function completeLesson(input: {
  auth: AuthenticatedUser;
  productId: string;
  lessonId: string;
}): Promise<ProductProgress> {
  const hasAccess = await canAccessProduct(input.auth, input.productId);

  if (!hasAccess) {
    throw new Error("No tienes acceso a este producto.");
  }

  await markLessonCompleted({
    userId: input.auth.user.id,
    productId: input.productId,
    lessonId: input.lessonId
  });

  const product = await getAdminProductEditor(input.productId);

  if (!product) {
    throw new Error("Producto no encontrado.");
  }

  const progressRows = await listProgressForProduct(input.auth.user.id, input.productId);
  const progress = calculateProgress(product.id, product.lessons, progressRows);

  if (!progressRows.some((row) => row.lessonId === input.lessonId && row.isCompleted)) {
    throw new Error("No pudimos validar la persistencia del progreso.");
  }

  return progress;
}

async function canAccessProduct(auth: AuthenticatedUser, productId: string): Promise<boolean> {
  if (auth.profile.role === "admin") {
    return true;
  }

  const enrollment = await getActiveEnrollment(auth.user.id, productId);
  return Boolean(enrollment);
}

function resolveActiveLesson(lessons: Lesson[], lessonSlug?: string): Lesson | null {
  if (lessons.length === 0) {
    return null;
  }

  if (!lessonSlug) {
    return lessons[0] ?? null;
  }

  return lessons.find((lesson) => lesson.slug === lessonSlug) ?? null;
}

function calculateProgress(
  productId: string,
  lessons: Lesson[],
  progressRows: Array<{
    lessonId: string;
    isCompleted: boolean;
    lastViewedAt: string | null;
  }>
): ProductProgress {
  const totalLessons = lessons.length;
  const completedLessonIds = new Set(
    progressRows.filter((progress) => progress.isCompleted).map((progress) => progress.lessonId)
  );
  const lastViewed = progressRows
    .filter((progress) => progress.lastViewedAt)
    .toSorted((first, second) =>
      String(second.lastViewedAt).localeCompare(String(first.lastViewedAt))
    )[0];
  const lastViewedLesson = lessons.find((lesson) => lesson.id === lastViewed?.lessonId);

  return {
    productId,
    totalLessons,
    completedLessons: completedLessonIds.size,
    progressPercentage: totalLessons === 0 ? 0 : Math.round((completedLessonIds.size / totalLessons) * 100),
    lastViewedLessonSlug: lastViewedLesson?.slug ?? null
  };
}

export async function unlockEnrollmentFromCommerce(input: {
  userId: string;
  productId: string;
  grantedBy: string;
  grantedReason: string;
}): Promise<Enrollment> {
  const enrollment = await grantEnrollment({
    userId: input.userId,
    productId: input.productId,
    grantedBy: input.grantedBy,
    expiresAt: null,
    grantedReason: input.grantedReason
  });
  const validated = await getActiveEnrollment(input.userId, input.productId);

  if (!validated || validated.id !== enrollment.id) {
    throw new Error("No pudimos validar el desbloqueo del producto.");
  }

  return enrollment;
}
