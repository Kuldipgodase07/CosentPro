/**
 * DPO Purposes Catalogue View
 * Purpose publishing & management with explicit data categories and retention periods
 */
import { S, n0, esc } from '../../core/state.js';
import { ic } from '../../components/icons.js';

export function oPurposes() {
  const orbit = S.purposes.filter(p => p.org === 'orbit');
  return `
    <div class="pagehead">
      <div>
        <h1>Purposes</h1>
        <p>Each purpose is a separate request with its own data list and retention. People see exactly this text.</p>
      </div>
    </div>
    <div class="grid g21">
      <section class="card">
        <h2>Catalogue</h2>
        <div class="scroll">
          <table class="tbl" style="margin-top:8px">
            <thead>
              <tr>
                <th>Purpose</th>
                <th>Data used</th>
                <th>Retention</th>
                <th>Consent rate</th>
                <th>People</th>
              </tr>
            </thead>
            <tbody>
              ${orbit.map(p => `
                <tr>
                  <td><b style="font-weight:500">${esc(p.name)}</b></td>
                  <td>${p.data.map(d => `<span class="tagx" style="margin:0 4px 4px 0">${esc(d)}</span>`).join('')}</td>
                  <td>${esc(p.ret)}</td>
                  <td class="num">${p.rate}%</td>
                  <td class="num">${n0(p.count)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>New purpose</h2>
        <div class="sub">Publish a request for people to review.</div>
        <form id="pform" style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
          <label class="f" for="pn">Name
            <input id="pn" type="text" required placeholder="e.g. Home-loan pre-approval">
          </label>
          <label class="f" for="pd">What people read
            <textarea id="pd" required placeholder="Plain words: what you do with the data and why."></textarea>
          </label>
          <label class="f" for="pc">Data used (comma separated)
            <input id="pc" type="text" required placeholder="PAN, Salary slips">
          </label>
          <label class="f" for="pr">Retention
            <select id="pr">
              <option>6 months</option>
              <option>12 months</option>
              <option>24 months</option>
              <option>Until the service ends</option>
            </select>
          </label>
          <button class="btn btn--p" type="submit">${ic('check')}Publish purpose</button>
        </form>
      </section>
    </div>
  `;
}
