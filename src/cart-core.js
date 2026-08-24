/* ─────────────────────────────────────────────────────────
   Joba — cart storage, shared by every page
   localStorage survives navigation; sessionStorage would not.
   ───────────────────────────────────────────────────────── */

const CART_KEY = 'jobaCart';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function writeCart(state) {
  localStorage.setItem(CART_KEY, JSON.stringify(state));
  updateCartBadge();
}

function addToCart(id, qty = 1) {
  const state = readCart();
  state[id] = (state[id] || 0) + qty;
  writeCart(state);
}

function setCartQty(id, qty) {
  const state = readCart();
  if (qty <= 0) delete state[id];
  else state[id] = qty;
  writeCart(state);
}

function removeFromCart(id) {
  const state = readCart();
  delete state[id];
  writeCart(state);
}

function cartCount() {
  return Object.values(readCart()).reduce((sum, qty) => sum + qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = cartCount();
}

/* Cart rows joined against the catalogue (products.js), used by both
   the bag and checkout pages so their totals can never drift apart. */
function cartLines() {
  const state = readCart();
  return Object.entries(state)
    .map(([id, qty]) => ({ ...catalogue[id], qty }))
    .filter(line => line.id); // drop stale ids no longer in the catalogue
}

const FREE_SHIPPING_AT = 5000;
const SHIPPING_FEE = 150;

function orderTotals(lines) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}

updateCartBadge();