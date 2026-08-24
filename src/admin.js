/* ─────────────────────────────────────────────────────────
   House of Joba — admin dashboard (client-side, localStorage)
   Product data seeds from products.js `catalogue`; everything
   else is mock/generated. No backend.
   ───────────────────────────────────────────────────────── */

/* IMG ('images/') comes from products.js — do not redeclare it here. */
const money = n => '৳' + Number(n).toLocaleString('en-IN');
const $ = id => document.getElementById(id);

/* ── Product store (seed from catalogue, persist edits) ── */
const PKEY = 'jobaAdminProducts';
function loadProducts() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(PKEY)); } catch {}
  if (!Array.isArray(s)) {
    s = Object.values(catalogue).map((p, i) => ({
      id: p.id, name: p.name, cat: p.cat, catSlug: p.catSlug,
      price: p.price, old: p.old || null, img: p.img,
      rating: p.rating, sold: p.soldNum || (700 + i * 190),
      stock: [12, 4, 31, 18, 7, 44, 22][i % 7], active: true
    }));
    saveProducts(s);
  }
  return s;
}
function saveProducts(s) { localStorage.setItem(PKEY, JSON.stringify(s)); }
let products = loadProducts();

const IMGFOR = id => (catalogue[id]?.img) || products.find(p => p.id === id)?.img || 'hero-saree-drape.png';

/* ── Mock orders (deterministic) ───────────────────────── */
const CUSTOMERS = [
  ['Nusrat Jahan', 'Dhaka'], ['Farhana Akter', 'Chittagong'], ['Tanvir Ahmed', 'Sylhet'],
  ['Ishrat Zahan', 'Rajshahi'], ['Mehzabin Chowdhury', 'Khulna'], ['Rownok Hasan', 'Narayanganj'],
  ['Sadia Islam', 'Dhaka'], ['Proma Das', 'Barisal'], ['Nabila Karim', 'Comilla'],
  ['Maliha Rahman', 'Gazipur'], ['Rifah Tasnim', 'Mymensingh'], ['Sumaya Akhtar', 'Bogra']
];
const STATUS = ['delivered', 'shipped', 'processing', 'delivered', 'pending', 'delivered', 'shipped', 'cancelled', 'delivered', 'processing', 'shipped', 'delivered'];
const AVATAR = ['#e44c6b', '#5d664b', '#2f6ba8', '#c9a227', '#6a3a8f', '#c2661f'];
const avatarColor = i => AVATAR[i % AVATAR.length];

function buildOrders() {
  const cat = Object.values(catalogue);
  return CUSTOMERS.map((c, i) => {
    const prod = cat[i % cat.length];
    const qty = (i % 3) + 1;
    const day = 21 - i;
    return {
      id: 'JB' + (1042 - i),
      customer: c[0], city: c[1],
      product: prod.name, productId: prod.id,
      qty, total: prod.price * qty,
      status: STATUS[i % STATUS.length],
      date: `Jul ${day < 10 ? '0' + day : day}, 2026`
    };
  });
}
const orders = buildOrders();

const statusBadge = s => {
  const map = { delivered: 'green', shipped: 'blue', processing: 'amber', pending: 'grey', cancelled: 'red' };
  return `<span class="badge ${map[s] || 'grey'}">${s[0].toUpperCase() + s.slice(1)}</span>`;
};

/* ── Settings store ────────────────────────────────────── */
const SKEY = 'jobaAdminSettings';
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch { return {}; }
}
const defaultSettings = { store: 'House of Joba', email: 'hello@joba.com', currency: '৳ BDT', freeShip: 5000, shipFee: 150 };

/* ── Metrics ───────────────────────────────────────────── */
function metrics() {
  const paid = orders.filter(o => o.status !== 'cancelled');
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const avgRating = (products.reduce((s, p) => s + (p.rating || 0), 0) / products.length).toFixed(2);
  return {
    revenue, orders: orders.length, products: products.length,
    customers: CUSTOMERS.length, avgRating,
    aov: Math.round(revenue / paid.length)
  };
}

