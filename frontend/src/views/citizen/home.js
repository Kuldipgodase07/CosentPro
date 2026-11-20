/**
 * Citizen (Data Principal) Home View
 * Features DPDP banner, rights shortcuts, data holding matrix, and attention list
 */
import { S, SUBJ, stat, fmtD, ago, greet, initials, esc } from '../../core/state.js';
import { ORGS } from '../../core/constants.js';
import { ic } from '../../components/icons.js';
import { ring, donut, typePill, secTag } from '../../components/ui/charts.js';

export const CATS = [
  ['Contact', /name|contact|phone|address/i],
  ['Financial', /bank|income|utility|transaction|spend|purchase history/i],
  ['Health', /diagnosis|lab|appointment|age/i],
  ['Device and usage', /device|browsing|usage|cell|signal|purchase events/i]
];

export function cHome() {
  const all = S.purposes;
  const pend = all.filter(p => p.status === 'pending');
  const exp = all.filter(p => stat(p) === 'expired');
  const soon = all.filter(p => stat(p) === 'granted' && p.exp && p.exp - Date.now() < 30 * 864e5);
  const act = all.filter(p => stat(p) === 'granted');
  const score2 = Math.round((all.length - pend.length - exp.length) / all.length * 100);
  const attn = pend.length + exp.length + soon.length;
  const mine = S.ledger.filter(e => e.subject === SUBJ && e.type !== 'NOTICE').slice(-4).reverse();
  const parts = [
    { l: 'Active', v: act.length, c: 'var(--accent)' },
    { l: 'Awaiting you', v: pend.length, c: 'var(--c-lilac)' },
    { l: 'Revoked', v: all.filter(p => p.status === 'revoked').length, c: 'var(--hi)' },
    { l: 'Expired', v: exp.length, c: 'var(--ink-2)' }
  ];
  const rights = [
    ['Know what is held', 'Ask for a summary of your data and who has it.', 'Access', 's.11', 'eye'],
    ['Correct or erase', 'Fix wrong data or ask for it to be deleted.', 'Erasure', 's.12', 'refresh'],
    ['Raise a complaint', 'Tell the organisation what went wrong.', 'Grievance', 's.13', 'flag'],
    ['Nominate someone', 'Choose who can act for you if you cannot.', 'Nominee', 's.14', 'users']
  ];
  const orgs = Object.keys(ORGS);

  return `
    <section class="dbanner">
      <div>
        <div class="chips">
          <span class="tg">${ic('shield')}Protected by the DPDP Act, 2023</span>
          <span class="tg">${ic('user')}Data Principal</span>
        </div>
        <h1>${greet()}, ${esc(S.user.name.split(' ')[0])}</h1>
        <p>${new Set(act.map(p => p.org)).size} organisations can use your data for ${act.length} purposes. ${attn ? attn + ' item' + (attn > 1 ? 's' : '') + ' need a look.' : 'Everything is up to date.'}</p>
        <div class="acts">
          <button class="btn btn--r" data-go="c-consents">Review my consents</button>
          ${pend.length ? `<button class="btn btn--ghost" data-go="c-inbox">Open inbox (${pend.length})</button>` : ''}
        </div>
      </div>
      <div class="gl">
        <div class="ringlab">${ring(score2, 120, 11)}<div>Review score</div></div>
      </div>
    </section>

    <section>
      <div class="panelh">
        <div>
          <h2 style="font-size:18px;font-weight:600">Your rights</h2>
          <div class="sub">Under the Act you can do all of this, free of charge.</div>
        </div>
      </div>
      <div class="grid g4" style="margin-top:8px">
        ${rights.map(r => `
          <button class="rt" data-act="goreq" data-t="${r[2]}">
            <span class="tile">${ic(r[4])}</span>
            <b>${r[0]}</b>
            <small>${r[1]}</small>
            <span class="sec" style="margin-left:0;align-self:flex-start">${r[3]}</span>
          </button>
        `).join('')}
      </div>
    </section>

    <div class="grid g21">
      <section class="card">
        <h2>Who holds what</h2>
        <div class="sub">Data types each organisation can use today, based on your active consents.</div>
        <div class="scroll">
          <table class="tbl dmap" style="margin-top:8px">
            <thead>
              <tr>
                <th>Organisation</th>
                ${CATS.map(c => `<th>${c[0]}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${orgs.map(k => `
                <tr>
                  <td><b style="font-weight:500">${ORGS[k].name}</b></td>
                  ${CATS.map(c => {
                    const on = act.some(p => p.org === k && p.data.some(d => c[1].test(d)));
                    return `<td><span class="dd ${on ? '' : 'off'}" role="img" aria-label="${on ? 'Yes' : 'No'}"></span></td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Your consents</h2>
        <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-top:10px">
          ${donut(parts, 132, 20, all.length)}
          <div class="legend2" style="flex-direction:column;gap:8px">
            ${parts.map(p => `<span><i style="background:${p.c}"></i>${p.l} <b class="num" style="color:var(--ink)">${p.v}</b></span>`).join('')}
          </div>
        </div>
      </section>
    </div>

    <div class="grid g21">
      <section class="card">
        <h2>Needs your attention</h2>
        <div class="sub">Nothing changes until you decide.</div>
        <ul class="feed" style="margin-top:8px">
          ${[...pend.map(p => [p, 'New request']), ...exp.map(p => [p, 'Expired']), ...soon.map(p => [p, 'Expires ' + fmtD(p.exp)])].map(([p, t]) => `
            <li>
              <span class="av" style="width:34px;height:34px;font-size:12px;border-radius:10px">${initials(ORGS[p.org].name)}</span>
              <div>
                <b style="font-weight:500">${esc(p.name)}</b>
                <div class="t" style="white-space:normal">${esc(ORGS[p.org].name)} · ${t}</div>
              </div>
              <button class="btn btn--sm btn--p" data-act="ask" data-id="${p.id}" data-do="grant">${t === 'New request' ? 'Review' : 'Renew'}</button>
            </li>
          `).join('') || `<li><div class="empty" style="grid-column:1/-1">All clear. We will tell you when an organisation asks for something new.</div></li>`}
        </ul>
      </section>

      <section class="card">
        <h2>Latest on your account</h2>
        <ul class="feed" style="margin-top:8px">
          ${mine.map(e => `
            <li>
              ${typePill(e.type)}
              <div style="min-width:0">
                <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.purpose)}</div>
                <div class="t">${esc(ORGS[e.org]?.name || e.org)}</div>
              </div>
              <span class="t">${ago(e.ts)}</span>
            </li>
          `).join('') || '<li><div class="empty" style="grid-column:1/-1">No activity yet.</div></li>'}
        </ul>
      </section>
    </div>

    <section class="card" style="display:flex;gap:16px;align-items:flex-start">
      ${ic('flag')}
      <div>
        <b style="font-weight:500">Not happy with an answer?</b>
        <p class="sub">Raise a complaint with the organisation first. If it does not resolve it, you can then take it to the Data Protection Board of India ${secTag('s.13')}</p>
      </div>
    </section>
  `;
}
