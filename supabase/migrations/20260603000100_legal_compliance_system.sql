alter table public.brand_settings
  add column if not exists legal_name text not null default '',
  add column if not exists tax_id text not null default '',
  add column if not exists country text not null default '',
  add column if not exists state text not null default '',
  add column if not exists address text not null default '',
  add column if not exists legal_email text not null default '',
  add column if not exists privacy_policy text not null default '',
  add column if not exists terms_conditions text not null default '',
  add column if not exists cookies_policy text not null default '',
  add column if not exists legal_notice text not null default '',
  add column if not exists privacy_updated_at timestamptz not null default now(),
  add column if not exists terms_updated_at timestamptz not null default now(),
  add column if not exists cookies_updated_at timestamptz not null default now(),
  add column if not exists legal_notice_updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'brand_settings_legal_info_length_check') then
    alter table public.brand_settings
      add constraint brand_settings_legal_info_length_check
      check (
        char_length(legal_name) <= 240 and
        char_length(tax_id) <= 80 and
        char_length(country) <= 120 and
        char_length(state) <= 120 and
        char_length(address) <= 1000 and
        char_length(legal_email) <= 240
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'brand_settings_legal_email_format_check') then
    alter table public.brand_settings
      add constraint brand_settings_legal_email_format_check
      check (
        legal_email = ''
        or legal_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'brand_settings_legal_documents_length_check') then
    alter table public.brand_settings
      add constraint brand_settings_legal_documents_length_check
      check (
        char_length(privacy_policy) <= 80000 and
        char_length(terms_conditions) <= 80000 and
        char_length(cookies_policy) <= 80000 and
        char_length(legal_notice) <= 80000
      );
  end if;
end $$;

create or replace function app_private.set_brand_legal_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.privacy_policy is distinct from old.privacy_policy then
    new.privacy_updated_at := now();
  end if;

  if new.terms_conditions is distinct from old.terms_conditions then
    new.terms_updated_at := now();
  end if;

  if new.cookies_policy is distinct from old.cookies_policy then
    new.cookies_updated_at := now();
  end if;

  if new.legal_notice is distinct from old.legal_notice then
    new.legal_notice_updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists brand_settings_set_legal_updated_at on public.brand_settings;
create trigger brand_settings_set_legal_updated_at
before update on public.brand_settings
for each row
execute function app_private.set_brand_legal_updated_at();
