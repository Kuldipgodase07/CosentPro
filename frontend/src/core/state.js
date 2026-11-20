/**
 * Reactive Central State Store
 * Holds all dynamic domain models: purposes, ledger, requests, users,
 * simulated live statistics, compliance scores, and UI flags.
 */
import { NOW, DAY, SUBJ, CP_CONFIG } from './constants.js';

/* ---------- re-exports from constants ---------- */
export { NOW, DAY, SUBJ, CP_CONFIG };

/* ---------- helper functions ---------- */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
export const fmt = ts => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(ts);
export const fmtD = ts => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(ts);
export const ago = ts => {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.round(s / 60) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  return Math.round(s / 86400) + ' d ago';
};
export const n0 = n => Math.round(n).toLocaleString('en-IN');
export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const hex = n => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
export const short = h => h ? h.slice(0, 8) + '…' + h.slice(-4) : '';
export const initials = s => s.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
export const initialsOf = initials;

export const P = (id, org, name, desc, data, ret, status, exp, kw) => ({
  id,
  org,
  name,
  desc,
  data,
  ret,
  status,
  exp,
  kw,
  receipt: 'RC-' + hex(8).toUpperCase(),
  updated: NOW - Math.round(rnd(2, 70)) * DAY,
  rate: Math.round(rnd(41, 93)),
  count: Math.round(rnd(9000, 98000))
});

