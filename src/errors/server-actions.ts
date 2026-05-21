import { logger } from "@/src/logger";
import { getClientErrorMessage, normalizeError } from "./normalize";

export type ActionStateLike = {
  status: "idle" | "success" | "error";
  message: string;
};

export function successActionState<T extends ActionStateLike = ActionStateLike>(message: string): T {
  return { status: "success", message } as T;
}

export function errorActionState<T extends ActionStateLike = ActionStateLike>(error: unknown, fallbackMessage: string, context?: Record<string, unknown>): T {
  const normalized = normalizeError(error, fallbackMessage);
  logger.error("Server action failed", { ...context, error: normalized });
  return { status: "error", message: getClientErrorMessage(error, fallbackMessage) } as T;
}

export function validationActionState<T extends ActionStateLike = ActionStateLike>(message = "Datos invalidos."): T {
  return { status: "error", message } as T;
}
