/**
 * Application Sidebar Navigation Component
 */
import { S, initialsOf, esc } from '../../core/state.js';
import { ROLES, SECTIONS } from '../../core/constants.js';
import { ic, LOGO } from '../icons.js';

export function badgeFor(id) {
  if (id === 'c-inbox') return S.purposes.filter(p => p.status === 'pending').length;
  if (id === 'o-requests') return S.requests.filter(r => r.status !== 'Resolved').length;
  return 0;
}

export function sidebar(routes, canFn) {
  const u = S.user;
  if (!u) return '';
  const isP = u.role === 'principal';
  const items = Object.entries(routes).filter(([, r]) => canFn(r.p));

  const nav = SECTIONS.map(sec => {
    const xs = items.filter(([, r]) => r.s === sec);
    return xs.length ? `
      <div class="secl">${sec}</div>
      ${xs.map(([id, r]) => {
        const b = badgeFor(id);
        return `
          <button class="nav" data-go="${id}" title="${r.t}" ${S.route === id ? 'aria-current="page"' : ''}>
            ${ic(r.i)}
            <span>${r.t}</span>
            ${b ? `<span class="badge">${b}</span>` : ''}
          </button>
        `;
      }).join('')}
    ` : '';
  }).join('');

  return `
    <aside class="sb" aria-label="Main navigation">
      <div class="sb-top">
        <a class="brand" href="#" data-go="home" aria-label="ConsentPro">
          ${LOGO}
          <span>ConsentPro</span>
        </a>
        <button class="iconbtn hide-m" data-act="rail" aria-label="Collapse sidebar" title="Collapse sidebar" style="width:34px;height:34px">
          ${ic('panel')}
        </button>
      </div>

      <div class="tenant">
        <span class="av" style="width:36px;height:36px;border-radius:11px;font-size:13px">
          ${isP ? initialsOf(u.name) : initialsOf(S.tenant.name)}
        </span>
        <div>
          <b>${isP ? 'Personal account' : esc(S.tenant.name)}</b>
          <small>${isP ? 'Data principal' : esc(S.tenant.plan) + ' plan · ' + esc(S.settings.region)}</small>
        </div>
      </div>

      <nav class="sbnav">${nav}</nav>

      <div class="sb-foot">
        <div class="sys">
          <i></i>
          <span>All systems operational</span>
        </div>
        <button class="ucard" data-act="umenu" aria-haspopup="menu">
          <span class="av" style="width:34px;height:34px;border-radius:50%;font-size:12px">${initialsOf(u.name)}</span>
          <div>
            <b>${esc(u.name)}</b>
            <span class="rolechip">${ROLES[u.role].n}</span>
          </div>
          ${ic('chev')}
        </button>
      </div>
    </aside>
  `;
}
