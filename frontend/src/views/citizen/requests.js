/**
 * Citizen Rights Requests View
 * Exercising DPDP rights: access, erasure, correction, grievance, nominee
 */
import { S, SUBJ, fmtD, daysLeft, esc } from '../../core/state.js';
import { RTYPES } from '../../core/constants.js';
import { ic } from '../../components/icons.js';
import { reqPill } from '../../components/ui/charts.js';

export function cRequests() {
  const mine = S.requests.filter(r => r.by === SUBJ);
  return `
    <div class="pagehead">
      <div>
        <h1>My rights</h1>
        <p>Ask for a copy of your data, a correction, deletion or a complaint. The organisation has 30 days to answer.</p>
      </div>
    </div>
    <div class="grid g21">
      <section class="card">
        <h2>Your requests</h2>
        ${mine.length ? `
          <ul class="feed" style="margin-top:8px">
            ${mine.map(r => `
              <li style="grid-template-columns:minmax(0,1fr) auto">
                <div>
                  <b style="font-weight:500">${RTYPES[r.type]}</b>
                  <div class="t" style="white-space:normal">${r.id} · ${esc(r.text)}</div>
                  <div class="t">Sent ${fmtD(r.ts)} · ${daysLeft(r.due)}</div>
                </div>
                ${reqPill(r.status)}
              </li>
            `).join('')}
          </ul>
        ` : `<div class="empty">No requests yet. Use the form to send your first one.</div>`}
      </section>

      <section class="card">
        <h2>New request</h2>
        <form id="rform" style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
          <label class="f" for="rt">What do you need?
            <select id="rt">
              ${Object.entries(RTYPES).map(([k, v]) => `<option value="${k}" ${S.rtype === k ? "selected" : ""}>${v}</option>`).join('')}
            </select>
          </label>
          <label class="f" for="rd">Details
            <textarea id="rd" required placeholder="Tell them what you need, in your own words."></textarea>
          </label>
          <button class="btn btn--p" type="submit">${ic('send')}Send request</button>
        </form>
      </section>
    </div>
  `;
}
