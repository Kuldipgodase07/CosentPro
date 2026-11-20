/**
 * Immutable SHA-256 Hash Chained Audit Ledger Service
 * Provides cryptographic tamper-evidence, verification, and consent receipts.
 */
import { S, SUBJ, NOW, DAY, byId, hex, short, fmt, rnd, pick } from '../core/state.js';
import { sha, canon } from '../core/crypto.js';
import { ORGS } from '../core/constants.js';
import { ic } from '../components/icons.js';
import { typePill } from '../components/ui/charts.js';

let chainP = Promise.resolve();

export function addEntry(e) {
  chainP = chainP.then(async () => {
    const prev = S.ledger.length ? S.ledger[S.ledger.length - 1].hash : '0'.repeat(64);
    const ent = Object.assign({ ts: Date.now() }, e);
    ent.seq = S.ledger.length + 1;
    ent.prev = prev;
    ent.hash = await sha(canon(ent));
    S.ledger.push(ent);
  });
  return chainP;
}

export async function seedLedger() {
  const rows = [];
  S.purposes.forEach(p => {
    if (p.status !== 'pending') {
      rows.push({
        ts: p.updated - DAY,
        type: 'NOTICE',
        org: p.org,
        purpose: p.name,
        subject: SUBJ,
        receipt: 'NT-' + hex(6).toUpperCase()
      });
    }
    rows.push({
      ts: p.updated,
      type: p.status === 'revoked' ? 'REVOKE' : 'GRANT',
      org: p.org,
      purpose: p.name,
      subject: SUBJ,
      receipt: p.receipt
    });
  });
  for (let i = 0; i < 10; i++) {
    const p = pick(S.purposes);
    rows.push({
      ts: NOW - Math.round(rnd(1, 50)) * DAY - i * 1000,
      type: pick(['GRANT', 'GRANT', 'VERIFY', 'REVOKE']),
      org: p.org,
      purpose: p.name,
      subject: 'dp_' + hex(6),
      receipt: 'RC-' + hex(8).toUpperCase()
    });
  }
  rows.sort((a, b) => a.ts - b.ts);
  for (const r of rows) {
    await addEntry(r);
  }
}

export function applyConsent(id, action) {
  const p = byId(id);
  const receipt = 'RC-' + hex(8).toUpperCase();
  p.status = action === 'grant' ? 'granted' : 'revoked';
  p.updated = Date.now();
  p.receipt = receipt;
  p.exp = action === 'grant' ? Date.now() + 365 * DAY : null;
  addEntry({
    type: action === 'grant' ? 'GRANT' : 'REVOKE',
    org: p.org,
    purpose: p.name,
    subject: SUBJ,
    receipt
  });
  if (p.org === 'orbit') {
    if (action === 'grant') {
      S.stats.active++;
      S.stats.grants++;
    } else {
      S.stats.active--;
      S.stats.revokes++;
    }
  }
  return receipt;
}

export async function verifyChain() {
  await chainP;
  let prev = '0'.repeat(64);
  for (const e of S.ledger) {
    const h = await sha(canon({ ...e, prev }));
    if (e.prev !== prev || h !== e.hash) {
      S.verified = { ok: false, at: e.seq };
      return;
    }
    prev = e.hash;
  }
  S.verified = { ok: true, n: S.ledger.length, at: Date.now() };
  const k = S.comp.find(c => c.id === 'k4');
  if (k && k.state === 'partial') k.state = 'done';
}

export function filtered() {
  const q = S.q.trim().toLowerCase();
  return S.ledger.filter(e =>
    (S.ftype === 'all' || e.type === S.ftype) &&
    (!q || [e.type, e.org, ORGS[e.org]?.name, e.purpose, e.subject, e.receipt, e.hash].join(' ').toLowerCase().includes(q))
  ).slice().reverse();
}

export function ledgerRows() {
  const rows = filtered().slice(0, 120);
  return rows.map(e => `
    <tr class="${S.tamper === e.seq ? 'bad' : ''}">
      <td class="num">${e.seq}</td>
      <td style="white-space:nowrap">${fmt(e.ts)}</td>
      <td>${typePill(e.type)}</td>
      <td>${ORGS[e.org]?.name || e.org}</td>
      <td style="min-width:200px">${e.purpose}</td>
      <td class="mono">${e.subject}</td>
      <td class="mono">${e.receipt}</td>
      <td class="mono" title="${e.hash}">${short(e.hash)}</td>
    </tr>
  `).join('') || '<tr><td colspan="8"><div class="empty">No entries match.</div></td></tr>';
}

export function vBanner() {
  const v = S.verified;
  if (!v) {
    return `<div class="banner banner--ok" style="background:var(--surface);box-shadow:inset 0 0 0 1px var(--line)">
      ${ic('shield')}<span>Run a verification to recompute every hash in your browser.</span>
    </div>`;
  }
  return v.ok
    ? `<div class="banner banner--ok">${ic('check')}<span>Chain intact. ${v.n} entries recomputed, no mismatch. Checked ${fmt(v.at)}.</span></div>`
    : `<div class="banner banner--bad">${ic('alert')}<span>Chain broken at entry #${v.at}. Its content no longer matches its hash, so every later entry is untrusted.</span></div>`;
}
