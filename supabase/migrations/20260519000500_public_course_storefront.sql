alter table public.products
  add column if not exists show_on_landing boolean not null default true,
  add column if not exists short_description text,
  add column if not exists thumbnail_url text,
  add column if not exists instructor_name text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_storefront_fields_length_check'
  ) then
    alter table public.products
      add constraint products_storefront_fields_length_check
      check (
        length(coalesce(short_description, '')) <= 280 and
        length(coalesce(thumbnail_url, '')) <= 500 and
        length(coalesce(instructor_name, '')) <= 160
      );
  end if;
end $$;

create index if not exists products_public_course_storefront_idx
on public.products (type, is_published, show_on_landing, created_at desc);

create or replace function public.ensure_product_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 1;
begin
  if new.slug is null or length(btrim(new.slug)) = 0 then
    base_slug := lower(regexp_replace(coalesce(new.title, 'curso'), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);

    if base_slug = '' then
      base_slug := 'curso';
    end if;

    candidate_slug := base_slug;

    while exists (
      select 1
      from public.products p
      where lower(p.slug) = candidate_slug
        and (new.id is null or p.id <> new.id)
    ) loop
      suffix := suffix + 1;
      candidate_slug := base_slug || '-' || suffix::text;
    end loop;

    new.slug := candidate_slug;
  else
    new.slug := lower(btrim(new.slug));
  end if;

  return new;
end;
$$;

drop trigger if exists products_ensure_slug on public.products;
create trigger products_ensure_slug
before insert or update of title, slug on public.products
for each row execute function public.ensure_product_slug();

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
  instructor_name
from public.products
where type = 'curso';

drop policy if exists "Admins can manage course products" on public.products;
create policy "Admins can manage course products"
on public.products
for all
to authenticated
using (
  type = 'curso'
  and app_private.current_user_role() = 'admin'
)
with check (
  type = 'curso'
  and app_private.current_user_role() = 'admin'
);

grant select on public.products to anon, authenticated;
