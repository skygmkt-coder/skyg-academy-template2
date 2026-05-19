export type Course = {
  id: string;
  creatorId: string | null;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  coverImagePath: string | null;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminCourseSummary = Course & {
  moduleCount: number;
  lessonCount: number;
};

export type Module = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type LessonResource = {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileBucket: string | null;
  filePath: string | null;
  fileType: string | null;
  fileSize: number | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Lesson = {
  id: string;
  courseId: string;
  moduleId: string | null;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  mediaBucket: string | null;
  mediaPath: string | null;
  mediaKind: "video" | "pdf" | "image" | "external" | null;
  displayOrder: number;
  isPreview: boolean;
  lessonType: "video" | "text" | "pdf";
  durationMinutes: number | null;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  resources: LessonResource[];
};

export type ModuleWithLessons = Module & {
  lessons: Lesson[];
};

export type CourseContent = Course & {
  modules: ModuleWithLessons[];
};
