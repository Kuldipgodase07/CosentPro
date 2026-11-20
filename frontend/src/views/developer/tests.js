/**
 * Developer Interoperability Conformance Tests View
 * Test runner for Kantara, HL7 FHIR, OpenID Connect, W3C DPV, IAB TCF, HMAC Webhooks
 */
import { S } from '../../core/state.js';
import { SUITES } from '../../core/constants.js';
import { ic } from '../../components/icons.js';

export function oTests(canFn) {
  const T = S.tests;
  const sel = S.testSel;
  const passN = T ? T.filter(t => t && t.done).reduce((a, t) => a + t.pass, 0) : 0;
  const total = SUITES.reduce((a, s) => a + s[2].length, 0);

  return `
    <div class="pagehead">
      <div>
        <h1>Interoperability</h1>
        <p>Conformance suites that run against the sandbox on every release.</p>
      </div>
      <span class="spacer"></span>
      ${canFn('tests') ? `
        <button class="btn btn--p" data-act="runtests" ${S.running ? 'disabled' : ''}>
          ${ic('play')}${S.running ? 'Running…' : 'Run all suites'}
        </button>
      ` : ''}
    </div>

    <div class="row">
      <span class="demo" style="display:inline-flex;gap:6px;align-items:center;font-size:12px;color:var(--ink-2)">
        ${ic('alert')}Simulated results for this demo. In production the suites run in CI.
      </span>
      ${T && T.every(t => t && t.done) ? `
        <span class="pill pill--granted">${ic('check')}${passN} of ${total} passed · ${T.reduce((a, t) => a + t.warn, 0)} warning</span>
      ` : ''}
    </div>

    <div class="grid g21" style="margin-top:14px">
      <section class="card" style="padding:8px 12px">
        <div class="scroll">
          <table class="tbl">
            <thead>
              <tr>
                <th>Suite</th>
                <th>Standard</th>
                <th>Result</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${SUITES.map((s, i) => {
                const t = T && T[i];
                return `
                  <tr>
                    <td>
                      <button class="btn btn--sm" data-act="tsel" data-i="${i}" ${sel === i ? 'style="border-color:var(--accent)"' : ''}>
                        ${s[0]}
                      </button>
                    </td>
                    <td>${s[1]}</td>
                    <td style="min-width:150px">
                      ${t ? (t.done ? `
                        <span class="pill ${t.warn ? 'pill--pending' : 'pill--granted'}">
                          ${ic(t.warn ? 'alert' : 'check')}${t.pass}/${s[2].length} pass${t.warn ? ' · 1 warning' : ''}
                        </span>
                      ` : '<div class="bar"><i style="width:60%"></i></div>') : '<span class="pill pill--expired">Not run</span>'}
                    </td>
                    <td class="num">${t && t.done ? t.ms + ' ms' : ''}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>${SUITES[sel][0]}</h2>
        <div class="sub">${SUITES[sel][1]}</div>
        <ul class="feed" style="margin-top:8px">
          ${SUITES[sel][2].map((n, j) => {
            const t = T && T[sel], warn = t && t.done && t.warn && j === t.warnAt;
            return `
              <li style="grid-template-columns:auto minmax(0,1fr)">
                <span class="pill ${!t || !t.done ? 'pill--expired' : warn ? 'pill--pending' : 'pill--granted'}">
                  ${!t || !t.done ? '–' : warn ? ic('alert') + 'Warn' : ic('check') + 'Pass'}
                </span>
                <span>${n}</span>
              </li>
            `;
          }).join('')}
        </ul>
      </section>
    </div>
  `;
}
