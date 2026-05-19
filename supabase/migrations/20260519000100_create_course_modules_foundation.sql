create or replace view public.courses
with (security_invoker = true)
as
select
  id,
  title,
  slug,
  description,
  cover_image_url,
  is_published,
  created_at,
  updated_at
from public.products
where type = 'curso';

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint modules_title_not_empty check (char_length(btrim(title)) > 0),
  constraint modules_display_order_non_negative check (display_order >= 0)
);

create index if not exists modules_course_order_idx
on public.modules (course_id, display_order, created_at);

drop trigger if exists modules_set_updated_at on public.modules;
create trigger modules_set_updated_at
before update on public.modules
for each row
execute function public.set_updated_at();

alter table public.modules enable row level security;

drop policy if exists "Public can read published course modules" on public.modules;
create policy "Public can read published course modules"
on public.modules
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = modules.course_id
      and products.type = 'curso'
      and products.is_published = true
  )
);

drop policy if exists "Admins can manage modules" on public.modules;
create policy "Admins can manage modules"
on public.modules
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');

alter table public.lessons
add column if not exists module_id uuid references public.modules(id) on delete set null,
add column if not exists lesson_type text not null default 'video',
add column if not exists duration_minutes integer,
add column if not exists status text not null default 'draft';

create index if not exists lessons_module_order_idx
on public.lessons (module_id, display_order, created_at);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_lesson_type_allowed'
  ) then
    alter table public.lessons
    add constraint lessons_lesson_type_allowed check (lesson_type in ('video', 'text', 'pdf'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lessons_status_allowed'
  ) then
    alter table public.lessons
    add constraint lessons_status_allowed check (status in ('draft', 'published'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'lessons_duration_minutes_non_negative'
  ) then
    alter table public.lessons
    add constraint lessons_duration_minutes_non_negative check (duration_minutes is null or duration_minutes >= 0);
  end if;
end $$;
