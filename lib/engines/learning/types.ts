import type { Profile } from "@/lib/engines/auth/types";
import type { Product, ProductWithLessons } from "@/lib/engines/catalog/types";
import type { Course, Lesson, Module } from "@/lib/courses/types";

export type EnrollmentStatus = "active" | "expired" | "revoked";
export type PaymentType = "free" | "transfer" | "dimo" | "mixed";
export type PaymentProofStatus = "pending" | "approved" | "rejected";

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  productId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  expiresAt: string | null;
  paymentProvider: string | null;
  paymentReference: string | null;
  grantedBy: string | null;
  grantedReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LessonProgress = {
  id: string;
  userId: string;
  productId: string;
  lessonId: string;
  isCompleted: boolean;
  lastViewedAt: string | null;
  completedAt: string | null;
};

export type ProductProgress = {
  productId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lastViewedLessonSlug: string | null;
};

export type StudentProductAccess = {
  product: Product;
  enrollment: Enrollment;
  progress: ProductProgress;
};

export type LearningExperience = {
  product: ProductWithLessons;
  activeLessonSlug: string | null;
  previousLessonSlug: string | null;
  nextLessonSlug: string | null;
  progress: ProductProgress;
  completedLessonIds: string[];
  hasAccess: boolean;
};

export type AdminEnrollment = Enrollment & {
  student: Profile | null;
};

export type CoursePaymentSettings = {
  courseId: string;
  paymentType: PaymentType;
  dimoUrl: string | null;
  transferBank: string | null;
  transferClabe: string | null;
  transferOwner: string | null;
  paymentNotes: string | null;
};

export type StudentPaymentProof = {
  id: string;
  courseId: string;
  imageUrl: string;
  notes: string | null;
  status: PaymentProofStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type AdminPaymentProof = StudentPaymentProof & {
  userId: string;
  student: Profile | null;
  signedImageUrl: string;
};

export type LearningActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type CoursePlayerResource = {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  displayOrder: number;
};

export type CoursePlayerLesson = Lesson & {
  resources: CoursePlayerResource[];
  isCompleted: boolean;
};

export type CoursePlayerModule = Module & {
  lessons: CoursePlayerLesson[];
};

export type CoursePlayerExperience = {
  course: Course;
  modules: CoursePlayerModule[];
  activeLesson: CoursePlayerLesson | null;
  previousLessonId: string | null;
  nextLessonId: string | null;
  progress: ProductProgress;
  completedLessonIds: string[];
  hasAccess: boolean;
  paymentSettings: CoursePaymentSettings;
  paymentProofs: StudentPaymentProof[];
};

export type ParsedVideo =
  | { provider: "youtube"; embedUrl: string }
  | { provider: "vimeo"; embedUrl: string }
  | { provider: "external"; url: string };
