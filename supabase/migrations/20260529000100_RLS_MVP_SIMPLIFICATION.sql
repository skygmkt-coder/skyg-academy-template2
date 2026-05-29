-- RLS_MVP_SIMPLIFICATION.sql
-- Controlled MVP-first RLS simplification for the course access surface.
-- Goal: remove circular policies between products, enrollments, lessons, and
-- lesson_resources by authorizing with direct row columns only.

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(app_private.current_user_role() = 'admin', false)
$$;

grant execute on function app_private.is_admin() to authenticated;

alter table public.lessons
  add column if not exists creator_id uuid references auth.users(id) on delete set null default auth.uid();

alter table public.lesson_resources
  add column if not exists product_id uuid references public.products(id) on delete cascade,
  add column if not exists creator_id uuid references auth.users(id) on delete set null default auth.uid(),
  add column if not exists is_published boolean not null default false;

update public.lessons l
set creator_id = p.creator_id
from public.products p
where p.id = l.product_id
  and l.creator_id is null;

update public.lesson_resources lr
set product_id = l.product_id,
    creator_id = coalesce(l.creator_id, p.creator_id),
    is_published = (l.is_preview = true and l.status = 'published')
from public.lessons l
left join public.products p on p.id = l.product_id
where l.id = lr.lesson_id
  and (
    lr.product_id is distinct from l.product_id
    or lr.creator_id is null
  );

create index if not exists lessons_creator_idx
on public.lessons (creator_id, created_at desc);

create index if not exists lessons_status_idx
on public.lessons (status, display_order, created_at);

create index if not exists lesson_resources_product_idx
on public.lesson_resources (product_id, display_order, created_at);

create index if not exists lesson_resources_creator_idx
on public.lesson_resources (creator_id, created_at desc);

create index if not exists lesson_resources_published_idx
on public.lesson_resources (is_published, display_order, created_at);

create or replace function app_private.sync_lesson_rls_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product_creator uuid;
begin
  select creator_id
  into product_creator
  from public.products
  where id = new.product_id;

  if new.creator_id is null then
    new.creator_id := product_creator;
  end if;

  return new;
end;
$$;

drop trigger if exists lessons_sync_rls_fields on public.lessons;
create trigger lessons_sync_rls_fields
before insert or update of product_id, creator_id on public.lessons
for each row
execute function app_private.sync_lesson_rls_fields();

create or replace function app_private.sync_lesson_resource_rls_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  lesson_product_id uuid;
  lesson_creator_id uuid;
begin
  select product_id, creator_id
  into lesson_product_id, lesson_creator_id
  from public.lessons
  where id = new.lesson_id;

  new.product_id := lesson_product_id;

  if new.creator_id is null then
    new.creator_id := lesson_creator_id;
  end if;

  return new;
end;
$$;

drop trigger if exists lesson_resources_sync_rls_fields on public.lesson_resources;
create trigger lesson_resources_sync_rls_fields
before insert or update of lesson_id, creator_id on public.lesson_resources
for each row
execute function app_private.sync_lesson_resource_rls_fields();

create or replace function app_private.sync_child_course_owner_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.creator_id is distinct from old.creator_id then
    update public.lessons
    set creator_id = new.creator_id
    where product_id = new.id;

    update public.lesson_resources
    set creator_id = new.creator_id
    where product_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists products_sync_child_course_owner_fields on public.products;
create trigger products_sync_child_course_owner_fields
after update of creator_id on public.products
for each row
execute function app_private.sync_child_course_owner_fields();

create or replace function app_private.sync_resources_from_lesson_owner_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.product_id is distinct from old.product_id
    or new.creator_id is distinct from old.creator_id then
    update public.lesson_resources
    set product_id = new.product_id,
        creator_id = new.creator_id
    where lesson_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists lessons_sync_resource_owner_fields on public.lessons;
