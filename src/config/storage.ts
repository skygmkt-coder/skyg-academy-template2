export const STORAGE_BUCKETS = {
  CATALOG_ASSETS: "catalog-assets",
  PAYMENT_PROOFS: "payment-proofs",
  COURSE_THUMBNAILS: "course-thumbnails",
  LESSON_RESOURCES: "lesson-resources",
  LESSON_MEDIA: "lesson-media"
} as const;

export const STORAGE_SIGNED_URL_TTL_SECONDS = {
  PROTECTED_MEDIA: 300,
  PAYMENT_PROOF: 300
} as const;

export const STORAGE_UPLOAD_LIMITS = {
  COURSE_IMAGE_BYTES: 10 * 1024 * 1024,
  PAYMENT_PROOF_BYTES: 10 * 1024 * 1024,
  LESSON_RESOURCE_BYTES: 50 * 1024 * 1024,
  LESSON_MEDIA_BYTES: 500 * 1024 * 1024
} as const;

export const STORAGE_MIME_TYPES = {
  IMAGES: ["image/jpeg", "image/png", "image/webp"],
  DOCUMENTS: ["application/pdf", "application/zip", "text/plain"],
  VIDEOS: ["video/mp4", "video/webm"],
  PAYMENT_PROOFS: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  CATALOG_ASSETS: ["image/jpeg", "image/png", "image/webp", "application/pdf", "application/zip", "text/plain"]
} as const;

export const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "text/plain": "txt",
  "video/mp4": "mp4",
  "video/webm": "webm"
};
