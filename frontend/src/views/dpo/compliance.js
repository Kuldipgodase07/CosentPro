/**
 * DPO Compliance Checklist View
 * Statutory requirement tracking for DPDP Act 2023 & GDPR
 */
import { S, score, esc } from '../../core/state.js';
import { ic } from '../../components/icons.js';

export function oCompliance() {
  const sc = score();
  return `
    <div class="pagehead">
      <div>
        <h1>Compliance</h1>
        <p>DPDP Act 2023 and GDPR readiness, computed from what is switched on for this tenant.</p>
      </div>
    </div>
    <div class="grid g21">
      <section class="card">
        <h2>Checklist</h2>
        <div>
          ${S.comp.map(c => `
            <div class="check" style="display:grid;grid-template-columns:84px minmax(0,1fr) auto;gap:12px;padding:12px 0;border-top:1px solid var(--line);align-items:center">
              <span class="pill ${c.state === 'done' ? 'pill--granted' : c.state === 'partial' ? 'pill--pending' : 'pill--revoked'}">
                ${c.state === 'done' ? ic('check') + 'Ready' : c.state === 'partial' ? ic('clock') + 'Partly' : ic('x') + 'Gap'}
              </span>
              <div>
                <b style="font-weight:500">${esc(c.title)}</b>
                <div class="sub">${esc(c.detail)}</div>
                <div class="ref" style="font-size:11.5px;color:var(--accent);margin-top:2px">${esc(c.ref)}</div>
              </div>
              ${c.state !== 'done' ? `<button class="btn btn--sm" data-act="comp-done" data-id="${c.id}">Mark done</button>` : '<span></span>'}
            </div>
          `).join('')}
        </div>
      </section>

      <section class="card" style="text-align:center">
        <h2>Readiness</h2>
        <div style="margin:18px auto;width:min(220px,100%);color:var(--ink)">
          <svg viewBox="0 0 200 200" width="100%" role="img" aria-label="${sc} percent ready">
            <circle cx="100" cy="100" r="86" fill="none" stroke="var(--surface-2)" stroke-width="16"/>
            <circle cx="100" cy="100" r="86" fill="none" stroke="var(--accent)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 86 * sc / 100} ${2 * Math.PI * 86}" transform="rotate(-90 100 100)"/>
            <text x="100" y="100" text-anchor="middle" dominant-baseline="central" font-size="56" font-weight="200" fill="var(--ink)">${sc}%</text>
          </svg>
        </div>
        <p class="sub">DPDP Rules were notified on 14 Nov 2025. The main duties apply from May 2027. Penalties reach ₹250 crore.</p>
      </section>
    </div>
  `;
}
