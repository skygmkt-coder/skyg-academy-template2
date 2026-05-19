alter table public.products
add column if not exists creator_id uuid references auth.users(id) on delete set null default auth.uid();

create index if not exists products_creator_idx
on public.products (creator_id, created_at desc);

create or replace view public.courses
with (security_invoker = true)
as
select
  id,
  creator_id,
  title,
  slug,
  description,
  cover_image_url,
  is_published,
  created_at,
  updated_at
from public.products
where type = 'curso';

drop policy if exists "Admins can manage products" on public.products;
drop policy if exists "Course owners can manage course products" on public.products;
drop policy if exists "Admins can manage non-course products" on public.products;

create policy "Course owners can manage course products"
on public.products
for all
to authenticated
using (
  type = 'curso'
  and creator_id = auth.uid()
)
with check (
  type = 'curso'
  and creator_id = auth.uid()
);

create policy "Admins can manage non-course products"
on public.products
for all
to authenticated
using (
  type <> 'curso'
  and app_private.current_user_role() = 'admin'
)
with check (
  type <> 'curso'
  and app_private.current_user_role() = 'admin'
);

drop policy if exists "Admins can manage modules" on public.modules;
drop policy if exists "Course owners can manage modules" on public.modules;

create policy "Course owners can manage modules"
on public.modules
for all
to authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = modules.course_id
      and products.type = 'curso'
      and products.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products
    where products.id = modules.course_id
      and products.type = 'curso'
      and products.creator_id = auth.uid()
  )
);

drop policy if exists "Admins can manage lessons" on public.lessons;
drop policy if exists "Course owners can manage lessons" on public.lessons;

create policy "Course owners can manage lessons"
on public.lessons
for all
to authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = lessons.product_id
      and products.type = 'curso'
      and products.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products
    where products.id = lessons.product_id
      and products.type = 'curso'
      and products.creator_id = auth.uid()
  )
);
