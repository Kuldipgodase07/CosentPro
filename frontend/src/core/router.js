/**
 * Central Route Registry & RBAC Routing Engine
 * Maps view keys to titles, icons, required permissions, sections, and renderers.
 */
import { S, $ } from './state.js';
import { ROLES, ROLE_PERMS, PERMS, PUBLIC } from './constants.js';
import { ic } from '../components/icons.js';
import { toast } from '../components/ui/toast.js';
import { sidebar } from '../components/layout/sidebar.js';
import { topbar } from '../components/layout/topbar.js';
import { closePop } from '../components/ui/user-menu.js';

// View Renderers
import { landing, afterPublic } from '../views/public/landing.js';
import { authView } from '../views/public/auth.js';
import { cHome } from '../views/citizen/home.js';
import { cConsents } from '../views/citizen/consents.js';
import { cInbox } from '../views/citizen/inbox.js';
import { cAssistant } from '../views/citizen/assistant.js';
import { cRequests } from '../views/citizen/requests.js';
import { cActivity } from '../views/citizen/activity.js';

import { dpoDash } from '../views/dpo/dashboard.js';
import { oPurposes } from '../views/dpo/purposes.js';
import { oNotices } from '../views/dpo/notices.js';
import { oRequests } from '../views/dpo/requests.js';
import { oCompliance } from '../views/dpo/compliance.js';

import { devDash } from '../views/developer/dashboard.js';
import { oSdk } from '../views/developer/sdk.js';
import { oKeys } from '../views/developer/keys.js';
import { oTests } from '../views/developer/tests.js';

import { audDash } from '../views/auditor/dashboard.js';
import { aLedger } from '../views/auditor/ledger.js';
import { aReports } from '../views/auditor/reports.js';

import { adminDash } from '../views/admin/dashboard.js';
import { oTeam } from '../views/admin/team.js';
import { oSettings } from '../views/admin/settings.js';

import { oAI } from '../views/ai/ai-studio.js';
import { oPlatform } from '../views/platform/platform.js';

export const can = p => !!(S.user && ROLE_PERMS[S.user.role] && ROLE_PERMS[S.user.role].includes(p));

export const roleHome = () => S.user ? ROLES[S.user.role].home : 'home';

export const R = {
  'c-home':       { t: 'Home', i: 'home', p: 'own', s: 'My data', f: () => cHome() },
  'c-consents':   { t: 'My consents', i: 'list', p: 'own', s: 'My data', f: () => cConsents() },
  'c-inbox':      { t: 'Inbox', i: 'inbox', p: 'own', s: 'My data', f: () => cInbox() },
  'c-assistant':  { t: 'Assistant', i: 'chat', p: 'own', s: 'My data', f: () => cAssistant() },
  'c-requests':   { t: 'My rights', i: 'flag', p: 'own', s: 'My data', f: () => cRequests() },
  'c-activity':   { t: 'Activity', i: 'clock', p: 'own', s: 'My data', f: () => cActivity() },

  'o-dash':       { t: 'Dashboard', i: 'grid', p: 'dash', s: 'Operate', f: () => (({ dpo: dpoDash, admin: adminDash, dev: devDash, auditor: audDash })[S.user?.role] || dpoDash)() },
  'o-purposes':   { t: 'Purposes', i: 'tag', p: 'purposes', s: 'Operate', f: () => oPurposes() },
  'o-notices':    { t: 'Notices', i: 'mail', p: 'purposes', s: 'Operate', f: () => oNotices() },
  'o-requests':   { t: 'Rights requests', i: 'flag', p: 'requests', s: 'Operate', f: () => oRequests() },
  'o-ai':         { t: 'AI Studio', i: 'bolt', p: 'ai', s: 'Operate', f: () => oAI() },

  'o-sdk':        { t: 'SDK and sandbox', i: 'code', p: 'sdk', s: 'Build', f: () => oSdk() },
  'o-keys':       { t: 'API keys and webhooks', i: 'key', p: 'keys', s: 'Build', f: () => oKeys() },
  'o-tests':      { t: 'Interoperability', i: 'beaker', p: 'tests', s: 'Build', f: () => oTests(can) },
  'o-platform':   { t: 'Platform', i: 'globe', p: 'dash', s: 'Build', f: () => oPlatform() },

  'o-compliance': { t: 'Compliance', i: 'tasks', p: 'compliance', s: 'Assure', f: () => oCompliance() },
  'a-ledger':     { t: 'Audit ledger', i: 'ledger', p: 'ledger', s: 'Assure', f: () => aLedger() },
  'a-reports':    { t: 'Evidence reports', i: 'file', p: 'verify', s: 'Assure', f: () => aReports() },

  'o-team':       { t: 'Team and access', i: 'users', p: 'team', s: 'Administer', f: () => oTeam() },
  'o-settings':   { t: 'Settings', i: 'gear', p: 'settings', s: 'Administer', f: () => oSettings() }
};

