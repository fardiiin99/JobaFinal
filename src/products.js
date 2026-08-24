/* ─────────────────────────────────────────────────────────
   Joba — shared catalogue + product-card rendering
   Loaded by both index.html and cart.html, before any
   page-specific script.
   ───────────────────────────────────────────────────────── */

const IMG = 'images/';

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
        <img class="p-photo" src="${IMG}${p.img}" alt="${p.name} — ${p.cat} saree"
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