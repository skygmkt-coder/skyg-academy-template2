create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  status text not null default 'pending',
  total_mxn_cents integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_allowed check (status in ('pending', 'paid', 'cancelled')),
  constraint orders_total_non_negative check (total_mxn_cents >= 0)
);

create index orders_user_status_idx on public.orders (user_id, status, created_at desc);
create index orders_product_status_idx on public.orders (product_id, status);
create index orders_created_at_idx on public.orders (created_at desc);

create or replace function app_private.set_order_total_from_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product_price integer;
begin
  select price_mxn_cents
  into product_price
  from public.products
  where id = new.product_id
    and is_published = true;

  if product_price is null then
    raise exception 'Product is not available for checkout';
  end if;

  new.total_mxn_cents = product_price;
  return new;
end;
$$;

create trigger orders_set_total_from_product
before insert on public.orders
for each row
execute function app_private.set_order_total_from_product();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null,
  status text not null default 'pending_review',
  proof_url text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_method_allowed check (method in ('transferencia', 'dimo')),
  constraint payments_status_allowed check (status in ('pending_review', 'approved', 'rejected')),
  constraint payments_proof_url_not_empty check (proof_url is null or char_length(btrim(proof_url)) > 0),
  constraint payments_rejection_reason_length check (rejection_reason is null or char_length(rejection_reason) <= 500),
  constraint payments_approved_fields check (
    status <> 'approved' or (approved_by is not null and approved_at is not null)
  )
);

create index payments_order_status_idx on public.payments (order_id, status);
create index payments_status_created_at_idx on public.payments (status, created_at desc);
create index payments_approved_by_idx on public.payments (approved_by);

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.payments enable row level security;

create policy "Users can read own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create own orders"
on public.orders
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');

create policy "Users can read own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = payments.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can create own payments"
on public.payments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = payments.order_id
      and orders.user_id = auth.uid()
      and orders.status = 'pending'
  )
);

create policy "Users can retry rejected own payments"
on public.payments
for update
to authenticated
using (
  status = 'rejected'
  and exists (
    select 1
    from public.orders
    where orders.id = payments.order_id
      and orders.user_id = auth.uid()
      and orders.status = 'pending'
  )
)
with check (
  status = 'pending_review'
  and exists (
    select 1
    from public.orders
    where orders.id = payments.order_id
      and orders.user_id = auth.uid()
      and orders.status = 'pending'
  )
);

create policy "Admins can manage payments"
on public.payments
for all
to authenticated
using (app_private.current_user_role() = 'admin')
with check (app_private.current_user_role() = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read own payment proofs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and (
    owner = auth.uid()
    or app_private.current_user_role() = 'admin'
  )
);

create policy "Users can upload own payment proofs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and owner = auth.uid()
);
