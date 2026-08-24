/* ─────────────────────────────────────────────────────────
   Joba — product detail page
   Reads ?id=<productId> from the URL, looks it up in the
   catalogue (products.js) and renders the page.
   ───────────────────────────────────────────────────────── */

const pid = new URLSearchParams(location.search).get('id');
const product = catalogue[pid];
const detail = productDetails[pid] || {};

function renderNotFound() {
  document.getElementById('pdpCrumb').innerHTML =
    `<a href="/">Home</a><span>/</span><span>Product</span>`;
  const pdp = document.getElementById('pdp');
  pdp.classList.add('pdp-empty');
  pdp.innerHTML = `
    <div class="cart-empty">
      <h2>Product not found</h2>
      <p>That piece isn’t in the catalogue — browse everything we carry instead.</p>
      <a href="new-arrivals" class="btn btn-primary">Shop New Arrivals</a>
    </div>`;
}

function renderProduct() {
  const p = product;
  document.title = `${p.name} — ${p.cat} Saree — Joba`;

  const crops = detail.crops && detail.crops.length ? detail.crops : [p.pos || '50% 50%'];
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;

  document.getElementById('pdpCrumb').innerHTML = `
    <a href="/">Home</a><span>/</span>
    <a href="category?c=${p.catSlug}">${p.cat}</a><span>/</span>
    <span>${p.name}</span>`;

  document.getElementById('pdp').innerHTML = `
    <div class="pdp-gallery">
      <div class="pdp-main">
        <img id="pdpMainImg" src="${imgSrc(p.img)}" alt="${p.name} — ${p.cat} saree"
             style="object-position:${crops[0]}">
        <span class="badge ${p.tag === 'SALE' ? 'sale' : ''}">${p.tag}</span>
      </div>
      <div class="pdp-thumbs">
        ${crops.map((c, i) => `
          <button class="pdp-thumb${i === 0 ? ' is-active' : ''}" data-pos="${c}"
                  aria-label="View ${i + 1}">
            <img src="${imgSrc(p.img)}" alt="" style="object-position:${c}">
          </button>`).join('')}
      </div>
    </div>

    <div class="pdp-info">
      <p class="pdp-cat"><a href="category?c=${p.catSlug}">${p.cat}</a></p>
      <h1 class="pdp-name">${p.name}</h1>

      <p class="pdp-rating">
        <span class="stars">${stars(p.rating)}</span>
        <strong>${p.rating}</strong>
        <span>(${p.reviews} reviews)</span>
        <span class="pdp-sold">· ${p.sold}</span>
      </p>

      <p class="pdp-price">
        ${taka(p.price)}
        ${p.old ? `<span class="pdp-old">${taka(p.old)}</span>
                   <span class="pdp-off">−${off}%</span>` : ''}
      </p>

      <p class="pdp-blurb">${detail.blurb || ''}</p>

      <div class="pdp-buy">
        <div class="qty" role="group" aria-label="Quantity">
          <button class="qty-btn" id="qtyMinus" aria-label="Decrease">−</button>
          <span class="qty-val" id="qtyVal">1</span>
          <button class="qty-btn" id="qtyPlus" aria-label="Increase">+</button>
        </div>
        <button class="btn btn-primary pdp-add" id="pdpAdd">Add to bag</button>
      </div>
      <a class="btn pdp-buynow" id="pdpBuy" href="cart">Buy it now</a>

      <ul class="pdp-perks">
        <li>Free delivery over ৳5,000 · ships in 2–4 days</li>
        <li>7-day easy exchange · free first re-fall &amp; pico</li>
        <li>Blouse piece included · loom ID on the label</li>
      </ul>

      ${detail.specs ? `
      <dl class="pdp-specs">
        ${detail.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>` : ''}
    </div>`;

  wireGallery();
  wireBuy(p);
  renderRelated(p);
}

function wireGallery() {
  const main = document.getElementById('pdpMainImg');
  document.querySelectorAll('.pdp-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.pdp-thumb.is-active')?.classList.remove('is-active');
      btn.classList.add('is-active');
      main.style.objectPosition = btn.dataset.pos;
    });
  });

  // Hover to zoom: scale the image and pan its focal point toward the cursor.
  const frame = main.closest('.pdp-main');
  frame.addEventListener('mouseenter', () => frame.classList.add('zoom'));
  frame.addEventListener('mouseleave', () => {
    frame.classList.remove('zoom');
    main.style.transformOrigin = 'center';
  });
  frame.addEventListener('mousemove', e => {
    const r = frame.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    main.style.transformOrigin = `${x}% ${y}%`;
  });
}

function wireBuy(p) {
  let qty = 1;
  const val = document.getElementById('qtyVal');
  const cartBtn = document.getElementById('cartBtn');
  document.getElementById('qtyMinus').onclick = () => { qty = Math.max(1, qty - 1); val.textContent = qty; };
  document.getElementById('qtyPlus').onclick  = () => { qty = Math.min(20, qty + 1); val.textContent = qty; };

  const bump = () => cartBtn.animate(
    [{ transform:'scale(1)' }, { transform:'scale(1.3)' }, { transform:'scale(1)' }],
    { duration:400, easing:'cubic-bezier(.22,.61,.36,1)' }
  );

  document.getElementById('pdpAdd').onclick = () => {
    addToCart(p.id, qty);
    bump();
    const btn = document.getElementById('pdpAdd');
    btn.textContent = 'Added ✓';
    setTimeout(() => { btn.textContent = 'Add to bag'; }, 1400);
  };

  // Buy it now: add then go to the bag (href already points there).
  document.getElementById('pdpBuy').addEventListener('click', () => addToCart(p.id, qty));
}

function renderRelated(p) {
  const related = Object.values(catalogue)
    .filter(x => x.id !== p.id && x.catSlug === p.catSlug);
  const pool = related.length ? related
    : Object.values(catalogue).filter(x => x.id !== p.id);
  const picks = pool.slice(0, 4);
  if (!picks.length) return;

  document.getElementById('pdpRelated').innerHTML =
    picks.map((x, i) => productCard(x, i, 'new')).join('');
  document.getElementById('pdpRelatedWrap').hidden = false;

  // add-to-bag for the related cards
  document.getElementById('pdpRelated').addEventListener('click', e => {
    const add = e.target.closest('.p-add');
    if (!add) return;
    addToCart(add.closest('.product').dataset.id);
    document.getElementById('cartBtn').animate(
      [{ transform:'scale(1)' }, { transform:'scale(1.3)' }, { transform:'scale(1)' }],
      { duration:400, easing:'cubic-bezier(.22,.61,.36,1)' }
    );
  });
}

if (!product) renderNotFound();
else renderProduct();