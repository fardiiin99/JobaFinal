-- ─────────────────────────────────────────────────────────
-- Joba — place_order()
--
-- The single way an order is created, for both the storefront
-- checkout and the admin's manual-order form.
--
-- SECURITY DEFINER, so the caller needs no table grants at all —
-- see 0002_rls.sql, where the public has zero access to `orders`.
--
-- Every figure that touches money is recomputed here from the
-- `products` and `settings` tables. Anything the client sends about
-- price, shipping or totals is ignored. A crafted request asking to
-- buy a ৳12,400 saree for ৳1 stores ৳12,400.
-- ─────────────────────────────────────────────────────────

create or replace function public.place_order(items jsonb, customer jsonb)
returns table (
  order_id     uuid,
  order_number text,
  subtotal     numeric,
  shipping     numeric,
  total        numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lines        jsonb;
  v_subtotal     numeric(12,2);
  v_shipping     numeric(12,2);
  v_total        numeric(12,2);
  v_threshold    numeric(12,2);
  v_fee          numeric(12,2);
  v_order_id     uuid;
  v_order_number text;
  v_unavailable  integer;
  v_short        integer;
  v_name         text;
  v_phone        text;
  v_address      text;
  v_city         text;
  v_payment      payment_method;
  v_source       order_source;
begin
  -- ── Customer ───────────────────────────────────────────
  v_name    := nullif(btrim(coalesce(customer->>'name', '')), '');
  v_phone   := nullif(btrim(coalesce(customer->>'phone', '')), '');
  v_address := nullif(btrim(coalesce(customer->>'address', '')), '');
  v_city    := nullif(btrim(coalesce(customer->>'city', '')), '');

  if v_name is null or v_phone is null or v_address is null or v_city is null then
    raise exception 'Name, phone, address and city are required'
      using errcode = '22023';
  end if;

  v_payment := coalesce((customer->>'payment_method')::payment_method, 'cod');

  -- Only a signed-in admin may record a manual (phone/Instagram) order.
  v_source := case
    when coalesce(customer->>'source', 'web') = 'manual'
         and auth.role() = 'authenticated' then 'manual'
    else 'web'
  end;

  -- ── Items ──────────────────────────────────────────────
  if items is null
     or jsonb_typeof(items) <> 'array'
     or jsonb_array_length(items) = 0 then
    raise exception 'Order must contain at least one item'
      using errcode = '22023';
  end if;

  with req as (
    select (e->>'product_id')::uuid as product_id,
           least(greatest(coalesce((e->>'quantity')::integer, 1), 1), 99) as quantity
    from jsonb_array_elements(items) e
    where nullif(btrim(coalesce(e->>'product_id', '')), '') is not null
  ),
  -- A cart can list the same product twice; merge before pricing.
  merged as (
    select product_id, least(sum(quantity), 99)::integer as quantity
    from req
    group by product_id
  ),
  joined as (
    select m.product_id, m.quantity, p.name, p.price, p.stock, p.active
    from merged m
    left join products p on p.id = m.product_id
  )
  select
    count(*) filter (where name is null or not active),
    count(*) filter (where coalesce(stock, 0) < quantity),
    jsonb_agg(jsonb_build_object(
      'product_id', product_id,
      'product_name', name,
      'unit_price', price,
      'quantity', quantity,
      'line_total', price * quantity
    )),
    coalesce(sum(price * quantity), 0)
  into v_unavailable, v_short, v_lines, v_subtotal
  from joined;

  if coalesce(v_unavailable, 0) > 0 then
    raise exception 'One or more items are no longer available'
      using errcode = '22023';
  end if;

  if coalesce(v_short, 0) > 0 then
    raise exception 'Not enough stock for one or more items'
      using errcode = '22023';
  end if;

  -- ── Shipping, from settings — never from the client ────
  select free_shipping_threshold, shipping_fee
    into v_threshold, v_fee
  from settings
  where id;

  v_shipping := case when v_subtotal >= v_threshold then 0 else v_fee end;
  v_total    := v_subtotal + v_shipping;

  -- ── Persist ────────────────────────────────────────────
  -- Sequence-backed, so two orders in the same millisecond cannot collide.
  v_order_number := 'JB' || nextval('order_number_seq');

  insert into orders (
    order_number, customer_name, customer_email, customer_phone,
    address, city, postcode, note, payment_method, status,
    subtotal, shipping, total, source
  )
  values (
    v_order_number, v_name,
    nullif(btrim(coalesce(customer->>'email', '')), ''),
    v_phone, v_address, v_city,
    nullif(btrim(coalesce(customer->>'postcode', '')), ''),
    nullif(btrim(coalesce(customer->>'note', '')), ''),
    v_payment, 'pending',
    v_subtotal, v_shipping, v_total, v_source
  )
  returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
  select
    v_order_id,
    (l->>'product_id')::uuid,
    l->>'product_name',
    (l->>'unit_price')::numeric,
    (l->>'quantity')::integer,
    (l->>'line_total')::numeric
  from jsonb_array_elements(v_lines) l;

  update products p
     set stock = p.stock - (l->>'quantity')::integer
    from jsonb_array_elements(v_lines) l
   where p.id = (l->>'product_id')::uuid;

  return query select v_order_id, v_order_number, v_subtotal, v_shipping, v_total;
end;
$$;

-- Functions are executable by PUBLIC by default; be explicit instead.
revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;
