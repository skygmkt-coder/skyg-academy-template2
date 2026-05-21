create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  target_type text not null,
  target_id text,
  course_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_events_event_type_not_empty check (length(trim(event_type)) > 0),
  constraint audit_events_target_type_not_empty check (length(trim(target_type)) > 0),
  constraint audit_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists audit_events_actor_user_id_idx on public.audit_events(actor_user_id);
create index if not exists audit_events_course_id_idx on public.audit_events(course_id);
create index if not exists audit_events_event_type_idx on public.audit_events(event_type);
create index if not exists audit_events_created_at_idx on public.audit_events(created_at desc);
create index if not exists audit_events_target_idx on public.audit_events(target_type, target_id);

alter table public.audit_events enable row level security;

revoke all on public.audit_events from anon;
grant insert, select on public.audit_events to authenticated;

drop policy if exists "Authenticated users can create own audit events" on public.audit_events;
create policy "Authenticated users can create own audit events"
  on public.audit_events
  for insert
  to authenticated
  with check (actor_user_id = auth.uid());

drop policy if exists "Admins can read audit events" on public.audit_events;
create policy "Admins can read audit events"
  on public.audit_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
