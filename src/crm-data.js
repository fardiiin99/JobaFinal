/* ─────────────────────────────────────────────────────────
   Joba — CRM dataset
   Demo data for the admin panel. Contacts, deals and the
   activity feed all live here so the views stay presentation
   only. Persisted edits go to localStorage via admin.js.
   ───────────────────────────────────────────────────────── */

const OWNERS = {
  azm: { id: 'azm', name: 'Azmayeen A.', initials: 'AA', color: '#e44c6b' },
  rif: { id: 'rif', name: 'Rifah T.',    initials: 'RT', color: '#5d664b' },
  sha: { id: 'sha', name: 'Shanto K.',   initials: 'SK', color: '#2f6ba8' }
};

/* status drives the pill in the contacts table.
   vip = >৳40k lifetime, active = ordered in last 90d,
   lead = never ordered, dormant = no order in 6m. */
const CONTACT_STATUS = {
  vip:     { label: 'VIP',     tone: 'gold'  },
  active:  { label: 'Active',  tone: 'green' },
  lead:    { label: 'Lead',    tone: 'blue'  },
  dormant: { label: 'Dormant', tone: 'grey'  }
};

const contacts = [
  {
    id: 'c01', name: 'Nusrat Jahan', email: 'nusrat.jahan@gmail.com', phone: '01712 664 201',
    city: 'Dhaka', company: '', status: 'vip', owner: 'azm',
    ltv: 61400, orders: 7, since: '2024-03-12', lastActivity: '2026-08-21',
    tags: ['Jamdani', 'Repeat', 'Newsletter'],
    note: 'Buys a piece before every family wedding. Prefers indigo over red.'
  },
  {
    id: 'c02', name: 'Farhana Akter', email: 'farhana.akter@outlook.com', phone: '01819 335 774',
    city: 'Chittagong', company: '', status: 'vip', owner: 'rif',
    ltv: 48200, orders: 6, since: '2024-06-02', lastActivity: '2026-08-19',
    tags: ['Mul Cotton', 'Repeat'],
    note: 'Asked about bulk pricing for her boutique — possible wholesale lead.'
  },
  {
    id: 'c03', name: 'Rehnuma Boutique', email: 'orders@rehnuma.com.bd', phone: '01911 220 118',
    city: 'Dhaka', company: 'Rehnuma Boutique', status: 'lead', owner: 'azm',
    ltv: 0, orders: 0, since: '2026-07-28', lastActivity: '2026-08-23',
    tags: ['Wholesale', 'Inbound'],
    note: 'Wants 40 pieces/month across Chanderi and Kota. Sent catalogue, awaiting terms.'
  },
  {
    id: 'c04', name: 'Tanvir Ahmed', email: 'tanvir.ahmed@gmail.com', phone: '01777 908 442',
    city: 'Sylhet', company: '', status: 'active', owner: 'sha',
    ltv: 24800, orders: 3, since: '2025-01-19', lastActivity: '2026-08-14',
    tags: ['Gifting'],
    note: 'Only ever buys gifts. Reach out before Eid and anniversaries.'
  },
  {
    id: 'c05', name: 'Ishrat Zahan', email: 'ishrat.z@gmail.com', phone: '01686 771 903',
    city: 'Rajshahi', company: '', status: 'active', owner: 'rif',
    ltv: 19600, orders: 3, since: '2025-04-08', lastActivity: '2026-08-11',
    tags: ['Mirror work'],
    note: ''
  },
  {
    id: 'c06', name: 'Mehzabin Chowdhury', email: 'mehzabin.c@gmail.com', phone: '01521 448 776',
    city: 'Khulna', company: '', status: 'vip', owner: 'azm',
    ltv: 43900, orders: 5, since: '2024-09-30', lastActivity: '2026-08-08',
    tags: ['Block print', 'Repeat', 'Newsletter'],
    note: 'Third order in a row was dabu. Send the indigo drop first.'
  },
  {
    id: 'c07', name: 'Weave & Wander', email: 'hello@weaveandwander.co', phone: '01610 552 330',
    city: 'Dhaka', company: 'Weave & Wander', status: 'lead', owner: 'sha',
    ltv: 0, orders: 0, since: '2026-08-04', lastActivity: '2026-08-20',
    tags: ['Wholesale', 'Instagram'],
    note: 'Concept store in Banani. Wants exclusivity on Kota Doria for 6 months.'
  },
  {
    id: 'c08', name: 'Rownok Hasan', email: 'rownok.hasan@gmail.com', phone: '01756 119 087',
    city: 'Narayanganj', company: '', status: 'active', owner: 'rif',
    ltv: 17800, orders: 2, since: '2025-11-14', lastActivity: '2026-08-06',
    tags: ['Kota Doria'],
    note: ''
  },
  {
    id: 'c09', name: 'Sadia Islam', email: 'sadia.islam@yahoo.com', phone: '01912 004 663',
    city: 'Dhaka', company: '', status: 'dormant', owner: 'azm',
    ltv: 12400, orders: 2, since: '2024-11-02', lastActivity: '2026-01-27',
    tags: ['Newsletter'],
    note: 'No order in 7 months. Worth a win-back offer.'
  },
  {
    id: 'c10', name: 'Proma Das', email: 'proma.das@gmail.com', phone: '01844 776 512',
    city: 'Barisal', company: '', status: 'active', owner: 'sha',
    ltv: 14900, orders: 2, since: '2026-02-11', lastActivity: '2026-07-30',
    tags: ['Chanderi'],
    note: ''
  },
  {
    id: 'c11', name: 'Nabila Karim', email: 'nabila.k@gmail.com', phone: '01733 890 214',
    city: 'Comilla', company: '', status: 'lead', owner: 'rif',
    ltv: 0, orders: 0, since: '2026-08-16', lastActivity: '2026-08-22',
    tags: ['Abandoned cart'],
    note: 'Cart with two mul cotton pieces sat for 6 days.'
  },
  {
    id: 'c12', name: 'Maliha Rahman', email: 'maliha.rahman@gmail.com', phone: '01998 336 110',
    city: 'Gazipur', company: '', status: 'dormant', owner: 'azm',
    ltv: 9200, orders: 1, since: '2025-06-21', lastActivity: '2025-12-09',
    tags: [],
    note: ''
  }
];

