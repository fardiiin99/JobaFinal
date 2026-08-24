/* ─────────────────────────────────────────────────────────
   Joba — shared catalogue + product-card rendering
   Loaded by both index.html and cart.html, before any
   page-specific script.
   ───────────────────────────────────────────────────────── */

const IMG = 'images/';

/* Resolves a stored image ref to a usable <img src>. Admin-uploaded photos
   are saved as data URIs; catalogue defaults are plain filenames under IMG. */
const imgSrc = img => (img && img.startsWith('data:')) ? img : IMG + (img || '');

/* Shop-by-weave categories. `slug` is the join key against each catalogue
   product's `catSlug` below, and the query param category.html reads. */
const categories = [
  { name:'Indigo Dabu',  slug:'indigo-dabu', desc:'Mud-resist, dipped in true indigo.', count:184, size:'lg',
    img:'indigo-lotus-pallu.jpg',    pos:'50% 40%' },
  { name:'Chanderi',     slug:'chanderi', desc:'Sheer, feather-light, hand-embroidered.', count:96, size:'',
    img:'ivory-floral-chanderi.jpg', pos:'50% 60%' },
  { name:'Mul Cotton',   slug:'mul-cotton', desc:'Soft mul with mirror work.',        count:130, size:'',
    img:'lilac-mirrorwork-mul.jpg',  pos:'50% 50%' },
  { name:'Kota Doria',   slug:'kota-doria', desc:'Open-weave checks, applique motifs.', count:41, size:'',
    img:'green-kota-butterfly.jpg',  pos:'50% 50%' },
  { name:'Bagru Print',  slug:'bagru-print', desc:'Natural dyes, wooden blocks.',      count:74,  size:'',
    img:'steel-blue-fish-block.jpg', pos:'50% 45%' },
  { name:'Hand Block Cotton', slug:'hand-block', desc:'Everyday drapes, printed by hand.', count:212, size:'full',
    img:'royal-blue-dabu.jpg',       pos:'50% 35%' }
];

/* Homepage hero slides — editable from admin (Settings → Homepage). */
const heroSlides = [
  { img:'hero-saree-drape.png',    alt:'Maroon and gold silk saree',  pos:'50% 30%' },
  { img:'royal-blue-dabu.jpg',     alt:'Royal blue dabu saree',       pos:'50% 35%' },
  { img:'ivory-floral-chanderi.jpg', alt:'Ivory floral Chanderi saree', pos:'50% 45%' },
  { img:'lilac-mirrorwork-mul.jpg', alt:'Lilac mirror-work mul saree', pos:'50% 40%' },
  { img:'green-kota-butterfly.jpg', alt:'Green Kota Doria saree',     pos:'50% 40%' }
];

/* Homepage customer reviews — editable from admin (Settings → Reviews). */
const reviews = [
  { name:'Nusrat Jahan',   city:'Dhaka',       rating:5, product:'Nilkantha Dabu',
    text:'The indigo actually looks hand-dipped, not printed — you can see where the resist cracked a little on the border. Wore it to a wedding and three people asked where it was from.' },
  { name:'Farhana Akter',  city:'Chittagong',  rating:5, product:'Padma Indigo Mul',
    text:'Mul cotton this soft usually falls apart after two washes. This one is on its twelfth and the colour hasn’t budged. Worth every taka.' },
  { name:'Tanvir Ahmed',   city:'Sylhet',      rating:4, product:'Shorna Chanderi',
    text:'Bought it for my wife’s birthday. Delivery took a day longer than promised but the saree itself is gorgeous — the embroidery is denser than the photos suggest.' },
  { name:'Ishrat Zahan',   city:'Rajshahi',    rating:5, product:'Bakul Lilac Mul',
    text:'Mirror work is all hand-placed, no glue smell, nothing crooked. My mother-in-law tried to keep it after borrowing it for a night, so — high praise.' },
  { name:'Mehzabin Chowdhury', city:'Khulna',  rating:5, product:'Rajanigandha Blue',
    text:'This is my third order from Joba. What keeps me coming back is that the block print is never perfectly even — that’s how you know a person made it, not a machine.' },
  { name:'Rownok Hasan',   city:'Narayanganj', rating:5, product:'Prajapati Kota',
    text:'Kota doria this crisp is hard to find outside Rajasthan, let alone here. The applique butterflies held their shape even after starching.' }
];

