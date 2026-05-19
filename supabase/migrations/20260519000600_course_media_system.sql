insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('course-thumbnails', 'course-thumbnails', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('lesson-resources', 'lesson-resources', false, 52428800, array['application/pdf','application/zip','text/plain','image/jpeg','image/png','image/webp']),
  ('lesson-media', 'lesson-media', false, 524288000, array['video/mp4','video/webm','application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.products
  add column if not exists thumbnail_path text,
  add column if not exists cover_image_path text;

alter table public.lessons
  add column if not exists media_bucket text,
  add column if not exists media_path text,
  add column if not exists media_kind text;

alter table public.lesson_resources
  add column if not exists file_bucket text,
  add column if not exists file_path text,
  add column if not exists file_type text,
  add column if not exists file_size bigint;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'lessons_media_kind_check') then
    alter table public.lessons
      add constraint lessons_media_kind_check
      check (media_kind is null or media_kind in ('video','pdf','image','external'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lesson_resources_file_size_check') then
    alter table public.lesson_resources
      add constraint lesson_resources_file_size_check
      check (file_size is null or file_size >= 0);
  end if;
end $$;

create or replace view public.courses with (security_invoker = true) as
select
  id,
  creator_id,
  title,
  slug,
  description,
  cover_image_url,
  is_published,
  created_at,
  updated_at,
  payment_type,
  dimo_url,
  transfer_bank,
  transfer_clabe,
  transfer_owner,
  payment_notes,
  show_on_landing,
  short_description,
  thumbnail_url,
  instructor_name,
  thumbnail_path,
  cover_image_path
from public.products
where type = 'curso';

drop policy if exists "Course owners can manage lesson resources" on public.lesson_resources;
create policy "Course owners can manage lesson resources"
on public.lesson_resources
for all
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    join public.products p on p.id = l.product_id
    where l.id = lesson_resources.lesson_id
      and p.type = 'curso'
      and p.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lessons l
    join public.products p on p.id = l.product_id
    where l.id = lesson_resources.lesson_id
      and p.type = 'curso'
      and p.creator_id = auth.uid()
  )
);

drop policy if exists "Public can read course thumbnails" on storage.objects;
create policy "Public can read course thumbnails"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'course-thumbnails');

drop policy if exists "Course owners can upload course thumbnails" on storage.objects;
create policy "Course owners can upload course thumbnails"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Course owners can update course thumbnails" on storage.objects;
create policy "Course owners can update course thumbnails"
on storage.objects
for update
to authenticated
using (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Course owners can delete course thumbnails" on storage.objects;
create policy "Course owners can delete course thumbnails"
on storage.objects
for delete
to authenticated
using (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Course owners can upload lesson resources" on storage.objects;
create policy "Course owners can upload lesson resources"
on storage.objects
for insert
to authenticated
with check (bucket_id in ('lesson-resources', 'lesson-media') and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Course owners can update lesson resources" on storage.objects;
create policy "Course owners can update lesson resources"
on storage.objects
for update
to authenticated
using (bucket_id in ('lesson-resources', 'lesson-media') and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id in ('lesson-resources', 'lesson-media') and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Course owners can delete lesson resources" on storage.objects;
create policy "Course owners can delete lesson resources"
on storage.objects
for delete
to authenticated
using (bucket_id in ('lesson-resources', 'lesson-media') and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Course learners can read lesson storage" on storage.objects;
create policy "Course learners can read lesson storage"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('lesson-resources', 'lesson-media')
  and (
    exists (
      select 1
      from public.lesson_resources lr
      join public.lessons l on l.id = lr.lesson_id
      join public.products p on p.id = l.product_id
      where lr.file_bucket = storage.objects.bucket_id
        and lr.file_path = storage.objects.name
        and (
          p.creator_id = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
          or exists (select 1 from public.enrollments e where e.user_id = auth.uid() and e.status = 'active' and e.course_id = p.id and (e.expires_at is null or e.expires_at > now()))
        )
    )
    or exists (
      select 1
      from public.lessons l
      join public.products p on p.id = l.product_id
      where l.media_bucket = storage.objects.bucket_id
        and l.media_path = storage.objects.name
        and (
          p.creator_id = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
          or exists (select 1 from public.enrollments e where e.user_id = auth.uid() and e.status = 'active' and e.course_id = p.id and (e.expires_at is null or e.expires_at > now()))
        )
    )
  )
);

grant select, update on public.products to authenticated;
grant select, update on public.lessons to authenticated;
grant select, insert, update, delete on public.lesson_resources to authenticated;
