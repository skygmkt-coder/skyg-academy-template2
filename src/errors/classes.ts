export type AppErrorCode =
  | "APP_ERROR"
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "PERMISSION_ERROR"
  | "STORAGE_ERROR"
  | "PAYMENT_ERROR";

export type AppErrorInput = {
  message: string;
  code?: AppErrorCode;
  statusCode?: number;
  exposeToClient?: boolean;
  cause?: unknown;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  code: AppErrorCode;
  statusCode: number;
  exposeToClient: boolean;
  details?: Record<string, unknown>;
  cause?: unknown;

  constructor(input: string | AppErrorInput) {
    const payload = typeof input === "string" ? { message: input } : input;
    super(payload.message);
    this.name = this.constructor.name;
    this.code = payload.code ?? "APP_ERROR";
    this.statusCode = payload.statusCode ?? 500;
    this.exposeToClient = payload.exposeToClient ?? false;
    this.details = payload.details;
    this.cause = payload.cause;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Datos invalidos.", input?: Omit<AppErrorInput, "message" | "code" | "statusCode" | "exposeToClient">) {
    super({ ...input, message, code: "VALIDATION_ERROR", statusCode: 400, exposeToClient: true });
  }
}

export class AuthError extends AppError {
  constructor(message = "Inicia sesion para continuar.", input?: Omit<AppErrorInput, "message" | "code" | "statusCode" | "exposeToClient">) {
    super({ ...input, message, code: "AUTH_ERROR", statusCode: 401, exposeToClient: true });
  }
}

export class PermissionError extends AppError {
  constructor(message = "No tienes permisos para realizar esta accion.", input?: Omit<AppErrorInput, "message" | "code" | "statusCode" | "exposeToClient">) {
    super({ ...input, message, code: "PERMISSION_ERROR", statusCode: 403, exposeToClient: true });
  }
}

export class StorageError extends AppError {
  constructor(message = "No pudimos procesar el archivo.", input?: Omit<AppErrorInput, "message" | "code" | "statusCode" | "exposeToClient">) {
    super({ ...input, message, code: "STORAGE_ERROR", statusCode: 502, exposeToClient: true });
  }
}

export class PaymentError extends AppError {
  constructor(message = "No pudimos procesar el pago.", input?: Omit<AppErrorInput, "message" | "code" | "statusCode" | "exposeToClient">) {
    super({ ...input, message, code: "PAYMENT_ERROR", statusCode: 422, exposeToClient: true });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