/* "As Styled by You" Instagram wall — editable from admin (Settings → Community).
   Sample posts, placeholder handles, not real accounts.
   ratio: 'sq' = 1:1, 'tall' = 9:16 (spans both rows). */
const igPosts = [
  { img:'green-kota-butterfly.jpg',  ratio:'sq',   handle:'nusrat.wears',     caption:'Kota border, up close 🌿' },
  { img:'indigo-lotus-pallu.jpg',    ratio:'sq',   handle:'the.saree.diary',  caption:'Indigo dabu detail 💙' },
  { img:'royal-blue-dabu.jpg',       ratio:'tall', handle:'anindita.dhk',     caption:'Lotus pallu for Boishakh 🌸' },
  { img:'ivory-floral-chanderi.jpg', ratio:'sq',   handle:'rifah.styles',     caption:'Chanderi, wedding ready ✨' },
  { img:'steel-blue-fish-block.jpg', ratio:'sq',   handle:'weave.and.wander', caption:'Fish block print 🐟' },
  { img:'lilac-mirrorwork-mul.jpg',  ratio:'tall', handle:'maliha.k',         caption:'Royal blue, full drape' },
  { img:'indigo-chevron-dabu.jpg',   ratio:'sq',   handle:'sadia.drapes',     caption:'Chevron dabu buti' },
  { img:'hero-saree-drape.png',      ratio:'sq',   handle:'proma.styles',     caption:'Gold zari, Puja ready 💛' },
  { img:'indigo-lotus-pallu.jpg',    ratio:'tall', handle:'farhana.wraps',    caption:'Lotus pallu, full drape 🌸' },
  { img:'green-kota-butterfly.jpg',  ratio:'sq',   handle:'tahmina.threads',  caption:'Kota applique detail' },
  { img:'royal-blue-dabu.jpg',       ratio:'sq',   handle:'nabila.k',         caption:'Dabu blues 💙' },
  { img:'ivory-floral-chanderi.jpg', ratio:'tall', handle:'sumaya.drapes',    caption:'Chanderi, Puja night ✨' }
];

/* Admin-edited homepage content is saved to localStorage as plain JSON
   (photos as data URIs). Apply it over the defaults on every page load. */
(function applyStoreOverrides() {
  try {
    const heroSaved = JSON.parse(localStorage.getItem('jobaHeroSlides') || 'null');
    if (Array.isArray(heroSaved) && heroSaved.length) {
      heroSlides.splice(0, heroSlides.length, ...heroSaved);
    }
    const catSaved = JSON.parse(localStorage.getItem('jobaCategories') || 'null');
    if (Array.isArray(catSaved) && catSaved.length) {
      categories.splice(0, categories.length, ...catSaved);
    }
    const reviewsSaved = JSON.parse(localStorage.getItem('jobaReviews') || 'null');
    if (Array.isArray(reviewsSaved) && reviewsSaved.length) {
      reviews.splice(0, reviews.length, ...reviewsSaved);
    }
    const communitySaved = JSON.parse(localStorage.getItem('jobaCommunity') || 'null');
    if (Array.isArray(communitySaved) && communitySaved.length) {
      igPosts.splice(0, igPosts.length, ...communitySaved);
    }
  } catch {}
})();

/* One catalogue, keyed by id — the key doubles as the cart's SKU.
   `catSlug` joins each product to the categories list above. */
