import { NextResponse } from "next/server";
import { z } from "zod";

import { createSignedCourseMediaUpload } from "@/lib/courses/media";

export const runtime = "nodejs";

const uploadSchema = z.object({
  intent: z.enum(["course-thumbnail", "course-cover", "lesson-resource", "lesson-media"]),
  courseId: z.string().uuid(),
  lessonId: z.string().uuid().optional(),
  fileName: z.string().trim().min(1).max(180),
  contentType: z.string().trim().min(1).max(120),
  size: z.number().int().positive().optional()
});

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = uploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalido." }, { status: 400 });
  }

  try {
    return NextResponse.json(await createSignedCourseMediaUpload(parsed.data));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No pudimos crear la carga." },
      { status: 500 }
    );
  }
}
