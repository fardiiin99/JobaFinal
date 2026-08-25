-- ─────────────────────────────────────────────────────────
-- Joba — core schema
--
-- Money is numeric(12,2): exact decimal, never float. The legacy
-- site multiplied JS numbers, which is fine for display but not for
-- money we actually store.
-- ─────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────
create type order_status as enum
  ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

create type payment_method as enum ('cod', 'mobile');

create type order_source as enum ('web', 'manual');

-- ── Categories ───────────────────────────────────────────
create table public.categories (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  description    text not null default '',
  image_url      text,
  -- CSS object-position. The legacy admin had no way to set this.
  image_position text not null default '50% 50%',
  -- Homepage mosaic span: '' = 1 cell, 'lg' = wide, 'full' = full row.
  size           text not null default ''
                   check (size in ('', 'lg', 'full')),
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Products ─────────────────────────────────────────────
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  category_id      uuid not null references public.categories(id) on delete restrict,
  price            numeric(12,2) not null check (price >= 0),
  -- Was `old` in the legacy catalogue. Must genuinely be a markdown.
  compare_at_price numeric(12,2)
                     check (compare_at_price is null or compare_at_price > price),
  image_url        text,
  image_position   text not null default '50% 50%',
  -- Crop positions used to fake a gallery from a single photo.
  gallery_positions text[] not null default '{}',
  blurb            text not null default '',
  -- [["Weave","Indigo Dabu"], ["Fabric","Handloom cotton mul"], …]
  specs            jsonb not null default '[]'::jsonb,
  rating           numeric(2,1) check (rating is null or rating between 0 and 5),
  review_count     integer not null default 0 check (review_count >= 0),
  sold_count       integer not null default 0 check (sold_count >= 0),
  stock            integer not null default 0 check (stock >= 0),
  -- Nullable on purpose. The legacy card rendered the literal string
  -- "null" for untagged products; the UI must handle absence.
  tag              text check (tag is null or tag in ('NEW', 'SALE')),
  active           boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_active_idx   on public.products (active) where active;

-- ── Homepage content ─────────────────────────────────────
-- key ∈ ('hero', 'reviews', 'community'); data is the ordered array.
create table public.content (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── Store settings (singleton, publicly readable) ────────
-- Nothing secret may live here — it is world-readable by design.
create table public.settings (
  id                      boolean primary key default true check (id),
  store_name              text not null default 'House of Joba',
  contact_email           text not null default 'hello@joba.com',
  currency                text not null default 'BDT',
  -- Legacy hardcoded 5000, below the cheapest product (5600), so free
  -- shipping was unreachable and the fee never applied. Default above it.
  free_shipping_threshold numeric(12,2) not null default 8000 check (free_shipping_threshold >= 0),
  shipping_fee            numeric(12,2) not null default 150 check (shipping_fee >= 0),
  -- Public by nature: the pixel id is visible in the browser anyway.
  meta_pixel_id           text,
  meta_events             jsonb not null default
    '{"PageView":true,"ViewContent":true,"AddToCart":true,"InitiateCheckout":true,"Purchase":true}'::jsonb,
  updated_at              timestamptz not null default now()
);

insert into public.settings (id) values (true);

-- ── Integration secrets (never client-readable) ──────────
-- Separate table so `settings` can stay public-read without leaking
-- the CAPI token. Reachable only via the service role.
create table public.integration_secrets (
  id                   boolean primary key default true check (id),
  meta_capi_token      text,
  meta_test_event_code text,
  updated_at           timestamptz not null default now()
);

insert into public.integration_secrets (id) values (true);

-- ── Orders ───────────────────────────────────────────────
-- Sequence-backed order numbers. The legacy site used the last 6 digits
-- of a ms timestamp, which repeated roughly every 16.7 minutes.
create sequence order_number_seq start 1043;

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique,
  customer_name  text not null,
  customer_email text,
  customer_phone text not null,
  address        text not null,
  city           text not null,
  postcode       text,
  note           text,
  payment_method payment_method not null default 'cod',
  status         order_status not null default 'pending',
  subtotal       numeric(12,2) not null check (subtotal >= 0),
  shipping       numeric(12,2) not null check (shipping >= 0),
  total          numeric(12,2) not null check (total >= 0),
  source         order_source not null default 'web',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index orders_created_idx on public.orders (created_at desc);
create index orders_status_idx  on public.orders (status);

-- Name and price are snapshotted so editing a product later never
-- rewrites the history of an order that was already placed.
create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price   numeric(12,2) not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  line_total   numeric(12,2) not null check (line_total >= 0)
);

create index order_items_order_idx on public.order_items (order_id);

-- ── Meta CAPI event log ──────────────────────────────────
create table public.capi_logs (
  id              uuid primary key default gen_random_uuid(),
  event_name      text not null,
  event_id        text,
  status          text not null check (status in ('success', 'error')),
  http_status     integer,
  request_payload jsonb,
  response_body   jsonb,
  error_message   text,
  created_at      timestamptz not null default now()
);

create index capi_logs_created_idx on public.capi_logs (created_at desc);

-- ── updated_at maintenance ───────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger content_touch before update on public.content
  for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();
create trigger secrets_touch before update on public.integration_secrets
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
