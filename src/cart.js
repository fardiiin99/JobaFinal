/* ─────────────────────────────────────────────────────────
   Joba — cart page
   Reads/writes the shared cart via cart-core.js, renders
   against the catalogue in products.js.
   ───────────────────────────────────────────────────────── */

const bagIcon = `<svg viewBox="0 0 24 24" width="48" height="48">
  <path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`;

function renderCart() {
  const lines = cartLines();
  const layout = document.getElementById('cartLayout');

  if (!lines.length) {
    layout.className = 'cart-layout cart-layout-empty';
    layout.innerHTML = `
      <div class="cart-empty">
        ${bagIcon}
        <h2>Your bag is empty</h2>
        <p>Explore the new arrivals and find your next drape.</p>
        <a href="new-arrivals" class="btn btn-primary">Shop New Arrivals</a>
      </div>`;
    renderAlsoLike(lines);
    return;
  }

  const { subtotal, shipping, total } = orderTotals(lines);

  const itemsHtml = lines.map(l => `
    <div class="cart-item" data-id="${l.id}">
      <img class="cart-item-photo" src="${imgSrc(l.img)}" style="object-position:${l.pos}" alt="${l.name}">
      <div class="cart-item-info">
        <p class="cart-item-cat">${l.cat}</p>
        <h3 class="cart-item-name">${l.name}</h3>
        <p class="cart-item-unit">${taka(l.price)} each</p>
        <button class="cart-item-remove" data-action="remove" data-id="${l.id}">Remove</button>
      </div>
      <div class="cart-item-qty">
        <button data-action="dec" data-id="${l.id}" aria-label="Decrease quantity">−</button>
        <span>${l.qty}</span>
        <button data-action="inc" data-id="${l.id}" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item-total">${taka(l.price * l.qty)}</div>
    </div>`).join('');

  const summaryHtml = `
    <aside class="cart-summary">
      <h2>Order Summary</h2>
      <div class="summary-row"><span>Subtotal</span><span>${taka(subtotal)}</span></div>
      <div class="summary-row"><span>Delivery</span><span>${shipping ? taka(shipping) : 'Free'}</span></div>
      ${shipping ? `<p class="summary-note">Add ${taka(FREE_SHIPPING_AT - subtotal)} more for free delivery.</p>` : ''}
      <div class="summary-row summary-total"><span>Total</span><span>${taka(total)}</span></div>
      <form class="promo-form" id="promoForm">
        <input type="text" placeholder="Promo code" aria-label="Promo code">
        <button type="submit" class="btn btn-ghost-dark">Apply</button>
      </form>
      <p class="promo-note" id="promoNote"></p>
      <a href="checkout" class="btn btn-primary cart-checkout">Checkout · ${taka(total)}</a>
    </aside>`;

  layout.className = 'cart-layout';
  layout.innerHTML = `<div class="cart-items">${itemsHtml}</div>${summaryHtml}`;

  document.getElementById('promoForm').addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('promoNote').textContent =
      'Demo store — promo codes aren’t wired up yet.';
  });

  renderAlsoLike(lines);
}

function renderAlsoLike(lines) {
  const inCart = new Set(lines.map(l => l.id));
  const pool = newArrivals.filter(p => !inCart.has(p.id));
  const suggestions = (pool.length ? pool : newArrivals).slice(0, 6);

  document.getElementById('alsoLikeSection').style.display = suggestions.length ? '' : 'none';
  document.getElementById('alsoLikeRail').innerHTML =
    suggestions.map((p, i) => productCard(p, i, 'new')).join('');
}

/* Qty stepper / remove — delegated so re-rendered rows keep working. */
document.getElementById('cartLayout').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;

  if (action === 'remove') removeFromCart(id);
  if (action === 'inc') addToCart(id, 1);
  if (action === 'dec') {
    const state = readCart();
    setCartQty(id, (state[id] || 0) - 1);
  }
  renderCart();
});

/* Add to bag on the "You may also like" rail.
   Custom (not page-chrome's) because adding here must also
   re-render the bag itself, not just bump the header badge. */
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
  renderCart();
});

/* Sticky header shadow + mobile nav toggle live in page-chrome.js. */

renderCart();