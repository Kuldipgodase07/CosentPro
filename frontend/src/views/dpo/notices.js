/**
 * DPO Notices View
 * Multilingual translation matrix and notice text preview
 */
import { S, byId, esc } from '../../core/state.js';
import { ORGS, LANGS } from '../../core/constants.js';
import { ic } from '../../components/icons.js';

export function noticeText(p) {
  return `${ORGS[p.org].name} would like to use your ${p.data.join(' and ').toLowerCase()}. ${p.desc} We keep it for: ${p.ret}. You can say no, and you can withdraw at any time as easily as you said yes.${S.settings.dpo ? ` Questions? Contact ${S.settings.dpo}, ${S.settings.dpoMail}.` : ''}`;
}

export function oNotices() {
  const ps = S.purposes.filter(p => p.org === 'orbit');
  const sel = byId(S.sel) && byId(S.sel).org === 'orbit' ? byId(S.sel) : ps[0];
  S.nstat = S.nstat || {};
  const st = (p, l) => S.nstat[p.id + l] || (l === 'en' ? 'ok' : (p.id.charCodeAt(1) + l.charCodeAt(0)) % 3 ? 'ok' : 'draft');

  return `
    <div class="pagehead">
      <div>
        <h1>Notices</h1>
        <p>The text people read for each purpose. Translations are drafted by AI and reviewed by your DPO before they go live.</p>
      </div>
    </div>
    <div class="grid g21">
      <section class="card">
        <h2>Translation status</h2>
        <div class="scroll">
          <table class="tbl" style="margin-top:8px">
            <thead>
              <tr>
                <th>Purpose</th>
                ${LANGS.map(l => `<th>${l[1]}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${ps.map(p => `
                <tr>
                  <td>
                    <button class="btn btn--sm" data-act="selp" data-id="${p.id}" ${sel === p ? 'style="border-color:var(--accent)"' : ''}>
                      ${esc(p.name)}
                    </button>
                  </td>
                  ${LANGS.map(l => `
                    <td>
                      <button class="pill ${st(p, l[0]) === 'ok' ? 'pill--granted' : 'pill--pending'}" style="border:0;cursor:pointer" data-act="nstat" data-k="${p.id + l[0]}" data-v="${st(p, l[0])}">
                        ${st(p, l[0]) === 'ok' ? ic('check') + 'Reviewed' : ic('clock') + 'Draft'}
                      </button>
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <p class="sub" style="margin-top:10px">Select a status to mark a translation reviewed. ${LANGS.length} of 22 scheduled languages are ready.</p>
      </section>

      <section class="card">
        <h2>Preview</h2>
        <div class="sub">${esc(sel.name)} · English</div>
        <div class="box" style="background:var(--surface-2);border-radius:14px;padding:16px;margin-top:14px;line-height:1.6">
          ${esc(noticeText(sel))}
        </div>
        <div class="row" style="margin-top:12px">
          <span class="tagx">Retention: ${esc(sel.ret)}</span>
          <span class="tagx">${sel.data.length} data item${sel.data.length > 1 ? 's' : ''}</span>
        </div>
      </section>
    </div>
  `;
}
