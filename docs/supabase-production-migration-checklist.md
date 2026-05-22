# Supabase Production Migration Checklist

This checklist is for safely initializing or repairing the Supabase database used by Vercel before continuing UI/UX work.

Recent production signal:

```text
ERROR: 42P01: relation "public.courses" does not exist
```

That error means the database is not only missing storefront/media columns. It is missing earlier base migrations that create the course view and its dependencies. Do not apply only the storefront/media migrations in this state.

Do not run migrations blindly. Verify the current production schema first, apply migrations in the repo order, then verify again.

## Complete Migration Order

Apply these files from top to bottom when bootstrapping a new or incomplete Supabase project:

1. `20260515000100_create_identity_foundation.sql`
2. `20260515000200_create_catalog_engine.sql`
3. `20260515000300_create_learning_access_engine.sql`
4. `20260516000400_create_commerce_foundation.sql`
5. `20260518000100_security_hardening.sql`
6. `20260519000100_create_course_modules_foundation.sql`
7. `20260519000200_create_course_ownership_system.sql`
8. `20260519000300_course_enrollment_system.sql`
9. `20260519000400_manual_course_payments.sql`
10. `20260519000500_public_course_storefront.sql`
11. `20260519000600_course_media_system.sql`
12. `202605200001_audit_events.sql`

## What Each Migration Does

### `20260515000100_create_identity_foundation.sql`

Creates identity and shared DB primitives:

- Type `public.app_role`
- Schema `app_private`
- Table `public.profiles`
- Table `public.brand_settings`
- Function `public.set_updated_at()`
- Function `app_private.handle_new_user()`
- Function `app_private.current_user_role()`
- Auth trigger `on_auth_user_created`
- RLS for profiles and brand settings

Required by almost every later migration because they call `app_private.current_user_role()` or reference `public.profiles`.

### `20260515000200_create_catalog_engine.sql`

Creates catalog/course base tables:

- Extension `pgcrypto`
- Table `public.products`
- Table `public.lessons`
- Table `public.lesson_resources`
- Updated-at triggers for catalog tables
- RLS for products, lessons, lesson resources
- Storage bucket `catalog-assets`
- Storage policies for catalog assets

Required before any course, enrollment, commerce, payment, storefront, or media migration.

### `20260515000300_create_learning_access_engine.sql`

Creates learner access/progress base:

- Table `public.enrollments`
- Table `public.lesson_progress`
- Enrollment policies for product, lesson, resource reads
- Lesson progress policies
- Updated-at triggers for enrollment/progress tables

Required before security hardening, manual payment approval, and media learner storage policies.

### `20260516000400_create_commerce_foundation.sql`

Creates commerce/manual payment base:

- Table `public.orders`
- Table `public.payments`
- Function `app_private.set_order_total_from_product()`
- Storage bucket `payment-proofs`
- Storage policies for payment proof uploads
- RLS for orders and payments

Required before security hardening and useful for legacy checkout/payment flows.

### `20260518000100_security_hardening.sql`

Hardens earlier access policies and adds transactional payment approval:

- Replaces public lesson resource policy with preview-only resource access
- Function `app_private.validate_lesson_progress_product()`
- Trigger `lesson_progress_validate_product`
- Restricts `catalog-assets` public read policy
- Hardens `payment-proofs` storage policies
- Function `public.approve_manual_payment_transaction(uuid, uuid)`

Depends on identity, catalog, learning access, and commerce tables.

### `20260519000100_create_course_modules_foundation.sql`

Creates course view and modules foundation:

- View `public.courses`
- Table `public.modules`
- Module RLS policies
- Adds to `public.lessons`:
  - `module_id`
  - `lesson_type`
  - `duration_minutes`
  - `status`
- Lesson constraints and module ordering indexes

This is the first migration that creates `public.courses`. If this is skipped, queries against `public.courses` fail with `42P01`.

### `20260519000200_create_course_ownership_system.sql`

Adds owner/admin course management:

- Adds `public.products.creator_id`
- Index `products_creator_idx`
- Replaces `public.courses` view to expose `creator_id`
- Replaces product/module/lesson policies for course owners

