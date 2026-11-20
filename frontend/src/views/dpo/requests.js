/**
 * DPO Rights Requests Queue View
 * Central queue with SLA countdowns and workflow stage triggers
 */
import { S, daysLeft, esc } from '../../core/state.js';
import { ic } from '../../components/icons.js';
import { reqPill } from '../../components/ui/charts.js';

export function oRequests() {
  const f = S.rf || 'all';
  const all = S.requests;
  const rows = all.filter(r =>
    f === 'all' ||
    (f === 'open' && r.status === 'Open') ||
    (f === 'prog' && r.status === 'In progress') ||
    (f === 'done' && r.status === 'Resolved')
  ).sort((a, b) => b.ts - a.ts);
  const c = s => all.filter(r => r.status === s).length;

  return `
    <div class="pagehead">
      <div>
        <h1>Rights requests</h1>
        <p>Access, correction, erasure and grievances from people. Each has a due date.</p>
      </div>
    </div>
    <div class="grid g4">
      <div class="card stat"><div class="k">${ic('clock')}Open</div><div class="v num">${c('Open')}</div><div class="d">waiting to start</div></div>
      <div class="card stat"><div class="k">${ic('bolt')}In progress</div><div class="v num">${c('In progress')}</div><div class="d">being handled</div></div>
      <div class="card stat"><div class="k">${ic('check')}Resolved</div><div class="v num">${c('Resolved')}</div><div class="d">closed</div></div>
      <div class="card stat"><div class="k">${ic('alert')}Overdue</div><div class="v num">${all.filter(r => r.status !== 'Resolved' && r.due < Date.now()).length}</div><div class="d">past the 30-day target</div></div>
    </div>
    <div class="row" role="group" aria-label="Filter" style="margin:14px 0">
      ${[['all', 'All'], ['open', 'Open'], ['prog', 'In progress'], ['done', 'Resolved']].map(([k, l]) => `
        <button class="chip" aria-pressed="${f === k}" data-rf="${k}">${l}</button>
      `).join('')}
    </div>
    <section class="card" style="padding:8px 12px">
      <div class="scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>From</th>
              <th>Request</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td class="mono">${r.id}</td>
                <td>${r.type}</td>
                <td class="mono">${r.by}</td>
                <td style="min-width:220px">${esc(r.text)}</td>
                <td style="white-space:nowrap">${r.status === 'Resolved' ? '–' : daysLeft(r.due)}</td>
                <td>${reqPill(r.status)}</td>
                <td style="white-space:nowrap">
                  ${r.status === 'Open' ? `<button class="btn btn--sm btn--p" data-act="req" data-id="${r.id}" data-to="In progress">Start</button>` :
                    r.status === 'In progress' ? `<button class="btn btn--sm" data-act="req" data-id="${r.id}" data-to="Resolved">Resolve</button>` : ''}
                </td>
              </tr>
            `).join('') || '<tr><td colspan="7"><div class="empty">Nothing here.</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
