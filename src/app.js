/* ─────────────────────────────────────────────────────────
   Joba — storefront interactions
   Catalogue data + productCard() live in products.js; cart
   storage lives in cart-core.js. Both load before this file.
   ───────────────────────────────────────────────────────── */

/* ── Categories ───────────────────────────────────────────
   `categories` array lives in products.js — shared with category.js
   so a category page can look up its own name/image/description. */
const arrowIcon = `<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`;

document.getElementById('catGrid').innerHTML = categories.map(c => `
  <a class="cat ${c.size}" href="category.html?c=${c.slug}">
    <img class="cat-bg" src="${IMG}${c.img}" alt="${c.name} saree"
         loading="lazy" style="object-position:${c.pos}">
    <span class="cat-count">${c.count}</span>
    <div class="cat-copy">
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <span class="cat-arrow">Shop ${c.name} ${arrowIcon}</span>
    </div>
  </a>
`).join('');

const rail = document.getElementById('rail');
rail.innerHTML = newArrivals.map((p, i) => productCard(p, i, 'new')).join('');

document.getElementById('bestGrid').innerHTML =
  bestSellers.map((p, i) => productCard(p, i, 'best')).join('');

/* ── Reviews ──────────────────────────────────────────── */
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

const avatarColors = ['#c1263f', '#1f7a68', '#b8860b', '#6a3a8f', '#2f6ba8', '#c2661f'];

document.getElementById('reviewsGrid').innerHTML = reviews.map((r, i) => `
  <article class="review-card">
    <div class="review-stars" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</div>
    <p class="review-text">“${r.text}”</p>
    <div class="review-author">
      <div class="review-avatar" style="background:${avatarColors[i % avatarColors.length]}">
        ${r.name.charAt(0)}
      </div>
      <div>
        <p class="review-name">${r.name} <span class="review-verified">✓ Verified</span></p>
        <p class="review-meta">${r.city} · Bought ${r.product}</p>
      </div>
    </div>
  </article>
`).join('');

/* ── Instagram community wall ─────────────────────────── */
/* Sample community posts — placeholder handles, not real accounts. */
/* ratio: 'sq' = 1:1, 'tall' = 9:16 (spans both rows). Pattern sq,sq,tall packs the
   2-row strip flush; the strip scrolls horizontally. */
const igPosts = [
  { img:'images/green-kota-butterfly.jpg',  ratio:'sq',   handle:'nusrat.wears',     caption:'Kota border, up close 🌿' },
  { img:'images/indigo-lotus-pallu.jpg',    ratio:'sq',   handle:'the.saree.diary',  caption:'Indigo dabu detail 💙' },
  { img:'images/royal-blue-dabu.jpg',       ratio:'tall', handle:'anindita.dhk',     caption:'Lotus pallu for Boishakh 🌸' },
  { img:'images/ivory-floral-chanderi.jpg', ratio:'sq',   handle:'rifah.styles',     caption:'Chanderi, wedding ready ✨' },
  { img:'images/steel-blue-fish-block.jpg', ratio:'sq',   handle:'weave.and.wander', caption:'Fish block print 🐟' },
  { img:'images/lilac-mirrorwork-mul.jpg',  ratio:'tall', handle:'maliha.k',         caption:'Royal blue, full drape' },
  { img:'images/indigo-chevron-dabu.jpg',   ratio:'sq',   handle:'sadia.drapes',     caption:'Chevron dabu buti' },
  { img:'images/hero-saree-drape.png',      ratio:'sq',   handle:'proma.styles',     caption:'Gold zari, Puja ready 💛' },
  { img:'images/indigo-lotus-pallu.jpg',    ratio:'tall', handle:'farhana.wraps',    caption:'Lotus pallu, full drape 🌸' },
  { img:'images/green-kota-butterfly.jpg',  ratio:'sq',   handle:'tahmina.threads',  caption:'Kota applique detail' },
  { img:'images/royal-blue-dabu.jpg',       ratio:'sq',   handle:'nabila.k',         caption:'Dabu blues 💙' },
  { img:'images/ivory-floral-chanderi.jpg', ratio:'tall', handle:'sumaya.drapes',    caption:'Chanderi, Puja night ✨' }
];

