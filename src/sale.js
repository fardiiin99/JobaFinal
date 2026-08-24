/* ─────────────────────────────────────────────────────────
   Joba — Sale page
   Lists every catalogue item currently tagged SALE.
   ───────────────────────────────────────────────────────── */

const saleProducts = Object.values(catalogue).filter(p => p.tag === 'SALE');
const grid = document.getElementById('listingGrid');

if (saleProducts.length) {
  grid.innerHTML = saleProducts.map((p, i) => productCard(p, i, 'new')).join('');
} else {
  grid.className = 'cart-layout-empty';
  grid.innerHTML = `
    <div class="cart-empty">
      <h2>No sale items right now</h2>
      <p>Check back soon — discounted weaves rotate as new stock comes in.</p>
      <a href="new-arrivals" class="btn btn-primary">Shop New Arrivals</a>
    </div>`;
}

/* ── Add to bag ─────────────────────────────── */
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