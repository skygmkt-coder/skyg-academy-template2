export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
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

export type Lesson = {
  id: string;
  courseId: string;
  moduleId: string | null;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  displayOrder: number;
  isPreview: boolean;
  lessonType: "video" | "text" | "pdf";
  durationMinutes: number | null;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};

export type ModuleWithLessons = Module & {
  lessons: Lesson[];
};

export type CourseContent = Course & {
  modules: ModuleWithLessons[];
};
