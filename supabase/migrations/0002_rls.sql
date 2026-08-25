-- ─────────────────────────────────────────────────────────
-- Joba — Row Level Security
--
-- The legacy site shipped its customer list as a static JS file at
-- /crm-data.js. The rule here is that the database refuses the read,
-- so no UI bug or forgotten .vercelignore entry can leak data again.
--
-- RLS enabled with NO policy = deny everything to anon and
-- authenticated. The service_role key bypasses RLS entirely and is
-- only ever used server-side.
-- ─────────────────────────────────────────────────────────

alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public.content             enable row level security;
alter table public.settings            enable row level security;
alter table public.integration_secrets enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.capi_logs           enable row level security;

-- ── Storefront catalogue: world-readable ─────────────────
create policy "categories are public"
  on public.categories for select
  using (true);

-- Only active products are visible to the public; the admin sees all.
create policy "active products are public"
  on public.products for select
  using (active or auth.role() = 'authenticated');

create policy "content is public"
  on public.content for select
  using (true);

create policy "settings are public"
  on public.settings for select
  using (true);

-- ── Admin writes: any signed-in user ─────────────────────
-- Self-signup is disabled in Supabase Auth, so "authenticated"
-- means an account the store owner created deliberately.
create policy "authenticated manage categories"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated manage products"
  on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated manage content"
  on public.content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated manage settings"
  on public.settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Orders: readable and editable only by the admin ──────
-- Customers never touch these tables directly. Placing an order goes
-- through place_order(), which is SECURITY DEFINER — so the public
-- needs no INSERT grant here at all.
create policy "authenticated read orders"
  on public.orders for select
  using (auth.role() = 'authenticated');

create policy "authenticated update orders"
  on public.orders for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated read order items"
  on public.order_items for select
  using (auth.role() = 'authenticated');

-- ── CAPI logs: admin reads, server writes ────────────────
-- Inserts happen through the service role in the API route, which
-- bypasses RLS, so no insert policy is granted to any client.
create policy "authenticated read capi logs"
  on public.capi_logs for select
  using (auth.role() = 'authenticated');

-- ── integration_secrets ──────────────────────────────────
-- Deliberately no policies. The Meta CAPI token is unreachable from
-- any browser session, signed in or not. Only the service role can
-- read or write it.

-- ── Storage: public read, authenticated write ────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media is public"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "authenticated upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "authenticated update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media');

create policy "authenticated delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');
