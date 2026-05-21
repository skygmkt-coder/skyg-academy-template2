import { NextResponse } from "next/server";
import { z } from "zod";

import { createSignedCourseMediaUpload } from "@/lib/courses/media";
import { readJsonBody, routeErrorResponse, validationErrorResponse } from "@/src/errors";

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
  try {
    const body = await readJsonBody(request);
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse("Payload invalido.");
    }

    return NextResponse.json(await createSignedCourseMediaUpload(parsed.data));
  } catch (error) {
    return routeErrorResponse(error, {
      context: { route: "POST /api/uploads/course-media" },
      fallbackMessage: "No pudimos crear la carga."
    });
  }
}
