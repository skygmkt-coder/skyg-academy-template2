-- Harden public lesson/resource access. Published products remain public, but
-- downloadable resources are public only for preview lessons; enrolled users
-- keep access through the authenticated enrollment policy.
drop policy if exists "Public can read published lesson resources" on public.lesson_resources;

create policy "Public can read published preview lesson resources"
on public.lesson_resources
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.lessons
    join public.products on products.id = lessons.product_id
    where lessons.id = lesson_resources.lesson_id
      and lessons.is_preview = true
      and products.is_published = true
  )
);

-- Keep lesson progress internally consistent: the lesson must belong to the
-- same product recorded on the progress row.
create or replace function app_private.validate_lesson_progress_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.lessons
    where lessons.id = new.lesson_id
      and lessons.product_id = new.product_id
  ) then
    raise exception 'Lesson does not belong to product';
  end if;

  return new;
end;
$$;

drop trigger if exists lesson_progress_validate_product on public.lesson_progress;

create trigger lesson_progress_validate_product
before insert or update on public.lesson_progress
for each row
execute function app_private.validate_lesson_progress_product();

-- Restrict storage read policy to catalog cover assets. Lesson resources should
-- not be discoverable through public storage policies.
drop policy if exists "Public can read catalog assets" on storage.objects;

create policy "Public can read catalog cover assets"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'catalog-assets'
  and name like 'covers/%'
);

-- Require storage object paths for payment proofs to live below the uploader's
-- user id. This is defense in depth in addition to Supabase's owner field.
drop policy if exists "Users can read own payment proofs" on storage.objects;
drop policy if exists "Users can upload own payment proofs" on storage.objects;

create policy "Users can read own payment proofs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and (
    owner = auth.uid()
    or name like auth.uid()::text || '/%'
    or app_private.current_user_role() = 'admin'
  )
);

create policy "Users can upload own payment proofs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and name like auth.uid()::text || '/%'
);

-- Transactional approval path for manual payments. This keeps order, payment,
-- and enrollment changes atomic and validates admin authorization server-side.
create or replace function public.approve_manual_payment_transaction(
  p_payment_id uuid,
  p_admin_id uuid
)
returns table(payment_id uuid, order_id uuid)
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  target_order_id uuid;
  target_user_id uuid;
  target_product_id uuid;
begin
  if app_private.current_user_role() <> 'admin' then
    raise exception 'Only admins can approve payments';
  end if;

  if p_admin_id <> auth.uid() then
    raise exception 'Admin id does not match authenticated user';
  end if;

  select payments.order_id, orders.user_id, orders.product_id
  into target_order_id, target_user_id, target_product_id
  from public.payments
  join public.orders on orders.id = payments.order_id
  where payments.id = p_payment_id
    and payments.status = 'pending_review'
    and orders.status = 'pending'
  for update of payments, orders;

  if target_order_id is null then
    raise exception 'Pending payment not found';
  end if;

  update public.orders
  set status = 'paid'
  where id = target_order_id;

  update public.payments
  set status = 'approved',
      approved_by = p_admin_id,
      approved_at = now(),
      rejection_reason = null
  where id = p_payment_id;

  insert into public.enrollments (
    user_id,
    product_id,
    status,
    expires_at,
    granted_by,
    granted_reason
  )
  values (
    target_user_id,
    target_product_id,
    'active',
    null,
    p_admin_id,
    'Pago aprobado ' || p_payment_id::text
  )
  on conflict (user_id, product_id) do update
    set status = 'active',
        expires_at = null,
        granted_by = excluded.granted_by,
        granted_reason = excluded.granted_reason;

  return query select p_payment_id, target_order_id;
end;
$$;

grant execute on function public.approve_manual_payment_transaction(uuid, uuid) to authenticated;
