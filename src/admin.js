/* ─────────────────────────────────────────────────────────
   House of Joba — admin panel
   Client-side only. Catalogue comes from products.js, CRM
   records from crm-data.js; edits are persisted to
   localStorage so a refresh keeps your changes.

   Views are plain render functions writing into #content.
   Routing is the URL hash, so a view survives a reload.
   ───────────────────────────────────────────────────────── */

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* `taka` comes from products.js. This is the compact variant
   used on KPI tiles where ৳320,000 would overflow the card. */
const money = n => {
  const v = Math.round(n);
  if (Math.abs(v) >= 100000) return '৳' + (v / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
  if (Math.abs(v) >= 1000)   return '৳' + (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return '৳' + v;
};

const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;

const DAY = 86400000;
const relTime = iso => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return 'upcoming';
  const d = Math.floor(diff / DAY);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return d + 'd ago';
  if (d < 365) return Math.floor(d / 30) + 'mo ago';
  return Math.floor(d / 365) + 'y ago';
};
const shortDate = iso => new Date(iso)
  .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/* ── Persistence ───────────────────────────────────────── */
const KEYS = { crm: 'jobaCRM', deals: 'jobaDeals', products: 'jobaAdminProducts', settings: 'jobaAdminSettings',
               hero: 'jobaHeroSlides', categories: 'jobaCategories', reviews: 'jobaReviews', community: 'jobaCommunity',
               orderStatus: 'jobaOrderStatus' };

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function load(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key));
    return raw == null ? fallback : raw;
  } catch { return fallback; }
}
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

/* Working copies — the imported consts stay pristine so
   "reset data" in Settings can restore them. */
let crmContacts = load(KEYS.crm, null) || contacts.map(c => ({ ...c, tags: [...c.tags] }));
let crmDeals    = load(KEYS.deals, null) || deals.map(d => ({ ...d }));
let feed        = activities.map(a => ({ ...a }));

const DEFAULT_SETTINGS = {
  store: 'House of Joba', email: 'hello@joba.com',
  currency: '৳ BDT', freeShip: 5000, shipFee: 150
};
let settings = { ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) };

const contactById = id => crmContacts.find(c => c.id === id);
const ownerOf = id => OWNERS[id] || { name: '—', initials: '?', color: '#9d968c' };

/* ── Products (seeded from the storefront catalogue) ───── */
function seedProducts() {
  return Object.values(catalogue).map((p, i) => ({
    id: p.id, name: p.name, cat: p.cat, catSlug: p.catSlug,
    price: p.price, old: p.old || null, img: p.img,
    rating: p.rating, sold: 700 + i * 190,
    stock: [12, 4, 31, 18, 7, 44, 22][i % 7], active: true
  }));
}
let products = load(KEYS.products, null) || seedProducts();

/* ── Orders (deterministic demo set, joined to contacts) ─ */
const ORDER_STATUS = ['delivered', 'shipped', 'processing', 'delivered', 'pending',
                      'delivered', 'shipped', 'cancelled', 'delivered', 'processing',
                      'shipped', 'delivered'];
const STATUS_TONE = { delivered: 'green', shipped: 'blue', processing: 'amber',
                      pending: 'grey', cancelled: 'red' };

const ADDRESS_LINES = [
  'House 14, Road 7, Dhanmondi', 'Flat 3B, Road 27, Banani', 'House 62, Sector 11, Uttara',
  'Holding 9, GEC Circle', 'House 21, Housing Estate', 'Flat 5A, Zindabazar',
  'House 8, New Market Area', 'House 33, Lane 4, Shaheb Bazar', 'Flat 2C, Sona Road',
  'House 17, College Road', 'House 5, Notun Bazar', 'Flat 1B, Chandra Road'
];

const orders = crmContacts.map((c, i) => {
  const list = Object.values(catalogue);
  const prod = list[i % list.length];
  const qty = (i % 3) + 1;
  const day = 21 - i;
  return {
    id: 'JB' + (1042 - i), contactId: c.id, customer: c.name, city: c.city,
    address: `${ADDRESS_LINES[i % ADDRESS_LINES.length]}, ${c.city}`,
    product: prod.name, productId: prod.id, qty, total: prod.price * qty,
    status: ORDER_STATUS[i % ORDER_STATUS.length],
    date: `2026-08-${String(Math.max(day, 1)).padStart(2, '0')}`
  };
});

const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'pending', 'cancelled'];
const orderStatusOverrides = load(KEYS.orderStatus, {});
orders.forEach(o => { if (orderStatusOverrides[o.id]) o.status = orderStatusOverrides[o.id]; });

/* ── Shared metrics ────────────────────────────────────── */
const SALES  = [180, 220, 260, 240, 310, 290, 360, 400, 380, 450, 520, 610]; // ৳ thousands
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function metrics() {
  const paid = orders.filter(o => o.status !== 'cancelled');
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const pipeline = crmDeals.filter(d => d.stage !== 'won')
                           .reduce((s, d) => s + d.value, 0);
  return {
    revenue, pipeline,
    orders: orders.length,
    aov: Math.round(revenue / paid.length),
    contacts: crmContacts.length,
    leads: crmContacts.filter(c => c.status === 'lead').length,
    vips: crmContacts.filter(c => c.status === 'vip').length
  };
}

/* ── Chart helpers ─────────────────────────────────────── */
function barChart(series, labels, alt) {
  const max = Math.max(...series, ...(alt || [0]));
  return `<div class="chart">${series.map((v, i) => `
    <div class="chart-col">
      <div class="chart-stack">
        <div class="chart-bar" style="height:${Math.round(v / max * 100)}%"
             title="${labels[i]}: ৳${v}k"></div>
        ${alt ? `<div class="chart-bar alt" style="height:${Math.round(alt[i] / max * 100)}%"
             title="Expenses ${labels[i]}: ৳${alt[i]}k"></div>` : ''}
      </div>
      <span class="chart-x">${labels[i]}</span>
    </div>`).join('')}</div>`;
}

function meterRows(rows) {
  const max = Math.max(...rows.map(r => r.value));
  return `<div class="meter">${rows.map(r => `
    <div class="meter-row">
      <div class="meter-top"><span>${esc(r.label)}</span><strong>${r.display}</strong></div>
      <div class="bar ${r.tone || ''}"><i style="width:${Math.round(r.value / max * 100)}%"></i></div>
    </div>`).join('')}</div>`;
}

const initials = name => name.split(' ').filter(Boolean).slice(0, 2)
  .map(w => w[0]).join('').toUpperCase();
const avatarEl = (name, color, cls = '') =>
  `<span class="avatar ${cls}" style="background:${color}">${esc(initials(name))}</span>`;

/* ═════════════════════════════════════════════════════════
   Views
   ═════════════════════════════════════════════════════════ */

