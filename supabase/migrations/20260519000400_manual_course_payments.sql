alter table public.products
  add column if not exists payment_type text not null default 'free',
  add column if not exists dimo_url text,
  add column if not exists transfer_bank text,
  add column if not exists transfer_clabe text,
  add column if not exists transfer_owner text,
  add column if not exists payment_notes text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_payment_type_check'
  ) then
    alter table public.products
      add constraint products_payment_type_check
      check (payment_type in ('free', 'transfer', 'dimo', 'mixed'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'products_payment_settings_length_check'
  ) then
    alter table public.products
      add constraint products_payment_settings_length_check
      check (
        length(coalesce(dimo_url, '')) <= 500 and
        length(coalesce(transfer_bank, '')) <= 160 and
        length(coalesce(transfer_clabe, '')) <= 32 and
        length(coalesce(transfer_owner, '')) <= 160 and
        length(coalesce(payment_notes, '')) <= 1000
      );
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
  payment_notes
from public.products
where type = 'curso';

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  notes text,
  status text not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_proofs_status_check check (status in ('pending', 'approved', 'rejected')),
  constraint payment_proofs_image_url_check check (length(trim(image_url)) > 0),
  constraint payment_proofs_notes_length_check check (length(coalesce(notes, '')) <= 1000)
);

create index if not exists payment_proofs_user_course_idx on public.payment_proofs(user_id, course_id);
create index if not exists payment_proofs_course_status_idx on public.payment_proofs(course_id, status, created_at desc);

create trigger payment_proofs_set_updated_at
before update on public.payment_proofs
for each row execute function public.set_updated_at();

alter table public.payment_proofs enable row level security;

drop policy if exists "Students can view own course payment proofs" on public.payment_proofs;
create policy "Students can view own course payment proofs"
on public.payment_proofs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Students can submit own course payment proofs" on public.payment_proofs;
create policy "Students can submit own course payment proofs"
on public.payment_proofs
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
  and exists (
    select 1
    from public.products p
    where p.id = course_id
      and p.type = 'curso'
      and p.payment_type in ('transfer', 'dimo', 'mixed')
  )
);

drop policy if exists "Course owners can view payment proofs" on public.payment_proofs;
create policy "Course owners can view payment proofs"
on public.payment_proofs
for select
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = course_id
      and p.type = 'curso'
      and p.creator_id = auth.uid()
  )
);

drop policy if exists "Course owners can review payment proofs" on public.payment_proofs;
create policy "Course owners can review payment proofs"
on public.payment_proofs
for update
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = course_id
      and p.type = 'curso'
      and p.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products p
    where p.id = course_id
      and p.type = 'curso'
      and p.creator_id = auth.uid()
  )
);

drop policy if exists "Admins can manage all payment proofs" on public.payment_proofs;
create policy "Admins can manage all payment proofs"
on public.payment_proofs
for all
to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Students can self enroll free courses" on public.enrollments;
create policy "Students can self enroll free courses"
on public.enrollments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and product_id = course_id
  and status = 'active'
  and exists (
    select 1
    from public.products p
    where p.id = course_id
      and p.type = 'curso'
      and p.payment_type = 'free'
  )
);

drop policy if exists "Students can refresh own free course enrollment" on public.enrollments;
create policy "Students can refresh own free course enrollment"
on public.enrollments
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and product_id = course_id
  and status = 'active'
  and exists (
    select 1
    from public.products p
    where p.id = course_id
      and p.type = 'curso'
      and p.payment_type = 'free'
  )
);

drop policy if exists "Course owners can read payment proof objects" on storage.objects;
create policy "Course owners can read payment proof objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and exists (
    select 1
    from public.payment_proofs pp
    join public.products p on p.id = pp.course_id
    where pp.image_url = storage.objects.name
      and (
        pp.user_id = auth.uid()
        or p.creator_id = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      )
  )
);

grant select, insert, update on public.payment_proofs to authenticated;
