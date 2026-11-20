/**
 * Developer Command Centre View
 * Live RPM, P95 latency, 90-day service uptime, API key usage, SDK adoption
 */
import { S, n0, p95, greet, esc } from '../../core/state.js';
import { ic } from '../../components/icons.js';
import { kpi, series } from '../../components/ui/charts.js';
import { banner } from '../dpo/dashboard.js';

export function devDash() {
  const rpm = series(30, 410, 90, 21);
  const lat = series(14, 120, 22, 17);
  const up = Array.from({ length: 90 }, (_, i) => (i === 31 || i === 64 ? 'deg' : ''));
  const codes = [['2xx', 99.31, 'Success'], ['4xx', 0.62, 'Client errors'], ['5xx', 0.07, 'Server errors']];
  const side = `
    <div class="ringlab">
      <div style="font-size:44px;font-weight:200;line-height:1">99.98%</div>
      API uptime<br>last 90 days
    </div>
  `;

  return banner({
    chips: [['code', 'Sandbox and live'], ['globe', esc(S.settings.region) + ' region'], ['bolt', 'v1 API']],
    h: `${greet()}, ${esc(S.user.name.split(' ')[0])}`,
    p: 'Check consent in one line. This page shows how your integration is behaving right now.',
    acts: [['Open SDK sandbox', 0, 'data-go="o-sdk"'], ['Manage keys', 0, 'data-go="o-keys"', 'ghost'], ['Run test suites', 0, 'data-go="o-tests"', 'ghost']],
    side
  }) + `
    <div class="grid g6">
      ${kpi({ i: 'bolt', k: 'Requests per minute', v: rpm[rpm.length - 1], d: 'verify, grant, revoke', s: rpm })}
      ${kpi({ i: 'clock', k: 'Latency p95', v: `<span id="k-lat">${p95()}</span>`, u: 'ms', d: 'target under 200 ms', s: lat })}
      ${kpi({ i: 'alert', k: 'Error rate', v: '0.07', u: '%', d: '5xx, last 24 hours' })}
      ${kpi({ i: 'link', k: 'Webhook success', v: '99.6', u: '%', d: 'retries recover the rest' })}
      ${kpi({ i: 'key', k: 'Active keys', v: S.keys.filter(k => k.status === 'active').length, d: '1 not used in 30 days' })}
      ${kpi({ i: 'ledger', k: 'Events written', v: `<span id="k-ledger">${S.ledger.length}</span>`, d: 'this session' })}
    </div>
    <div class="grid g21">
      <section class="card">
        <div class="panelh">
          <div>
            <h2>Service status</h2>
            <div class="sub">Each bar is one day. Taller colour means an incident day.</div>
          </div>
        </div>
        ${[['Consent API', 'verify · grant · revoke'], ['Receipt service', 'signing and retrieval'], ['Audit ledger', 'append and verify'], ['Webhook delivery', 'retries and dead-letter']].map((s, i) => `
          <div class="statrow" style="grid-template-columns:minmax(0,200px) minmax(0,1fr) auto">
            <div>
              <b style="font-weight:500">${s[0]}</b>
              <div class="sub">${s[1]}</div>
            </div>
            <div class="uptime" aria-hidden="true">
              ${up.map((c, k) => `<i class="${i === 3 && k === 64 ? 'deg' : i === 0 && k === 31 ? 'deg' : ''}"></i>`).join('')}
            </div>
            <span class="pill pill--granted">${ic('check')}Operational</span>
          </div>
        `).join('')}
      </section>
      <section class="card">
        <h2>Responses by class</h2>
        <div class="sub">Last 24 hours · sample</div>
        <div style="margin-top:10px">
          ${codes.map(c => `
            <div class="frow">
              <span>${c[0]} ${c[2]}</span>
              <div class="bar"><i style="width:${Math.max(c[1], 1.5)}%"></i></div>
              <span class="n num">${c[1]}%</span>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
    <div class="grid g2">
      <section class="card">
        <h2>API key usage</h2>
        <div class="scroll">
          <table class="tbl" style="margin-top:6px">
            <thead>
              <tr>
                <th>Key</th>
                <th>Calls today</th>
                <th>Last used</th>
              </tr>
            </thead>
            <tbody>
              ${S.keys.map((k, i) => `
                <tr>
                  <td><b style="font-weight:500">${esc(k.name)}</b><div class="sub mono">${k.prefix}••••</div></td>
                  <td class="num">${k.status === 'active' ? n0(12400 - i * 5200) : '–'}</td>
                  <td>${k.status === 'active' ? k.last : 'revoked'}</td>
                </tr>
              `).join('') || '<tr><td colspan="3"><div class="empty">No keys yet.</div></td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>SDK adoption</h2>
        <div class="sub">Share of calls by SDK and version</div>
        <div style="margin-top:10px">
          ${[['Web 1.4', 58], ['Android 1.2', 27], ['iOS 1.1', 11], ['REST direct', 4]].map(r => `
            <div class="frow">
              <span>${r[0]}</span>
              <div class="bar"><i style="width:${r[1]}%"></i></div>
              <span class="n num">${r[1]}%</span>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}