export const S = {
  role: 'c',
  route: 'c-home',
  theme: 'system',
  lang: 'en',
  modal: null,
  filter: 'all',
  purposes: [
    P('o1', 'orbit', 'Credit scoring with alternative data', 'Uses bank statements and utility payments to offer you a fairer credit limit.', ['Bank statements', 'Utility payments'], 'Until loan closure + 3 years', 'granted', NOW + 210 * DAY, ['credit', 'score', 'scoring', 'loan']),
    P('o2', 'orbit', 'Product offers by SMS and email', 'Sends offers that match how you bank. Never shared outside Orbit Bank.', ['Name', 'Contact details', 'Spend categories'], '12 months', 'granted', NOW + 120 * DAY, ['marketing', 'offers', 'sms', 'email', 'promotions']),
    P('o3', 'orbit', 'Fraud pattern analytics', 'Checks unusual activity on your account to stop fraud early.', ['Device ID', 'Transaction metadata'], '24 months', 'granted', NOW + 300 * DAY, ['fraud', 'security']),
    P('o4', 'orbit', 'Sharing with insurance partners', 'Lets two insurance partners quote you from your income band.', ['Name', 'Income band'], '6 months', 'revoked', null, ['insurance', 'partners']),
    P('m1', 'medi', 'Appointment reminders', 'Reminds you about visits and follow-ups by SMS.', ['Contact details', 'Appointment times'], '12 months', 'granted', NOW + 90 * DAY, ['reminders', 'appointment', 'sms']),
    P('m2', 'medi', 'Records shared with referred specialists', 'Sends your reports to a specialist only when your doctor refers you.', ['Diagnosis summary', 'Lab reports'], 'Until the referral ends', 'granted', NOW + 60 * DAY, ['records', 'specialist', 'referral', 'reports']),
    P('m3', 'medi', 'Wellness newsletters', 'Monthly health tips tailored to your age group.', ['Name', 'Age band'], '12 months', 'granted', NOW - 6 * DAY, ['newsletter', 'wellness', 'tips']),
    P('s1', 'swift', 'Personalised recommendations', 'Suggests products from what you browse and buy.', ['Browsing history', 'Purchase history'], '12 months', 'granted', NOW + 19 * DAY, ['recommendations', 'personalised', 'personalized']),
    P('s2', 'swift', 'Delivery partner location sharing', 'Shares your address and phone with the courier for one delivery.', ['Address', 'Phone number'], 'Until delivery', 'granted', NOW + 30 * DAY, ['delivery', 'courier', 'location']),
    P('s3', 'swift', 'Ad measurement with third parties', 'Lets ad networks measure whether their ads led to a purchase.', ['Device ID', 'Purchase events'], '13 months', 'revoked', null, ['ads', 'advertising', 'measurement', 'third']),
    P('t1', 'telco', 'Personalised plan recommendations', 'Uses how much data and talk time you use to suggest cheaper plans.', ['Usage summary'], '12 months', 'pending', null, ['plans', 'recommendations']),
    P('t2', 'telco', 'Network analytics for service quality', 'Uses network data from your phone to find and fix call drops.', ['Cell tower data', 'Signal strength'], '6 months', 'pending', null, ['network', 'analytics', 'quality'])
  ],
  ledger: [],
  feed: [],
  lat: [],
  chat: [],
  pending: null,
  verified: null,
  tamper: null,
  backup: null,
  q: '',
  ftype: 'all',
  tab: 'web',
  noticePick: { t1: false, t2: false },
  apiOut: null,
  stats: { active: 128430, grants: 4812, revokes: 213, verifies: 1902114, prop: 2.1 },
  comp: [
    { id: 'k1', ref: 'DPDP s.6 · GDPR Art. 7', title: 'Consent is explicit and tied to one purpose', detail: 'Every purpose in the catalogue has its own request, data list and retention.', state: 'done', w: 3 },
    { id: 'k2', ref: 'DPDP s.6(4) · GDPR Art. 7(3)', title: 'Withdrawing is as easy as giving', detail: 'One tap or one spoken sentence, applied across connected systems in seconds.', state: 'done', w: 3 },
    { id: 'k3', ref: 'DPDP s.5', title: 'Notice in the person’s own language', detail: 'Four languages are ready. The Constitution lists 22 scheduled languages.', state: 'partial', w: 2 },
    { id: 'k4', ref: 'GDPR Art. 30', title: 'Tamper-evident record of every consent event', detail: 'Hash-chained ledger. Run a verification to confirm it is intact.', state: 'partial', w: 3 },
    { id: 'k5', ref: 'DPDP s.9', title: 'Verifiable parental consent for children', detail: 'Age gate and guardian check are not configured for this tenant.', state: 'gap', w: 3 },
    { id: 'k6', ref: 'DPDP s.8 · GDPR Art. 33', title: 'Breach notification workflow', detail: 'Alert templates and the regulator contact are not set up yet.', state: 'gap', w: 2 },
    { id: 'k7', ref: 'DPDP s.13', title: 'Grievance redressal contact published', detail: 'DPO name and contact appear on every notice.', state: 'done', w: 1 }
  ],
  user: null,
  next: null,
  rail: false,
  mfa: null,
  authErr: '',
  tenant: { name: 'Orbit Bank', plan: 'Growth', region: 'Mumbai · asia-south1' },
  newTenant: false,
  users: [
    { name: 'Aarav Mehta', email: 'aarav@example.com', role: 'principal', status: 'Active', last: 'now', mfa: false },
    { name: 'Meera Nair', email: 'meera@orbitbank.example', role: 'dpo', status: 'Active', last: '12 min ago', mfa: true },
    { name: 'Kabir Shah', email: 'kabir@orbitbank.example', role: 'dev', status: 'Active', last: '1 h ago', mfa: true },
    { name: 'Rhea D’Souza', email: 'rhea@auditfirm.example', role: 'auditor', status: 'Active', last: '2 d ago', mfa: true },
    { name: 'Neha Kapoor', email: 'neha@orbitbank.example', role: 'admin', status: 'Active', last: '5 min ago', mfa: true }
  ],
  settings: {
    dpo: 'Meera Nair',
    dpoMail: 'dpo@orbitbank.example',
    mfa: true,
    timeout: '30',
    retention: '12 months',
    langs: ['en', 'hi', 'ta', 'bn'],
    region: 'Mumbai'
  },
  keys: [
    { id: 'k1', name: 'Production web checkout', prefix: 'cp_live_7f3a', scopes: ['verify', 'receipts:write'], created: NOW - 41 * DAY, last: '2 min ago', status: 'active' },
    { id: 'k2', name: 'Mobile app (Android)', prefix: 'cp_live_c19e', scopes: ['verify'], created: NOW - 19 * DAY, last: '8 min ago', status: 'active' }
  ],
  hooks: [
    { id: 'w1', url: 'https://api.orbitbank.example/hooks/consent', events: ['consent.revoked', 'consent.granted'], status: 'active' }
  ],
  deliv: [],
  requests: [
    { id: 'RQ-1041', type: 'Access', by: 'dp_2b91c4', text: 'Wants a copy of the data held for credit scoring.', ts: NOW - 6 * DAY, due: NOW + 24 * DAY, status: 'In progress' },
    { id: 'RQ-1042', type: 'Erasure', by: 'dp_88e3f0', text: 'Asks to delete marketing history after revoking offers.', ts: NOW - 3 * DAY, due: NOW + 27 * DAY, status: 'Open' },
    { id: 'RQ-1043', type: 'Correction', by: 'dp_51ad07', text: 'Mobile number on file is out of date.', ts: NOW - 1 * DAY, due: NOW + 29 * DAY, status: 'Open' },
    { id: 'RQ-1038', type: 'Grievance', by: 'dp_c7720a', text: 'Offers kept arriving two days after revoking.', ts: NOW - 15 * DAY, due: NOW + 15 * DAY, status: 'Resolved' }
  ],
  notifs: [
    { id: 1, to: ['dpo', 'admin'], t: '3 rights requests are waiting for review.', ts: NOW - 36e5, un: true },
    { id: 2, to: ['dev', 'admin'], t: 'Webhook api.orbitbank.example answered in 212 ms.', ts: NOW - 5 * 36e5, un: true },
    { id: 3, to: ['auditor', 'dpo', 'admin'], t: 'Ledger head hash changed after 24 new events.', ts: NOW - 9 * 36e5, un: false },
    { id: 4, to: ['principal'], t: 'Bharat Telecom sent you a consent request.', ts: NOW - 2 * 36e5, un: true },
    { id: 5, to: ['principal'], t: 'Personalised recommendations from SwiftCart expires in 19 days.', ts: NOW - 26 * 36e5, un: true }
  ],
  tests: null,
  testSel: 0,
  sel: null,
  step: 0,
  hero: [true, true, false],
  demo: { a: true, b: false, c: false },
  ltab: 'web',
  heroTab: 0,
  aud: 0,
  menu: false,
  slide: 0,
  pw: false,
  heroHold: false,
  slideHold: false,
  drawerOpen: false,
  ai: {
    tab: 'notice',
    text: '',
    req: '',
    lang: 'hi',
    busy: '',
    res: {},
    fs: '',
    sim: { role: 'auditor', op: 'read', col: 'ledger', own: false }
  }
};

