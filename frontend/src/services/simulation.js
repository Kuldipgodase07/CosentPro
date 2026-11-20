/**
 * Live Simulation Service
 * Generates synthetic traffic for banking fiduciary, updates live metrics,
 * pushes real-time ledger entries, and computes p95 latency.
 */
import { S, $, n0, hex, pick, rnd, p95 } from '../core/state.js';
import { addEntry } from './ledger.js';
import { liveFeedHTML, ledgerRows } from '../components/ui/charts.js';

export function tick() {
  if (document.hidden) return;
  const orbit = S.purposes.filter(p => p.org === 'orbit');
  const p = pick(orbit);
  const r = Math.random();
  const type = r < 0.45 ? 'GRANT' : r < 0.87 ? 'VERIFY' : 'REVOKE';
  const ev = {
    type,
    org: 'orbit',
    purpose: p.name,
    subject: 'dp_' + hex(6),
    receipt: 'RC-' + hex(8).toUpperCase()
  };

  addEntry(ev).then(() => {
    S.feed.unshift({ ...ev, ts: Date.now() });
    S.feed.length = Math.min(S.feed.length, 30);
    if (type === 'GRANT') {
      S.stats.active++;
      S.stats.grants++;
    } else if (type === 'REVOKE') {
      S.stats.active--;
      S.stats.revokes++;
      S.stats.prop = S.stats.prop * 0.9 + rnd(1.6, 2.8) * 0.1;
    } else {
      S.stats.verifies++;
      S.lat.push(rnd(96, 176));
    }

    if (S.route === 'o-dash') {
      const set = (id, v) => {
        const e = $('#' + id);
        if (e) e.textContent = v;
      };
      set('k-active', n0(S.stats.active));
      set('k-grants', n0(S.stats.grants));
      set('k-rev', n0(S.stats.revokes));
      set('k-prop', S.stats.prop.toFixed(1));
      set('k-lat', p95());
      set('k-ledger', S.ledger.length);
      const f = $('#livefeed');
      if (f) f.innerHTML = liveFeedHTML();
    }

    if (S.route === 'a-ledger' && !S.tamper && !S.q) {
      const b = $('#lbody');
      if (b) b.innerHTML = ledgerRows();
    }
  });
}

let simInterval = null;

export function startSimulation() {
  if (!simInterval) {
    simInterval = setInterval(tick, 2600);
  }
}

export function stopSimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
}