Required before admin course listing/editor and course-owner policies.

### `20260519000300_course_enrollment_system.sql`

Updates enrollment model for courses:

- Ensures/extends `public.enrollments`
- Adds:
  - `course_id`
  - `enrolled_at`
  - `payment_provider`
  - `payment_reference`
- Adds course enrollment constraints and indexes
- Replaces enrollment policies to use `course_id`
- Adds course-owner student profile read policy
- Updates lesson progress policies to use course enrollments

Required before manual course payments and media learner storage access.

### `20260519000400_manual_course_payments.sql`

Adds manual LATAM course payment system:

- Adds to `public.products`:
  - `payment_type`
  - `dimo_url`
  - `transfer_bank`
  - `transfer_clabe`
  - `transfer_owner`
  - `payment_notes`
- Replaces `public.courses` view to expose payment columns
- Table `public.payment_proofs`
- Payment proof policies
- Free-course self-enrollment policies
- Payment proof storage read policy

Required before storefront and media migrations because their `courses` view definitions reference payment columns.

### `20260519000500_public_course_storefront.sql`

Adds public storefront fields:

- Adds to `public.products`:
  - `show_on_landing`
  - `short_description`
  - `thumbnail_url`
  - `instructor_name`
- Constraint `products_storefront_fields_length_check`
- Index `products_public_course_storefront_idx`
- Function `public.ensure_product_slug()`
- Trigger `products_ensure_slug`
- Replaces `public.courses` view to expose storefront and payment columns
- Recreates policy `Admins can manage course products`

Requires ownership and payment columns to exist.

### `20260519000600_course_media_system.sql`

Adds course/lesson media and storage:

- Storage buckets:
  - `course-thumbnails`
  - `lesson-resources`
  - `lesson-media`
- Adds to `public.products`:
  - `thumbnail_path`
  - `cover_image_path`
- Adds to `public.lessons`:
  - `media_bucket`
  - `media_path`
  - `media_kind`
- Adds to `public.lesson_resources`:
  - `file_bucket`
  - `file_path`
  - `file_type`
  - `file_size`
- Media/file constraints
- Replaces `public.courses` view to expose storefront and media columns
- Course owner storage policies
- Learner media read policy

Requires storefront, payment, ownership, enrollments, modules, lessons, lesson resources, and profiles.

### `202605200001_audit_events.sql`

Adds audit logging:

- Table `public.audit_events`
- Audit indexes
- RLS for audit event inserts and admin reads

Depends on auth users and profiles/admin role.

## Dependency Map

- `identity` -> required by RLS helpers, profiles, admin checks.
- `catalog` -> required by products, lessons, lesson resources.
- `learning access` -> required by enrollment/progress and learner read policies.
- `commerce` -> required by legacy orders/payments and security hardening.
- `security hardening` -> depends on learning access and commerce objects.
- `course modules` -> creates `public.courses` and `public.modules`.
- `course ownership` -> adds `creator_id` and owner policies.
- `course enrollment system` -> evolves enrollments from product access to course access.
- `manual course payments` -> adds course payment fields and `payment_proofs`.
- `public storefront` -> adds public catalog fields and depends on payment fields.
- `course media` -> adds storage/media fields and depends on storefront/enrollments/ownership.
- `audit events` -> optional for boot, required for audit logging features.

## What Breaks If A Migration Is Skipped

- Skip identity: RLS policies and functions using `app_private.current_user_role()` fail.
- Skip catalog: `products`, `lessons`, `lesson_resources` do not exist.
- Skip learning access: `enrollments` and `lesson_progress` do not exist.
- Skip commerce: `orders`, `payments`, and `payment-proofs` bucket do not exist.
- Skip security hardening: approval transaction and hardened storage policies are missing.
- Skip course modules: `public.courses` and `public.modules` do not exist.
- Skip ownership: `creator_id` is missing and owner/admin course access breaks.
- Skip course enrollment system: `course_id` enrollment model is missing.
- Skip manual payments: payment columns and `payment_proofs` are missing.
- Skip storefront: `thumbnail_url`, public course fields, and storefront view columns are missing.
- Skip media: media storage buckets and media path columns are missing.
- Skip audit events: audit helper writes fail or silently no-op depending on caller behavior.

