create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.products(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null default 'active',
  enrolled_at timestamptz not null default now(),
  expires_at timestamptz,
  payment_provider text,
  payment_reference text,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.enrollments
add column if not exists course_id uuid references public.products(id) on delete cascade,
add column if not exists enrolled_at timestamptz not null default now(),
add column if not exists payment_provider text,
add column if not exists payment_reference text;

update public.enrollments
set course_id = product_id
where course_id is null;

alter table public.enrollments
alter column course_id set not null;

update public.enrollments
set enrolled_at = created_at
where enrolled_at is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_unique_user_course') then
    alter table public.enrollments
    add constraint enrollments_unique_user_course unique (user_id, course_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'enrollments_payment_provider_length') then
    alter table public.enrollments
    add constraint enrollments_payment_provider_length check (payment_provider is null or char_length(payment_provider) <= 80);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'enrollments_payment_reference_length') then
    alter table public.enrollments
    add constraint enrollments_payment_reference_length check (payment_reference is null or char_length(payment_reference) <= 180);
  end if;
end $$;

create index if not exists enrollments_course_status_idx on public.enrollments (course_id, status);
create index if not exists enrollments_user_course_status_idx on public.enrollments (user_id, course_id, status);
create index if not exists enrollments_enrolled_at_idx on public.enrollments (enrolled_at desc);

alter table public.enrollments enable row level security;

drop policy if exists "Users can read own enrollments" on public.enrollments;
create policy "Users can read own enrollments"
on public.enrollments
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Course owners can read course enrollments" on public.enrollments;
drop policy if exists "Course owners can manage course enrollments" on public.enrollments;
create policy "Course owners can manage course enrollments"
on public.enrollments
for all
to authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = enrollments.course_id
      and products.type = 'curso'
      and products.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products
    where products.id = enrollments.course_id
      and products.type = 'curso'
      and products.creator_id = auth.uid()
  )
);

drop policy if exists "Admins can manage enrollments" on public.enrollments;
create policy "Admins can manage enrollments"
on public.enrollments
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');

drop policy if exists "Course owners can read student profiles" on public.profiles;
create policy "Course owners can read student profiles"
on public.profiles
for select
to authenticated
using (
  role = 'student'
  and exists (
    select 1
    from public.products
    where products.type = 'curso'
      and products.creator_id = auth.uid()
  )
);

drop policy if exists "Active enrolled users can read enrolled products" on public.products;
create policy "Active enrolled users can read enrolled products"
on public.products
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments
    where enrollments.user_id = auth.uid()
      and enrollments.course_id = products.id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

drop policy if exists "Active enrolled users can read enrolled lessons" on public.lessons;
create policy "Active enrolled users can read enrolled lessons"
on public.lessons
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments
    where enrollments.user_id = auth.uid()
      and enrollments.course_id = lessons.product_id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

drop policy if exists "Active enrolled users can read enrolled lesson resources" on public.lesson_resources;
create policy "Active enrolled users can read enrolled lesson resources"
on public.lesson_resources
for select
to authenticated
using (
  exists (
    select 1
    from public.lessons
    join public.enrollments on enrollments.course_id = lessons.product_id
    where lessons.id = lesson_resources.lesson_id
      and enrollments.user_id = auth.uid()
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

drop policy if exists "Users can insert own active lesson progress" on public.lesson_progress;
create policy "Users can insert own active lesson progress"
on public.lesson_progress
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.enrollments
    where enrollments.user_id = auth.uid()
      and enrollments.course_id = lesson_progress.product_id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

drop policy if exists "Users can update own active lesson progress" on public.lesson_progress;
create policy "Users can update own active lesson progress"
on public.lesson_progress
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.enrollments
    where enrollments.user_id = auth.uid()
      and enrollments.course_id = lesson_progress.product_id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.enrollments
    where enrollments.user_id = auth.uid()
      and enrollments.course_id = lesson_progress.product_id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);
