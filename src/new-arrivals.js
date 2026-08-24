/* ─────────────────────────────────────────────────────────
   Joba — New Arrivals page
   Lists every item in the `newArrivals` array from products.js.
   ───────────────────────────────────────────────────────── */

document.getElementById('listingGrid').innerHTML =
  newArrivals.map((p, i) => productCard(p, i, 'new')).join('');

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