## Preflight: Detect Current DB State

Run these read-only queries in Supabase SQL Editor before applying anything.

### Check Base Tables And View

```sql
select
  n.nspname as schema_name,
  c.relname as relation_name,
  case c.relkind
    when 'r' then 'table'
    when 'v' then 'view'
    when 'm' then 'materialized_view'
    else c.relkind::text
  end as relation_type
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles',
    'brand_settings',
    'products',
    'lessons',
    'lesson_resources',
    'modules',
    'courses',
    'enrollments',
    'lesson_progress',
    'orders',
    'payments',
    'payment_proofs',
    'audit_events'
  )
order by c.relname;
```

Minimum healthy course stack after all required migrations:

- `profiles` table
- `brand_settings` table
- `products` table
- `lessons` table
- `lesson_resources` table
- `modules` table
- `courses` view
- `enrollments` table
- `lesson_progress` table
- `payment_proofs` table

`orders` and `payments` are required for legacy commerce/payment foundation. `audit_events` is required for audit logging.

### Check Required Functions

```sql
select
  n.nspname as schema_name,
  p.proname as function_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where (n.nspname, p.proname) in (
  ('public', 'set_updated_at'),
  ('app_private', 'handle_new_user'),
  ('app_private', 'current_user_role'),
  ('app_private', 'set_order_total_from_product'),
  ('app_private', 'validate_lesson_progress_product'),
  ('public', 'approve_manual_payment_transaction'),
  ('public', 'ensure_product_slug')
)
order by n.nspname, p.proname;
```

### Check Critical Columns

```sql
select
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'products' and column_name in (
      'creator_id',
      'payment_type',
      'dimo_url',
      'transfer_bank',
      'transfer_clabe',
      'transfer_owner',
      'payment_notes',
      'show_on_landing',
      'short_description',
      'thumbnail_url',
      'instructor_name',
      'thumbnail_path',
      'cover_image_path'
    ))
    or (table_name = 'lessons' and column_name in (
      'module_id',
      'lesson_type',
      'duration_minutes',
      'status',
      'media_bucket',
      'media_path',
      'media_kind'
    ))
    or (table_name = 'lesson_resources' and column_name in (
      'file_bucket',
      'file_path',
      'file_type',
      'file_size'
    ))
    or (table_name = 'enrollments' and column_name in (
      'product_id',
      'course_id',
      'status',
      'enrolled_at',
      'expires_at',
      'payment_provider',
      'payment_reference'
    ))
    or (table_name = 'payment_proofs' and column_name in (
      'user_id',
      'course_id',
      'image_url',
      'status',
      'reviewed_by',
      'reviewed_at'
    ))
  )
order by table_name, column_name;
```

### Check Storage Buckets

```sql
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id in (
  'catalog-assets',
  'payment-proofs',
  'course-thumbnails',
  'lesson-resources',
  'lesson-media'
)
order by id;
```

### Check `courses` View Columns

Only run this after `public.courses` appears in the base table/view query.

```sql
select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'courses'
  and column_name in (
    'id',
    'creator_id',
    'title',
    'slug',
    'description',
    'cover_image_url',
    'thumbnail_url',
    'thumbnail_path',
    'cover_image_path',
    'show_on_landing',
    'short_description',
    'instructor_name',
    'payment_type',
    'dimo_url',
    'transfer_bank',
    'transfer_clabe',
    'transfer_owner',
    'payment_notes'
  )
order by ordinal_position;
```

## Apply From Scratch In Supabase SQL Editor

1. Confirm you are in the Supabase project actually connected to Vercel.
2. Open SQL Editor.
3. Run the preflight queries above and save the results.
4. Apply migrations in the complete order listed above.
5. Run only one migration file at a time.
6. After each migration, confirm there are no SQL errors.
7. If a migration fails, stop. Do not continue with later migrations.
8. Capture the exact failing SQL error and rerun the preflight query for the object it was trying to create.
9. After all migrations pass, run the final verification queries below.
10. Redeploy Vercel only after verification passes.

