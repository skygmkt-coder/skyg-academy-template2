export type EnvDefinition = {
  key: string;
  required?: boolean;
  format?: "url";
  public?: boolean;
};

export type EnvValidationResult<T extends Record<string, string | undefined>> = {
  values: { [K in keyof T]: string | undefined };
  missing: string[];
  invalid: string[];
};

export function validateEnv<T extends Record<string, string | undefined>>(
  values: T,
  definitions: readonly EnvDefinition[],
  scope: "public" | "server"
): EnvValidationResult<T> {
  const missing: string[] = [];
  const invalid: string[] = [];

  definitions.forEach((definition) => {
    const value = values[definition.key as keyof T];
    const normalized = typeof value === "string" ? value.trim() : "";

    if (definition.required && !normalized) {
      missing.push(definition.key);
      return;
    }

    if (normalized && definition.format === "url" && !isValidUrl(normalized)) {
      invalid.push(definition.key);
    }

    if (scope === "public" && !definition.key.startsWith("NEXT_PUBLIC_")) {
      invalid.push(`${definition.key} must use NEXT_PUBLIC_ to be exposed to the browser`);
    }
  });

  return { values, missing, invalid };
}

export function assertValidEnv<T extends Record<string, string | undefined>>(
  values: T,
  definitions: readonly EnvDefinition[],
  scope: "public" | "server"
): { [K in keyof T]: string | undefined } {
  const result = validateEnv(values, definitions, scope);

  if (result.missing.length > 0 || result.invalid.length > 0) {
    const details = [
      result.missing.length > 0 ? `missing: ${result.missing.join(", ")}` : null,
      result.invalid.length > 0 ? `invalid: ${result.invalid.join(", ")}` : null
    ]
      .filter(Boolean)
      .join("; ");

    throw new Error(`Invalid ${scope} environment configuration (${details}). Check .env.example and docs/env-and-config-architecture.md.`);
  }

  return result.values;
}

export function readOptionalEnvValue(value: string | undefined, key: string, format?: EnvDefinition["format"]): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  if (format === "url" && !isValidUrl(normalized)) {
    throw new Error(`Invalid optional environment variable ${key}: expected a valid URL.`);
  }
  return normalized;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
