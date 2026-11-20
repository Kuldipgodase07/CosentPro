/**
 * In-Browser Cloud Firestore Simulator & Syncer
 * Reflects full tenant document structure, ops log, and real-time syncing.
 */
import { S, SUBJ } from '../core/state.js';

export const DB = {
  docs: new Map(),
  ops: [],
  reads: 0,
  writes: 0,
  auth: 0,
  fn: 0,
  tid: 'orbit',
  seeded: false,

  colOf(p) {
    return p.split('/').slice(0, -1).join('/');
  },

  log(op, path, n) {
    this.ops.unshift({ ts: Date.now(), op, path, n: n || 0 });
    if (this.ops.length > 140) this.ops.pop();
  },

  set(path, data, quiet) {
    const next = JSON.stringify(data, (k, v) => (k === 'pw' || k === 'secret') ? undefined : v);
    const prev = this.docs.get(path);
    if (prev && prev.s === next) return false;
    this.docs.set(path, { s: next, ts: Date.now() });
    this.writes++;
    if (!quiet) this.log(prev ? 'update' : 'set', path, next.length);
    return true;
  },

  get(path) {
    const d = this.docs.get(path);
    this.reads++;
    this.log('get', path, d ? d.s.length : 0);
    return d ? JSON.parse(d.s) : null;
  },

  list(col) {
    return [...this.docs.entries()]
      .filter(([p]) => this.colOf(p) === col)
      .sort((a, b) => b[1].ts - a[1].ts)
      .map(([p, d]) => ({ id: p.split('/').pop(), data: JSON.parse(d.s) }));
  },

  cols() {
    const m = {};
    for (const p of this.docs.keys()) {
      const c = this.colOf(p);
      m[c] = (m[c] || 0) + 1;
    }
    return m;
  },

  sync() {
    if (!S.user) return;
    const t = `tenants/${this.tid}`;
    const first = !this.seeded;
    let n = 0;
    const w = (p, d) => {
      if (this.set(p, d, first)) n++;
    };

    S.purposes.forEach(p => {
      w(`${t}/purposes/${p.id}`, { name: p.name, org: p.org, status: p.status, receipt: p.receipt, updated: p.updated });
      if (p.org === 'orbit') {
        w(`principals/${SUBJ}/consents/${p.id}`, { purpose: p.name, status: p.status, receipt: p.receipt, updated: p.updated });
      }
    });

    S.requests.forEach(r => w(`${t}/requests/${r.id}`, r));
    S.keys.forEach(k => w(`${t}/apiKeys/${k.id}`, { name: k.name, prefix: k.prefix, scopes: k.scopes, status: k.status, created: k.created }));
    S.hooks.forEach(h => w(`${t}/webhooks/${h.id}`, { url: h.url, events: h.events }));
    S.users.forEach(u => w(`users/${(u.email || '').replace(/[^a-z0-9]/gi, '_')}`, { name: u.name, email: u.email, role: u.role, status: u.status }));
    w(`${t}/config/settings`, S.settings);
    S.ledger.forEach(l => w(`${t}/ledger/${String(l.seq).padStart(6, '0')}`, l));

    if (first && S.ledger.length) {
      this.seeded = true;
      this.log('seed', `${n} documents written`, 0);
    }
  }
};