create trigger lessons_sync_resource_owner_fields
after update of product_id, creator_id on public.lessons
for each row
execute function app_private.sync_resources_from_lesson_owner_fields();

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Users can update own profile basics" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Course owners can read student profiles" on public.profiles;

create policy "MVP profiles read own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "MVP profiles admin read"
on public.profiles
for select
to authenticated
using (app_private.is_admin());

create policy "MVP profiles update own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = app_private.current_user_role());

create policy "MVP profiles admin update"
on public.profiles
for update
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "Public can read published products" on public.products;
drop policy if exists "Admins can manage products" on public.products;
drop policy if exists "Course owners can manage course products" on public.products;
drop policy if exists "Admins can manage non-course products" on public.products;
drop policy if exists "Admins can manage course products" on public.products;
drop policy if exists "Active enrolled users can read enrolled products" on public.products;

create policy "MVP products read published"
on public.products
for select
to anon, authenticated
using (is_published = true);

create policy "MVP products creator read own"
on public.products
for select
to authenticated
using (creator_id = auth.uid());

create policy "MVP products admin read all"
on public.products
for select
to authenticated
using (app_private.is_admin());

create policy "MVP products creator insert own"
on public.products
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "MVP products creator update own"
on public.products
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "MVP products creator delete own"
on public.products
for delete
to authenticated
using (creator_id = auth.uid());

create policy "MVP products admin manage all"
on public.products
for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "Users can read own enrollments" on public.enrollments;
drop policy if exists "Admins can manage enrollments" on public.enrollments;
drop policy if exists "Course owners can read course enrollments" on public.enrollments;
drop policy if exists "Course owners can manage course enrollments" on public.enrollments;
drop policy if exists "Students can self enroll free courses" on public.enrollments;
drop policy if exists "Students can refresh own free course enrollment" on public.enrollments;

create policy "MVP enrollments read own"
on public.enrollments
for select
to authenticated
using (user_id = auth.uid());

create policy "MVP enrollments admin manage all"
on public.enrollments
for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "Public can read published product lessons" on public.lessons;
drop policy if exists "Admins can manage lessons" on public.lessons;
drop policy if exists "Course owners can manage lessons" on public.lessons;
drop policy if exists "Active enrolled users can read enrolled lessons" on public.lessons;

create policy "MVP lessons read published"
on public.lessons
for select
to anon, authenticated
using (status = 'published');

create policy "MVP lessons creator read own"
on public.lessons
for select
to authenticated
using (creator_id = auth.uid());

create policy "MVP lessons admin read all"
on public.lessons
for select
to authenticated
using (app_private.is_admin());

create policy "MVP lessons creator insert own"
on public.lessons
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "MVP lessons creator update own"
on public.lessons
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "MVP lessons creator delete own"
on public.lessons
for delete
to authenticated
using (creator_id = auth.uid());

create policy "MVP lessons admin manage all"
on public.lessons
for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "Public can read published lesson resources" on public.lesson_resources;
drop policy if exists "Public can read published preview lesson resources" on public.lesson_resources;
drop policy if exists "Admins can manage lesson resources" on public.lesson_resources;
drop policy if exists "Course owners can manage lesson resources" on public.lesson_resources;
drop policy if exists "Active enrolled users can read enrolled lesson resources" on public.lesson_resources;

create policy "MVP lesson resources read published"
on public.lesson_resources
for select
to anon, authenticated
using (is_published = true);

create policy "MVP lesson resources creator read own"
on public.lesson_resources
for select
to authenticated
using (creator_id = auth.uid());

create policy "MVP lesson resources admin read all"
on public.lesson_resources
for select
to authenticated
using (app_private.is_admin());

create policy "MVP lesson resources creator insert own"
on public.lesson_resources
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "MVP lesson resources creator update own"
on public.lesson_resources
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "MVP lesson resources creator delete own"
on public.lesson_resources
for delete
to authenticated
using (creator_id = auth.uid());

create policy "MVP lesson resources admin manage all"
on public.lesson_resources
for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());
