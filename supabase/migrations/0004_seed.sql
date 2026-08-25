-- ─────────────────────────────────────────────────────────
-- Joba — seed
--
-- Real catalogue data lifted from the legacy src/products.js.
--
-- Two deliberate departures from the legacy data:
--
-- 1. Category "count" is not stored. The old site hardcoded
--    184/96/130/41/74/212 against a 7-product catalogue, and the
--    category page rendered "Showing 1 of 96 pieces in this weave" —
--    a false stock claim on a commerce page. It is derived now.
--
-- 2. Images point at /images/*.webp, produced by
--    scripts/optimize-images.mjs. The originals totalled 11.4 MB
--    (an 8 MB hero, and a 2.3 MB flower drawn at 42x42 px).
-- ─────────────────────────────────────────────────────────

insert into public.categories (slug, name, description, image_url, image_position, size, sort_order) values
  ('indigo-dabu','Indigo Dabu','Mud-resist, dipped in true indigo.','/images/indigo-lotus-pallu.webp','50% 40%','lg',1),
  ('chanderi','Chanderi','Sheer, feather-light, hand-embroidered.','/images/ivory-floral-chanderi.webp','50% 60%','',2),
  ('mul-cotton','Mul Cotton','Soft mul with mirror work.','/images/lilac-mirrorwork-mul.webp','50% 50%','',3),
  ('kota-doria','Kota Doria','Open-weave checks, applique motifs.','/images/green-kota-butterfly.webp','50% 50%','',4),
  ('bagru-print','Bagru Print','Natural dyes, wooden blocks.','/images/steel-blue-fish-block.webp','50% 45%','',5),
  ('hand-block','Hand Block Cotton','Everyday drapes, printed by hand.','/images/royal-blue-dabu.webp','50% 35%','full',6)
on conflict (slug) do nothing;

-- sort_order follows the legacy newArrivals rail order.
-- Best sellers are derived: order by sold_count desc.
insert into public.products
  (slug, name, category_id, price, compare_at_price, image_url, image_position,
   gallery_positions, blurb, specs, rating, review_count, sold_count, stock, tag, sort_order)
values
  ('nilkantha-dabu','Nilkantha Dabu',(select id from public.categories where slug='indigo-dabu'),
   6800, null, '/images/indigo-chevron-dabu.webp','50% 45%',
   array['50% 20%','50% 50%','50% 85%'],
   'A true-indigo dabu drape — mud-resist printed by hand, then dipped so the chevrons hold that deep, uneven blue only fermentation gives. Softens with every wash.',
   '[["Weave","Indigo Dabu · mud-resist"],["Fabric","Handloom cotton mul"],["Length","5.5 m + 0.8 m blouse piece"],["Care","Hand wash cold, dry in shade"],["Made in","Narayanganj, Bangladesh"]]'::jsonb,
   4.9, 412, 1240, 12, 'NEW', 1),

  ('prajapati-kota','Prajapati Kota',(select id from public.categories where slug='kota-doria'),
   8900, null, '/images/green-kota-butterfly.webp','50% 50%',
   array['50% 22%','50% 55%','50% 85%'],
   'Crisp green Kota Doria in an open check, with applique butterflies that hold their shape through a starch. Light, structured and quietly festive.',
   '[["Weave","Kota Doria · applique"],["Fabric","Cotton-silk kota"],["Length","5.5 m + 0.8 m blouse piece"],["Care","Dry clean recommended"],["Made in","Kota tradition, woven locally"]]'::jsonb,
   4.8, 198, 640, 22, 'NEW', 2),

  ('shorna-chanderi','Shorna Chanderi',(select id from public.categories where slug='chanderi'),
   12400, null, '/images/ivory-floral-chanderi.webp','50% 55%',
   array['50% 22%','50% 55%','50% 85%'],
   'Sheer ivory Chanderi shot with a fine zari check and hand-embroidered florals. The kind of drape that photographs like light and wears like nothing at all.',
   '[["Weave","Chanderi · zari check"],["Fabric","Silk-cotton blend"],["Length","5.5 m + 0.8 m blouse piece"],["Care","Dry clean only"],["Made in","Chanderi tradition, woven locally"]]'::jsonb,
   4.9, 265, 870, 31, 'NEW', 3),

  ('bakul-lilac-mul','Bakul Lilac Mul',(select id from public.categories where slug='mul-cotton'),
   7200, null, '/images/lilac-mirrorwork-mul.webp','50% 50%',
   array['50% 20%','50% 50%','50% 80%'],
   'Soft lilac mul scattered with hand-set mirror work — no glue, every disc stitched. A daytime saree that turns just enough heads at an evening do.',
   '[["Weave","Mul cotton · mirror work"],["Fabric","Handloom mul"],["Length","5.5 m + 0.8 m blouse piece"],["Care","Hand wash, avoid wringing"],["Made in","Narayanganj, Bangladesh"]]'::jsonb,
   4.8, 231, 720, 18, 'NEW', 4),

  ('meen-bagru','Meen Bagru',(select id from public.categories where slug='bagru-print'),
   5600, null, '/images/steel-blue-fish-block.webp','50% 50%',
   array['50% 20%','50% 50%','50% 85%'],
   'Steel-blue Bagru with a repeating fish block — natural dyes on wooden blocks, so no two metres print identically. That slight drift is how you know a hand made it.',
   '[["Weave","Bagru print · natural dye"],["Fabric","Handloom cotton"],["Length","5.5 m + 0.8 m blouse piece"],["Care","Hand wash separately first time"],["Made in","Bagru tradition, woven locally"]]'::jsonb,
   4.7, 344, 1090, 44, 'NEW', 5),

  ('rajanigandha-blue','Rajanigandha Blue',(select id from public.categories where slug='hand-block'),
   6400, 8200, '/images/royal-blue-dabu.webp','50% 40%',
   array['50% 18%','50% 50%','50% 82%'],
   'Everyday royal blue hand-block cotton with a dabu border. Built to be worn, washed and worn again — the drape only gets better as the starch settles.',
   '[["Weave","Hand-block cotton · dabu border"],["Fabric","Handloom cotton"],["Length","5.5 m + 0.8 m blouse piece"],["Care","Machine wash gentle, cold"],["Made in","Narayanganj, Bangladesh"]]'::jsonb,
   4.9, 308, 980, 7, 'SALE', 6),

  ('padma-indigo-mul','Padma Indigo Mul',(select id from public.categories where slug='mul-cotton'),
   5900, 7400, '/images/indigo-lotus-pallu.webp','50% 45%',
   array['50% 18%','50% 50%','50% 82%'],
   'Feather-light indigo mul with a lotus pallu. Airy enough for Dhaka summers, with a hand-block border that reads as a quiet luxury rather than a loud one.',
   '[["Weave","Mul cotton · block-printed"],["Fabric","Fine handloom mul"],["Length","5.5 m + 0.8 m blouse piece"],["Care","Gentle hand wash"],["Made in","Narayanganj, Bangladesh"]]'::jsonb,
   4.8, 521, 1610, 4, 'SALE', 7)
on conflict (slug) do nothing;

insert into public.content (key, data) values
('hero', '[
  {"image_url":"/images/hero-saree-drape.webp","alt":"Maroon and gold silk saree","position":"50% 30%"},
  {"image_url":"/images/royal-blue-dabu.webp","alt":"Royal blue dabu saree","position":"50% 35%"},
  {"image_url":"/images/ivory-floral-chanderi.webp","alt":"Ivory floral Chanderi saree","position":"50% 45%"},
  {"image_url":"/images/lilac-mirrorwork-mul.webp","alt":"Lilac mirror-work mul saree","position":"50% 40%"},
  {"image_url":"/images/green-kota-butterfly.webp","alt":"Green Kota Doria saree","position":"50% 40%"}
]'::jsonb),
('reviews', '[
  {"name":"Nusrat Jahan","city":"Dhaka","rating":5,"product":"Nilkantha Dabu","text":"The indigo actually looks hand-dipped, not printed — you can see where the resist cracked a little on the border. Wore it to a wedding and three people asked where it was from."},
  {"name":"Farhana Akter","city":"Chittagong","rating":5,"product":"Padma Indigo Mul","text":"Mul cotton this soft usually falls apart after two washes. This one is on its twelfth and the colour hasn’t budged. Worth every taka."},
  {"name":"Tanvir Ahmed","city":"Sylhet","rating":4,"product":"Shorna Chanderi","text":"Bought it for my wife’s birthday. Delivery took a day longer than promised but the saree itself is gorgeous — the embroidery is denser than the photos suggest."},
  {"name":"Ishrat Zahan","city":"Rajshahi","rating":5,"product":"Bakul Lilac Mul","text":"Mirror work is all hand-placed, no glue smell, nothing crooked. My mother-in-law tried to keep it after borrowing it for a night, so — high praise."},
  {"name":"Mehzabin Chowdhury","city":"Khulna","rating":5,"product":"Rajanigandha Blue","text":"This is my third order from Joba. What keeps me coming back is that the block print is never perfectly even — that’s how you know a person made it, not a machine."},
  {"name":"Rownok Hasan","city":"Narayanganj","rating":5,"product":"Prajapati Kota","text":"Kota doria this crisp is hard to find outside Rajasthan, let alone here. The applique butterflies held their shape even after starching."}
]'::jsonb),
('community', '[
  {"image_url":"/images/green-kota-butterfly.webp","ratio":"sq","handle":"nusrat.wears","caption":"Kota border, up close 🌿"},
  {"image_url":"/images/indigo-lotus-pallu.webp","ratio":"sq","handle":"the.saree.diary","caption":"Indigo dabu detail 💙"},
  {"image_url":"/images/royal-blue-dabu.webp","ratio":"tall","handle":"anindita.dhk","caption":"Lotus pallu for Boishakh 🌸"},
  {"image_url":"/images/ivory-floral-chanderi.webp","ratio":"sq","handle":"rifah.styles","caption":"Chanderi, wedding ready ✨"},
  {"image_url":"/images/steel-blue-fish-block.webp","ratio":"sq","handle":"weave.and.wander","caption":"Fish block print 🐟"},
  {"image_url":"/images/lilac-mirrorwork-mul.webp","ratio":"tall","handle":"maliha.k","caption":"Royal blue, full drape"},
  {"image_url":"/images/indigo-chevron-dabu.webp","ratio":"sq","handle":"sadia.drapes","caption":"Chevron dabu buti"},
  {"image_url":"/images/hero-saree-drape.webp","ratio":"sq","handle":"proma.styles","caption":"Gold zari, Puja ready 💛"},
  {"image_url":"/images/indigo-lotus-pallu.webp","ratio":"tall","handle":"farhana.wraps","caption":"Lotus pallu, full drape 🌸"},
  {"image_url":"/images/green-kota-butterfly.webp","ratio":"sq","handle":"tahmina.threads","caption":"Kota applique detail"},
  {"image_url":"/images/royal-blue-dabu.webp","ratio":"sq","handle":"nabila.k","caption":"Dabu blues 💙"},
  {"image_url":"/images/ivory-floral-chanderi.webp","ratio":"tall","handle":"sumaya.drapes","caption":"Chanderi, Puja night ✨"}
]'::jsonb)
on conflict (key) do update set data = excluded.data;
