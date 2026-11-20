/**
 * DPO Dashboard View
 * Features compliance command centre, DPDP enforcement milestones, obligations map,
 * statutory penalty ceilings, consent conversion funnel, and rights SLA tracker.
 */
import { S, n0, score, daysTo, greet, csState, esc } from '../../core/state.js';
import { CEIL } from '../../core/constants.js';
import { ic } from '../../components/icons.js';
import { ring, kpi, series, chartSVG, liveFeedHTML, secTag, stPill } from '../../components/ui/charts.js';

export function banner(o) {
  return `
    <section class="dbanner">
      <div>
        <div class="chips">
          ${o.chips.map(c => `<span class="tg">${ic(c[0])}${c[1]}</span>`).join('')}
        </div>
        <h1>${o.h}</h1>
        <p>${o.p}</p>
        <div class="acts">
          ${o.acts.map(a => `<button class="btn ${a[3] || 'btn--r'}" ${a[2]}>${a[0]}${a[1] ? '' : ''}</button>`).join('')}
        </div>
      </div>
      <div class="gl">${o.side}</div>
    </section>
  `;
}

export function milestones() {
  const m = [
    ['14 Nov 2025', 'Rules notified', 'Data Protection Board constituted', new Date(2025, 10, 14)],
    ['14 Nov 2026', 'Consent Manager rules apply', 'Registration with the Board opens', new Date(2026, 10, 14)],
    ['14 May 2027', 'Main duties apply', 'Notice, consent, security, breach, rights', new Date(2027, 4, 14)]
  ];
  return `
    <div class="mile">
      ${m.map(x => `
        <div class="m ${x[3] <= Date.now() ? 'past' : ''}">
          <b>${x[0]}</b>
          <small>${x[1]}</small><br>
          <small>${x[2]}</small>
        </div>
      `).join('')}
    </div>
  `;
}

export function obligations() {
  const overdue = S.requests.filter(r => r.status !== 'Resolved' && r.due < Date.now()).length;
  return [
    ['s.5', 'Notice to Data Principals', 'Itemised notice with purposes, rights and complaint route.', csState('k3'), 'o-notices'],
    ['s.6', 'Free, specific, informed consent', 'Purpose-bound requests. Nothing pre-ticked or bundled.', csState('k1'), 'o-purposes'],
    ['s.6(4)', 'Withdrawal as easy as giving', 'One tap or one spoken sentence. ' + S.stats.prop.toFixed(1) + ' s to reach systems.', csState('k2'), 'o-purposes'],
    ['s.8(5)', 'Reasonable security safeguards', 'Encryption, role-based access, key rotation, tamper-evident log.', S.settings.mfa ? 'done' : 'partial', 'o-team'],
    ['s.8(6)', 'Personal data breach intimation', 'Tell the Board and affected people. Detailed report within 72 hours.', csState('k6'), 'o-compliance'],
    ['s.8(7)', 'Erase data once consent is withdrawn', 'Retention timers and erasure jobs per purpose.', 'partial', 'o-compliance'],
    ['s.9', 'Children’s data', 'Verifiable consent of a parent or guardian under 18.', csState('k5'), 'o-compliance'],
    ['s.10', 'Significant Data Fiduciary duties', 'India-based DPO, independent data auditor, impact assessment. Applies only if notified.', 'gap', 'o-compliance'],
    ['s.11–14', 'Rights of Data Principals', overdue ? overdue + ' request overdue.' : 'Access, correction, erasure, grievance and nominee, answered on time.', overdue ? 'partial' : 'done', 'o-requests']
  ];
}

