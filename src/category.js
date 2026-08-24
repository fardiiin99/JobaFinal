/* ─────────────────────────────────────────────────────────
   Joba — category page
   Reads ?c=<slug> from the URL, looks the category up in
   products.js, and lists every catalogue item tagged with it.
   ───────────────────────────────────────────────────────── */

const slug = new URLSearchParams(location.search).get('c');
const category = categories.find(c => c.slug === slug);
const categoryProducts = category
  ? Object.values(catalogue).filter(p => p.catSlug === slug)
  : [];

function renderNotFound() {
  document.getElementById('categoryCrumb').innerHTML =
    `<a href="/">Home</a><span>/</span><span>Shop by Weave</span>`;
  document.getElementById('categoryBanner').innerHTML = '';
  document.getElementById('categoryHead').innerHTML = '';
  document.getElementById('categoryGrid').className = 'cart-layout-empty';
  document.getElementById('categoryGrid').innerHTML = `
    <div class="cart-empty">
      <h2>Category not found</h2>
      <p>That weave isn’t in the catalogue — browse everything we carry instead.</p>
      <a href="/#collections" class="btn btn-primary">Shop by Weave</a>
    </div>`;
}

function renderCategory() {
  document.title = `${category.name} Sarees — Joba`;

  document.getElementById('categoryCrumb').innerHTML = `
    <a href="/">Home</a><span>/</span>
    <a href="/#collections">Shop by Weave</a><span>/</span>
    <span>${category.name}</span>`;

  document.getElementById('categoryBanner').innerHTML = `
    <div class="category-hero">
      <img src="${imgSrc(category.img)}" alt="${category.name} saree" style="object-position:${category.pos}">
      <div class="category-hero-copy">
        <h1>${category.name}</h1>
        <p>${category.desc}</p>
      </div>
    </div>`;

  document.getElementById('categoryHead').innerHTML = `
    <h2>All ${category.name}</h2>
    <p class="head-note" id="categoryCount"></p>`;

  const grid = document.getElementById('categoryGrid');
  if (!categoryProducts.length) {
    grid.className = 'cart-layout-empty';
    grid.innerHTML = `
      <div class="cart-empty">
        <h2>Nothing here yet</h2>
        <p>New pieces in this weave are on the way — check back soon.</p>
        <a href="new-arrivals" class="btn btn-primary">Shop New Arrivals</a>
      </div>`;
    return;
  }

  // Toolbar: search / on-sale / sort within this weave.
  document.getElementById('catToolbar').hidden = false;
  wireToolbar();
  applyFilters();
}

/* ── Filter + sort within the category ─────────────────── */
const catState = { q: '', sale: false, sort: 'featured' };

function applyFilters() {
  const grid = document.getElementById('categoryGrid');
  const empty = document.getElementById('catEmpty');
  const q = catState.q.trim().toLowerCase();

  let list = categoryProducts.filter(p => {
    if (catState.sale && !p.old) return false;
    if (q && !`${p.name} ${p.cat}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sorters = {
    'price-asc':  (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'rating':     (a, b) => b.rating - a.rating,
  };
  if (sorters[catState.sort]) list = [...list].sort(sorters[catState.sort]);

  document.getElementById('categoryCount').textContent =
    `Showing ${list.length} of ${category.count} pieces in this weave`;

  if (!list.length) {
    grid.className = 'grid-products';
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.className = 'grid-products';
  grid.innerHTML = list.map((p, i) => productCard(p, i, 'new')).join('');
}

function wireToolbar() {
  document.getElementById('catSearch').addEventListener('input', e => {
    catState.q = e.target.value; applyFilters();
  });
  document.getElementById('catSaleOnly').addEventListener('change', e => {
    catState.sale = e.target.checked; applyFilters();
  });
  document.getElementById('catSort').addEventListener('change', e => {
    catState.sort = e.target.value; applyFilters();
  });
  document.getElementById('catReset').addEventListener('click', () => {
    catState.q = ''; catState.sale = false; catState.sort = 'featured';
    document.getElementById('catSearch').value = '';
    document.getElementById('catSaleOnly').checked = false;
    document.getElementById('catSort').value = 'featured';
    applyFilters();
  });
}

if (!category) {
  renderNotFound();
} else {
  renderCategory();
}

/* ── Add to bag (mirrors app.js / cart.js) ──── */
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

/* Sticky header shadow + mobile nav toggle live in page-chrome.js. */