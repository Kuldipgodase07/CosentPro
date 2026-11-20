/**
 * Citizen Activity View
 * Audit timeline of every consent event on this citizen's account
 */
import { S, SUBJ, fmt, esc } from '../../core/state.js';
import { ORGS } from '../../core/constants.js';

export function cActivity() {
  const rows = S.ledger.filter(e => e.subject === SUBJ).slice().reverse();
  const types = {
    GRANT: 'You granted',
    REVOKE: 'You revoked',
    NOTICE: 'Notice shown for',
    DECLINE: 'You declined',
    VERIFY: 'Checked for'
  };

  return `
    <div class="pagehead">
      <div>
        <h1>Activity</h1>
        <p>Every notice, grant and revoke on your account, newest first. Each has a receipt.</p>
      </div>
    </div>
    <section class="card">
      ${rows.length ? `
        <ul class="tl" style="display:flex;flex-direction:column;gap:12px;margin:0">
          ${rows.slice(0, 40).map(e => `
            <li class="${e.type === 'REVOKE' ? 'rev' : ''}" style="padding:10px 0;border-top:1px solid var(--line)">
              <b>${types[e.type] || e.type} · ${esc(e.purpose)}</b>
              <small style="display:block;color:var(--ink-2);margin-top:2px">${esc(ORGS[e.org]?.name || e.org)} · ${fmt(e.ts)} · <span class="mono">${esc(e.receipt)}</span></small>
            </li>
          `).join('')}
        </ul>
      ` : '<div class="empty">No activity yet.</div>'}
    </section>
  `;
}
