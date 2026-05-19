export const APP_ROUTES = {
  login: "/login",
  products: "/mis-productos",
  adminCourses: "/admin/cursos",
  publicCourses: "/cursos",
  mediaDownload: "/api/media/download",
  uploadCatalogAsset: "/api/uploads/signed-url",
  uploadPaymentProof: "/api/uploads/payment-proof",
  uploadCourseMedia: "/api/uploads/course-media"
} as const;

export function courseEditorPath(courseId: string): string {
  return `${APP_ROUTES.adminCourses}/${courseId}`;
}

export function learnCoursePath(courseId: string): string {
  return `/learn/${courseId}`;
}
