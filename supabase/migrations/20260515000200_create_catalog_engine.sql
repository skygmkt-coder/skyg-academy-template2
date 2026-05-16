create extension if not exists pgcrypto;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  type text not null,
  subtitle text,
  description text,
  cover_image_url text,
  price_mxn_cents integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_title_not_empty check (char_length(btrim(title)) > 0),
  constraint products_slug_not_empty check (char_length(btrim(slug)) > 0),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_type_allowed check (type in ('curso', 'taller')),
  constraint products_price_non_negative check (price_mxn_cents >= 0)
);

create unique index products_slug_unique_idx on public.products (lower(slug));
create index products_published_idx on public.products (is_published, created_at desc);
create index products_type_idx on public.products (type);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  video_url text,
  display_order integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_title_not_empty check (char_length(btrim(title)) > 0),
  constraint lessons_slug_not_empty check (char_length(btrim(slug)) > 0),
  constraint lessons_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint lessons_display_order_non_negative check (display_order >= 0)
);

create unique index lessons_product_slug_unique_idx on public.lessons (product_id, lower(slug));
create index lessons_product_order_idx on public.lessons (product_id, display_order, created_at);
create index lessons_preview_idx on public.lessons (is_preview);

create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  file_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_resources_title_not_empty check (char_length(btrim(title)) > 0),
  constraint lesson_resources_file_url_not_empty check (char_length(btrim(file_url)) > 0),
  constraint lesson_resources_display_order_non_negative check (display_order >= 0)
);

create index lesson_resources_lesson_order_idx on public.lesson_resources (lesson_id, display_order, created_at);

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create trigger lessons_set_updated_at
before update on public.lessons
for each row
execute function public.set_updated_at();

create trigger lesson_resources_set_updated_at
before update on public.lesson_resources
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;

create policy "Public can read published products"
on public.products
for select
to anon, authenticated
using (is_published = true);

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');

create policy "Public can read published product lessons"
on public.lessons
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = lessons.product_id
      and products.is_published = true
  )
);

create policy "Admins can manage lessons"
on public.lessons
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');

create policy "Public can read published lesson resources"
on public.lesson_resources
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.lessons
    join public.products on products.id = lessons.product_id
    where lessons.id = lesson_resources.lesson_id
      and products.is_published = true
  )
);

create policy "Admins can manage lesson resources"
on public.lesson_resources
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-assets',
  'catalog-assets',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/zip',
    'text/plain'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read catalog assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'catalog-assets');

create policy "Admins can upload catalog assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'catalog-assets'
  and app_private.current_user_role() = 'admin'
);

create policy "Admins can update catalog assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'catalog-assets'
  and app_private.current_user_role() = 'admin'
)
with check (
  bucket_id = 'catalog-assets'
  and app_private.current_user_role() = 'admin'
);