export function obligationsCard() {
  const O = obligations(), done = O.filter(o => o[3] === 'done').length;
  return `
    <section class="card">
      <div class="panelh">
        <div>
          <h2>DPDP Act obligations</h2>
          <div class="sub">${done} of ${O.length} ready. Select one to fix it.</div>
        </div>
        <span class="spacer"></span>
        <div class="legend2">
          <span><i style="background:var(--accent)"></i>Ready</span>
          <span><i style="background:var(--accent-soft);box-shadow:inset 0 0 0 1px var(--accent)"></i>Partly</span>
          <span><i style="background:var(--hi)"></i>Gap</span>
        </div>
      </div>
      <div class="obls">
        ${O.map(o => `
          <button class="obl" data-go="${o[4]}">
            <div class="top">${secTag(o[0])}${stPill(o[3])}</div>
            <b>${o[1]}</b>
            <small>${o[2]}</small>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

export function penaltyCard() {
  const gaps = obligations().filter(o => o[3] !== 'done' && CEIL[o[0]]);
  return `
    <section class="card">
      <h2>Penalty exposure</h2>
      <div class="sub">Maximum ceilings in the Act’s Schedule for each open item. They are limits, not predictions. The Board decides actual amounts.</div>
      <div style="margin-top:8px">
        ${gaps.map(g => `
          <div class="statrow">
            <div>
              <b style="font-weight:500">${g[1]}</b>
              <div class="sub">${secTag(g[0]).replace('margin-left:auto', '')} ${g[3] === 'gap' ? 'Gap' : 'Partly ready'}</div>
            </div>
            <b class="num" style="font-weight:500;font-size:17px">up to ${CEIL[g[0]]}</b>
          </div>
        `).join('') || '<div class="empty">No open items carry a penalty ceiling.</div>'}
      </div>
    </section>
  `;
}

export function funnelCard() {
  const f = [['Notices shown', 18420], ['Notices opened', 14370], ['Choice made', 11790], ['Consent granted', 9580]];
  return `
    <section class="card">
      <h2>Consent funnel</h2>
      <div class="sub">Last 30 days · sample data. A grant requires an explicit choice.</div>
      <div style="margin-top:10px">
        ${f.map(r => `
          <div class="frow">
            <span>${r[0]}</span>
            <div class="bar"><i style="width:${r[1] / f[0][1] * 100}%"></i></div>
            <span class="n num">${n0(r[1])}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

export function slaCard() {
  const types = ['Access', 'Correction', 'Erasure', 'Grievance'], rs = S.requests;
  return `
    <section class="card">
      <div class="panelh">
        <div>
          <h2>Rights requests</h2>
          <div class="sub">30-day internal target ${secTag('s.11–14')}</div>
        </div>
      </div>
      ${types.map(t => {
        const a = rs.filter(r => r.type === t), o = a.filter(r => r.status !== 'Resolved').length;
        return `
          <div class="frow">
            <span>${t}</span>
            <div class="bar"><i style="width:${a.length ? (a.length - o) / a.length * 100 : 100}%"></i></div>
            <span class="n num">${o} open</span>
          </div>
        `;
      }).join('')}
      <button class="btn btn--sm" style="margin-top:10px" data-go="o-requests">Open queue</button>
    </section>
  `;
}

export function dpoDash() {
  const st = S.stats, orbit = S.purposes.filter(p => p.org === 'orbit'), sc = score(), openR = S.requests.filter(r => r.status !== 'Resolved').length;
  const side = `
    <div class="ringlab">${ring(sc, 120, 11)}<div>DPDP readiness</div></div>
    <div style="text-align:right">
      <div style="font-size:44px;font-weight:200;line-height:1">${daysTo(2027, 5, 14)}</div>
      <div class="ringlab" style="text-align:right">days to 14 May 2027<br>main duties apply</div>
    </div>
  `;

  return banner({
    chips: [['shield', 'Data Fiduciary'], ['building', esc(S.tenant.name)], ['globe', 'India data residency']],
    h: `${greet()}, ${esc(S.user.name.split(' ')[0])}`,
    p: `${openR} rights request${openR === 1 ? '' : 's'} open and ${obligations().filter(o => o[3] !== 'done').length} obligations to close before the main duties apply.`,
    acts: [['Review requests', 0, 'data-go="o-requests"'], ['Copy board summary', 0, 'data-act="board"', 'ghost']],
    side
  }) + `
    <div class="grid g6">
      ${kpi({ i: 'check', k: 'Active consents', v: `<span id="k-active">${n0(st.active)}</span>`, d: `across ${orbit.length} purposes`, s: series(14, 120, 6, 3), sec: 's.6' })}
      ${kpi({ i: 'bolt', k: 'Grants today', v: `<span id="k-grants">${n0(st.grants)}</span>`, d: 'explicit, purpose-bound', s: series(14, 3200, 380, 7) })}
      ${kpi({ i: 'x', k: 'Revocations today', v: `<span id="k-rev">${n0(st.revokes)}</span>`, d: `${(st.revokes / st.grants * 100).toFixed(1)}% of grants`, s: series(14, 180, 30, 11), sec: 's.6(4)' })}
      ${kpi({ i: 'clock', k: 'Revocation reaches systems', v: `<span id="k-prop">${st.prop.toFixed(1)}</span>`, u: 's avg', d: 'target under 5 s', s: series(14, 22, 5, 5) })}
      ${kpi({ i: 'flag', k: 'Rights requests open', v: openR, d: `${S.requests.filter(r => r.status !== 'Resolved' && r.due < Date.now()).length} overdue`, sec: 's.11–14' })}
      ${kpi({ i: 'star', k: 'User satisfaction', v: '4.6', u: '/ 5', d: '1,284 prompts (sample)', s: series(14, 44, 2, 9) })}
    </div>
    ${obligationsCard()}
    <div class="grid g21">${funnelCard()}${slaCard()}</div>
    <div class="grid g21">
      <section class="card">
        <div class="panelh">
          <div>
            <h2>Grants and revocations, 14 days</h2>
            <div class="sub">Revocations are scaled ×8 to share the axis.</div>
          </div>
          <span class="spacer"></span>
          <div class="legend"><span><i></i>Grants</span><span><i class="b"></i>Revocations ×8</span></div>
        </div>
        ${chartSVG()}
      </section>
      <section class="card">
        <div class="panelh">
          <h2>Live events</h2>
          <span class="spacer"></span>
          <span class="live"><i></i>streaming</span>
        </div>
        <ul class="feed" id="livefeed">${liveFeedHTML()}</ul>
      </section>
    </div>
    <div class="grid g21">
      ${penaltyCard()}
      <section class="card">
        <h2>Timeline to enforcement</h2>
        <div class="sub">Dates from the DPDP Rules, 2025.</div>
        ${milestones()}
        <p class="sub" style="margin-top:14px">Consent Manager registration is open. The main duties apply 18 months after the Rules were notified.</p>
        <div id="k-ledger" hidden>${S.ledger.length}</div>
      </section>
    </div>
  `;
}