/* ── Views ─────────────────────────────────────────────── */
const SALES = [180, 220, 260, 240, 310, 290, 360, 400, 380, 450, 520, 610]; // k৳ per month
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function chart(values, labels) {
  const max = Math.max(...values);
  return `<div class="chart">${values.map((v, i) => `
    <div class="chart-col">
      <div class="chart-bar" style="height:${Math.round(v / max * 100)}%" title="${labels[i]}: ৳${v}k"></div>
      <span class="chart-x">${labels[i]}</span>
    </div>`).join('')}</div>`;
}

function viewDashboard() {
  const m = metrics();
  const kpis = [
    { label: 'Revenue', value: money(m.revenue), delta: '+12.4%', up: true, icon: 'M6 12h12M12 6v12', cls: '' },
    { label: 'Orders', value: m.orders, delta: '+8.1%', up: true, icon: 'M4 4h16v16H4z', cls: 'blue' },
    { label: 'Avg order value', value: money(m.aov), delta: '-2.3%', up: false, icon: 'M3 12h18', cls: 'gold' },
    { label: 'Avg rating', value: m.avgRating + '★', delta: '+0.1', up: true, icon: 'M12 4l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z', cls: 'olive' }
  ];
  const top = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const recent = orders.slice(0, 6);

  $('content').innerHTML = `
    <div class="kpi-grid">
      ${kpis.map(k => `
        <div class="kpi">
          <div class="kpi-top">
            <span class="kpi-label">${k.label}</span>
            <span class="kpi-icon ${k.cls}"><svg viewBox="0 0 24 24"><path d="${k.icon}"/></svg></span>
          </div>
          <div class="kpi-value">${k.value}</div>
          <span class="kpi-delta ${k.up ? 'up' : 'down'}">${k.up ? '▲' : '▼'} ${k.delta} <span style="color:var(--ink-soft);font-weight:400">vs last month</span></span>
        </div>`).join('')}
    </div>

    <div class="panels">
      <div class="panel">
        <div class="panel-head"><h3>Revenue</h3><span>Last 12 months · ৳ thousands</span></div>
        ${chart(SALES, MONTHS)}
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Top products</h3><span>by units sold</span></div>
        <div class="toplist">
          ${top.map(p => `
            <div class="topitem">
              <img src="${IMG}${p.img}" alt="">
              <div class="topitem-body"><strong>${p.name}</strong><span>${p.cat}</span></div>
              <span class="topitem-val">${p.sold.toLocaleString('en-IN')}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="table-wrap">
      <div class="table-tools"><strong>Recent orders</strong><span style="margin-left:auto;color:var(--ink-soft);font-size:13px">${orders.length} total</span></div>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${recent.map(o => `
            <tr>
              <td><strong>#${o.id}</strong></td>
              <td>${o.customer}</td>
              <td>${o.product} <span style="color:var(--ink-soft)">×${o.qty}</span></td>
              <td class="money">${money(o.total)}</td>
              <td>${statusBadge(o.status)}</td>
              <td style="color:var(--ink-soft)">${o.date}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
}

function viewProducts() {
  $('content').innerHTML = `
    <div class="view-head">
      <div><p>${products.length} products · ${products.filter(p => p.active).length} active</p></div>
      <button class="btn-primary" id="addProduct">+ Add product</button>
    </div>
    <div class="table-wrap">
      <div class="table-scroll">
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Rating</th><th>Status</th><th></th></tr></thead>
          <tbody id="prodRows">${products.map(rowProduct).join('')}</tbody>
        </table>
      </div>
    </div>`;
  $('addProduct').onclick = () => openModal();
}

function rowProduct(p) {
  const low = p.stock <= 8;
  const pct = Math.min(100, Math.round(p.stock / 50 * 100));
  return `
    <tr data-id="${p.id}">
      <td>
        <div class="cell-prod">
          <img src="${IMG}${p.img}" alt="">
          <div><strong>${p.name}</strong><span>${p.cat}</span></div>
        </div>
      </td>
      <td class="money">${money(p.price)}${p.old ? ` <span style="color:var(--ink-soft);font-weight:400;text-decoration:line-through">${money(p.old)}</span>` : ''}</td>
      <td>
        <div style="display:flex;align-items:center;gap:9px">
          <span class="stock-bar ${low ? 'low' : ''}"><i style="width:${pct}%"></i></span>
          <span style="font-size:13px;${low ? 'color:var(--deep);font-weight:600' : ''}">${p.stock}</span>
        </div>
      </td>
      <td>${p.rating || '—'}★</td>
      <td>${p.active ? '<span class="badge green">Active</span>' : '<span class="badge grey">Draft</span>'}</td>
      <td>
        <div class="row-actions">
          <button class="icon-act edit" title="Edit"><svg viewBox="0 0 24 24"><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13 5l4 4"/></svg></button>
          <button class="icon-act del" title="Delete"><svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"/></svg></button>
        </div>
      </td>
    </tr>`;
}

function viewOrders() {
  $('content').innerHTML = `
    <div class="table-wrap">
      <div class="table-tools">
        <div class="seg" id="orderFilter">
          <button class="chipbtn is-active" data-s="all">All</button>
          <button class="chipbtn" data-s="processing">Processing</button>
          <button class="chipbtn" data-s="shipped">Shipped</button>
          <button class="chipbtn" data-s="delivered">Delivered</button>
          <button class="chipbtn" data-s="cancelled">Cancelled</button>
        </div>
      </div>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody id="orderRows">${orders.map(rowOrder).join('')}</tbody>
        </table>
      </div>
    </div>`;
  $('orderFilter').addEventListener('click', e => {
    const b = e.target.closest('.chipbtn'); if (!b) return;
    document.querySelector('#orderFilter .is-active').classList.remove('is-active');
    b.classList.add('is-active');
    const s = b.dataset.s;
    $('orderRows').innerHTML = orders.filter(o => s === 'all' || o.status === s).map(rowOrder).join('');
  });
}
function rowOrder(o) {
  return `<tr>
    <td><strong>#${o.id}</strong></td>
    <td>${o.customer} <span style="color:var(--ink-soft)">· ${o.city}</span></td>
    <td>${o.product}</td>
    <td>${o.qty}</td>
    <td class="money">${money(o.total)}</td>
    <td>${statusBadge(o.status)}</td>
    <td style="color:var(--ink-soft)">${o.date}</td>
  </tr>`;
}

function viewCustomers() {
  // aggregate orders per customer
  const byName = {};
  orders.forEach(o => {
    (byName[o.customer] ??= { name: o.customer, city: o.city, orders: 0, spent: 0 });
    byName[o.customer].orders++; byName[o.customer].spent += o.status === 'cancelled' ? 0 : o.total;
  });
  const rows = Object.values(byName);
  $('content').innerHTML = `
    <div class="table-wrap">
      <div class="table-tools"><strong>${rows.length} customers</strong></div>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Customer</th><th>Location</th><th>Orders</th><th>Total spent</th><th>Tier</th></tr></thead>
          <tbody>${rows.map((c, i) => {
            const tier = c.spent > 20000 ? '<span class="badge gold" style="background:#f6eccf;color:#8a6a13">VIP</span>'
              : c.spent > 10000 ? '<span class="badge blue">Loyal</span>' : '<span class="badge grey">New</span>';
            return `<tr>
              <td><div class="cell-prod"><span class="avatar-sm" style="background:${avatarColor(i)}">${c.name[0]}</span><div><strong>${c.name}</strong></div></div></td>
              <td>${c.city}</td>
              <td>${c.orders}</td>
              <td class="money">${money(c.spent)}</td>
              <td>${tier}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>`;
}

function viewAnalytics() {
  const m = metrics();
  const byCat = {};
  products.forEach(p => { byCat[p.cat] = (byCat[p.cat] || 0) + p.sold; });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const catMax = Math.max(...cats.map(c => c[1]));
  $('content').innerHTML = `
    <div class="panels">
      <div class="panel">
        <div class="panel-head"><h3>Revenue trend</h3><span>Last 12 months · ৳ thousands</span></div>
        ${chart(SALES, MONTHS)}
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Units by weave</h3><span>share of sales</span></div>
        <div class="toplist">
          ${cats.map(([name, val]) => `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px"><span>${name}</span><strong>${val.toLocaleString('en-IN')}</strong></div>
              <span class="stock-bar" style="width:100%;height:8px"><i style="width:${Math.round(val / catMax * 100)}%;background:linear-gradient(90deg,var(--hibiscus),var(--deep))"></i></span>
            </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="kpi-grid">
      ${[['Conversion rate', '3.8%'], ['Repeat buyers', '41%'], ['Avg rating', m.avgRating + '★'], ['Refund rate', '1.2%']].map(([l, v]) => `
        <div class="kpi"><span class="kpi-label">${l}</span><div class="kpi-value">${v}</div></div>`).join('')}
    </div>`;
}

function financeChart(rev, exp, labels) {
  const max = Math.max(...rev);
  return `<div class="chart">${rev.map((v, i) => `
    <div class="chart-col">
      <div class="chart-pair">
        <div class="chart-bar" style="height:${Math.round(v / max * 100)}%" title="Revenue ${labels[i]}: ৳${v}k"></div>
        <div class="chart-bar exp" style="height:${Math.round(exp[i] / max * 100)}%" title="Expenses ${labels[i]}: ৳${exp[i]}k"></div>
      </div>
      <span class="chart-x">${labels[i]}</span>
    </div>`).join('')}</div>`;
}

function viewFinance() {
  const m = metrics();
  const revenue = m.revenue;
  const expenses = Math.round(revenue * 0.58);
  const profit = revenue - expenses;
  const margin = (profit / revenue * 100).toFixed(1);
  const pending = 42800;

  const EXP = SALES.map(v => Math.round(v * 0.58));
  const breakdown = [
    ['Cost of goods', Math.round(expenses * 0.62), 'var(--hibiscus)'],
    ['Shipping & logistics', Math.round(expenses * 0.14), 'var(--olive)'],
    ['Marketing', Math.round(expenses * 0.16), 'var(--gold)'],
    ['Operations', Math.round(expenses * 0.08), '#2f6ba8']
  ];
  const bMax = Math.max(...breakdown.map(b => b[1]));

  // transactions: incoming order payments + outgoing expense payouts
  const methods = ['bKash', 'Card', 'Nagad', 'Bank', 'Card', 'bKash'];
  const txIn = orders.filter(o => o.status !== 'cancelled').slice(0, 7).map((o, i) => ({
    label: `Payment · #${o.id}`, sub: `${o.customer} · ${methods[i % methods.length]}`,
    amount: o.total, date: o.date, dir: 'in'
  }));
  const txOut = [
    { label: 'Weaver payout', sub: 'Narayanganj cluster · Bank', amount: 48200, date: 'Jul 19, 2026', dir: 'out' },
    { label: 'Courier settlement', sub: 'Pathao · Bank', amount: 9600, date: 'Jul 18, 2026', dir: 'out' },
    { label: 'Ad spend', sub: 'Meta Ads · Card', amount: 14300, date: 'Jul 16, 2026', dir: 'out' },
    { label: 'Fabric purchase', sub: 'Tangail mills · Bank', amount: 31500, date: 'Jul 14, 2026', dir: 'out' }
  ];
  const tx = [...txIn, ...txOut];

  $('content').innerHTML = `
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-top"><span class="kpi-label">Gross revenue</span><span class="kpi-icon"><svg viewBox="0 0 24 24"><path d="M12 3v18M7 7h7a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h9"/></svg></span></div><div class="kpi-value">${money(revenue)}</div><span class="kpi-delta up">▲ +12.4% <span style="color:var(--ink-soft);font-weight:400">vs last month</span></span></div>
      <div class="kpi"><div class="kpi-top"><span class="kpi-label">Expenses</span><span class="kpi-icon olive"><svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg></span></div><div class="kpi-value">${money(expenses)}</div><span class="kpi-delta down">▲ +6.0% <span style="color:var(--ink-soft);font-weight:400">vs last month</span></span></div>
      <div class="kpi"><div class="kpi-top"><span class="kpi-label">Net profit</span><span class="kpi-icon gold"><svg viewBox="0 0 24 24"><path d="M4 18l6-6 4 4 6-8"/></svg></span></div><div class="kpi-value">${money(profit)}</div><span class="kpi-delta up">▲ +18.9% <span style="color:var(--ink-soft);font-weight:400">vs last month</span></span></div>
      <div class="kpi"><div class="kpi-top"><span class="kpi-label">Profit margin</span><span class="kpi-icon blue"><svg viewBox="0 0 24 24"><path d="M5 19L19 5M8 8h.01M16 16h.01"/></svg></span></div><div class="kpi-value">${margin}%</div><span class="kpi-delta up">▲ +2.1pt <span style="color:var(--ink-soft);font-weight:400">vs last month</span></span></div>
    </div>

    <div class="panels">
      <div class="panel">
        <div class="panel-head">
          <h3>Revenue vs expenses</h3>
          <span class="legend"><i class="lg-rev"></i>Revenue <i class="lg-exp"></i>Expenses</span>
        </div>
        ${financeChart(SALES, EXP, MONTHS)}
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Expense breakdown</h3><span>this month</span></div>
        <div class="toplist">
          ${breakdown.map(([name, val, col]) => `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px"><span>${name}</span><strong>${money(val)}</strong></div>
              <span class="stock-bar" style="width:100%;height:8px"><i style="width:${Math.round(val / bMax * 100)}%;background:${col}"></i></span>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="panels" style="grid-template-columns:1fr 1fr">
      <div class="panel fin-balance">
        <span class="kpi-label">Available balance</span>
        <div class="kpi-value" style="margin:10px 0 4px">${money(profit - pending)}</div>
        <p style="color:var(--ink-soft);font-size:13.5px;margin-bottom:16px">${money(pending)} pending payout · settles in 2 days</p>
        <button class="btn-primary" id="payoutBtn">Withdraw funds</button>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>This month</h3></div>
        <div class="toplist">
          <div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--ink-soft)">Orders paid</span><strong>${orders.filter(o => o.status !== 'cancelled').length}</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--ink-soft)">Refunds</span><strong>${money(0)}</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--ink-soft)">Avg order value</span><strong>${money(m.aov)}</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--ink-soft)">Tax collected (est.)</span><strong>${money(Math.round(revenue * 0.05))}</strong></div>
        </div>
      </div>
    </div>

    <div class="table-wrap">
      <div class="table-tools"><strong>Transactions</strong><span style="margin-left:auto;color:var(--ink-soft);font-size:13px">${tx.length} entries</span></div>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Transaction</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>${tx.map(t => `
            <tr>
              <td><div class="cell-prod" style="gap:12px">
                <span class="tx-ico ${t.dir}">${t.dir === 'in' ? '↓' : '↑'}</span>
                <div><strong>${t.label}</strong><span>${t.sub}</span></div>
              </div></td>
              <td>${t.dir === 'in' ? '<span class="badge green">Income</span>' : '<span class="badge red">Expense</span>'}</td>
              <td class="money" style="color:${t.dir === 'in' ? '#3f6b3a' : 'var(--deep)'}">${t.dir === 'in' ? '+' : '−'}${money(t.amount)}</td>
              <td style="color:var(--ink-soft)">${t.date}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;

  $('payoutBtn').onclick = () => toast('Withdrawal requested · ' + money(profit - pending));
}

function viewSettings() {
  const s = { ...defaultSettings, ...loadSettings() };
  $('content').innerHTML = `
    <div class="settings-grid">
      <div class="panel">
        <div class="panel-head"><h3>Store profile</h3></div>
        <form class="set-form" id="setForm">
          <label>Store name<input id="s-store" value="${s.store}"></label>
          <label>Contact email<input id="s-email" type="email" value="${s.email}"></label>
          <label>Currency<select id="s-currency"><option${s.currency === '৳ BDT' ? ' selected' : ''}>৳ BDT</option><option${s.currency === '$ USD' ? ' selected' : ''}>$ USD</option><option${s.currency === '₹ INR' ? ' selected' : ''}>₹ INR</option></select></label>
          <div class="mf-row">
            <label>Free shipping over<input id="s-freeship" type="number" value="${s.freeShip}"></label>
            <label>Shipping fee<input id="s-shipfee" type="number" value="${s.shipFee}"></label>
          </div>
          <div style="display:flex;justify-content:flex-end"><button type="submit" class="btn-primary">Save changes</button></div>
        </form>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Danger zone</h3></div>
        <p style="color:var(--ink-soft);font-size:14px;line-height:1.6;margin-bottom:16px">Reset admin data (products, settings) back to the seeded catalogue. Storefront is unaffected.</p>
        <button class="btn-ghost" id="resetAdmin" style="color:var(--deep);border-color:var(--deep)">Reset admin data</button>
      </div>
    </div>`;
  $('setForm').onsubmit = e => {
    e.preventDefault();
    localStorage.setItem(SKEY, JSON.stringify({
      store: $('s-store').value, email: $('s-email').value, currency: $('s-currency').value,
      freeShip: +$('s-freeship').value, shipFee: +$('s-shipfee').value
    }));
    toast('Settings saved');
  };
  $('resetAdmin').onclick = () => {
    localStorage.removeItem(PKEY); localStorage.removeItem(SKEY);
    products = loadProducts(); toast('Admin data reset'); route('settings');
  };
}

/* ── Product modal (add / edit) ────────────────────────── */
const modal = $('modal');
function fillCatOptions(sel) {
  sel.innerHTML = categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
}
function openModal(id) {
  fillCatOptions($('pf-cat'));
  const editing = products.find(p => p.id === id);
  $('modalTitle').textContent = editing ? 'Edit product' : 'Add product';
  $('pf-id').value = editing ? editing.id : '';
  $('pf-name').value = editing ? editing.name : '';
  $('pf-cat').value = editing ? editing.catSlug : categories[0].slug;
  $('pf-price').value = editing ? editing.price : '';
  $('pf-old').value = editing && editing.old ? editing.old : '';
  $('pf-stock').value = editing ? editing.stock : '';
  $('pf-rating').value = editing ? editing.rating : '4.8';
  $('pf-active').value = editing ? String(editing.active) : 'true';
  modal.hidden = false;
}
function closeModal() { modal.hidden = true; }

$('productForm').onsubmit = e => {
  e.preventDefault();
  const id = $('pf-id').value;
  const catSlug = $('pf-cat').value;
  const cat = categories.find(c => c.slug === catSlug).name;
  const data = {
    name: $('pf-name').value.trim(), cat, catSlug,
    price: +$('pf-price').value, old: $('pf-old').value ? +$('pf-old').value : null,
    stock: +$('pf-stock').value, rating: +$('pf-rating').value || 4.8,
    active: $('pf-active').value === 'true'
  };
  if (id) {
    const p = products.find(x => x.id === id);
    Object.assign(p, data);
    toast('Product updated');
  } else {
    const newId = 'p' + Date.now();
    products.unshift({ id: newId, img: IMGFOR(catSlug) || 'hero-saree-drape.png', sold: 0, ...data });
    toast('Product added');
  }
  saveProducts(products);
  closeModal();
  viewProducts();
};
$('modalClose').onclick = closeModal;
$('modalCancel').onclick = closeModal;
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

/* product row actions (delegated, re-bound each render via #content) */
$('content').addEventListener('click', e => {
  const row = e.target.closest('tr[data-id]'); if (!row) return;
  const id = row.dataset.id;
  if (e.target.closest('.edit')) openModal(id);
  else if (e.target.closest('.del')) {
    if (confirm('Delete this product?')) {
      products = products.filter(p => p.id !== id);
      saveProducts(products); viewProducts(); toast('Product deleted');
    }
  }
});

/* ── Routing ───────────────────────────────────────────── */
const VIEWS = {
  dashboard: { title: 'Dashboard', render: viewDashboard },
  products: { title: 'Products', render: viewProducts },
  orders: { title: 'Orders', render: viewOrders },
  customers: { title: 'Customers', render: viewCustomers },
  analytics: { title: 'Analytics', render: viewAnalytics },
  finance: { title: 'Finance', render: viewFinance },
  settings: { title: 'Settings', render: viewSettings }
};
function route(name) {
  const v = VIEWS[name] || VIEWS.dashboard;
  $('viewTitle').textContent = v.title;
  document.querySelectorAll('.side-link').forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
  v.render();
  $('sidebar').classList.remove('open');
  location.hash = name;
}
document.querySelectorAll('.side-link').forEach(b => b.onclick = () => route(b.dataset.view));
$('mobileMenu').onclick = () => $('sidebar').classList.toggle('open');

/* ── Toast ─────────────────────────────────────────────── */
let toastTimer;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
}

/* ── Boot ──────────────────────────────────────────────── */
route((location.hash || '#dashboard').slice(1));