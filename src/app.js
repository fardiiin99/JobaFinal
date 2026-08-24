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
  <a class="cat ${c.size}" href="category?c=${c.slug}">
    <img class="cat-bg" src="${imgSrc(c.img)}" alt="${c.name} saree"
         loading="lazy" style="object-position:${c.pos}">
    <span class="cat-count">${c.count}</span>
    <div class="cat-copy">
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <span class="cat-arrow">Shop ${c.name} ${arrowIcon}</span>
    </div>
  </a>
`).join('');

/* ── Hero slides (data comes from products.js, admin-editable) ─── */
const slidesTrack = document.getElementById('slides');
if (slidesTrack) {
  slidesTrack.innerHTML = heroSlides.map(s => `
    <div class="slide"><img src="${imgSrc(s.img)}" alt="${s.alt || ''}" style="object-position:${s.pos || '50% 50%'}"></div>
  `).join('');
}

const rail = document.getElementById('rail');
rail.innerHTML = newArrivals.map((p, i) => productCard(p, i, 'new')).join('');

document.getElementById('bestGrid').innerHTML =
  bestSellers.map((p, i) => productCard(p, i, 'best')).join('');

/* ── Reviews ──────────────────────────────────────────── */
/* `reviews` array lives in products.js — shared with admin.js so the
   homepage testimonials are editable from Settings. */
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
/* `igPosts` array lives in products.js — shared with admin.js so the
   community wall is editable from Settings. */
document.getElementById('igGrid').innerHTML = igPosts.map(p => `
  <a class="ig-item ig-${p.ratio}" href="https://www.instagram.com/${p.handle}/" target="_blank" rel="noopener" aria-label="@${p.handle} on Instagram">
    <img src="${imgSrc(p.img)}" alt="${p.caption}" loading="lazy">
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