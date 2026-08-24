/* ─────────────────────────────────────────────────────────
   Joba — Best Sellers page
   Lists every item in the `bestSellers` array from products.js,
   ranked (mode 'best' adds the #1/#2… badge and rating/sold line).
   ───────────────────────────────────────────────────────── */

document.getElementById('listingGrid').innerHTML =
  bestSellers.map((p, i) => productCard(p, i, 'best')).join('');

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