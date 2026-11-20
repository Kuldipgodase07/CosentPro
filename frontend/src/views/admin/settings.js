/**
 * Tenant Admin Settings View
 * Organization profile, DPO contact publishing, mandatory 2FA, language preferences
 */
import { S, esc } from '../../core/state.js';
import { LANGS } from '../../core/constants.js';
import { ic } from '../../components/icons.js';

export function oSettings() {
  const s = S.settings;
  return `
    <div class="pagehead">
      <div>
        <h1>Settings</h1>
        <p>Workspace details shown on notices, and how people sign in.</p>
      </div>
    </div>
    <div class="grid g2">
      <section class="card">
        <h2>Organisation</h2>
        <form id="sform" style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
          <label class="f" for="tn">Organisation name
            <input id="tn" type="text" value="${esc(S.tenant.name)}">
          </label>
          <label class="f" for="td">Data Protection Officer
            <input id="td" type="text" value="${esc(s.dpo)}" placeholder="Name">
          </label>
          <label class="f" for="tm">DPO contact email
            <input id="tm" type="text" value="${esc(s.dpoMail)}" placeholder="dpo@yourcompany.example">
          </label>
          <label class="f" for="tr">Default retention
            <select id="tr">
              ${['6 months', '12 months', '24 months'].map(x => `<option ${s.retention === x ? 'selected' : ''}>${x}</option>`).join('')}
            </select>
          </label>
          <label class="f" for="tg">Data region
            <select id="tg">
              ${['Mumbai', 'Delhi'].map(x => `<option ${s.region === x ? 'selected' : ''}>${x}</option>`).join('')}
            </select>
          </label>
          <button class="btn btn--p" type="submit">${ic('check')}Save changes</button>
        </form>
      </section>

      <section class="card">
        <h2>Security and languages</h2>
        <div style="display:flex;flex-direction:column;gap:18px;margin-top:14px">
          <div class="row" style="justify-content:space-between;flex-wrap:nowrap">
            <div>
              <b style="font-weight:500">Require two-step sign-in</b>
              <div class="sub">For DPO, developer, auditor and admin roles.</div>
            </div>
            <button class="sw dk" role="switch" aria-checked="${s.mfa}" aria-label="Require two-step sign-in" data-act="setmfa"></button>
          </div>
          <label class="f" for="to">Session timeout
            <select id="to" data-set="timeout">
              ${['15', '30', '60'].map(x => `<option value="${x}" ${s.timeout === x ? 'selected' : ''}>${x} minutes</option>`).join('')}
            </select>
          </label>
          <div>
            <b style="font-weight:500">Notice languages</b>
            <div class="row" style="margin-top:8px">
              ${LANGS.map(l => `
                <button class="chip" aria-pressed="${s.langs.includes(l[0])}" data-act="lang" data-l="${l[0]}">${l[1]}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
