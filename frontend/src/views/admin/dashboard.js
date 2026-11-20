/**
 * Tenant Admin Dashboard View
 * Security posture checks, plan limits, onboarding checklist, team metrics
 */
import { S, n0, score, greet, initialsOf, esc } from '../../core/state.js';
import { ic } from '../../components/icons.js';
import { ring, kpi, series, secTag } from '../../components/ui/charts.js';
import { banner, obligationsCard, slaCard } from '../dpo/dashboard.js';

export function onboarding() {
  const items = [
    ['Add your DPO contact', !!S.settings.dpo, 'o-settings'],
    ['Publish your first purpose', S.purposes.some(p => p.org === 'orbit' && p.id[0] === 'n'), 'o-purposes'],
    ['Create an API key', S.keys.length > 0, 'o-keys'],
    ['Verify the audit chain', !!(S.verified && S.verified.ok), 'a-ledger']
  ];
  const done = items.filter(i => i[1]).length;
  if (done === items.length) return '';
  return `
    <section class="card">
      <div class="row" style="justify-content:space-between">
        <div>
          <h2>Set up ${esc(S.tenant.name)}</h2>
          <div class="sub">${done} of ${items.length} done</div>
        </div>
        <div class="bar" style="width:min(220px,100%)">
          <i style="width:${done / items.length * 100}%"></i>
        </div>
      </div>
      <div class="grid g4" style="margin-top:14px">
        ${items.map(i => `
          <button class="btn" data-go="${i[2]}" style="justify-content:flex-start;${i[1] ? 'opacity:.6' : ''}">
            ${ic(i[1] ? 'check' : 'chev')}
            <span style="${i[1] ? 'text-decoration:line-through' : ''}">${i[0]}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

export function adminDash() {
  const used = 318400, cap = 500000;
  const u = S.users.filter(x => x.role !== 'principal');
  const sc = score();
  const sec = [
    ['Two-step sign-in required', S.settings.mfa],
    ['No unused API keys older than 30 days', !S.keys.some(k => k.status === 'active' && Date.now() - k.created > 30 * 864e5 && k.last === 'never')],
    ['Roles follow least privilege', true],
    ['Single sign-on (SSO)', false],
    ['Webhook endpoints use HTTPS', S.hooks.every(h => h.url.startsWith('https://'))]
  ];
  const side = `
    <div class="ringlab">
      ${ring(sc, 120, 11)}
      <div>DPDP readiness</div>
    </div>
  `;

  return banner({
    chips: [['building', esc(S.tenant.name)], ['shield', esc(S.tenant.plan) + ' plan'], ['globe', esc(S.settings.region) + ' region']],
    h: `${greet()}, ${esc(S.user.name.split(' ')[0])}`,
    p: 'Your workspace at a glance: people, security, usage and compliance.',
    acts: [['Invite a member', 0, 'data-go="o-team"'], ['Create API key', 0, 'data-go="o-keys"', 'ghost'], ['Settings', 0, 'data-go="o-settings"', 'ghost']],
    side
  }) + (S.newTenant ? onboarding() : '') + `
    <div class="grid g6">
      ${kpi({ i: 'users', k: 'Team members', v: u.length, d: `${u.filter(x => x.status === 'Invited').length} invited` })}
      ${kpi({ i: 'key', k: 'Active API keys', v: S.keys.filter(k => k.status === 'active').length, d: 'rotate every 90 days' })}
      ${kpi({ i: 'bolt', k: 'Consent events this month', v: n0(used), d: `${Math.round(used / cap * 100)}% of ${n0(cap)} included`, s: series(14, 9000, 2500, 13) })}
      ${kpi({ i: 'check', k: 'Active consents', v: `<span id="k-active">${n0(S.stats.active)}</span>`, d: 'across your purposes' })}
      ${kpi({ i: 'tasks', k: 'Audit readiness', v: sc, u: '%', d: 'DPDP obligations closed' })}
      ${kpi({ i: 'clock', k: 'Uptime, 90 days', v: '99.98', u: '%', d: 'target 99.9%' })}
    </div>
    <div class="grid g21">
      <section class="card">
        <h2>Security posture</h2>
        <div class="sub">Checks that protect the workspace ${secTag('s.8(5)')}</div>
        <div style="margin-top:8px">
          ${sec.map(s => `
            <div class="statrow">
              <span>${s[0]}</span>
              ${s[1] ? `<span class="pill pill--granted">${ic('check')}Pass</span>` : `<span class="pill pill--pending">${ic('alert')}Action</span>`}
            </div>
          `).join('')}
        </div>
      </section>
      <section class="card">
        <h2>Plan usage</h2>
        <div class="sub">${esc(S.tenant.plan)} plan · resets on the 1st</div>
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:16px">
          <div>
            <div class="row" style="justify-content:space-between">
              <span>Consent events</span>
              <b class="num" style="font-weight:500">${n0(used)} / ${n0(cap)}</b>
            </div>
            <div class="bar" style="margin-top:6px"><i style="width:${used / cap * 100}%"></i></div>
          </div>
          <div>
            <div class="row" style="justify-content:space-between">
              <span>Team seats</span>
              <b class="num" style="font-weight:500">${u.length} / 10</b>
            </div>
            <div class="bar" style="margin-top:6px"><i style="width:${u.length * 10}%"></i></div>
          </div>
          <div>
            <div class="row" style="justify-content:space-between">
              <span>Languages</span>
              <b class="num" style="font-weight:500">${S.settings.langs.length} / 22</b>
            </div>
            <div class="bar" style="margin-top:6px"><i style="width:${S.settings.langs.length / 22 * 100}%"></i></div>
          </div>
        </div>
      </section>
    </div>
    ${obligationsCard()}
    <div class="grid g21">
      <section class="card">
        <h2>Recent team activity</h2>
        <ul class="feed" style="margin-top:6px">
          ${[['Meera Nair', 'answered request RQ-1038', '12 min ago'], ['Kabir Shah', 'created API key Mobile app (Android)', '1 h ago'], ['Rhea D’Souza', 'verified the audit chain', '2 d ago'], ['Neha Kapoor', 'changed the DPO contact', '3 d ago']].map(a => `
            <li style="grid-template-columns:auto minmax(0,1fr) auto">
              <span class="av" style="width:34px;height:34px;border-radius:50%;font-size:12px">${initialsOf(a[0])}</span>
              <div><b style="font-weight:500">${a[0]}</b> ${a[1]}</div>
              <span class="t">${a[2]}</span>
            </li>
          `).join('')}
        </ul>
      </section>
      ${slaCard()}
    </div>
    <div id="k-ledger" hidden>${S.ledger.length}</div>
  `;
}
