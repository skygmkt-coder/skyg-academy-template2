# Course Schema Compatibility

## Context

`lib/courses/repository.ts` supports three database states because Vercel can build against a Supabase database that is behind the committed migrations.

## Products / Courses Columns

Base catalog schema (`20260515000200_create_catalog_engine.sql` and ownership view):

- `id`
- `creator_id`
- `title`
- `slug`
- `description`
- `cover_image_url`
- `is_published`
- `created_at`
- `updated_at`

Storefront schema (`20260519000500_public_course_storefront.sql`):

- all base columns
- `thumbnail_url`
- `show_on_landing`
- `short_description`
- `instructor_name`

Media schema (`20260519000600_course_media_system.sql`):

- all storefront columns
- `thumbnail_path`
- `cover_image_path`

## Lessons Columns

Base catalog schema:

- `id`
- `product_id`
- `module_id`
- `title`
- `slug`
- `description`
- `video_url`
- `display_order`
- `is_preview`
- `lesson_type`
- `duration_minutes`
- `status`
- `created_at`
- `updated_at`

Media schema:

- all base columns
- `media_bucket`
- `media_path`
- `media_kind`

## Lesson Resources Columns

Base catalog schema:

- `id`
- `lesson_id`
- `title`
- `file_url`
- `display_order`
- `created_at`
- `updated_at`

Media schema:

- all base columns
- `file_bucket`
- `file_path`
- `file_type`
- `file_size`

## Rule

Code should try the newest schema first and only fall back when Supabase reports a missing media/storefront column. The long-term fix is still to apply the missing Supabase migrations to the database used by Vercel.