function viewDashboard() {
  const m = metrics();
  const kpis = [
    { label: 'Revenue',         value: money(m.revenue),  delta: '+12.4%', up: true,  note: 'vs last month' },
    { label: 'Open pipeline',   value: money(m.pipeline), delta: '+8.1%',  up: true,  note: `${crmDeals.filter(d => d.stage !== 'won').length} deals` },
    { label: 'Avg order value', value: taka(m.aov),       delta: '-2.3%',  up: false, note: 'vs last month' },
    { label: 'New leads',       value: m.leads,           delta: '+3',     up: true,  note: 'this month' }
  ];

  const stageRows = PIPELINE_STAGES.map(s => {
    const total = crmDeals.filter(d => d.stage === s.id).reduce((t, d) => t + d.value, 0);
    return { label: s.label, value: total || 1, display: money(total) };
  });

  const recent = [...feed].sort((a, b) => new Date(b.when) - new Date(a.when)).slice(0, 7);

  $('content').innerHTML = `
    <div class="kpi-grid">
      ${kpis.map(k => `
        <div class="kpi">
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-value">${k.value}</div>
          <div class="kpi-foot">
            <span class="delta ${k.up ? 'up' : 'down'}">
              ${icon(k.up ? 'up' : 'down')}${k.delta}
            </span>
            ${esc(k.note)}
          </div>
        </div>`).join('')}
    </div>

    <div class="panels split">
      <div class="panel">
        <div class="panel-head">
          <h3>Revenue</h3>
          <span class="meta">Last 12 months · ৳ thousands</span>
        </div>
        ${barChart(SALES, MONTHS)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <h3>Pipeline by stage</h3>
          <a class="btn btn-quiet btn-sm" href="#pipeline">Open board</a>
        </div>
        ${meterRows(stageRows)}
      </div>
    </div>

    <div class="panels split">
      <div class="panel">
        <div class="panel-head">
          <h3>Recent activity</h3>
          <span class="meta">Across all contacts</span>
        </div>
        <div class="timeline">${recent.map(timelineItem).join('')}</div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <h3>Top customers</h3>
          <a class="btn btn-quiet btn-sm" href="#contacts">All contacts</a>
        </div>
        ${meterRows([...crmContacts].sort((a, b) => b.ltv - a.ltv).slice(0, 5)
          .map(c => ({ label: c.name, value: c.ltv || 1, display: money(c.ltv), tone: 'olive' })))}
      </div>
    </div>`;
}

/* ── CRM · Contacts ────────────────────────────────────── */
const contactState = { q: '', segment: 'all', sort: 'recent' };

function viewContacts() {
  const m = metrics();
  $('content').innerHTML = `
    <div class="view-head">
      <div>
        <h2>Contacts</h2>
        <p>${crmContacts.length} records · ${m.vips} VIP · ${m.leads} open leads</p>
      </div>
      <div class="view-head-actions">
        <button class="btn btn-ghost" id="exportContacts">Export CSV</button>
        <button class="btn btn-primary" id="addContact">${icon('plus')} New contact</button>
      </div>
    </div>

    <div class="toolbar">
      <div class="search">
        ${icon('search')}
        <input type="search" id="contactSearch" placeholder="Search name, email, city…"
               value="${esc(contactState.q)}" aria-label="Search contacts">
      </div>
      <div class="seg" id="segments">
        ${SEGMENTS.map(s => `
          <button class="chip ${contactState.segment === s.id ? 'is-active' : ''}"
                  data-seg="${s.id}">${esc(s.label)}</button>`).join('')}
      </div>
      <div class="toolbar-right">
        <select class="select" id="contactSort" aria-label="Sort contacts">
          <option value="recent">Last activity</option>
          <option value="ltv">Lifetime value</option>
          <option value="name">Name A–Z</option>
          <option value="new">Newest</option>
        </select>
      </div>
    </div>

    <div class="table-wrap" id="contactsTable"></div>`;

  $('contactSort').value = contactState.sort;
  renderContactRows();

  $('contactSearch').addEventListener('input', e => {
    contactState.q = e.target.value; renderContactRows();
  });
  $('segments').addEventListener('click', e => {
    const chip = e.target.closest('.chip'); if (!chip) return;
    contactState.segment = chip.dataset.seg;
    $('segments').querySelector('.is-active')?.classList.remove('is-active');
    chip.classList.add('is-active');
    renderContactRows();
  });
  $('contactSort').addEventListener('change', e => {
    contactState.sort = e.target.value; renderContactRows();
  });
  $('addContact').onclick = () => openContactModal();
  $('exportContacts').onclick = () => toast(`Exported ${filteredContacts().length} contacts`);
}

function filteredContacts() {
  const q = contactState.q.trim().toLowerCase();
  const seg = SEGMENTS.find(s => s.id === contactState.segment) || SEGMENTS[0];

  const list = crmContacts.filter(c => {
    if (!seg.test(c)) return false;
    if (!q) return true;
    return `${c.name} ${c.email} ${c.city} ${c.company} ${c.tags.join(' ')}`
      .toLowerCase().includes(q);
  });

  const sorters = {
    recent: (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity),
    ltv:    (a, b) => b.ltv - a.ltv,
    name:   (a, b) => a.name.localeCompare(b.name),
    new:    (a, b) => new Date(b.since) - new Date(a.since)
  };
  return [...list].sort(sorters[contactState.sort]);
}