const catalogue = {
  indigoChevron: {
    id:'indigoChevron', name:'Nilkantha Dabu', cat:'Indigo Dabu', catSlug:'indigo-dabu', price:6800, old:null, tag:'NEW',
    img:'indigo-chevron-dabu.jpg', pos:'50% 45%',
    rating:4.9, reviews:412, sold:'1,240 sold'
  },
  indigoLotus: {
    id:'indigoLotus', name:'Padma Indigo Mul', cat:'Mul Cotton', catSlug:'mul-cotton', price:5900, old:7400, tag:'SALE',
    img:'indigo-lotus-pallu.jpg', pos:'50% 45%',
    rating:4.8, reviews:521, sold:'1,610 sold'
  },
  ivoryChanderi: {
    id:'ivoryChanderi', name:'Shorna Chanderi', cat:'Chanderi', catSlug:'chanderi', price:12400, old:null, tag:'NEW',
    img:'ivory-floral-chanderi.jpg', pos:'50% 55%',
    rating:4.9, reviews:265, sold:'870 sold'
  },
  lilacMul: {
    id:'lilacMul', name:'Bakul Lilac Mul', cat:'Mul Cotton', catSlug:'mul-cotton', price:7200, old:null, tag:'NEW',
    img:'lilac-mirrorwork-mul.jpg', pos:'50% 50%',
    rating:4.8, reviews:231, sold:'720 sold'
  },
  royalBlue: {
    id:'royalBlue', name:'Rajanigandha Blue', cat:'Hand Block', catSlug:'hand-block', price:6400, old:8200, tag:'SALE',
    img:'royal-blue-dabu.jpg', pos:'50% 40%',
    rating:4.9, reviews:308, sold:'980 sold'
  },
  steelBagru: {
    id:'steelBagru', name:'Meen Bagru', cat:'Bagru Print', catSlug:'bagru-print', price:5600, old:null, tag:'NEW',
    img:'steel-blue-fish-block.jpg', pos:'50% 50%',
    rating:4.7, reviews:344, sold:'1,090 sold'
  },
  greenKota: {
    id:'greenKota', name:'Prajapati Kota', cat:'Kota Doria', catSlug:'kota-doria', price:8900, old:null, tag:'NEW',
    img:'green-kota-butterfly.jpg', pos:'50% 50%',
    rating:4.8, reviews:198, sold:'640 sold'
  }
};

/* Long-form copy for the product page (product.html?id=…), keyed by the same id.
   `crops` are object-position values used to fake a small gallery from one photo. */
