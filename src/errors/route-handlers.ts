import { NextResponse } from "next/server";

import { logger } from "@/src/logger";
import { ValidationError } from "./classes";
import { normalizeError } from "./normalize";

export type ErrorResponseBody = {
  message: string;
  code?: string;
};

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch (error) {
    throw new ValidationError("Payload invalido.", { cause: error });
  }
}

export function routeErrorResponse(
  error: unknown,
  options: {
    context?: Record<string, unknown>;
    fallbackMessage?: string;
    fallbackStatus?: number;
  } = {}
) {
  const normalized = normalizeError(error, options.fallbackMessage);
  const status = normalized.statusCode === 500 && options.fallbackStatus ? options.fallbackStatus : normalized.statusCode;

  logger.error("Route handler failed", {
    ...options.context,
    error: normalized
  });

  const body: ErrorResponseBody = {
    message: normalized.clientMessage
  };

  if (process.env.NODE_ENV !== "production") {
    body.code = normalized.code;
  }

  return NextResponse.json(body, { status });
}

export function validationErrorResponse(message = "Payload invalido.") {
  return routeErrorResponse(new ValidationError(message), { fallbackMessage: message });
}
