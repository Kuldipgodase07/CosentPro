/**
 * Auditor Audit Ledger View
 * Full cryptographic verification, intentional tamper simulation, search & event filtering
 */
import { S, esc } from '../../core/state.js';
import { ic } from '../../components/icons.js';
import { vBanner, ledgerRows } from '../../services/ledger.js';

export function aLedger() {
  return `
    <div class="pagehead">
      <div>
        <h1>Audit ledger</h1>
        <p>Append-only. Each entry stores the SHA-256 hash of the one before it, so any edit breaks every hash after it.</p>
      </div>
      <span class="spacer"></span>
      <span class="live"><i></i>${S.ledger.length} entries</span>
    </div>
    <div class="row">
      <button class="btn btn--p" data-act="verify">${ic('shield')}Verify chain</button>
      <button class="btn" data-act="tamper">${ic('alert')}${S.tamper ? 'Restore entry' : 'Tamper test'}</button>
      <span class="spacer" style="flex:1"></span>
      <label class="sr" for="q">Search</label>
      <div style="position:relative;min-width:220px">
        <input id="q" type="search" placeholder="Search receipt, subject, purpose" value="${esc(S.q)}" style="width:100%;padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface)">
      </div>
      <label class="sr" for="ft">Event type</label>
      <select id="ft" style="width:auto;padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface)">
        ${['all', 'GRANT', 'REVOKE', 'VERIFY', 'NOTICE', 'DECLINE'].map(t => `
          <option value="${t}" ${S.ftype === t ? 'selected' : ''}>${t === 'all' ? 'All events' : t[0] + t.slice(1).toLowerCase()}</option>
        `).join('')}
      </select>
    </div>
    <div id="vbanner" style="margin:14px 0">${vBanner()}</div>
    <section class="card" style="padding:8px 12px">
      <div class="scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Time</th>
              <th>Event</th>
              <th>Organisation</th>
              <th>Purpose</th>
              <th>Subject</th>
              <th>Receipt</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody id="lbody">${ledgerRows()}</tbody>
        </table>
      </div>
    </section>
  `;
}
