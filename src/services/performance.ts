import { logger } from "@/src/logger";

export const DATA_FETCH_TIMEOUT_MS = {
  BRAND_SETTINGS: 1200,
  PUBLIC_CATALOG: 2200,
  DASHBOARD_QUERY: 2800
} as const;

export class DataFetchTimeoutError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`${label} timed out after ${timeoutMs}ms`);
    this.name = "DataFetchTimeoutError";
  }
}

export async function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new DataFetchTimeoutError(label, timeoutMs));
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function safeData<T>(input: {
  label: string;
  load: () => Promise<T>;
  fallback: T;
  timeoutMs?: number;
}): Promise<T> {
  const timeoutMs = input.timeoutMs ?? DATA_FETCH_TIMEOUT_MS.DASHBOARD_QUERY;

  try {
    return await withTimeout(input.load(), timeoutMs, input.label);
  } catch (error) {
    if (isNextDynamicServerError(error)) {
      throw error;
    }

    logger.warn("Using fallback for slow or failed data fetch.", {
      label: input.label,
      timeoutMs,
      error
    });
    return input.fallback;
  }
}

function isNextDynamicServerError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const digest = "digest" in error ? error.digest : undefined;
  if (typeof digest === "string" && digest.includes("DYNAMIC_SERVER_USAGE")) {
    return true;
  }

  const message = "message" in error ? error.message : undefined;
  return typeof message === "string" && message.includes("Dynamic server usage");
}
