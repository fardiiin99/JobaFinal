/* ─────────────────────────────────────────────────────────
   Joba — shared page chrome
   Sticky header shadow + mobile nav toggle: identical on every
   page, so it lives here once instead of being copied around.

   Deliberately does NOT include the wishlist/add-to-bag click
   handler — cart.js needs a variant that re-renders the bag
   after adding, so a page-wide delegated handler here would
   double-fire alongside it. Pages that just need the default
   add-to-bag behaviour (category.js, new-arrivals.js, etc.)
   each carry their own copy of that one small handler.

   Load after cart-core.js, before the page-specific script.
   ───────────────────────────────────────────────────────── */

const header = document.getElementById('header');
addEventListener('scroll', () => header.classList.toggle('stuck', scrollY > 8), { passive:true });

const nav = document.getElementById('nav');
document.getElementById('menuBtn').onclick = () => nav.classList.toggle('open');
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') nav.classList.remove('open');
});

/* Shop dropdown: hover opens it on desktop; click/tap toggles it (touch + keyboard). */
const shopGroup = document.querySelector('.nav-group');
if (shopGroup) {
  const trigger = shopGroup.querySelector('.nav-trigger');
  trigger.addEventListener('click', () => {
    const open = shopGroup.classList.toggle('open');
    trigger.setAttribute('aria-expanded', open);
  });
  // close on any click outside the group
  document.addEventListener('click', e => {
    if (shopGroup.contains(e.target)) return;
    shopGroup.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  });
}

/* ── Search overlay ───────────────────────────────────────
   Built once and shared by every page. Filters the catalogue
   (products.js) live and links to each product page. */
const searchBtn = document.querySelector('.icon-btn[aria-label="Search"]');
if (searchBtn && typeof catalogue !== 'undefined') {
  const products = Object.values(catalogue);

  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-panel" role="dialog" aria-label="Search">
      <div class="search-bar">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input type="search" id="siteSearch" placeholder="Search sarees, weaves…" aria-label="Search products" autocomplete="off">
        <button class="search-close" aria-label="Close search">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="search-results" id="searchResults"></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#siteSearch');
  const results = overlay.querySelector('#searchResults');

  const taka = n => '৳' + n.toLocaleString('en-IN');

  function render(q) {
    const term = q.trim().toLowerCase();
    if (!term) {
      results.innerHTML = `<p class="search-hint">Start typing to search ${products.length} sarees.</p>`;
      return;
    }
    const hits = products.filter(p => `${p.name} ${p.cat}`.toLowerCase().includes(term));
    if (!hits.length) {
      results.innerHTML = `<p class="search-hint">No sarees match “${q.trim()}”.</p>`;
      return;
    }
    results.innerHTML = hits.map(p => `
      <a class="search-item" href="product?id=${p.id}">
        <img src="images/${p.img}" alt="${p.name}" style="object-position:${p.pos}">
        <div class="search-item-body">
          <p class="search-item-cat">${p.cat}</p>
          <p class="search-item-name">${p.name}</p>
          <p class="search-item-price">${taka(p.price)}${p.old ? ` <span>${taka(p.old)}</span>` : ''}</p>
        </div>
      </a>`).join('');
  }

  function open() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    render('');
    input.value = '';
    input.focus();
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  searchBtn.addEventListener('click', open);
  overlay.querySelector('.search-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  input.addEventListener('input', () => render(input.value));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}