export function denied(id) {
  const need = R[id].p;
  const who = Object.keys(ROLES).filter(k => ROLE_PERMS[k].includes(need)).map(k => ROLES[k].n);
  return `
    <div class="card denied" style="padding:48px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px">
      <div class="big" style="width:56px;height:56px;border-radius:50%;background:var(--surface-2);display:grid;place-items:center;color:var(--accent)">
        ${ic('lock')}
      </div>
      <h1 style="font-weight:300;font-size:30px">You do not have access to ${R[id].t}</h1>
      <p style="color:var(--ink-2);max-width:52ch">
        Your role, ${ROLES[S.user.role].n}, does not include “${PERMS[need]}”. This page is open to: ${who.join(', ')}. Ask a tenant admin to change your role.
      </p>
      <button class="btn btn--p" data-go="${roleHome()}">Go to my home</button>
    </div>
  `;
}

export function renderApp() {
  const id = S.route;
  const body = can(R[id].p) ? R[id].f() : denied(id);
  const root = $('#root');
  if (!root) return;
  root.innerHTML = `
    <div class="app ${S.rail ? 'rail' : ''} ${S.drawerOpen ? 'open' : ''}" id="app">
      ${sidebar(R, can)}
      <div class="content">
        ${topbar(R)}
        <div class="page">
          <main id="view" tabindex="-1">${body}</main>
        </div>
      </div>
    </div>
  `;
  const c = $('#chat');
  if (c) c.scrollTop = c.scrollHeight;
}

export function render() {
  closePop();
  const root = $('#root');
  if (!root) return;
  if (PUBLIC.includes(S.route)) {
    root.innerHTML = S.route === 'home' ? landing() : authView();
    afterPublic();
  } else {
    renderApp();
  }
  document.title = 'ConsentPro';
}

export function go(r) {
  if (!PUBLIC.includes(r) && !R[r]) r = S.user ? roleHome() : 'home';
  if (!PUBLIC.includes(r) && !S.user) {
    S.next = r;
    r = 'login';
  }
  if ((r === 'login' || r === 'signup') && S.user) r = roleHome();
  S.route = r;
  S.drawerOpen = false;
  if (location.hash !== '#' + r) {
    try {
      history.replaceState(null, '', '#' + r);
    } catch (e) {
      location.hash = r;
    }
  }
  render();
  window.scrollTo({ top: 0 });
}

export function login(u) {
  S.user = u;
  try {
    sessionStorage.setItem('cp-session', u.email);
  } catch (e) {}
  const nx = S.next;
  S.next = null;
  S.mfa = null;
  S.authErr = '';
  go(nx && R[nx] && can(R[nx].p) ? nx : roleHome());
  toast('Signed in as ' + ROLES[u.role].n);
}

export function logout() {
  S.user = null;
  S.mfa = null;
  try {
    sessionStorage.removeItem('cp-session');
  } catch (e) {}
  closePop();
  go('home');
  toast('Signed out');
}
