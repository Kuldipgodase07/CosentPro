/**
 * Auditor Evidence Reports View
 * Exportable verifiable evidence bundles and organization breakups
 */
import { S } from '../../core/state.js';
import { ORGS } from '../../core/constants.js';
import { ic } from '../../components/icons.js';

export function aReports() {
  const L = S.ledger;
  const c = t => L.filter(e => e.type === t).length;
  const orgs = Object.keys(ORGS);

  return `
    <div class="pagehead">
      <div>
        <h1>Reports</h1>
        <p>Evidence an auditor can check without trusting the platform.</p>
      </div>
      <span class="spacer"></span>
      <button class="btn btn--p" data-act="copy-bundle">${ic('copy')}Copy evidence bundle</button>
    </div>
    <div class="grid g4">
      ${[['Grants', 'GRANT', 'check'], ['Revocations', 'REVOKE', 'x'], ['Verifications', 'VERIFY', 'shield'], ['Notices shown', 'NOTICE', 'file']].map(([l, t, i]) => `
        <div class="card stat">
          <div class="k">${ic(i)}${l}</div>
          <div class="v num">${c(t)}</div>
          <div class="d">in this ledger</div>
        </div>
      `).join('')}
    </div>
    <div class="grid g2" style="margin-top:16px">
      <section class="card">
        <h2>Events by organisation</h2>
        <div class="scroll">
          <table class="tbl" style="margin-top:8px">
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Grants</th>
                <th>Revokes</th>
                <th>Verifies</th>
              </tr>
            </thead>
            <tbody>
              ${orgs.map(k => `
                <tr>
                  <td>${ORGS[k].name}</td>
                  ${['GRANT', 'REVOKE', 'VERIFY'].map(t => `<td class="num">${L.filter(e => e.org === k && e.type === t).length}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>What the ledger proves</h2>
        <ul class="feed" style="margin-top:8px">
          ${[['Who agreed', 'A pseudonymous subject ID, never a name.'], ['To what', 'The exact purpose text shown at the time.'], ['When', 'A timestamp fixed inside the hash.'], ['Unaltered', 'Verify chain recomputes every hash locally.']].map(([a, b]) => `
            <li style="grid-template-columns:auto minmax(0,1fr)">
              ${ic('check')}
              <div>
                <b style="font-weight:500">${a}</b>
                <div class="t" style="white-space:normal">${b}</div>
              </div>
            </li>
          `).join('')}
        </ul>
      </section>
    </div>
  `;
}
