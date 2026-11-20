/**
 * User Profile Popover & Demo Role Switcher
 */
import { S, $, esc } from '../../core/state.js';
import { ROLES } from '../../core/constants.js';
import { ic } from '../icons.js';

export function closePop() {
  const p = $('#pop');
  if (p) {
    p.hidden = true;
    p.innerHTML = '';
  }
}

export function openUserMenu(btn) {
  const u = S.user;
  const r = btn.getBoundingClientRect();
  const p = $('#pop');
  if (!p || !u) return;
  p.className = 'pop';
  p.style.left = Math.max(12, Math.min(r.left, innerWidth - 312)) + 'px';
  p.style.bottom = (innerHeight - r.top + 8) + 'px';
  p.style.top = 'auto';
  p.innerHTML = `
    <div style="padding:10px">
      <b style="font-weight:500">${esc(u.name)}</b>
      <div style="color:var(--ink-2);font-size:13px">${esc(u.email)}</div>
    </div>
    <hr>
    <div class="lab">View as another role (demo)</div>
    ${S.users.filter(x => !x.added).slice(0, 5).map(x => `
      <button class="mi ${x.role === u.role ? 'sel' : ''}" data-act="as" data-email="${esc(x.email)}">
        ${ic(x.role === u.role ? 'check' : 'user')}
        <span>
          ${ROLES[x.role].n}
          <small style="display:block;color:var(--ink-2)">${esc(x.name)}</small>
        </span>
      </button>
    `).join('')}
    <hr>
    <button class="mi" data-act="theme">${ic('auto')}Theme: ${S.theme}</button>
    <button class="mi" data-act="logout">${ic('logout')}Sign out</button>
  `;
  p.hidden = false;
}
