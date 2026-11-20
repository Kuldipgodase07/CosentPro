/**
 * Auditor Command Centre View
 * Independent evidence coverage across DPDP sections, random sample re-hashing, chain integrity
 */
import { S, short, fmt, greet, esc } from '../../core/state.js';
import { ic } from '../../components/icons.js';
import { ring, kpi, secTag, typePill } from '../../components/ui/charts.js';
import { banner } from '../dpo/dashboard.js';

export function audDash() {
  const v = S.verified;
  const cov = [
    ['s.5', 'Notice records', 92],
    ['s.6', 'Consent receipts', 100],
    ['s.6(4)', 'Withdrawals', 100],
    ['s.8(5)', 'Security controls', 88],
    ['s.8(6)', 'Breach workflow', 40],
    ['s.9', 'Children’s consent', 25],
    ['s.11–14', 'Rights requests', 85]
  ];
  const side = `
    <div class="ringlab">
      ${ring(Math.round(cov.reduce((a, c) => a + c[2], 0) / cov.length), 120, 11)}
      <div>Evidence coverage</div>
    </div>
  `;
  const sm = S.sample;

  return banner({
    chips: [['eye', 'Read-only access'], ['shield', 'Independent audit'], ['building', esc(S.tenant.name)]],
    h: `${greet()}, ${esc(S.user.name.split(' ')[0])}`,
    p: 'Check that the records are complete and unaltered. Everything here recomputes in your own browser.',
    acts: [['Verify chain now', 0, 'data-act="verify"'], ['Draw a sample', 0, 'data-act="sample"', 'ghost'], ['Open ledger', 0, 'data-go="a-ledger"', 'ghost']],
    side
  }) + `
    <div class="grid g6">
      ${kpi({ i: 'ledger', k: 'Ledger entries', v: `<span id="k-ledger">${S.ledger.length}</span>`, d: 'append-only' })}
      ${kpi({ i: 'shield', k: 'Chain integrity', v: v ? (v.ok ? 'Intact' : 'Broken') : 'Not run', d: v ? (v.ok ? v.n + ' entries recomputed' : 'Mismatch at #' + v.at) : 'Run a verification', sec: 's.8(5)' })}
      ${kpi({ i: 'clock', k: 'Revocations within 5 s', v: '99.98', u: '%', d: 'sample, 30 days', sec: 's.6(4)' })}
      ${kpi({ i: 'flag', k: 'Rights requests on time', v: '96', u: '%', d: 'against 30-day target', sec: 's.11–14' })}
      ${kpi({ i: 'alert', k: 'Exceptions', v: S.tamper ? 1 : 0, d: S.tamper ? 'tamper test active' : 'none recorded' })}
      ${kpi({ i: 'file', k: 'Last head hash', v: `<span class="mono" style="font-size:18px">${short((S.ledger[S.ledger.length - 1] || {}).hash).slice(0, 8)}</span>`, d: 'changes with every event' })}
    </div>
    <div class="grid g21">
      <section class="card">
        <h2>Evidence coverage by DPDP section</h2>
        <div class="sub">Share of required records that exist for the audit period.</div>
        <div style="margin-top:10px">
          ${cov.map(c => `
            <div class="frow" style="grid-template-columns:150px minmax(0,1fr) 52px">
              <span>${secTag(c[0])} ${c[1]}</span>
              <div class="bar"><i style="width:${c[2]}%"></i></div>
              <span class="n num">${c[2]}%</span>
            </div>
          `).join('')}
        </div>
      </section>
      <section class="card">
        <h2>Method</h2>
        <ul class="feed" style="margin-top:8px">
          ${[['Verify chain', 'Recompute every SHA-256 hash and compare.'], ['Draw a sample', 'Random events, each re-hashed on its own.'], ['Tamper test', 'Edit one record to prove detection works.'], ['Copy evidence', 'A bundle with the head hash for your file.']].map(a => `
            <li style="grid-template-columns:auto minmax(0,1fr)">
              ${ic('check')}
              <div>
                <b style="font-weight:500">${a[0]}</b>
                <div class="t" style="white-space:normal">${a[1]}</div>
              </div>
            </li>
          `).join('')}
        </ul>
      </section>
    </div>
    <section class="card">
      <div class="panelh">
        <div>
          <h2>Random sample</h2>
          <div class="sub">25 events chosen by the browser, each re-hashed on its own.</div>
        </div>
        <span class="spacer"></span>
        <button class="btn btn--p btn--sm" data-act="sample">${ic('refresh')}Draw sample</button>
      </div>
      ${sm ? `
        <div class="scroll">
          <table class="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Event</th>
                <th>Purpose</th>
                <th>Receipt</th>
                <th>Hash check</th>
              </tr>
            </thead>
            <tbody>
              ${sm.slice(0, 8).map(e => `
                <tr>
                  <td class="num">${e.seq}</td>
                  <td>${fmt(e.ts)}</td>
                  <td>${typePill(e.type)}</td>
                  <td>${esc(e.purpose)}</td>
                  <td class="mono">${esc(e.receipt)}</td>
                  <td>
                    ${e.ok ? `<span class="pill pill--granted">${ic('check')}Match</span>` : `<span class="pill pill--revoked">${ic('x')}Mismatch</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <p class="sub" style="margin-top:8px">${sm.filter(e => e.ok).length} of ${sm.length} sampled events match their stored hash. Showing the first 8.</p>
      ` : '<div class="empty">Draw a sample to test individual records.</div>'}
    </section>
  `;
}
