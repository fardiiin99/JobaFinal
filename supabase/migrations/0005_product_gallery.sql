-- Extra product photos. image_url stays the main photo (cards, OG,
-- checkout snapshots); gallery_urls holds the rest, in display order.
alter table public.products
  add column if not exists gallery_urls text[] not null default '{}';
