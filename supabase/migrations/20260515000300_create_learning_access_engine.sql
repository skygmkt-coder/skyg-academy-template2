create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null default 'active',
  expires_at timestamptz,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_status_allowed check (status in ('active', 'expired', 'revoked')),
  constraint enrollments_reason_length check (granted_reason is null or char_length(granted_reason) <= 500),
  constraint enrollments_unique_user_product unique (user_id, product_id)
);

create index enrollments_user_status_idx on public.enrollments (user_id, status);
create index enrollments_product_status_idx on public.enrollments (product_id, status);
create index enrollments_expires_at_idx on public.enrollments (expires_at);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean not null default false,
  last_viewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_progress_unique_user_lesson unique (user_id, lesson_id),
  constraint lesson_progress_completed_at_required check (
    (is_completed = false) or (completed_at is not null)
  )
);

create index lesson_progress_user_product_idx on public.lesson_progress (user_id, product_id);
create index lesson_progress_user_product_completed_idx on public.lesson_progress (user_id, product_id, is_completed);
create index lesson_progress_last_viewed_idx on public.lesson_progress (user_id, product_id, last_viewed_at desc);

create trigger enrollments_set_updated_at
before update on public.enrollments
for each row
execute function public.set_updated_at();

create trigger lesson_progress_set_updated_at
before update on public.lesson_progress
for each row
execute function public.set_updated_at();

alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Active enrolled users can read enrolled products"
on public.products
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments
    where enrollments.user_id = auth.uid()
      and enrollments.product_id = products.id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

create policy "Active enrolled users can read enrolled lessons"
on public.lessons
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments
    where enrollments.user_id = auth.uid()
      and enrollments.product_id = lessons.product_id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

create policy "Active enrolled users can read enrolled lesson resources"
on public.lesson_resources
for select
to authenticated
using (
  exists (
    select 1
    from public.lessons
    join public.enrollments on enrollments.product_id = lessons.product_id
    where lessons.id = lesson_resources.lesson_id
      and enrollments.user_id = auth.uid()
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

create policy "Users can read own enrollments"
on public.enrollments
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can manage enrollments"
on public.enrollments
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');

create policy "Users can read own lesson progress"
on public.lesson_progress
for select
to authenticated
using (user_id = auth.uid());

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
      and enrollments.product_id = lesson_progress.product_id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

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
      and enrollments.product_id = lesson_progress.product_id
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
      and enrollments.product_id = lesson_progress.product_id
      and enrollments.status = 'active'
      and (enrollments.expires_at is null or enrollments.expires_at > now())
  )
);

create policy "Admins can manage lesson progress"
on public.lesson_progress
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');
