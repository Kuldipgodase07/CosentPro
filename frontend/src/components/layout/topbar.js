/**
 * Application Top Bar Component
 */
import { S, esc } from '../../core/state.js';
import { ic } from '../icons.js';

export function topbar(routes) {
  const r = routes[S.route] || { s: 'Dashboard', t: 'Overview' };
  const un = S.notifs.filter(n => n.un && n.to.includes(S.user.role)).length;

  return `
    <header class="tb">
      <button class="iconbtn menubtn" data-act="drawer" aria-label="Open menu">
        ${ic('menu')}
      </button>
      <div class="crumb">
        <span class="hide-m">${S.user.role === 'principal' ? 'My account' : esc(S.tenant.name)}</span>
        <span class="hide-m">${ic('chev')}</span>
        <span class="hide-m">${r.s}</span>
        <span class="hide-m">${ic('chev')}</span>
        <b>${r.t}</b>
      </div>
      <span class="spacer" style="flex:1"></span>
      <button class="cmdbtn" data-act="cmd">
        ${ic('search')}
        <span>Search or jump to…</span>
        <kbd>Ctrl K</kbd>
      </button>
      <button class="iconbtn dot" data-act="notifs" aria-label="Notifications">
        ${ic('bell')}
        ${un ? '<i></i>' : ''}
      </button>
      <button class="iconbtn" data-act="theme" aria-label="Change theme" title="Theme: ${S.theme}">
        ${ic(S.theme === 'dark' ? 'moon' : S.theme === 'light' ? 'sun' : 'auto')}
      </button>
    </header>
  `;
}
