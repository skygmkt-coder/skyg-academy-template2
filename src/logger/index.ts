export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

type Logger = {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
};

const isProduction = process.env.NODE_ENV === "production";

function writeLog(level: LogLevel, message: string, context?: LogContext): void {
  if (level === "debug" && isProduction) return;

  const payload = {
    level,
    message,
    context: sanitizeContext(context),
    timestamp: new Date().toISOString()
  };

  if (isProduction) {
    const serialized = JSON.stringify(payload);
    if (level === "error") console.error(serialized);
    else if (level === "warn") console.warn(serialized);
    else console.info(serialized);
    return;
  }

  const consoleContext = payload.context ? [payload.context] : [];
  if (level === "error") console.error(`[${level}] ${message}`, ...consoleContext);
  else if (level === "warn") console.warn(`[${level}] ${message}`, ...consoleContext);
  else if (level === "debug") console.debug(`[${level}] ${message}`, ...consoleContext);
  else console.info(`[${level}] ${message}`, ...consoleContext);
}

function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, sanitizeValue(key, value)])
  );
}

function sanitizeValue(key: string, value: unknown): unknown {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("password") || lowerKey.includes("token") || lowerKey.includes("secret") || lowerKey.includes("key")) {
    return "[redacted]";
  }

  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: isProduction ? undefined : value.stack };
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return sanitizeContext(value as LogContext);
  }

  return value;
}

export const logger: Logger = {
  debug: (message, context) => writeLog("debug", message, context),
  info: (message, context) => writeLog("info", message, context),
  warn: (message, context) => writeLog("warn", message, context),
  error: (message, context) => writeLog("error", message, context)
};