Important: several early migrations use plain `create table` / `create type`, not `if not exists`. If production is partially initialized, a migration may fail because an object already exists. In that case, stop and inspect the object instead of editing the migration live.

## Applying To A Partially Migrated DB

Use the preflight result to decide where to start:

- If `profiles` or `app_private.current_user_role()` is missing, start at migration `1`.
- If `products`, `lessons`, or `lesson_resources` is missing, start at migration `2`.
- If `enrollments` or `lesson_progress` is missing, start at migration `3`.
- If `orders`, `payments`, or `payment-proofs` bucket is missing, start at migration `4`.
- If `courses` view or `modules` table is missing, start at migration `6`.
- If `creator_id` is missing on `products`, start at migration `7`.
- If `course_id` is missing on `enrollments`, start at migration `8`.
- If payment columns are missing on `products`, start at migration `9`.
- If `thumbnail_url` is missing, start at migration `10`.
- If media path columns or media buckets are missing, start at migration `11`.
- If `audit_events` is missing, apply migration `12`.

When in doubt, run the complete order in a staging Supabase project first and compare schema output before touching production.

## Final Verification Before Redeploy

### Relations

```sql
select
  c.relname,
  case c.relkind when 'r' then 'table' when 'v' then 'view' else c.relkind::text end as relation_type
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles',
    'brand_settings',
    'products',
    'lessons',
    'lesson_resources',
    'modules',
    'courses',
    'enrollments',
    'lesson_progress',
    'orders',
    'payments',
    'payment_proofs',
    'audit_events'
  )
order by c.relname;
```

Expected:

- All listed objects exist.
- `courses` is a view.
- The others are tables.

### Course View Smoke Test

```sql
select
  id,
  creator_id,
  title,
  slug,
  payment_type,
  show_on_landing,
  thumbnail_url,
  thumbnail_path,
  cover_image_path
from public.courses
limit 5;
```

This must run without missing-column errors.

### Storage Buckets

```sql
select
  id,
  public,
  file_size_limit
from storage.buckets
where id in (
  'catalog-assets',
  'payment-proofs',
  'course-thumbnails',
  'lesson-resources',
  'lesson-media'
)
order by id;
```

Expected:

- `catalog-assets`: public `true`
- `payment-proofs`: public `false`
- `course-thumbnails`: public `true`
- `lesson-resources`: public `false`
- `lesson-media`: public `false`

### RLS Policy Presence

```sql
select
  schemaname,
  tablename,
  count(*) as policy_count
from pg_policies
where schemaname in ('public', 'storage')
  and tablename in (
    'profiles',
    'brand_settings',
    'products',
    'lessons',
    'lesson_resources',
    'modules',
    'enrollments',
    'lesson_progress',
    'orders',
    'payments',
    'payment_proofs',
    'audit_events',
    'objects'
  )
group by schemaname, tablename
order by schemaname, tablename;
```

## Risks

- Applying migrations out of order can fail because later views reference columns not created yet.
- `public.courses` is created in migration `20260519000100_create_course_modules_foundation.sql`; storefront/media migrations only replace it.
- The storefront/media view definitions require `creator_id` and payment columns from earlier migrations.
- Storage policies depend on `profiles`, `enrollments`, `lessons`, `lesson_resources`, and `products` matching the expected schema.
- Supabase/PostgREST may need a short schema cache refresh window after SQL runs.
- Running migrations against the wrong Supabase project will not fix the Vercel deployment that uses another project.
- If existing policies were manually customized in production with the same names, `drop policy if exists` will replace them.
- Early migrations are not fully idempotent; object-exists errors should be investigated, not ignored.

## Rollback Notes

Prefer forward fixes over rollback. If a migration partially fails, capture the exact SQL Editor error and verify which objects were created before rerunning anything.

Do not drop columns as a rollback unless there is a confirmed backup and a clear data-loss decision. The safer rollback is usually to restore the expected view/policy definition and leave additive columns in place.

## Next Action

Because `public.courses` does not exist, treat the Vercel Supabase database as missing base course migrations. Start with the preflight queries, then apply the complete migration order from the earliest missing dependency. After final verification passes, redeploy Vercel.