function renderContactRows() {
  const list = filteredContacts();
  const wrap = $('contactsTable');

  if (!list.length) {
    wrap.innerHTML = `
      <div class="empty">
        ${icon('inbox')}
        <h3>No contacts match</h3>
        <p>Try a different search or clear the segment filter.</p>
        <button class="btn btn-ghost" id="clearContactFilters">Clear filters</button>
      </div>`;
    $('clearContactFilters').onclick = () => {
      contactState.q = ''; contactState.segment = 'all'; viewContacts();
    };
    return;
  }

  wrap.innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Contact</th><th>Location</th><th>Status</th>
            <th class="t-right">Lifetime</th><th class="t-right">Orders</th>
            <th>Owner</th><th>Last activity</th><th></th>
          </tr>
        </thead>
        <tbody>${list.map(contactRow).join('')}</tbody>
      </table>
    </div>
    <div class="table-foot">
      <span>Showing ${list.length} of ${crmContacts.length}</span>
      <span>Total lifetime value · ${taka(list.reduce((s, c) => s + c.ltv, 0))}</span>
    </div>`;

  wrap.querySelectorAll('tr[data-id]').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('.act')) return;
      openContactDrawer(tr.dataset.id);
    });
  });
  wrap.querySelectorAll('.act.edit').forEach(b =>
    b.addEventListener('click', () => openContactModal(b.closest('tr').dataset.id)));
  wrap.querySelectorAll('.act.del').forEach(b =>
    b.addEventListener('click', () => deleteContact(b.closest('tr').dataset.id)));
}

function contactRow(c) {
  const status = CONTACT_STATUS[c.status];
  const owner = ownerOf(c.owner);
  return `
    <tr data-id="${c.id}" class="is-clickable">
      <td>
        <div class="cell-user">
          ${avatarEl(c.name, owner.color)}
          <div>
            <strong>${esc(c.name)}</strong>
            <span>${esc(c.email)}</span>
          </div>
        </div>
      </td>
      <td>${esc(c.city)}${c.company ? `<br><span class="muted" style="font-size:12px">${esc(c.company)}</span>` : ''}</td>
      <td><span class="pill ${status.tone}">${status.label}</span></td>
      <td class="t-right num">${c.ltv ? taka(c.ltv) : '—'}</td>
      <td class="t-right num">${c.orders || '—'}</td>
      <td>
        <div class="cell-user">
          ${avatarEl(owner.name, owner.color, 'sm')}
          <span class="muted" style="font-size:12.5px">${esc(owner.name)}</span>
        </div>
      </td>
      <td class="muted">${relTime(c.lastActivity)}</td>
      <td>
        <div class="row-actions">
          <button class="act edit" title="Edit">${icon('edit')}</button>
          <button class="act del" title="Delete">${icon('trash')}</button>
        </div>
      </td>
    </tr>`;
}

function deleteContact(id) {
  const c = contactById(id);
  if (!c || !confirm(`Delete ${c.name}? This also removes their deals.`)) return;
  crmContacts = crmContacts.filter(x => x.id !== id);
  crmDeals = crmDeals.filter(d => d.contactId !== id);
  save(KEYS.crm, crmContacts); save(KEYS.deals, crmDeals);
  closeDrawer(); renderContactRows(); renderNav();
  toast('Contact deleted');
}

/* ── CRM · Contact drawer ──────────────────────────────── */
const TL_ICON = { order: 'bag', email: 'mail', call: 'phone', note: 'note', task: 'check' };

function timelineItem(a) {
  const owner = ownerOf(a.owner);
  return `
    <div class="tl-item">
      <div class="tl-rail">
        <span class="tl-dot ${a.type}">${icon(TL_ICON[a.type] || 'note')}</span>
        <span class="tl-line"></span>
      </div>
      <div class="tl-body">
        <p>${esc(a.text)}</p>
        <div class="tl-meta">${esc(owner.name)} · ${relTime(a.when)}</div>
      </div>
    </div>`;
}

function openContactDrawer(id) {
  const c = contactById(id);
  if (!c) return;
  const owner = ownerOf(c.owner);
  const status = CONTACT_STATUS[c.status];
  const theirDeals = crmDeals.filter(d => d.contactId === c.id);
  const theirFeed = feed.filter(a => a.contactId === c.id)
                        .sort((a, b) => new Date(b.when) - new Date(a.when));
  const theirOrders = orders.filter(o => o.contactId === c.id);

  $('drawerKind').textContent = 'Contact';
  $('drawerBody').innerHTML = `
    <div class="drawer-hero">
      <div class="drawer-id">
        ${avatarEl(c.name, owner.color, 'lg')}
        <div>
          <h3>${esc(c.name)}</h3>
          <div class="sub">${c.company ? esc(c.company) + ' · ' : ''}${esc(c.city)}</div>
        </div>
      </div>
      <div class="quick-row">
        <button class="quick" data-act="email">${icon('mail')}Email</button>
        <button class="quick" data-act="call">${icon('phone')}Call</button>
        <button class="quick" data-act="note">${icon('note')}Note</button>
        <button class="quick" data-act="task">${icon('check')}Task</button>
      </div>
    </div>

    <div class="stat-strip">
      <div><strong>${taka(c.ltv)}</strong><span>Lifetime</span></div>
      <div><strong>${c.orders}</strong><span>Orders</span></div>
      <div><strong>${theirDeals.length}</strong><span>Deals</span></div>
    </div>

    <section class="drawer-section">
      <h4>Details <button class="btn btn-quiet btn-sm" id="drawerEdit">Edit</button></h4>
      <dl>
        <div class="field"><dt>Status</dt><dd><span class="pill ${status.tone}">${status.label}</span></dd></div>
        <div class="field"><dt>Email</dt><dd>${esc(c.email)}</dd></div>
        <div class="field"><dt>Phone</dt><dd>${esc(c.phone)}</dd></div>
        <div class="field"><dt>Owner</dt><dd>${esc(owner.name)}</dd></div>
        <div class="field"><dt>Customer since</dt><dd>${shortDate(c.since)}</dd></div>
        <div class="field"><dt>Last activity</dt><dd>${relTime(c.lastActivity)}</dd></div>
      </dl>
    </section>

    <section class="drawer-section">
      <h4>Tags</h4>
      <div class="tag-row">
        ${c.tags.length
          ? c.tags.map(t => `<span class="tag">${esc(t)}<button data-tag="${esc(t)}" title="Remove">×</button></span>`).join('')
          : '<span class="muted" style="font-size:13px">No tags yet</span>'}
        <button class="tag" id="addTag" style="border:1px dashed var(--line);background:none">+ Add</button>
      </div>
    </section>

    <section class="drawer-section">
      <h4>Private note</h4>
      <textarea class="note-box" id="contactNote"
        placeholder="Anything the team should know before reaching out…">${esc(c.note)}</textarea>
    </section>

    ${theirDeals.length ? `
    <section class="drawer-section">
      <h4>Open deals</h4>
      ${theirDeals.map(d => {
        const stage = PIPELINE_STAGES.find(s => s.id === d.stage);
        return `<div class="owner-row">
          <div>
            <strong>${esc(d.title)}</strong>
            <span>${stage.label} · closes ${shortDate(d.close)}</span>
          </div>
          <span class="pill plain grey num">${taka(d.value)}</span>
        </div>`;
      }).join('')}
    </section>` : ''}

    ${theirOrders.length ? `
    <section class="drawer-section">
      <h4>Orders</h4>
      ${theirOrders.map(o => `
        <div class="owner-row">
          <div>
            <strong>#${esc(o.id)}</strong>
            <span>${esc(o.product)} ×${o.qty}</span>
          </div>
          <span class="pill ${STATUS_TONE[o.status]}">${o.status[0].toUpperCase() + o.status.slice(1)}</span>
        </div>`).join('')}
    </section>` : ''}

    <section class="drawer-section">
      <h4>Activity</h4>
      <div class="timeline">
        ${theirFeed.length ? theirFeed.map(timelineItem).join('')
          : '<span class="muted" style="font-size:13px">Nothing logged yet.</span>'}
      </div>
    </section>`;

  /* quick actions log straight into the feed */
  $('drawerBody').querySelectorAll('.quick').forEach(btn => {
    btn.onclick = () => {
      const kind = btn.dataset.act;
      const text = prompt(`Log a ${kind} for ${c.name}:`);
      if (!text) return;
      feed.unshift({ id: 'a' + Date.now(), contactId: c.id, type: kind,
                     owner: c.owner, when: new Date().toISOString(), text });
      c.lastActivity = new Date().toISOString().slice(0, 10);
      save(KEYS.crm, crmContacts);
      openContactDrawer(c.id);
      if (currentView === 'contacts') renderContactRows();
      toast(`${kind[0].toUpperCase() + kind.slice(1)} logged`);
    };
  });

  $('drawerEdit').onclick = () => openContactModal(c.id);

  $('drawerBody').querySelectorAll('[data-tag]').forEach(b => {
    b.onclick = () => {
      c.tags = c.tags.filter(t => t !== b.dataset.tag);
      save(KEYS.crm, crmContacts); openContactDrawer(c.id);
    };
  });
  $('addTag').onclick = () => {
    const t = prompt('Tag name:');
    if (!t || c.tags.includes(t)) return;
    c.tags.push(t); save(KEYS.crm, crmContacts); openContactDrawer(c.id);
  };

  const note = $('contactNote');
  note.addEventListener('blur', () => {
    if (note.value === c.note) return;
    c.note = note.value; save(KEYS.crm, crmContacts); toast('Note saved');
  });

  showDrawer();
}

/* ── CRM · Pipeline board ──────────────────────────────── */
function viewPipeline() {
  const open = crmDeals.filter(d => d.stage !== 'won');
  $('content').innerHTML = `
    <div class="view-head">
      <div>
        <h2>Pipeline</h2>
        <p>${open.length} open deals worth ${taka(open.reduce((s, d) => s + d.value, 0))} · drag a card to move it</p>
      </div>
      <div class="view-head-actions">
        <button class="btn btn-primary" id="addDeal">${icon('plus')} New deal</button>
      </div>
    </div>
    <div class="board" id="board">
      ${PIPELINE_STAGES.map(stageColumn).join('')}
    </div>`;

  $('addDeal').onclick = () => openDealModal();
  wireBoard();
}

function stageColumn(stage) {
  const inStage = crmDeals.filter(d => d.stage === stage.id);
  const total = inStage.reduce((s, d) => s + d.value, 0);
  return `
    <div class="column" data-stage="${stage.id}">
      <div class="col-head">
        <h4>${esc(stage.label)}</h4>
        <span class="col-count">${inStage.length}</span>
        <span class="col-total num">${money(total)}</span>
      </div>
      ${inStage.map(dealCard).join('')}
    </div>`;
}

function dealCard(d) {
  const c = contactById(d.contactId);
  const owner = ownerOf(d.owner);
  return `
    <article class="deal" draggable="true" data-id="${d.id}">
      <h5>${esc(d.title)}</h5>
      <div class="who">${esc(c ? c.name : 'Unknown contact')}</div>
      <div class="deal-foot">
        <span class="deal-val">${taka(d.value)}</span>
        <span class="deal-date">${shortDate(d.close)}</span>
        ${avatarEl(owner.name, owner.color, 'sm')}
      </div>
    </article>`;
}

function wireBoard() {
  const board = $('board');
  let dragId = null;

  board.querySelectorAll('.deal').forEach(card => {
    card.addEventListener('dragstart', e => {
      dragId = card.dataset.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragId);
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    card.addEventListener('click', () => {
      const deal = crmDeals.find(x => x.id === card.dataset.id);
      if (deal) openContactDrawer(deal.contactId);
    });
  });

  board.querySelectorAll('.column').forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const id = dragId || e.dataTransfer.getData('text/plain');
      const deal = crmDeals.find(d => d.id === id);
      if (!deal || deal.stage === col.dataset.stage) return;

      deal.stage = col.dataset.stage;
      save(KEYS.deals, crmDeals);
      viewPipeline(); renderNav();
      const stage = PIPELINE_STAGES.find(s => s.id === deal.stage);
      toast(`${deal.title} → ${stage.label}`);
    });
  });
}

/* ── Orders ────────────────────────────────────────────── */
let orderFilter = 'all';

function viewOrders() {
  const statuses = ['all', 'processing', 'shipped', 'delivered', 'pending', 'cancelled'];
  $('content').innerHTML = `
    <div class="view-head">
      <div>
        <h2>Orders</h2>
        <p>${orders.length} orders · ${taka(orders.filter(o => o.status !== 'cancelled')
          .reduce((s, o) => s + o.total, 0))} collected</p>
      </div>
    </div>
    <div class="toolbar">
      <div class="seg" id="orderFilter">
        ${statuses.map(s => `
          <button class="chip ${orderFilter === s ? 'is-active' : ''}" data-s="${s}">
            ${s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
          </button>`).join('')}
      </div>
    </div>
    <div class="table-wrap" id="ordersTable"></div>`;

  renderOrderRows();
  $('orderFilter').addEventListener('click', e => {
    const chip = e.target.closest('.chip'); if (!chip) return;
    orderFilter = chip.dataset.s;
    $('orderFilter').querySelector('.is-active')?.classList.remove('is-active');
    chip.classList.add('is-active');
    renderOrderRows();
  });
}

function renderOrderRows() {
  const list = orders.filter(o => orderFilter === 'all' || o.status === orderFilter);
  $('ordersTable').innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Delivery address</th><th>Product</th>
              <th class="t-right">Qty</th><th class="t-right">Total</th>
              <th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>${list.map(o => `
          <tr class="is-clickable" data-contact="${o.contactId}">
            <td><strong>#${esc(o.id)}</strong></td>
            <td>${esc(o.customer)}</td>
            <td class="muted" style="max-width:220px">${esc(o.address)}</td>
            <td>${esc(o.product)}</td>
            <td class="t-right num">${o.qty}</td>
            <td class="t-right num">${taka(o.total)}</td>
            <td>
              <select class="status-select ${STATUS_TONE[o.status]}" data-id="${o.id}">
                ${ORDER_STATUSES.map(s =>
                  `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}
              </select>
            </td>
            <td class="muted">${shortDate(o.date)}</td>
          </tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="table-foot">
      <span>Showing ${list.length} of ${orders.length}</span>
      <span>${taka(list.reduce((s, o) => s + o.total, 0))}</span>
    </div>`;

  $('ordersTable').querySelectorAll('tr[data-contact]').forEach(tr =>
    tr.addEventListener('click', e => {
      if (e.target.closest('select')) return;
      openContactDrawer(tr.dataset.contact);
    }));

  $('ordersTable').querySelectorAll('.status-select').forEach(sel =>
    sel.addEventListener('change', () => {
      const o = orders.find(x => x.id === sel.dataset.id);
      o.status = sel.value;
      const overrides = load(KEYS.orderStatus, {});
      overrides[o.id] = sel.value;
      save(KEYS.orderStatus, overrides);
      toast(`Order #${o.id} marked ${o.status}`);
      viewOrders();
    }));
}

/* ── Products ──────────────────────────────────────────── */
function viewProducts() {
  $('content').innerHTML = `
    <div class="view-head">
      <div>
        <h2>Products</h2>
        <p>${products.length} products · ${products.filter(p => p.active).length} active ·
           ${products.filter(p => p.stock <= 8).length} low on stock</p>
      </div>
      <div class="view-head-actions">
        <button class="btn btn-primary" id="addProduct">${icon('plus')} Add product</button>
      </div>
    </div>
    <div class="table-wrap">
      <div class="table-scroll">
        <table>
          <thead>
            <tr><th>Product</th><th class="t-right">Price</th><th>Stock</th>
                <th class="t-right">Rating</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>${products.map(productRow).join('')}</tbody>
        </table>
      </div>
    </div>`;

  $('addProduct').onclick = () => openProductModal();
  $('content').querySelectorAll('.act.edit').forEach(b =>
    b.onclick = () => openProductModal(b.closest('tr').dataset.id));
  $('content').querySelectorAll('.act.del').forEach(b =>
    b.onclick = () => {
      const id = b.closest('tr').dataset.id;
      if (!confirm('Delete this product?')) return;
      products = products.filter(p => p.id !== id);
      save(KEYS.products, products); viewProducts(); toast('Product deleted');
    });
}

function productRow(p) {
  const low = p.stock <= 8;
  return `
    <tr data-id="${p.id}">
      <td>
        <div class="cell-prod">
          <img src="${imgSrc(p.img)}" alt="">
          <div><strong>${esc(p.name)}</strong><span>${esc(p.cat)}</span></div>
        </div>
      </td>
      <td class="t-right num">
        ${taka(p.price)}
        ${p.old ? `<br><span class="muted" style="font-size:12px;text-decoration:line-through">${taka(p.old)}</span>` : ''}
      </td>
      <td>
        <span class="stock-bar ${low ? 'low' : ''}">
          <i style="width:${Math.min(100, Math.round(p.stock / 50 * 100))}%"></i>
        </span>
        <span class="num" style="font-size:12.5px;margin-left:8px;${low ? 'color:var(--brand-deep);font-weight:600' : ''}">${p.stock}</span>
      </td>
      <td class="t-right num">${p.rating || '—'}</td>
      <td><span class="pill ${p.active ? 'green' : 'grey'}">${p.active ? 'Active' : 'Draft'}</span></td>
      <td>
        <div class="row-actions">
          <button class="act edit" title="Edit">${icon('edit')}</button>
          <button class="act del" title="Delete">${icon('trash')}</button>
        </div>
      </td>
    </tr>`;
}

/* ── Analytics ─────────────────────────────────────────── */
function viewAnalytics() {
  const byWeave = {};
  products.forEach(p => { byWeave[p.cat] = (byWeave[p.cat] || 0) + p.sold; });

  const bySource = [
    { label: 'Instagram',  value: 42 },
    { label: 'Direct',     value: 27 },
    { label: 'Search',     value: 18 },
    { label: 'Referral',   value: 9  },
    { label: 'Newsletter', value: 4  }
  ];

  $('content').innerHTML = `
    <div class="view-head">
      <div><h2>Analytics</h2><p>Traffic, conversion and catalogue performance</p></div>
    </div>

    <div class="kpi-grid">
      ${[['Conversion rate', '3.8%', '+0.4pt', true],
         ['Repeat buyers', '41%', '+6pt', true],
         ['Avg rating', '4.83', '+0.12', true],
         ['Refund rate', '1.2%', '-0.3pt', true]].map(([l, v, d, up]) => `
        <div class="kpi">
          <div class="kpi-label">${l}</div>
          <div class="kpi-value">${v}</div>
          <div class="kpi-foot">
            <span class="delta ${up ? 'up' : 'down'}">${icon(up ? 'up' : 'down')}${d}</span>
            vs last month
          </div>
        </div>`).join('')}
    </div>

    <div class="panels split">
      <div class="panel">
        <div class="panel-head">
          <h3>Revenue trend</h3><span class="meta">Last 12 months · ৳ thousands</span>
        </div>
        ${barChart(SALES, MONTHS)}
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Traffic source</h3><span class="meta">% of sessions</span></div>
        ${meterRows(bySource.map(s => ({ label: s.label, value: s.value, display: s.value + '%', tone: 'blue' })))}
      </div>
    </div>

    <div class="panels half">
      <div class="panel">
        <div class="panel-head"><h3>Units by weave</h3><span class="meta">all time</span></div>
        ${meterRows(Object.entries(byWeave).sort((a, b) => b[1] - a[1])
          .map(([label, value]) => ({ label, value, display: value.toLocaleString('en-IN'), tone: 'olive' })))}
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Contacts by status</h3><span class="meta">${crmContacts.length} total</span></div>
        ${meterRows(Object.keys(CONTACT_STATUS).map(k => {
          const n = crmContacts.filter(c => c.status === k).length;
          return { label: CONTACT_STATUS[k].label, value: n || 0.001, display: String(n) };
        }))}
      </div>
    </div>`;
}

/* ── Finance ───────────────────────────────────────────── */
function viewFinance() {
  const m = metrics();
  const revenue = m.revenue;
  const expenses = Math.round(revenue * 0.58);
  const profit = revenue - expenses;
  const margin = (profit / revenue * 100).toFixed(1);
  const pending = 42800;
  const EXP = SALES.map(v => Math.round(v * 0.58));

  const breakdown = [
    { label: 'Cost of goods',        value: Math.round(expenses * 0.62), tone: '' },
    { label: 'Shipping & logistics', value: Math.round(expenses * 0.14), tone: 'olive' },
    { label: 'Marketing',            value: Math.round(expenses * 0.16), tone: 'gold' },
    { label: 'Operations',           value: Math.round(expenses * 0.08), tone: 'blue' }
  ].map(b => ({ ...b, display: taka(b.value) }));

  const methods = ['bKash', 'Card', 'Nagad', 'Bank', 'Card', 'bKash'];
  const txIn = orders.filter(o => o.status !== 'cancelled').slice(0, 6).map((o, i) => ({
    label: `Payment · #${o.id}`, sub: `${o.customer} · ${methods[i % methods.length]}`,
    amount: o.total, date: o.date, dir: 'in'
  }));
  const txOut = [
    { label: 'Weaver payout',      sub: 'Narayanganj cluster · Bank', amount: 48200, date: '2026-08-19', dir: 'out' },
    { label: 'Courier settlement', sub: 'Pathao · Bank',              amount: 9600,  date: '2026-08-18', dir: 'out' },
    { label: 'Ad spend',           sub: 'Meta Ads · Card',            amount: 14300, date: '2026-08-16', dir: 'out' },
    { label: 'Fabric purchase',    sub: 'Tangail mills · Bank',       amount: 31500, date: '2026-08-14', dir: 'out' }
  ];
  const tx = [...txIn, ...txOut].sort((a, b) => new Date(b.date) - new Date(a.date));

  $('content').innerHTML = `
    <div class="view-head">
      <div><h2>Finance</h2><p>Cash position, margin and settlement activity</p></div>
    </div>

    <div class="kpi-grid">
      ${[['Gross revenue', money(revenue), '+12.4%', true],
         ['Expenses', money(expenses), '+6.0%', false],
         ['Net profit', money(profit), '+18.9%', true],
         ['Profit margin', margin + '%', '+2.1pt', true]].map(([l, v, d, up]) => `
        <div class="kpi">
          <div class="kpi-label">${l}</div>
          <div class="kpi-value">${v}</div>
          <div class="kpi-foot">
            <span class="delta ${up ? 'up' : 'down'}">${icon(up ? 'up' : 'down')}${d}</span>
            vs last month
          </div>
        </div>`).join('')}
    </div>

    <div class="panels split">
      <div class="panel">
        <div class="panel-head">
          <h3>Revenue vs expenses</h3>
          <span class="legend">
            <span><i class="lg-a"></i>Revenue</span>
            <span><i class="lg-b"></i>Expenses</span>
          </span>
        </div>
        ${barChart(SALES, MONTHS, EXP)}
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Expense breakdown</h3><span class="meta">this month</span></div>
        ${meterRows(breakdown)}
      </div>
    </div>

    <div class="panels half">
      <div class="panel">
        <div class="panel-head"><h3>Available balance</h3></div>
        <div class="kpi-value" style="margin:0 0 4px">${taka(profit - pending)}</div>
        <p class="muted" style="font-size:13px">
          ${taka(pending)} pending payout · settles in 2 days
        </p>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>This month</h3></div>
        <div class="meter">
          ${[['Orders paid', String(orders.filter(o => o.status !== 'cancelled').length)],
             ['Refunds', taka(0)],
             ['Avg order value', taka(m.aov)],
             ['Tax collected (est.)', taka(Math.round(revenue * 0.05))]].map(([k, v]) => `
            <div style="display:flex;justify-content:space-between;font-size:13.5px">
              <span class="muted">${k}</span><strong>${v}</strong>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="table-wrap">
      <div class="table-scroll">
        <table>
          <thead><tr><th>Transaction</th><th>Type</th><th class="t-right">Amount</th><th>Date</th></tr></thead>
          <tbody>${tx.map(t => `
            <tr>
              <td>
                <div class="cell-user">
                  <span class="avatar" style="background:${t.dir === 'in' ? 'var(--green)' : 'var(--brand-deep)'}">
                    ${t.dir === 'in' ? '↓' : '↑'}
                  </span>
                  <div><strong>${esc(t.label)}</strong><span>${esc(t.sub)}</span></div>
                </div>
              </td>
              <td><span class="pill ${t.dir === 'in' ? 'green' : 'red'}">${t.dir === 'in' ? 'Income' : 'Expense'}</span></td>
              <td class="t-right num" style="color:${t.dir === 'in' ? 'var(--green)' : 'var(--brand-deep)'};font-weight:600">
                ${t.dir === 'in' ? '+' : '−'}${taka(t.amount)}
              </td>
              <td class="muted">${shortDate(t.date)}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;

}

/* ── Settings ──────────────────────────────────────────── */
function viewSettings() {
  $('content').innerHTML = `
    <div class="view-head">
      <div><h2>Settings</h2><p>Store profile, team and stored data</p></div>
    </div>

    <div class="settings-grid">
      <div class="panel">
        <div class="panel-head"><h3>Store profile</h3></div>
        <form class="form" id="settingsForm">
          <label>Store name<input id="s-store" value="${esc(settings.store)}"></label>
          <label>Contact email<input id="s-email" type="email" value="${esc(settings.email)}"></label>
          <label>Currency
            <select id="s-currency">
              ${['৳ BDT', '$ USD', '₹ INR'].map(c =>
                `<option ${settings.currency === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </label>
          <div class="form-row">
            <label>Free shipping over<input id="s-freeship" type="number" min="0" value="${settings.freeShip}"></label>
            <label>Shipping fee<input id="s-shipfee" type="number" min="0" value="${settings.shipFee}"></label>
          </div>
          <div class="form-foot">
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="panel">
          <div class="panel-head">
            <h3>Team</h3>
            <span class="meta">${Object.keys(OWNERS).length} members</span>
          </div>
          ${Object.values(OWNERS).map(o => {
            const owned = crmContacts.filter(c => c.owner === o.id).length;
            return `<div class="owner-row">
              ${avatarEl(o.name, o.color)}
              <div><strong>${esc(o.name)}</strong><span>${owned} contacts</span></div>
              <span class="pill grey">${o.id === 'azm' ? 'Owner' : 'Sales'}</span>
            </div>`;
          }).join('')}
        </div>

        <div class="panel">
          <div class="panel-head"><h3>Stored data</h3></div>
          <p class="muted" style="font-size:13px;line-height:1.6;margin-bottom:14px">
            Contacts, deals, products and settings live in this browser's localStorage.
            Resetting restores the seeded demo data — the storefront is unaffected.
          </p>
          <button class="btn btn-danger" id="resetAdmin">Reset admin data</button>
        </div>
      </div>

      <div class="panel span-2">
        <div class="panel-head">
          <h3>Homepage hero</h3>
          <span class="meta">${heroSlides.length} slides</span>
        </div>
        <div class="media-list" id="heroList">
          ${heroSlides.map((s, i) => heroSlideRow(s, i)).join('')}
        </div>
        <div class="form-foot">
          <label class="btn btn-ghost file-btn">${icon('plus')} Add slide
            <input type="file" accept="image/*" id="heroAddFile" hidden>
          </label>
          <button class="btn btn-primary" id="heroSave">Save hero</button>
        </div>
      </div>

      <div class="panel span-2">
        <div class="panel-head">
          <h3>Categories</h3>
          <span class="meta">${categories.length} categories</span>
        </div>
        <div class="media-list" id="catList">
          ${categories.map((c, i) => categoryRow(c, i)).join('')}
        </div>
        <div class="form-foot">
          <button class="btn btn-primary" id="catSave">Save categories</button>
        </div>
      </div>

      <div class="panel span-2">
        <div class="panel-head">
          <h3>Reviews</h3>
          <span class="meta">${reviews.length} reviews</span>
        </div>
        <div class="media-list" id="reviewList">
          ${reviews.map((r, i) => reviewRow(r, i)).join('')}
        </div>
        <div class="form-foot">
          <button class="btn btn-ghost" id="reviewAdd">${icon('plus')} Add review</button>
          <button class="btn btn-primary" id="reviewSave">Save reviews</button>
        </div>
      </div>

      <div class="panel span-2">
        <div class="panel-head">
          <h3>Community ("As Styled by You")</h3>
          <span class="meta">${igPosts.length} posts</span>
        </div>
        <div class="media-list" id="communityList">
          ${igPosts.map((p, i) => communityRow(p, i)).join('')}
        </div>
        <div class="form-foot">
          <label class="btn btn-ghost file-btn">${icon('plus')} Add post
            <input type="file" accept="image/*" id="communityAddFile" hidden>
          </label>
          <button class="btn btn-primary" id="communitySave">Save community</button>
        </div>
      </div>
    </div>`;

  $('settingsForm').onsubmit = e => {
    e.preventDefault();
    settings = {
      store: $('s-store').value.trim(),
      email: $('s-email').value.trim(),
      currency: $('s-currency').value,
      freeShip: +$('s-freeship').value,
      shipFee: +$('s-shipfee').value
    };
    save(KEYS.settings, settings);
    toast('Settings saved');
  };

  $('resetAdmin').onclick = () => {
    if (!confirm('Reset all admin data back to the seeded demo set?')) return;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    crmContacts = contacts.map(c => ({ ...c, tags: [...c.tags] }));
    crmDeals = deals.map(d => ({ ...d }));
    feed = activities.map(a => ({ ...a }));
    products = seedProducts();
    settings = { ...DEFAULT_SETTINGS };
    route('settings'); toast('Admin data reset');
  };

  $('content').querySelectorAll('.hero-alt').forEach(inp =>
    inp.onchange = () => { heroSlides[+inp.dataset.i].alt = inp.value; });

  $('content').querySelectorAll('.hero-replace').forEach(inp =>
    inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      heroSlides[+inp.dataset.i].img = await readFileAsDataURL(file);
      route('settings'); toast('Slide photo updated');
    });

  $('content').querySelectorAll('.hero-remove').forEach(btn =>
    btn.onclick = () => {
      if (heroSlides.length <= 1) return toast('Keep at least one slide');
      heroSlides.splice(+btn.dataset.i, 1);
      route('settings');
    });

  $('heroAddFile').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    heroSlides.push({ img: await readFileAsDataURL(file), alt: '', pos: '50% 50%' });
    route('settings');
  };

  $('heroSave').onclick = () => { save(KEYS.hero, heroSlides); toast('Homepage hero saved'); };

  $('content').querySelectorAll('.cat-name').forEach(inp =>
    inp.onchange = () => { categories[+inp.dataset.i].name = inp.value; });

  $('content').querySelectorAll('.cat-desc').forEach(inp =>
    inp.onchange = () => { categories[+inp.dataset.i].desc = inp.value; });

  $('content').querySelectorAll('.cat-replace').forEach(inp =>
    inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      categories[+inp.dataset.i].img = await readFileAsDataURL(file);
      route('settings'); toast('Category photo updated');
    });

  $('catSave').onclick = () => { save(KEYS.categories, categories); toast('Categories saved'); };

  $('content').querySelectorAll('.rv-name').forEach(inp =>
    inp.onchange = () => { reviews[+inp.dataset.i].name = inp.value.trim(); });
  $('content').querySelectorAll('.rv-city').forEach(inp =>
    inp.onchange = () => { reviews[+inp.dataset.i].city = inp.value.trim(); });
  $('content').querySelectorAll('.rv-product').forEach(inp =>
    inp.onchange = () => { reviews[+inp.dataset.i].product = inp.value.trim(); });
  $('content').querySelectorAll('.rv-rating').forEach(sel =>
    sel.onchange = () => { reviews[+sel.dataset.i].rating = +sel.value; });
  $('content').querySelectorAll('.rv-text').forEach(ta =>
    ta.onchange = () => { reviews[+ta.dataset.i].text = ta.value.trim(); });

  $('content').querySelectorAll('.rv-remove').forEach(btn =>
    btn.onclick = () => {
      if (reviews.length <= 1) return toast('Keep at least one review');
      reviews.splice(+btn.dataset.i, 1);
      route('settings');
    });

  $('reviewAdd').onclick = () => {
    reviews.push({ name: '', city: '', rating: 5, product: '', text: '' });
    route('settings');
  };

  $('reviewSave').onclick = () => { save(KEYS.reviews, reviews); toast('Reviews saved'); };

  $('content').querySelectorAll('.ig-handle').forEach(inp =>
    inp.onchange = () => { igPosts[+inp.dataset.i].handle = inp.value.trim().replace(/^@/, ''); });
  $('content').querySelectorAll('.ig-caption').forEach(inp =>
    inp.onchange = () => { igPosts[+inp.dataset.i].caption = inp.value.trim(); });
  $('content').querySelectorAll('.ig-ratio').forEach(sel =>
    sel.onchange = () => { igPosts[+sel.dataset.i].ratio = sel.value; });

  $('content').querySelectorAll('.ig-replace').forEach(inp =>
    inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      igPosts[+inp.dataset.i].img = await readFileAsDataURL(file);
      route('settings'); toast('Post photo updated');
    });

  $('content').querySelectorAll('.ig-remove').forEach(btn =>
    btn.onclick = () => {
      if (igPosts.length <= 1) return toast('Keep at least one post');
      igPosts.splice(+btn.dataset.i, 1);
      route('settings');
    });

  $('communityAddFile').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    igPosts.push({ img: await readFileAsDataURL(file), ratio: 'sq', handle: '', caption: '' });
    route('settings');
  };

  $('communitySave').onclick = () => { save(KEYS.community, igPosts); toast('Community wall saved'); };
}

function heroSlideRow(s, i) {
  return `
    <div class="media-row" data-i="${i}">
      <img src="${imgSrc(s.img)}" alt="">
      <input class="hero-alt" data-i="${i}" placeholder="Alt text" value="${esc(s.alt || '')}">
      <label class="icon-btn file-btn" title="Replace photo">${icon('edit')}
        <input type="file" accept="image/*" class="hero-replace" data-i="${i}" hidden>
      </label>
      <button class="icon-btn hero-remove" data-i="${i}" title="Remove">${icon('trash')}</button>
    </div>`;
}

function categoryRow(c, i) {
  return `
    <div class="media-row" data-i="${i}">
      <img src="${imgSrc(c.img)}" alt="">
      <div class="cat-row-fields">
        <input class="cat-name" data-i="${i}" placeholder="Name" value="${esc(c.name)}">
        <input class="cat-desc" data-i="${i}" placeholder="Description" value="${esc(c.desc)}">
      </div>
      <label class="icon-btn file-btn" title="Replace photo">${icon('edit')}
        <input type="file" accept="image/*" class="cat-replace" data-i="${i}" hidden>
      </label>
    </div>`;
}

function reviewRow(r, i) {
  return `
    <div class="media-row review-row" data-i="${i}">
      <div class="review-row-fields">
        <div class="form-row">
          <input class="rv-name" data-i="${i}" placeholder="Customer name" value="${esc(r.name)}">
          <input class="rv-city" data-i="${i}" placeholder="City" value="${esc(r.city)}">
        </div>
        <div class="form-row">
          <input class="rv-product" data-i="${i}" placeholder="Product bought" value="${esc(r.product)}">
          <select class="rv-rating" data-i="${i}">
            ${[5, 4, 3, 2, 1].map(n =>
              `<option value="${n}" ${r.rating === n ? 'selected' : ''}>${n} star${n > 1 ? 's' : ''}</option>`).join('')}
          </select>
        </div>
        <textarea class="rv-text" data-i="${i}" rows="2" placeholder="Review text">${esc(r.text)}</textarea>
      </div>
      <button class="icon-btn rv-remove" data-i="${i}" title="Remove">${icon('trash')}</button>
    </div>`;
}

function communityRow(p, i) {
  return `
    <div class="media-row" data-i="${i}">
      <img src="${imgSrc(p.img)}" alt="">
      <div class="cat-row-fields">
        <input class="ig-handle" data-i="${i}" placeholder="Instagram handle" value="${esc(p.handle)}">
        <input class="ig-caption" data-i="${i}" placeholder="Caption" value="${esc(p.caption)}">
      </div>
      <select class="ig-ratio" data-i="${i}">
        <option value="sq" ${p.ratio === 'sq' ? 'selected' : ''}>Square</option>
        <option value="tall" ${p.ratio === 'tall' ? 'selected' : ''}>Tall</option>
      </select>
      <label class="icon-btn file-btn" title="Replace photo">${icon('edit')}
        <input type="file" accept="image/*" class="ig-replace" data-i="${i}" hidden>
      </label>
      <button class="icon-btn ig-remove" data-i="${i}" title="Remove">${icon('trash')}</button>
    </div>`;
}

/* ═════════════════════════════════════════════════════════
   Modals
   ═════════════════════════════════════════════════════════ */
const modal = $('modal');

function openModal(title, fieldsHtml, onSubmit) {
  $('modalTitle').textContent = title;
  $('modalForm').innerHTML = `${fieldsHtml}
    <div class="form-foot">
      <button type="button" class="btn btn-ghost" id="modalCancel">Cancel</button>
      <button type="submit" class="btn btn-primary">Save</button>
    </div>`;
  $('modalForm').className = 'modal-form form';
  modal.hidden = false;
  $('modalCancel').onclick = closeModal;
  $('modalForm').onsubmit = e => { e.preventDefault(); onSubmit(); };
  $('modalForm').querySelector('input,select')?.focus();
}
const closeModal = () => { modal.hidden = true; };
$('modalClose').onclick = closeModal;
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

function openContactModal(id) {
  const c = id ? contactById(id) : null;
  openModal(c ? 'Edit contact' : 'New contact', `
    <div class="form-row">
      <label>Full name<input id="f-name" required value="${esc(c?.name || '')}"></label>
      <label>Company <span>optional</span><input id="f-company" value="${esc(c?.company || '')}"></label>
    </div>
    <div class="form-row">
      <label>Email<input id="f-email" type="email" required value="${esc(c?.email || '')}"></label>
      <label>Phone<input id="f-phone" value="${esc(c?.phone || '')}"></label>
    </div>
    <div class="form-row">
      <label>City<input id="f-city" value="${esc(c?.city || '')}"></label>
      <label>Status
        <select id="f-status">
          ${Object.entries(CONTACT_STATUS).map(([k, v]) =>
            `<option value="${k}" ${c?.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="form-row">
      <label>Owner
        <select id="f-owner">
          ${Object.values(OWNERS).map(o =>
            `<option value="${o.id}" ${c?.owner === o.id ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}
        </select>
      </label>
      <label>Lifetime value<input id="f-ltv" type="number" min="0" value="${c?.ltv ?? 0}"></label>
    </div>`,
    () => {
      const today = new Date().toISOString().slice(0, 10);
      const data = {
        name: $('f-name').value.trim(), company: $('f-company').value.trim(),
        email: $('f-email').value.trim(), phone: $('f-phone').value.trim(),
        city: $('f-city').value.trim(), status: $('f-status').value,
        owner: $('f-owner').value, ltv: +$('f-ltv').value || 0
      };
      if (c) {
        Object.assign(c, data);
        toast('Contact updated');
      } else {
        crmContacts.unshift({
          id: 'c' + Date.now(), orders: 0, since: today, lastActivity: today,
          tags: [], note: '', ...data
        });
        toast('Contact added');
      }
      save(KEYS.crm, crmContacts);
      closeModal(); renderNav();
      if (currentView === 'contacts') renderContactRows();
      if (c && !$('drawer').hidden) openContactDrawer(c.id);
    });
}

function openDealModal() {
  openModal('New deal', `
    <label>Deal title<input id="f-title" required placeholder="e.g. Wholesale trial order"></label>
    <label>Contact
      <select id="f-contact">
        ${crmContacts.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
      </select>
    </label>
    <div class="form-row">
      <label>Value (৳)<input id="f-value" type="number" min="0" required value="25000"></label>
      <label>Expected close<input id="f-close" type="date" value="${new Date(Date.now() + 30 * DAY).toISOString().slice(0, 10)}"></label>
    </div>
    <div class="form-row">
      <label>Stage
        <select id="f-stage">
          ${PIPELINE_STAGES.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
        </select>
      </label>
      <label>Owner
        <select id="f-downer">
          ${Object.values(OWNERS).map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join('')}
        </select>
      </label>
    </div>`,
    () => {
      crmDeals.push({
        id: 'd' + Date.now(),
        contactId: $('f-contact').value,
        title: $('f-title').value.trim(),
        value: +$('f-value').value || 0,
        stage: $('f-stage').value,
        owner: $('f-downer').value,
        close: $('f-close').value
      });
      save(KEYS.deals, crmDeals);
      closeModal(); viewPipeline(); renderNav(); toast('Deal added');
    });
}

function openProductModal(id) {
  const p = id ? products.find(x => x.id === id) : null;
  let photo = p ? p.img : null;
  openModal(p ? 'Edit product' : 'Add product', `
    <div class="form-row" style="align-items:center">
      <img id="f-photo-preview" src="${imgSrc(photo || categories[0].img)}" alt=""
           style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex:0 0 auto">
      <label class="btn btn-ghost file-btn" style="flex:1">Upload photo
        <input type="file" accept="image/*" id="f-photo" hidden>
      </label>
    </div>
    <div class="form-row">
      <label>Product name<input id="f-pname" required value="${esc(p?.name || '')}"></label>
      <label>Category
        <select id="f-pcat">
          ${categories.map(c =>
            `<option value="${c.slug}" ${p?.catSlug === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="form-row">
      <label>Price (৳)<input id="f-price" type="number" min="0" required value="${p?.price ?? ''}"></label>
      <label>Old price <span>optional</span><input id="f-old" type="number" min="0" value="${p?.old ?? ''}"></label>
    </div>
    <div class="form-row">
      <label>Stock<input id="f-stock" type="number" min="0" required value="${p?.stock ?? 0}"></label>
      <label>Rating<input id="f-rating" type="number" min="0" max="5" step="0.1" value="${p?.rating ?? 4.8}"></label>
    </div>
    <label>Status
      <select id="f-active">
        <option value="true" ${p?.active !== false ? 'selected' : ''}>Active</option>
        <option value="false" ${p?.active === false ? 'selected' : ''}>Draft</option>
      </select>
    </label>`,
    () => {
      const slug = $('f-pcat').value;
      const cat = categories.find(c => c.slug === slug);
      const data = {
        name: $('f-pname').value.trim(), cat: cat.name, catSlug: slug,
        price: +$('f-price').value, old: $('f-old').value ? +$('f-old').value : null,
        stock: +$('f-stock').value, rating: +$('f-rating').value || 4.8,
        active: $('f-active').value === 'true'
      };
      if (p) { Object.assign(p, data, { img: photo || p.img }); toast('Product updated'); }
      else {
        products.unshift({ id: 'p' + Date.now(), img: photo || cat.img, sold: 0, ...data });
        toast('Product added');
      }
      save(KEYS.products, products);
      closeModal(); viewProducts();
    });
  $('f-photo').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    photo = await readFileAsDataURL(file);
    $('f-photo-preview').src = photo;
  };
}

/* ═════════════════════════════════════════════════════════
   Drawer / toast / nav / routing
   ═════════════════════════════════════════════════════════ */
function showDrawer() {
  $('drawer').hidden = false; $('drawerScrim').hidden = false;
  requestAnimationFrame(() => {
    $('drawer').classList.add('open'); $('drawerScrim').classList.add('open');
  });
}
function closeDrawer() {
  $('drawer').classList.remove('open'); $('drawerScrim').classList.remove('open');
  setTimeout(() => { $('drawer').hidden = true; $('drawerScrim').hidden = true; }, 240);
}
$('drawerClose').onclick = closeDrawer;
$('drawerScrim').onclick = closeDrawer;

let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
}

const NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' }
  ]},
  { group: 'CRM', items: [
    { id: 'contacts', label: 'Contacts', icon: 'users', count: () => crmContacts.length },
    { id: 'pipeline', label: 'Pipeline', icon: 'flow',  count: () => crmDeals.filter(d => d.stage !== 'won').length }
  ]},
  { group: 'Commerce', items: [
    { id: 'orders',   label: 'Orders',   icon: 'bag', count: () => orders.length },
    { id: 'products', label: 'Products', icon: 'box' }
  ]},
  { group: 'Insights', items: [
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'finance',   label: 'Finance',   icon: 'wallet' }
  ]},
  { group: 'Workspace', items: [
    { id: 'settings', label: 'Settings', icon: 'cog' }
  ]}
];

function renderNav() {
  $('sideNav').innerHTML = NAV.map(g => `
    <div class="side-label">${g.group}</div>
    ${g.items.map(it => `
      <button class="side-link ${currentView === it.id ? 'is-active' : ''}" data-view="${it.id}">
        ${icon(it.icon)}
        <span>${it.label}</span>
        ${it.count ? `<span class="side-count">${it.count()}</span>` : ''}
      </button>`).join('')}`).join('');

  $('sideNav').querySelectorAll('.side-link').forEach(b =>
    b.onclick = () => route(b.dataset.view));
}

const VIEWS = {
  dashboard: { title: 'Dashboard', sub: 'Everything at a glance', render: viewDashboard },
  contacts:  { title: 'Contacts',  sub: 'Customer relationships', render: viewContacts  },
  pipeline:  { title: 'Pipeline',  sub: 'Deals in progress',      render: viewPipeline  },
  orders:    { title: 'Orders',    sub: '',                       render: viewOrders    },
  products:  { title: 'Products',  sub: '',                       render: viewProducts  },
  analytics: { title: 'Analytics', sub: '',                       render: viewAnalytics },
  finance:   { title: 'Finance',   sub: '',                       render: viewFinance   },
  settings:  { title: 'Settings',  sub: '',                       render: viewSettings  }
};

let currentView = 'dashboard';

function route(name) {
  const view = VIEWS[name] ? name : 'dashboard';
  currentView = view;
  const v = VIEWS[view];

  $('viewTitle').textContent = v.title;
  $('viewSub').textContent = v.sub;
  document.title = `${v.title} — Joba Admin`;

  closeDrawer();
  v.render();
  renderNav();
  $('sidebar').classList.remove('open');

  if (location.hash.slice(1) !== view) location.hash = view;
}

/* ── Global chrome ─────────────────────────────────────── */
$('mobileMenu').onclick = () => $('sidebar').classList.toggle('open');

/* Typing in the global search jumps to Contacts and hands the
   query over to the view's own search box. */
$('globalSearch').addEventListener('input', e => {
  const q = e.target.value.trim();
  if (!q || currentView === 'contacts') return;
  contactState.q = q;
  contactState.segment = 'all';
  route('contacts');
  e.target.value = '';
  const box = $('contactSearch');
  box.focus();
  box.setSelectionRange(q.length, q.length);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!modal.hidden) return closeModal();
    if (!$('drawer').hidden) return closeDrawer();
  }
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  if (e.key === '/' && !typing) { e.preventDefault(); $('globalSearch').focus(); }
});

addEventListener('hashchange', () => route(location.hash.slice(1)));

/* ── Boot ──────────────────────────────────────────────── */
route(location.hash.slice(1) || 'dashboard');
