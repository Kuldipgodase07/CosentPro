/**
 * Tenant Admin Team & Access View
 * User management, team invitations, and full interactive RBAC Permission Matrix
 */
import { S, esc } from '../../core/state.js';
import { ROLES, ROLE_PERMS, PERMS } from '../../core/constants.js';
import { ic } from '../../components/icons.js';

export function oTeam() {
  const mem = S.users.filter(u => u.role !== 'principal');
  const roles = Object.keys(ROLES);

  return `
    <div class="pagehead">
      <div>
        <h1>Team and access</h1>
        <p>Who can do what. Changing a permission below takes effect immediately for that role.</p>
      </div>
    </div>
    <div class="grid g21">
      <section class="card" style="padding:8px 12px">
        <div class="scroll">
          <table class="tbl">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${mem.map(u => `
                <tr>
                  <td>
                    <b style="font-weight:500">${esc(u.name)}</b>
                    <div class="sub">${esc(u.email)}</div>
                  </td>
                  <td><span class="rolechip">${ROLES[u.role].n}</span></td>
                  <td>
                    ${u.status === 'Invited' ? `<span class="pill pill--pending">${ic('clock')}Invited</span>` : `<span class="pill pill--granted">${ic('check')}Active</span>`}
                  </td>
                  <td>${u.last}</td>
                  <td style="white-space:nowrap">
                    ${u.status === 'Invited' ? `<button class="btn btn--sm" data-act="accept" data-email="${esc(u.email)}">Simulate accept</button>` : ''}
                    ${u.email !== S.user.email ? ` <button class="btn btn--sm btn--r" data-act="rmuser" data-email="${esc(u.email)}">Remove</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Invite a member</h2>
        <form id="iform" style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
          <label class="f" for="in">Name
            <input id="in" type="text" required>
          </label>
          <label class="f" for="ie">Email
            <input id="ie" type="text" required>
          </label>
          <label class="f" for="ir">Role
            <select id="ir">
              ${['dpo', 'dev', 'auditor', 'admin'].map(r => `<option value="${r}">${ROLES[r].n}</option>`).join('')}
            </select>
          </label>
          <button class="btn btn--p" type="submit">${ic('mail')}Send invite</button>
        </form>
      </section>
    </div>

    <section class="card" style="padding:8px 12px;margin-top:16px">
      <div style="padding:12px 8px 0">
        <h2>Role permissions</h2>
        <div class="sub">The sidebar and every page check these. An admin always keeps team and settings access.</div>
      </div>
      <div class="scroll">
        <table class="tbl matrix" style="margin-top:8px">
          <thead>
            <tr>
              <th>Permission</th>
              ${roles.map(r => `<th>${ROLES[r].n}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${Object.entries(PERMS).map(([p, l]) => `
              <tr>
                <td>${l}</td>
                ${roles.map(r => {
                  const lock = (r === 'admin' && (p === 'team' || p === 'settings')) ||
                               (r === 'principal' && p === 'own') ||
                               (r !== 'principal' && p === 'own') ||
                               (r === 'principal' && p !== 'own');
                  return `
                    <td style="text-align:center">
                      <input type="checkbox"
                             aria-label="${ROLES[r].n}: ${l}"
                             data-perm="${p}"
                             data-prole="${r}"
                             ${ROLE_PERMS[r].includes(p) ? 'checked' : ''}
                             ${lock ? 'disabled' : ''}
                             style="width:18px;height:18px;accent-color:var(--accent)">
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
