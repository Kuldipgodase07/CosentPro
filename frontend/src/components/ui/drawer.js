/**
 * Notification Drawer Component
 */
import { S, $, ago, esc } from '../../core/state.js';
import { ic } from '../icons.js';

export function openNotifs(renderCallback) {
  const d = $('#drawer');
  if (!d) return;
  const list = S.notifs.filter(n => n.to.includes(S.user.role));
  d.hidden = false;
  d.innerHTML = `
    <div class="row" style="justify-content:space-between;margin-bottom:8px">
      <h2 style="font-size:20px;font-weight:400">Notifications</h2>
      <button class="btn btn--sm" data-act="closedrawer">Close</button>
    </div>
    <button class="btn btn--sm" data-act="readall">Mark all read</button>
    ${list.map(n => `
      <div class="nitem ${n.un ? 'un' : ''}" style="display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--line);align-items:flex-start">
        <span class="av" style="width:34px;height:34px;border-radius:50%;font-size:12px">${ic('bell')}</span>
        <div>
          <b>${esc(n.t)}</b>
          <div style="color:var(--ink-2);font-size:12.5px;margin-top:2px">${ago(n.ts)}</div>
        </div>
      </div>
    `).join('') || '<div class="empty">You are all caught up.</div>'}
  `;
  list.forEach(n => n.un = false);
}

export function closeDrawer() {
  const d = $('#drawer');
  if (d) d.hidden = true;
}
