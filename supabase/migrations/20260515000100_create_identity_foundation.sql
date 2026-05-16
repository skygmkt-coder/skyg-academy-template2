create type public.app_role as enum ('admin', 'student');

create schema if not exists app_private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_empty check (char_length(btrim(email)) > 0)
);

create unique index profiles_email_unique_idx on public.profiles (lower(email));
create index profiles_role_idx on public.profiles (role);

create table public.brand_settings (
  id boolean primary key default true,
  brand_name text not null default 'SaaS Platform',
  logo_url text,
  primary_color text not null default '#0c60a0',
  accent_color text not null default '#14b8a6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brand_settings_singleton check (id),
  constraint brand_name_not_empty check (char_length(btrim(brand_name)) > 0),
  constraint primary_color_hex check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint accent_color_hex check (accent_color ~ '^#[0-9A-Fa-f]{6}$')
);

insert into public.brand_settings (id)
values (true)
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger brand_settings_set_updated_at
before update on public.brand_settings
for each row
execute function public.set_updated_at();

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

create or replace function app_private.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

grant usage on schema app_private to authenticated;
grant execute on function app_private.current_user_role() to authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function app_private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.brand_settings enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  app_private.current_user_role() = 'admin'
);

create policy "Users can update own profile basics"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = app_private.current_user_role());

create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using (
  app_private.current_user_role() = 'admin'
)
with check (
  app_private.current_user_role() = 'admin'
);

create policy "Users can read brand settings"
on public.brand_settings
for select
to anon, authenticated
using (true);

create policy "Admins can update brand settings"
on public.brand_settings
for update
to authenticated
using (
  app_private.current_user_role() = 'admin'
)
with check (
  app_private.current_user_role() = 'admin'
);
