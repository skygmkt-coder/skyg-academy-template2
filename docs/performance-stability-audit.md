# Performance & Stability Audit

## Scope

Audited routes:

- `/`
- `/cursos`
- `/login`
- `/mis-productos`
- `/admin`
- `/legal/privacy`
- `/legal/terms`
- `/legal/cookies`
- `/legal/disclaimer`

Audited data sources:

- `getActiveBrandSettings()`
- `listPublishedProducts()`
- `listPublicProducts()`
- `listPublicStorefrontCourses()`
- `/mis-productos` student product and payment queries
- `/admin` course, product, payment and student queries

## Root Cause

The app depended on Supabase reads inside Server Components without explicit timeouts. A slow or unavailable Supabase request could block the full render path, especially because `getActiveBrandSettings()` runs from the root layout and several pages also fetch catalog/dashboard data in `Promise.all`.

This made public routes sensitive to non-critical data:

- `/login` and `/legal/*` could wait on branding.
- `/` could wait on branding and public product catalog.
- `/cursos` could wait on storefront catalog counts.
- `/mis-productos` could wait on student enrollments/payments after login.
- `/admin` could wait on multiple dashboard queries at once.

## Changes Applied

- Added `src/services/performance.ts` with reusable timeout and fallback helpers.
- Added a 1.2s timeout for `brand_settings` and fallback brand/legal settings.
- Memoized `getActiveBrandSettings()` with React cache to avoid duplicate brand fetches in the same request.
- Made public product listing return an empty catalog fallback after a safe timeout.
- Made `/cursos` use a bounded storefront catalog fetch while keeping the existing premium fallback state.
- Made `/mis-productos` render with empty operational states if student products or payment queries fail or time out.
- Made `/admin` render with empty operational states if dashboard summary queries fail or time out.

## Timeout Policy

- Brand settings: `1200ms`
- Public catalog: `2200ms`
- Dashboard queries: `2800ms`

These deadlines prioritize fast first paint and operational continuity. They do not cancel Supabase at the network layer, but they prevent Server Components from waiting indefinitely for non-critical data.

## Remaining Risks

- Auth-required routes still depend on `requireUser()` / `requireAdmin()` before rendering. That is intentional because access control should stay strict.
- Some secondary admin pages may still benefit from the same bounded-data pattern in future PRs.
- If Supabase latency is consistently high, indexes and query plans should be audited separately.
- `Promise.race` does not abort the underlying Supabase request; a future improvement could add abortable fetch support at the Supabase client layer if needed.

## Next Recommendations

- Add per-route monitoring in Vercel for slow Server Component renders.
- Audit Supabase query plans for `products`, `profiles`, `enrollments`, `orders`, `payments`, `modules`, `lessons` and `lesson_progress`.
- Add route-level `loading.tsx` files for authenticated dashboard sections.
- Extend bounded fallbacks to `/admin/pagos`, `/admin/productos`, `/admin/cursos` after this PR is validated in production.
