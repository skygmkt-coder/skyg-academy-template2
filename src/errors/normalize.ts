import { AppError, isAppError } from "./classes";

export type NormalizedError = {
  name: string;
  message: string;
  code: string;
  statusCode: number;
  exposeToClient: boolean;
  clientMessage: string;
  cause?: unknown;
  details?: Record<string, unknown>;
};

const defaultClientMessage = "Ocurrio un error inesperado. Intenta de nuevo.";

export function normalizeError(error: unknown, fallbackMessage = defaultClientMessage): NormalizedError {
  if (isAppError(error)) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      exposeToClient: error.exposeToClient,
      clientMessage: error.exposeToClient ? error.message : fallbackMessage,
      cause: error.cause,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: "UNEXPECTED_ERROR",
      statusCode: 500,
      exposeToClient: false,
      clientMessage: fallbackMessage,
      cause: error
    };
  }

  return {
    name: "UnknownError",
    message: String(error ?? "Unknown error"),
    code: "UNKNOWN_ERROR",
    statusCode: 500,
    exposeToClient: false,
    clientMessage: fallbackMessage,
    cause: error
  };
}

export function getClientErrorMessage(error: unknown, fallbackMessage = defaultClientMessage): string {
  return normalizeError(error, fallbackMessage).clientMessage;
}

export function toAppError(error: unknown, fallbackMessage = defaultClientMessage): AppError {
  if (isAppError(error)) return error;
  const normalized = normalizeError(error, fallbackMessage);
  return new AppError({
    message: normalized.message,
    code: "APP_ERROR",
    statusCode: normalized.statusCode,
    exposeToClient: false,
    cause: normalized.cause,
    details: normalized.details
  });
}