/* Sales pipeline — wholesale and high-value retail conversations.
   `stage` keys must match PIPELINE_STAGES below. */
const PIPELINE_STAGES = [
  { id: 'new',      label: 'New lead'   },
  { id: 'contact',  label: 'Contacted'  },
  { id: 'qualify',  label: 'Qualified'  },
  { id: 'proposal', label: 'Proposal'   },
  { id: 'won',      label: 'Won'        }
];

const deals = [
  { id: 'd01', contactId: 'c03', title: 'Rehnuma monthly supply',    value: 320000, stage: 'proposal', owner: 'azm', close: '2026-09-15' },
  { id: 'd02', contactId: 'c07', title: 'Kota exclusivity — Banani', value: 185000, stage: 'qualify',  owner: 'sha', close: '2026-09-30' },
  { id: 'd03', contactId: 'c02', title: 'Farhana boutique trial',    value: 96000,  stage: 'contact',  owner: 'rif', close: '2026-10-04' },
  { id: 'd04', contactId: 'c11', title: 'Cart recovery — 2 pieces',  value: 13100,  stage: 'new',      owner: 'rif', close: '2026-08-29' },
  { id: 'd05', contactId: 'c01', title: 'Bridal set — Nov wedding',  value: 42000,  stage: 'qualify',  owner: 'azm', close: '2026-10-20' },
  { id: 'd06', contactId: 'c06', title: 'Indigo drop pre-order',     value: 27200,  stage: 'won',      owner: 'azm', close: '2026-08-18' },
  { id: 'd07', contactId: 'c09', title: 'Win-back offer',            value: 8500,   stage: 'new',      owner: 'azm', close: '2026-09-05' },
  { id: 'd08', contactId: 'c04', title: 'Eid gifting bundle',        value: 31500,  stage: 'contact',  owner: 'sha', close: '2026-09-22' }
];

/* Activity feed. Rendered on the contact drawer (filtered by
   contactId) and on the dashboard (most recent, unfiltered). */
const activities = [
  { id: 'a01', contactId: 'c03', type: 'email', owner: 'azm', when: '2026-08-23T10:20:00', text: 'Sent wholesale catalogue and 2026 rate card.' },
  { id: 'a02', contactId: 'c11', type: 'task',  owner: 'rif', when: '2026-08-22T16:05:00', text: 'Follow up on abandoned cart — offer free delivery.' },
  { id: 'a03', contactId: 'c01', type: 'order', owner: 'azm', when: '2026-08-21T12:40:00', text: 'Order #JB1042 — Nilkantha Dabu ×1 · ৳6,800' },
  { id: 'a04', contactId: 'c07', type: 'call',  owner: 'sha', when: '2026-08-20T11:15:00', text: 'Call — wants 6-month exclusivity on Kota Doria.' },
  { id: 'a05', contactId: 'c02', type: 'order', owner: 'rif', when: '2026-08-19T09:30:00', text: 'Order #JB1041 — Padma Indigo Mul ×2 · ৳11,800' },
  { id: 'a06', contactId: 'c03', type: 'note',  owner: 'azm', when: '2026-08-18T15:50:00', text: 'Needs 40 pcs/month. Margin works at 32% if we bundle delivery.' },
  { id: 'a07', contactId: 'c06', type: 'order', owner: 'azm', when: '2026-08-18T14:10:00', text: 'Order #JB1040 — Rajanigandha Blue ×4 · ৳25,600' },
  { id: 'a08', contactId: 'c01', type: 'note',  owner: 'azm', when: '2026-08-15T13:00:00', text: 'Asked to be notified before the next Jamdani drop.' },
  { id: 'a09', contactId: 'c04', type: 'email', owner: 'sha', when: '2026-08-14T10:05:00', text: 'Sent Eid gifting lookbook.' },
  { id: 'a10', contactId: 'c05', type: 'order', owner: 'rif', when: '2026-08-11T17:25:00', text: 'Order #JB1039 — Bakul Lilac Mul ×1 · ৳7,200' },
  { id: 'a11', contactId: 'c08', type: 'call',  owner: 'rif', when: '2026-08-06T12:00:00', text: 'Confirmed delivery address change to Narayanganj.' },
  { id: 'a12', contactId: 'c10', type: 'order', owner: 'sha', when: '2026-07-30T11:45:00', text: 'Order #JB1038 — Shorna Chanderi ×1 · ৳12,400' }
];

/* Saved views for the contacts toolbar. `test` runs against a contact. */
const SEGMENTS = [
  { id: 'all',       label: 'All contacts',   test: () => true },
  { id: 'vip',       label: 'VIP',            test: c => c.status === 'vip' },
  { id: 'leads',     label: 'Leads',          test: c => c.status === 'lead' },
  { id: 'wholesale', label: 'Wholesale',      test: c => c.tags.includes('Wholesale') },
  { id: 'dormant',   label: 'Needs win-back', test: c => c.status === 'dormant' }
];