/* state helpers */
export const stat = p => (p.status === 'granted' && p.exp && p.exp < Date.now()) ? 'expired' : p.status;
export const byId = id => S.purposes.find(p => p.id === id);
export const strength = pw => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
export const p95 = () => {
  const a = S.lat.length ? S.lat.slice(-60) : [132, 118, 141, 150, 127];
  const s = [...a].sort((x, y) => x - y);
  return Math.round(s[Math.floor(s.length * .95) - 1] || s[s.length - 1]);
};
export const score = () => {
  const t = S.comp.reduce((a, c) => a + c.w, 0);
  const d = S.comp.reduce((a, c) => a + c.w * (c.state === 'done' ? 1 : c.state === 'partial' ? .5 : 0), 0);
  return Math.round(d / t * 100);
};
export const csState = id => (S.comp.find(c => c.id === id) || {}).state || 'gap';
export const daysLeft = ts => {
  const d = Math.ceil((ts - Date.now()) / DAY);
  return d >= 0 ? d + ' days left' : Math.abs(d) + ' days overdue';
};
export const daysTo = (y, m, d) => Math.max(0, Math.ceil((new Date(y, m - 1, d) - Date.now()) / DAY));
export const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
export const notify = (to, t) => {
  S.notifs.unshift({ id: Date.now() + Math.random(), to, t, ts: Date.now(), un: true });
};

export function obligations() {
  const overdue = S.requests ? S.requests.filter(r => r.status !== 'Resolved' && r.due < Date.now()).length : 0;
  return [
    ['s.5', 'Notice to Data Principals', 'Itemised notice with purposes, rights and complaint route.', csState('k3'), 'o-notices'],
    ['s.6', 'Free, specific, informed consent', 'Purpose-bound requests. Nothing pre-ticked or bundled.', csState('k1'), 'o-purposes'],
    ['s.6(4)', 'Withdrawal as easy as giving', 'One tap or one spoken sentence. ' + (S.stats ? S.stats.prop.toFixed(1) : '1.2') + ' s to reach systems.', csState('k2'), 'o-purposes'],
    ['s.8(5)', 'Reasonable security safeguards', 'Encryption, role-based access, key rotation, tamper-evident log.', (S.settings && S.settings.mfa) ? 'done' : 'partial', 'o-team'],
    ['s.8(6)', 'Personal data breach intimation', 'Tell the Board and affected people. Detailed report within 72 hours.', csState('k6'), 'o-compliance'],
    ['s.8(7)', 'Erase data once consent is withdrawn', 'Retention timers and erasure jobs per purpose.', 'partial', 'o-compliance'],
    ['s.9', 'Children’s data', 'Verifiable consent of a parent or guardian under 18.', csState('k5'), 'o-compliance'],
    ['s.10', 'Significant Data Fiduciary duties', 'India-based DPO, independent data auditor, impact assessment. Applies only if notified.', 'gap', 'o-compliance'],
    ['s.11–14', 'Rights of Data Principals', overdue ? overdue + ' request overdue.' : 'Access, correction, erasure, grievance and nominee, answered on time.', overdue ? 'partial' : 'done', 'o-requests']
  ];
}
