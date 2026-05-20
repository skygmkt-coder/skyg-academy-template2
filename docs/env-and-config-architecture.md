# Env and Config Architecture

This project centralizes runtime configuration in two small, reversible layers:

- `src/env`: environment variable definitions, runtime validation and public/server separation.
- `src/config`: stable application constants for routes, storage buckets, providers, payment values and feature flags.

The goal is not to change business logic. The goal is to make future SaaS features safer to add and easier to review.

## Current Env Model

Public variables are safe to ship to the browser and must use `NEXT_PUBLIC_`:

- `NEXT_PUBLIC_SUPABASE_URL`: required Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: required browser/server publishable key.
- `NEXT_PUBLIC_APP_URL`: optional canonical app URL for previews, callbacks and future absolute URLs.

Server-only variables must never use `NEXT_PUBLIC_`:

- `SUPABASE_SERVICE_ROLE_KEY`: optional and reserved for future server-only jobs or admin-only services. It must never be imported by client modules.

## File Responsibilities

- `src/env/public.ts`: validates public envs without exposing private values.
- `src/env/client.ts`: client-safe wrapper for browser code.
- `src/env/server.ts`: server wrapper that can read public envs and optional server-only values.
- `src/env/validation.ts`: tiny runtime validation helpers with no external dependencies.
- `src/config/storage.ts`: bucket names, signed URL TTLs, MIME types and upload limits.
- `src/config/routes.ts`: internal route constants and route builders.
- `src/config/payments.ts`: payment types, payment methods and provider identifiers.
- `src/config/providers.ts`: provider identifiers and provider-specific static config.
- `src/config/app.ts`: app-level constants and conservative feature flags.

Existing compatibility wrappers remain in `lib/supabase/env-client.ts` and `lib/supabase/env-server.ts` so current imports continue to work.

## How To Add New Envs

1. Decide if the value is public or server-only.
2. Public values must start with `NEXT_PUBLIC_` and go in `src/env/public.ts`.
3. Server-only values go in `src/env/server.ts` and must not be imported by client components.
4. Add the variable to `.env.example` with a short comment.
5. Document the variable here if it affects deploy, auth, payments, storage or routing.
6. Use a helper function to expose a domain-specific shape instead of reading `process.env` throughout the app.

Example public env:

```ts
// src/env/public.ts
{ key: "NEXT_PUBLIC_APP_URL", required: false, format: "url", public: true }
```

Example server-only env:

```ts
// src/env/server.ts
readOptionalEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")
```

## Security Rules

- Never expose Supabase `service_role`, secret keys, payment secrets or webhook secrets through `NEXT_PUBLIC_`.
- Never import `src/env/server.ts` from client components, client hooks or files marked with `"use client"`.
- Keep public env validation strict: public keys must start with `NEXT_PUBLIC_`.
- Prefer optional envs for new non-critical capabilities to avoid breaking production deploys.
- Required envs should fail with clear messages and point to `.env.example` plus this document.
- Do not commit `.env.local` or real credentials. If committed, rotate the secret and remove it in a separate security PR.

## Public vs Private Separation

Use `src/env/client.ts` when code can run in the browser:

```ts
import { getClientEnv } from "@/src/env/client";

const env = getClientEnv();
```

Use `src/env/server.ts` only in server code, route handlers, server actions, repositories and Next config:

```ts
import { getServerEnv } from "@/src/env/server";

const env = getServerEnv();
```

For Supabase compatibility, existing code may continue using:

```ts
import { getSupabaseServerEnv } from "@/lib/supabase/env-server";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env-client";
```

## Naming Conventions

- Env vars: `UPPER_SNAKE_CASE`.
- Public env vars: `NEXT_PUBLIC_<DOMAIN>_<NAME>`.
- Server-only env vars: `<DOMAIN>_<NAME>` without `NEXT_PUBLIC_`.
- Storage buckets: kebab-case in `STORAGE_BUCKETS`.
- Routes: route constants in `APP_ROUTES`, route builders for dynamic paths.
- Payment providers: centralized in `PAYMENT_PROVIDERS`.
- Feature flags: boolean values in `FEATURE_FLAGS`; default to `false` unless a feature is production-ready.

## Config Examples

Storage bucket usage:

```ts
import { STORAGE_BUCKETS } from "@/src/config";

supabase.storage.from(STORAGE_BUCKETS.PAYMENT_PROOFS);
```

Route usage:

```ts
import { APP_ROUTES, courseEditorPath } from "@/src/config";

fetch(APP_ROUTES.uploadCourseMedia);
redirect(courseEditorPath(courseId));
```

Payment provider usage:

```ts
import { PAYMENT_PROVIDERS } from "@/src/config";

paymentProvider: PAYMENT_PROVIDERS.MANUAL_PROOF;
```

## Hardcoded Values Found

- Supabase public env reads were duplicated between client/server wrappers and `next.config.ts`.
- Storage bucket names were hardcoded in course media, catalog uploads and payment proof uploads.
- API upload/download routes were hardcoded in client upload helpers.
- Manual payment provider references such as `manual-proof`, `free` and `self-enrollment` were embedded in services.
- `.env.local` exists in the remote tree even though `.gitignore` ignores local env files; this should be handled as a separate security cleanup with rotation if it contains real values.

## Change Boundaries

This hardening step does not:

- Add new dependencies.
- Change database schema.
- Change RLS policies.
- Change payment behavior.
- Change bucket names.
- Change business logic.
- Move existing feature modules.

Future hardening PRs should build on this layer instead of reading `process.env` or repeating bucket names directly.
