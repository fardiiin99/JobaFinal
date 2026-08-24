/* ─────────────────────────────────────────────────────────
   Joba — checkout page
   Three states: empty-cart guard, the form itself, and a
   post-submit confirmation. No backend — this is a demo store,
   so the confirmation says so rather than pretending to charge
   a card or dispatch a real order.
   ───────────────────────────────────────────────────────── */

const bagIcon = `<svg viewBox="0 0 24 24" width="48" height="48">
  <path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`;

const checkIcon = `<svg viewBox="0 0 24 24" width="48" height="48">
  <circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>`;

function orderNumber() {
  return 'JB' + Date.now().toString().slice(-6);
}

function renderCheckout() {
  const layout = document.getElementById('checkoutLayout');
  const lines = cartLines();

  if (!lines.length) {
    layout.className = 'checkout-layout checkout-layout-empty';
    layout.innerHTML = `
      <div class="cart-empty">
        ${bagIcon}
        <h2>Your bag is empty</h2>
        <p>Add something to your bag before checking out.</p>
        <a href="new-arrivals.html" class="btn btn-primary">Shop New Arrivals</a>
      </div>`;
    return;
  }

  const { subtotal, shipping, total } = orderTotals(lines);

  const recapHtml = lines.map(l => `
    <div class="recap-row">
      <img class="recap-photo" src="${IMG}${l.img}" style="object-position:${l.pos}" alt="${l.name}">
      <div class="recap-info">
        <p class="recap-name">${l.name}</p>
        <p class="recap-qty">Qty ${l.qty}</p>
      </div>
      <div class="recap-total">${taka(l.price * l.qty)}</div>
    </div>`).join('');

  layout.className = 'checkout-layout';
  layout.innerHTML = `
    <form class="checkout-form" id="checkoutForm" novalidate>
      <h2>Contact</h2>
      <div class="form-row">
        <div class="form-group">
          <label for="fullName">Full name</label>
          <input id="fullName" name="fullName" type="text" required autocomplete="name"
                 placeholder="Your name">
        </div>
        <div class="form-group">
          <label for="phone">Phone number</label>
          <input id="phone" name="phone" type="tel" required autocomplete="tel"
                 placeholder="01XXXXXXXXX" pattern="0[0-9]{10}">
        </div>
      </div>

      <h2>Delivery address</h2>
      <div class="form-group">
        <label for="address">Street address</label>
        <input id="address" name="address" type="text" required autocomplete="street-address"
               placeholder="House, road, area">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="city">City</label>
          <input id="city" name="city" type="text" required autocomplete="address-level2"
                 placeholder="e.g. Dhaka">
        </div>
        <div class="form-group">
          <label for="postcode">Postcode</label>
          <input id="postcode" name="postcode" type="text" autocomplete="postal-code">
        </div>
      </div>
      <div class="form-group">
        <label for="note">Delivery note <span>(optional)</span></label>
        <input id="note" name="note" type="text" placeholder="Gate code, landmark, preferred time…">
      </div>

      <h2>Payment</h2>
      <div class="payment-options">
        <label class="payment-option">
          <input type="radio" name="payment" value="cod" checked>
          <span class="payment-option-body">
            <strong>Cash on Delivery</strong>
            <small>Pay in cash when your order arrives.</small>
          </span>
        </label>
        <label class="payment-option">
          <input type="radio" name="payment" value="mobile">
          <span class="payment-option-body">
            <strong>bKash / Nagad</strong>
            <small>We’ll send a payment request to your phone once the order is confirmed.</small>
          </span>
        </label>
      </div>

      <p class="checkout-disclaimer">
        This is a demo store — placing an order won’t charge you or dispatch anything.
      </p>
      <button type="submit" class="btn btn-primary cart-checkout">Place Order · ${taka(total)}</button>
    </form>

    <aside class="cart-summary">
      <h2>Order Summary</h2>
      <div class="order-recap">${recapHtml}</div>
      <div class="summary-row"><span>Subtotal</span><span>${taka(subtotal)}</span></div>
      <div class="summary-row"><span>Delivery</span><span>${shipping ? taka(shipping) : 'Free'}</span></div>
      ${shipping ? `<p class="summary-note">Add ${taka(FREE_SHIPPING_AT - subtotal)} more for free delivery.</p>` : ''}
      <div class="summary-row summary-total"><span>Total</span><span>${taka(total)}</span></div>
    </aside>`;

  document.getElementById('checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    renderConfirmation({
      orderId: orderNumber(),
      name: data.get('fullName'),
      phone: data.get('phone'),
      address: [data.get('address'), data.get('city')].filter(Boolean).join(', '),
      payment: data.get('payment'),
      lines, subtotal, shipping, total
    });
    writeCart({});
  });
}

function renderConfirmation(order) {
  const layout = document.getElementById('checkoutLayout');
  const paymentLabel = order.payment === 'mobile' ? 'bKash / Nagad' : 'Cash on Delivery';

  layout.className = 'checkout-layout checkout-layout-empty';
  layout.innerHTML = `
    <div class="cart-empty checkout-success">
      ${checkIcon}
      <h2>Order placed — #${order.orderId}</h2>
      <p>Thanks, ${order.name}. This is a demo store, so nothing was actually
         charged or shipped — but here’s the recap:</p>
      <div class="order-recap order-recap-confirm">
        ${order.lines.map(l => `
          <div class="recap-row">
            <img class="recap-photo" src="${IMG}${l.img}" style="object-position:${l.pos}" alt="${l.name}">
            <div class="recap-info">
              <p class="recap-name">${l.name}</p>
              <p class="recap-qty">Qty ${l.qty}</p>
            </div>
            <div class="recap-total">${taka(l.price * l.qty)}</div>
          </div>`).join('')}
      </div>
      <div class="summary-row summary-total"><span>Total</span><span>${taka(order.total)}</span></div>
      <p class="confirm-detail">${paymentLabel} · Delivering to ${order.address}</p>
      <a href="index.html" class="btn btn-primary">Continue Shopping</a>
    </div>`;
}

/* Sticky header shadow + mobile nav toggle live in page-chrome.js. */

renderCheckout();