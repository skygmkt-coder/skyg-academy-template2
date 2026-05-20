# Error Handling Architecture

This document defines the reusable error handling foundation for the SaaS architecture. It is intentionally small, dependency-free and compatible with the current production behavior.

## Philosophy

Errors should be useful internally and safe externally.

- Internal logs may include context that helps debug a failed operation.
- Client-facing responses must never expose secrets, SQL details, stack traces, tokens or raw provider payloads.
- Domain code should throw typed errors when the error category is known.
- Route handlers and server actions should normalize errors at the boundary.
- Unexpected errors should be logged and shown to users as a generic message.

## Structure

- `src/errors/classes.ts`: typed error classes.
- `src/errors/normalize.ts`: conversion from unknown errors to a safe normalized shape.
- `src/errors/route-handlers.ts`: helpers for API/Route Handler responses.
- `src/errors/server-actions.ts`: helpers for action state responses.
- `src/logger/index.ts`: simple structured logger with development/production behavior.

## Error Types

### AppError

Base class for expected application errors. Use this only when a more specific subclass does not fit.

```ts
throw new AppError({ message: "No pudimos completar la operacion.", statusCode: 500 });
```

### ValidationError

Use for invalid user input, malformed JSON, missing query params or invalid form payloads.

```ts
throw new ValidationError("Payload invalido.");
```

### AuthError

Use when the user must be authenticated. Existing auth helpers may still redirect; use `AuthError` in new non-redirect API boundaries.

```ts
throw new AuthError();
```

### PermissionError

Use when the user is authenticated but does not own or cannot manage the resource.

```ts
throw new PermissionError("No tienes permisos para modificar este curso.");
```

### StorageError

Use for Supabase Storage upload, signed URL, delete or file validation failures.

```ts
throw new StorageError("No pudimos preparar la carga del archivo.", { cause: error });
```

### PaymentError

Use for manual payment, proof review, enrollment-after-payment or payment provider failures.

```ts
throw new PaymentError("Ya tienes un comprobante pendiente de revision.");
```

## Route Handler Rules

- Put request parsing inside `try/catch`.
- Use `readJsonBody(request)` instead of calling `request.json()` directly in new handlers.
- Return validation failures with `validationErrorResponse()` or `ValidationError`.
- Use `routeErrorResponse(error, { context, fallbackMessage })` at the boundary.
- Include route context, not secrets or full payloads.
- Do not return raw `error.message` for unexpected errors.

Example:

```ts
export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationErrorResponse("Payload invalido.");
    return NextResponse.json(await service(parsed.data));
  } catch (error) {
    return routeErrorResponse(error, {
      context: { route: "POST /api/example" },
      fallbackMessage: "No pudimos completar la solicitud."
    });
  }
}
```

## Server Action Rules

- Validate form data before calling services.
- Use typed domain errors in services when possible.
- For actions that return state, use `errorActionState()` and `successActionState()`.
- For actions that redirect, allow redirects to complete and avoid catching broad errors around `redirect()`.
- Do not leak raw provider, SQL or storage messages to end users unless wrapped in a client-safe `AppError`.

Example:

```ts
try {
  await updateThing(input);
} catch (error) {
  return errorActionState(error, "No pudimos guardar los cambios.", { action: "updateThing" });
}
```

## Logger Behavior

The logger is intentionally simple:

- Development: readable console output and debug logs enabled.
- Production: structured JSON logs and debug logs disabled.
- Keys containing `password`, `token`, `secret` or `key` are redacted.

Use:

```ts
import { logger } from "@/src/logger";

logger.error("Payment review failed", { proofId, error });
```

## What Not To Expose To Clients

Never expose:

- Supabase service role keys or publishable key values in errors.
- Storage signed upload tokens or signed read URLs in logs visible to clients.
- SQL statements, RLS policy details or database stack traces.
- Payment proof URLs if they are private paths.
- Provider raw responses from future payment integrations.
- Full request bodies for uploads, payments, auth or profile changes.

## Findings From Current Code

- Route handlers duplicated `{ message }` error responses and status decisions.
- Some handlers parsed `request.json()` before `try/catch`, which can throw unhandled errors on malformed JSON.
- Several server actions duplicate `errorState` and `successState` helpers.
- Some services return silent fallbacks such as `"#"` when signed URLs fail; these should be reviewed in a later PR.
- Many domain services throw generic `Error`; gradual migration to typed errors should happen close to future feature work.

## Adoption Strategy

1. Use the helpers for all new Route Handlers and Server Actions.
2. Migrate existing upload/download handlers first because they are high-risk boundaries.
3. Migrate payment and enrollment services in a separate PR using `PaymentError` and `PermissionError`.
4. Add audit logging after typed errors are in place.
5. Keep behavior-compatible fallbacks until production flows are covered by checks.
