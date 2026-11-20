/**
 * Citizen My Consents View
 * Granular purpose catalogue grouped by organization with independent grant/revoke controls
 */
import { S, stat, fmtD, initials, esc } from '../../core/state.js';
import { ORGS } from '../../core/constants.js';
import { ic } from '../../components/icons.js';
import { pill } from '../../components/ui/charts.js';

export function purposeRow(p, withOrg) {
  const s = stat(p), org = ORGS[p.org];
  const soon = s === 'granted' && p.exp && p.exp - Date.now() < 30 * 864e5;
  return `
    <div class="prow">
      <div>
        <h3>${esc(p.name)}</h3>
        <div class="meta">${withOrg ? esc(org.name) + ' · ' : ''}${esc(p.desc)}</div>
        <div class="tags">
          ${p.data.map(d => `<span class="tagx">${esc(d)}</span>`).join('')}
          <span class="tagx">Kept: ${esc(p.ret)}</span>
        </div>
        ${soon ? `<div class="meta" style="margin-top:8px;color:var(--ink)"><b style="font-weight:500">Expires ${fmtD(p.exp)}.</b> Renew it or let it lapse.</div>` : ''}
      </div>
      <div class="act">
        ${pill(s)}
        <div class="row">
          <button class="btn btn--sm" data-act="receipt" data-id="${p.id}">${ic('file')}Receipt</button>
          ${s === 'granted'
            ? `<button class="btn btn--sm btn--r" data-act="ask" data-id="${p.id}" data-do="revoke">Revoke</button>`
            : `<button class="btn btn--sm btn--p" data-act="ask" data-id="${p.id}" data-do="grant">${s === 'pending' ? 'Review' : 'Grant'}</button>`
          }
        </div>
      </div>
    </div>
  `;
}

export function cConsents() {
  const f = S.filter;
  const test = p => {
    const s = stat(p);
    return f === 'all' ||
      (f === 'active' && s === 'granted') ||
      (f === 'revoked' && s === 'revoked') ||
      (f === 'attention' && (s === 'pending' || s === 'expired' || (s === 'granted' && p.exp && p.exp - Date.now() < 30 * 864e5)));
  };
  const groups = Object.keys(ORGS).map(k => [k, S.purposes.filter(p => p.org === k && test(p))]).filter(g => g[1].length);

  return `
    <div class="pagehead">
      <div>
        <h1>My consents</h1>
        <p>Every purpose is separate. Revoking one never affects the others.</p>
      </div>
    </div>
    <div class="row" role="group" aria-label="Filter">
      ${[['all', 'All'], ['active', 'Active'], ['attention', 'Needs attention'], ['revoked', 'Revoked']].map(([k, l]) => `
        <button class="chip" aria-pressed="${f === k}" data-filter="${k}">${l}</button>
      `).join('')}
    </div>
    ${groups.map(([k, ps]) => `
      <section class="card org">
        <div class="orghead" style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <span class="av" style="width:36px;height:36px;border-radius:10px;font-size:13px">${initials(ORGS[k].name)}</span>
          <div>
            <b>${ORGS[k].name}</b>
            <span style="display:block;color:var(--ink-2);font-size:12px">${ORGS[k].sector} · ${ps.length} purpose${ps.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        ${ps.map(p => purposeRow(p, false)).join('')}
      </section>
    `).join('') || '<div class="card empty">No consents match this filter.</div>'}
  `;
}
