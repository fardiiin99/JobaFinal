/* ─────────────────────────────────────────────────────────
   Joba — Shop All
   Lists the whole catalogue with live search, weave filter,
   sale toggle and sort. All client-side over products.js.
   ───────────────────────────────────────────────────────── */

const allProducts = Object.values(catalogue);

const state = { q: '', weave: 'all', sale: false, sort: 'featured' };

const $ = id => document.getElementById(id);
const grid = $('shopGrid');
const empty = $('shopEmpty');
const count = $('shopCount');

/* ── Weave filter chips (All + each category) ──────────── */
$('weaveChips').innerHTML =
  `<button class="chip is-active" data-weave="all">All</button>` +
  categories.map(c => `<button class="chip" data-weave="${c.slug}">${c.name}</button>`).join('');

/* ── Filter + sort + render ────────────────────────────── */
function apply() {
  const q = state.q.trim().toLowerCase();

  let list = allProducts.filter(p => {
    if (state.weave !== 'all' && p.catSlug !== state.weave) return false;
    if (state.sale && !p.old) return false;
    if (q && !`${p.name} ${p.cat}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sorters = {
    'price-asc':  (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'rating':     (a, b) => b.rating - a.rating,
  };
  if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);

  count.textContent = `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;

  if (!list.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = list.map((p, i) => productCard(p, i, 'new')).join('');
}

/* ── Controls ──────────────────────────────────────────── */
$('shopSearch').addEventListener('input', e => { state.q = e.target.value; apply(); });

$('weaveChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelector('.chip.is-active')?.classList.remove('is-active');
  chip.classList.add('is-active');
  state.weave = chip.dataset.weave;
  apply();
});

$('saleOnly').addEventListener('change', e => { state.sale = e.target.checked; apply(); });
$('shopSort').addEventListener('change', e => { state.sort = e.target.value; apply(); });

$('shopReset').addEventListener('click', () => {
  state.q = ''; state.weave = 'all'; state.sale = false; state.sort = 'featured';
  $('shopSearch').value = '';
  $('saleOnly').checked = false;
  $('shopSort').value = 'featured';
  document.querySelector('.chip.is-active')?.classList.remove('is-active');
  document.querySelector('.chip[data-weave="all"]').classList.add('is-active');
  apply();
});

/* Pre-select a weave when arriving as shop.html?c=<slug>. */
const preset = new URLSearchParams(location.search).get('c');
if (preset && categories.some(c => c.slug === preset)) {
  state.weave = preset;
  document.querySelector('.chip.is-active')?.classList.remove('is-active');
  document.querySelector(`.chip[data-weave="${preset}"]`)?.classList.add('is-active');
}

apply();

/* ── Add to bag (delegated) ────────────────────────────── */
const cartBtn = $('cartBtn');
grid.addEventListener('click', e => {
  const add = e.target.closest('.p-add');
  if (!add) return;
  addToCart(add.closest('.product').dataset.id);
  cartBtn.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }],
    { duration: 400, easing: 'cubic-bezier(.22,.61,.36,1)' }
  );
});