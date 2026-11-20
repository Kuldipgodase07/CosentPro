/**
 * Dynamic SVG Chart & Graphic Visualizers
 * Includes 14-day trends, Donut charts, KPI sparklines, and score rings
 */
import { S, NOW, DAY, fmtD, ago, esc } from '../../core/state.js';
import { ic } from '../icons.js';

export const pill = s => ({
  granted: `<span class="pill pill--granted">${ic('check')}Active</span>`,
  revoked: `<span class="pill pill--revoked">${ic('x')}Revoked</span>`,
  pending: `<span class="pill pill--pending">${ic('clock')}Awaiting you</span>`,
  expired: `<span class="pill pill--expired">${ic('clock')}Expired</span>`
}[s] || '');

export const typePill = t => ({
  GRANT: '<span class="pill pill--granted">Grant</span>',
  REVOKE: '<span class="pill pill--revoked">Revoke</span>',
  VERIFY: '<span class="pill pill--neutral">Verify</span>',
  NOTICE: '<span class="pill pill--pending">Notice</span>',
  DECLINE: '<span class="pill pill--expired">Decline</span>'
}[t] || '');

export const stPill = s =>
  s === 'done' ? `<span class="pill pill--granted">${ic('check')}Ready</span>` :
  s === 'partial' ? `<span class="pill pill--pending">${ic('clock')}Partly</span>` :
  `<span class="pill pill--revoked">${ic('x')}Gap</span>`;

export const reqPill = s =>
  s === 'Open' ? `<span class="pill pill--pending">${ic('clock')}Open</span>` :
  s === 'In progress' ? `<span class="pill pill--granted">${ic('bolt')}In progress</span>` :
  `<span class="pill pill--neutral">${ic('check')}Resolved</span>`;

export const secTag = s => `<span class="sec" title="DPDP Act 2023, section ${s.replace('s.', '')}">${s}</span>`;

export function ring(pct, size = 120, stroke = 10) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return `
    <svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${pct} percent">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(242,230,238,.22)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#FFCCF2" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c * pct / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="${size * 0.28}" font-weight="200">${pct}%</text>
    </svg>
  `;
}

export function donut(parts, size = 150, stroke = 22, center = '') {
  const tot = parts.reduce((a, p) => a + p.v, 0) || 1;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  let off = 0;
  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${parts.map(p => p.l + ' ' + p.v).join(', ')}" style="flex:none">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${stroke}"/>
      ${parts.map(p => {
        const len = p.v / tot * C;
        const e = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${p.c}" stroke-width="${stroke}" stroke-dasharray="${Math.max(0, len - 2)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
        off += len;
        return e;
      }).join('')}
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="${size * 0.24}" font-weight="200" fill="var(--ink)">${center}</text>
    </svg>
  `;
}

export function series(n, base, amp, seed) {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, (_, i) => Math.round(base + Math.sin(i / 2) * amp + r() * amp));
}

export function spark(v, w = 112, h = 36) {
  const mx = Math.max(...v), mn = Math.min(...v);
  const x = i => 2 + i * (w - 4) / (v.length - 1);
  const y = a => h - 4 - (a - mn) / (mx - mn || 1) * (h - 10);
  const pts = v.map((a, i) => x(i).toFixed(1) + ',' + y(a).toFixed(1)).join(' ');
  return `
    <svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
      <polygon points="${x(0)},${h} ${pts} ${x(v.length - 1)},${h}" fill="var(--chart-a)" opacity=".14"/>
      <polyline points="${pts}" fill="none" stroke="var(--chart-a)" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="${x(v.length - 1)}" cy="${y(v[v.length - 1])}" r="3" fill="var(--chart-a)"/>
    </svg>
  `;
}

export const kpi = o => `
  <div class="card kpi">
    <div class="k">${ic(o.i)}<span>${o.k}</span>${o.sec ? secTag(o.sec) : ''}</div>
    <div class="kv">
      <div class="v num">${o.v}${o.u ? `<small>${o.u}</small>` : ''}</div>
      ${o.s ? spark(o.s) : ''}
    </div>
    <div class="d">${o.d}</div>
  </div>
`;

export function chartSVG() {
  const W = 700, H = 400, pl = 44, pr = 16, pt = 14, pb = 30, n = 14;
  let seed = 7;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const g = Array.from({ length: n }, (_, i) => Math.round(3100 + i * 70 + Math.sin(i / 1.6) * 380 + r() * 260));
  const v = Array.from({ length: n }, (_, i) => Math.round(150 + Math.cos(i / 2) * 36 + r() * 40));
  g[n - 1] = S.stats.grants;
  v[n - 1] = S.stats.revokes;
  const max = 6000;
  const x = i => pl + i * (W - pl - pr) / (n - 1);
  const y = val => pt + (1 - val / max) * (H - pt - pb);
  const gl = g.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d).toFixed(1)}`).join(' ');
  const vl = v.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d * 8).toFixed(1)}`).join(' ');
  const ticks = [0, 2000, 4000, 6000];
  const lab = i => fmtD(NOW - (n - 1 - i) * DAY).replace(/ 20\d\d$/, '');

  return `
    <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Grants and revocations, last 14 days" style="display:block;max-width:100%">
      ${ticks.map(t => `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${pl - 8}" y="${y(t)}" text-anchor="end" dominant-baseline="central" font-size="11" fill="var(--ink-2)">${t ? t / 1000 + 'k' : 0}</text>`).join('')}
      <path d="${gl} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)}Z" fill="var(--chart-a)" opacity=".14"/>
      <path d="${gl}" fill="none" stroke="var(--chart-a)" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="${vl}" fill="none" stroke="var(--chart-b)" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>
      <circle cx="${x(n - 1)}" cy="${y(g[n - 1])}" r="5" fill="var(--chart-a)" stroke="var(--surface)" stroke-width="2"/>
      <circle cx="${x(n - 1)}" cy="${y(v[n - 1] * 8)}" r="4.5" fill="var(--chart-b)" stroke="var(--surface)" stroke-width="2"/>
      ${[0, 3, 6, 9, 13].map(i => `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === 13 ? 'end' : i === 0 ? 'start' : 'middle'}" font-size="11" fill="var(--ink-2)">${lab(i)}</text>`).join('')}
    </svg>
  `;
}

export function liveFeedHTML() {
  return S.feed.slice(0, 7).map(e => `
    <li>
      ${typePill(e.type)}
      <div style="min-width:0">
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.purpose)}</div>
        <div class="t mono">${esc(e.subject)}</div>
      </div>
      <span class="t">${ago(e.ts)}</span>
    </li>
  `).join('') || '<li><div class="empty" style="grid-column:1/-1">Waiting for the first event…</div></li>';
}

export { ledgerRows } from '../../services/ledger.js';