document.getElementById('igGrid').innerHTML = igPosts.map(p => `
  <a class="ig-item ig-${p.ratio}" href="https://www.instagram.com/${p.handle}/" target="_blank" rel="noopener" aria-label="@${p.handle} on Instagram">
    <img src="${p.img}" alt="${p.caption}" loading="lazy">
  </a>
`).join('');

/* ── Hero image slider ────────────────────────────────── */
(() => {
  const track = document.getElementById('slides');
  if (!track) return;
  const count = track.children.length;
  const dotsWrap = document.getElementById('sliderDots');
  let idx = 0;
  let timer;

  dotsWrap.innerHTML = Array.from({ length: count }, (_, i) =>
    `<button aria-label="Go to slide ${i + 1}"></button>`).join('');
  const dots = [...dotsWrap.children];

  function go(i) {
    idx = (i + count) % count;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('is-active', j === idx));
  }
  function next() { go(idx + 1); }
  function start() { timer = setInterval(next, 5000); }
  function reset() { clearInterval(timer); start(); }

  document.getElementById('sliderNext').onclick = () => { next(); reset(); };
  document.getElementById('sliderPrev').onclick = () => { go(idx - 1); reset(); };
  dots.forEach((d, i) => d.onclick = () => { go(i); reset(); });

  const slider = document.getElementById('heroSlider');
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', start);

  go(0);
  start();
})();

/* ── Rail arrows ──────────────────────────────────────── */
const step = () => rail.querySelector('.product').offsetWidth + 18;
document.getElementById('nextBtn').onclick = () => rail.scrollBy({ left:  step() * 2 });
document.getElementById('prevBtn').onclick = () => rail.scrollBy({ left: -step() * 2 });

/* Sticky header shadow + mobile nav toggle live in page-chrome.js. */

/* ── Add to bag (delegated, covers every card on the page) ── */
const cartBtn = document.getElementById('cartBtn');
document.addEventListener('click', e => {

  const addBtn = e.target.closest('.p-add');
  if (!addBtn) return;
  const id = addBtn.closest('.product').dataset.id;
  addToCart(id);
  cartBtn.animate(
    [{ transform:'scale(1)' }, { transform:'scale(1.3)' }, { transform:'scale(1)' }],
    { duration:400, easing:'cubic-bezier(.22,.61,.36,1)' }
  );
});

/* ── Reveal on scroll ─────────────────────────────────── */
const targets = document.querySelectorAll(
  '.tile, .cat, .product, .card-flat, .review-card, .split-copy, .section-head, .news-inner, .ig-item'
);
targets.forEach(el => el.classList.add('reveal'));

const pending = new Set(targets);

const reveal = (el, delay = 0) => {
  if (!pending.has(el)) return;
  pending.delete(el);
  io.unobserve(el);
  setTimeout(() => el.classList.add('in'), delay);
};

const io = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) reveal(entry.target, i * 70);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

targets.forEach(el => io.observe(el));

/* Safety net: an anchor jump or a fast scroll can move an element from
   below the fold to above it without the ratio ever crossing a threshold,
   so no observer callback fires and the element stays stuck at opacity 0.
   Sweep on scroll for anything already at or above the fold.

   Runs synchronously rather than behind requestAnimationFrame: rAF is
   suspended in background tabs, which would strand the sweep permanently.
   Cost is bounded — `pending` only shrinks, and the listener detaches at 0. */
function sweep() {
  if (!pending.size) {
    removeEventListener('scroll', sweep);
    return;
  }
  pending.forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight) reveal(el);
  });
}
addEventListener('scroll', sweep, { passive: true });
addEventListener('load', sweep);

/* ── Newsletter ───────────────────────────────────────── */
document.getElementById('newsForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Subscribed ✓';
  btn.disabled = true;
  e.target.querySelector('input').value = '';
});