const productDetails = {
  indigoChevron: {
    blurb:'A true-indigo dabu drape — mud-resist printed by hand, then dipped so the chevrons hold that deep, uneven blue only fermentation gives. Softens with every wash.',
    specs:[['Weave','Indigo Dabu · mud-resist'],['Fabric','Handloom cotton mul'],['Length','5.5 m + 0.8 m blouse piece'],['Care','Hand wash cold, dry in shade'],['Made in','Narayanganj, Bangladesh']],
    crops:['50% 20%','50% 50%','50% 85%']
  },
  indigoLotus: {
    blurb:'Feather-light indigo mul with a lotus pallu. Airy enough for Dhaka summers, with a hand-block border that reads as a quiet luxury rather than a loud one.',
    specs:[['Weave','Mul cotton · block-printed'],['Fabric','Fine handloom mul'],['Length','5.5 m + 0.8 m blouse piece'],['Care','Gentle hand wash'],['Made in','Narayanganj, Bangladesh']],
    crops:['50% 18%','50% 50%','50% 82%']
  },
  ivoryChanderi: {
    blurb:'Sheer ivory Chanderi shot with a fine zari check and hand-embroidered florals. The kind of drape that photographs like light and wears like nothing at all.',
    specs:[['Weave','Chanderi · zari check'],['Fabric','Silk-cotton blend'],['Length','5.5 m + 0.8 m blouse piece'],['Care','Dry clean only'],['Made in','Chanderi tradition, woven locally']],
    crops:['50% 22%','50% 55%','50% 85%']
  },
  lilacMul: {
    blurb:'Soft lilac mul scattered with hand-set mirror work — no glue, every disc stitched. A daytime saree that turns just enough heads at an evening do.',
    specs:[['Weave','Mul cotton · mirror work'],['Fabric','Handloom mul'],['Length','5.5 m + 0.8 m blouse piece'],['Care','Hand wash, avoid wringing'],['Made in','Narayanganj, Bangladesh']],
    crops:['50% 20%','50% 50%','50% 80%']
  },
  royalBlue: {
    blurb:'Everyday royal blue hand-block cotton with a dabu border. Built to be worn, washed and worn again — the drape only gets better as the starch settles.',
    specs:[['Weave','Hand-block cotton · dabu border'],['Fabric','Handloom cotton'],['Length','5.5 m + 0.8 m blouse piece'],['Care','Machine wash gentle, cold'],['Made in','Narayanganj, Bangladesh']],
    crops:['50% 18%','50% 50%','50% 82%']
  },
  steelBagru: {
    blurb:'Steel-blue Bagru with a repeating fish block — natural dyes on wooden blocks, so no two metres print identically. That slight drift is how you know a hand made it.',
    specs:[['Weave','Bagru print · natural dye'],['Fabric','Handloom cotton'],['Length','5.5 m + 0.8 m blouse piece'],['Care','Hand wash separately first time'],['Made in','Bagru tradition, woven locally']],
    crops:['50% 20%','50% 50%','50% 85%']
  },
  greenKota: {
    blurb:'Crisp green Kota Doria in an open check, with applique butterflies that hold their shape through a starch. Light, structured and quietly festive.',
    specs:[['Weave','Kota Doria · applique'],['Fabric','Cotton-silk kota'],['Length','5.5 m + 0.8 m blouse piece'],['Care','Dry clean recommended'],['Made in','Kota tradition, woven locally']],
    crops:['50% 22%','50% 55%','50% 85%']
  }
};

const newArrivals = [
  catalogue.indigoChevron, catalogue.greenKota, catalogue.ivoryChanderi,
  catalogue.lilacMul, catalogue.steelBagru, catalogue.royalBlue,
  catalogue.indigoLotus
];

/* Ranked by units sold — see the `sold` field above. */
const bestSellers = [
  catalogue.indigoLotus, catalogue.indigoChevron,
  catalogue.steelBagru, catalogue.royalBlue
];

const taka = n => '৳' + n.toLocaleString('en-IN');

const stars = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

/* One card builder shared by the New Arrivals rail and the Best Sellers grid. */
function productCard(p, i, mode) {
  const flag = mode === 'best'
    ? `<span class="rank"><em>#${i + 1}</em><span class="rank-label">BEST SELLER</span></span>`
    : `<span class="badge ${p.tag === 'SALE' ? 'sale' : ''}">${p.tag}</span>`;

  const meta = mode === 'best'
    ? `<p class="p-rating"><span class="stars">${stars(p.rating)}</span>
         ${p.rating} <span>(${p.reviews})</span></p>
       <p class="p-sold">${p.sold}</p>`
    : '';

  const href = `product.html?id=${p.id}`;
  return `
  <article class="product" data-id="${p.id}">
    <div class="p-media">
      <a class="p-link" href="${href}" aria-label="${p.name}">
        <img class="p-photo" src="${imgSrc(p.img)}" alt="${p.name} — ${p.cat} saree"
             loading="lazy" style="object-position:${p.pos}">
      </a>
      ${flag}
      <button class="p-add">Add to bag</button>
    </div>
    <div class="p-body">
      <p class="p-cat">${p.cat}</p>
      <a class="p-name-link" href="${href}"><h3 class="p-name">${p.name}</h3></a>
      <p class="p-price">
        ${taka(p.price)}
        ${p.old ? `<span class="p-old">${taka(p.old)}</span>` : ''}
      </p>
      ${meta}
    </div>
  </article>`;
}