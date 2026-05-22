# Supabase Production Migration Checklist

This checklist is for safely applying and verifying the course storefront and media migrations in the Supabase project used by Vercel.

Critical migrations:

- `supabase/migrations/20260519000500_public_course_storefront.sql`
- `supabase/migrations/20260519000600_course_media_system.sql`

Do not run these changes blindly. Verify the current production schema first, apply migrations in order, then verify again.

## What The Migrations Add

### `20260519000500_public_course_storefront.sql`

`public.products` columns:

- `show_on_landing boolean not null default true`
- `short_description text`
- `thumbnail_url text`
- `instructor_name text`

Other database objects:

- Constraint `products_storefront_fields_length_check`
- Index `products_public_course_storefront_idx`
- Function `public.ensure_product_slug()`
- Trigger `products_ensure_slug`
- Replaces `public.courses` view to include storefront/payment fields
- Recreates policy `Admins can manage course products`
- Grants `select` on `public.products` to `anon` and `authenticated`

### `20260519000600_course_media_system.sql`

Storage buckets:

- `course-thumbnails`
- `lesson-resources`
- `lesson-media`

`public.products` columns:

- `thumbnail_path text`
- `cover_image_path text`

`public.lessons` columns:

- `media_bucket text`
- `media_path text`
- `media_kind text`

`public.lesson_resources` columns:

- `file_bucket text`
- `file_path text`
- `file_type text`
- `file_size bigint`

Other database objects:

- Constraint `lessons_media_kind_check`
- Constraint `lesson_resources_file_size_check`
- Replaces `public.courses` view to include storefront and media fields
- Recreates lesson resource ownership policy
- Creates storage policies for course thumbnails, lesson resources, lesson media, and learner read access
- Grants select/update permissions needed by authenticated course admin flows

## Prerequisites

Before applying these migrations, confirm the previous course/payment migrations are already present. The storefront/media views reference payment columns that are expected to exist on `public.products`.

Run this read-only query in Supabase SQL Editor:

```sql
select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('products', 'lessons', 'lesson_resources', 'courses')
  and column_name in (
    'payment_type',
    'dimo_url',
    'transfer_bank',
    'transfer_clabe',
    'transfer_owner',
    'payment_notes',
    'creator_id'
  )
order by table_name, column_name;
```

Expected minimum before applying:

- `public.products.creator_id`
- `public.products.payment_type`
- `public.products.dimo_url`
- `public.products.transfer_bank`
- `public.products.transfer_clabe`
- `public.products.transfer_owner`
- `public.products.payment_notes`

If these are missing, stop and apply the earlier ownership/payment migrations first.

## Preflight Verification

Run these read-only queries before applying anything.

### Check Storefront Columns

```sql
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'products'
  and column_name in (
    'show_on_landing',
    'short_description',
    'thumbnail_url',
    'instructor_name'
  )
order by column_name;
```

### Check Media Columns

```sql
select
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'products' and column_name in ('thumbnail_path', 'cover_image_path'))
    or (table_name = 'lessons' and column_name in ('media_bucket', 'media_path', 'media_kind'))
    or (table_name = 'lesson_resources' and column_name in ('file_bucket', 'file_path', 'file_type', 'file_size'))
  )
order by table_name, column_name;
```

### Check `courses` View Columns

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

### Check Storage Buckets

```sql
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id in ('course-thumbnails', 'lesson-resources', 'lesson-media')
order by id;
```

### Check Policies And Constraints

```sql
select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname in ('public', 'storage')
  and (
    tablename in ('products', 'lesson_resources')
    or policyname ilike '%course thumbnails%'
    or policyname ilike '%lesson resources%'
    or policyname ilike '%lesson storage%'
  )
order by schemaname, tablename, policyname;
```

```sql
select
  conname,
  conrelid::regclass as table_name
from pg_constraint
where conname in (
  'products_storefront_fields_length_check',
  'lessons_media_kind_check',
  'lesson_resources_file_size_check'
)
order by conname;
```

## Apply In Supabase SQL Editor

1. Open the Supabase project connected to Vercel production/preview.
2. Go to SQL Editor.
3. Run the preflight verification queries above.
4. Confirm the earlier ownership/payment columns exist.
5. Open `supabase/migrations/20260519000500_public_course_storefront.sql`.
6. Paste the full migration SQL into SQL Editor.
7. Run it once.
8. Confirm there are no errors.
9. Open `supabase/migrations/20260519000600_course_media_system.sql`.
10. Paste the full migration SQL into SQL Editor.
11. Run it once.
12. Confirm there are no errors.
13. Run the post-apply verification queries below.
14. Redeploy Vercel after schema verification passes.

These migrations are written with `if not exists`, `drop policy if exists`, and `on conflict` guards where needed, so they are intended to be safe to run once against partially migrated environments. Still, review any SQL Editor error before retrying.

## Post-Apply Verification

Run this consolidated query after applying both migrations:

```sql
select
  table_name,
  count(*) as found_columns
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'products' and column_name in (
      'show_on_landing',
      'short_description',
      'thumbnail_url',
      'instructor_name',
      'thumbnail_path',
      'cover_image_path'
    ))
    or (table_name = 'lessons' and column_name in (
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
    or (table_name = 'courses' and column_name in (
      'thumbnail_url',
      'thumbnail_path',
      'cover_image_path',
      'show_on_landing',
      'short_description',
      'instructor_name'
    ))
  )
group by table_name
order by table_name;
```

Expected counts:

- `products`: `6`
- `lessons`: `3`
- `lesson_resources`: `4`
- `courses`: `6`

Check storage buckets:

```sql
select
  id,
  public,
  file_size_limit
from storage.buckets
where id in ('course-thumbnails', 'lesson-resources', 'lesson-media')
order by id;
```

Expected:

- `course-thumbnails`: public `true`
- `lesson-resources`: public `false`
- `lesson-media`: public `false`

Check `courses` view can be queried:

```sql
select
  id,
  title,
  thumbnail_url,
  thumbnail_path,
  cover_image_path,
  show_on_landing
from public.courses
limit 5;
```

If this query fails with a missing column, the view was not replaced successfully or one of the expected `products` columns is still missing.

## Risks

- Replacing `public.courses` can fail if prerequisite payment/ownership columns are missing.
- Storage policies depend on `profiles`, `enrollments`, `lessons`, `lesson_resources`, and `products` matching the expected course schema.
- `create or replace view public.courses` changes the exposed column contract immediately for PostgREST.
- Supabase/PostgREST may need a short schema cache refresh window after SQL runs.
- Running migrations against the wrong Supabase project will not fix the Vercel deployment that uses another project.
- If existing policies were manually customized in production with the same names, `drop policy if exists` will replace them.

## Rollback Notes

Prefer forward fixes over rollback. If a migration partially fails, capture the exact SQL Editor error and verify which objects were created before rerunning anything.

Do not drop columns as a rollback unless there is a confirmed backup and a clear data-loss decision. The safer rollback is usually to restore the previous view definition and leave additive columns in place.

## Next Action

Apply the two migrations in order in the Supabase project used by Vercel, then redeploy the latest `main` build. If verification fails, collect the failing SQL statement and the result of the preflight queries before making further schema changes.
