/**
 * Citizen Consent Inbox View
 * Multilingual pending consent requests with granular individual checks
 */
import { S, NOW, ago, esc } from '../../core/state.js';
import { NOTICE } from '../../core/constants.js';
import { ic } from '../../components/icons.js';

export function cInbox() {
  const ps = S.purposes.filter(p => p.status === 'pending');
  if (!ps.length) {
    return `
      <div class="pagehead">
        <div>
          <h1>Inbox</h1>
          <p>Requests from organisations appear here.</p>
        </div>
      </div>
      <div class="card empty">
        ${ic('check')}
        <p style="margin-top:8px">You have answered every request. Nothing is waiting.</p>
      </div>
    `;
  }
  const any = ps.some(p => S.noticePick[p.id]);

  return `
    <div class="pagehead">
      <div>
        <h1>Inbox</h1>
        <p>Nothing is pre-selected. Choose what you are comfortable with.</p>
      </div>
    </div>
    <section class="card">
      <div class="orghead" style="display:flex;align-items:center;gap:12px">
        <span class="av" style="width:36px;height:36px;border-radius:10px;font-size:13px">BT</span>
        <div>
          <b>Bharat Telecom</b>
          <span style="display:block;color:var(--ink-2);font-size:12px">New consent request · ${ps.length} purposes · received ${ago(NOW - 3600e3 * 2)}</span>
        </div>
      </div>
      <div class="row" style="margin:14px 0 8px" role="group" aria-label="Language">
        ${ic('globe')}
        ${[['en', 'English'], ['hi', 'हिन्दी'], ['ta', 'தமிழ்'], ['bn', 'বাংলা']].map(([k, l]) => `
          <button class="chip" aria-pressed="${S.lang === k}" data-lang="${k}">${l}</button>
        `).join('')}
      </div>
      <div class="box" style="background:var(--surface-2);border-radius:14px;padding:16px;font-size:16px;line-height:1.6" lang="${S.lang}">
        ${NOTICE[S.lang]}
      </div>
      <div style="margin-top:8px">
        <span class="demo" style="display:inline-flex;gap:6px;align-items:center;font-size:12px;color:var(--ink-2)">
          ${ic('bolt')}Plain-language summary. Pre-written for this sample; live, Gemini generates it from the policy text.
        </span>
      </div>
      <div style="margin-top:16px">
        ${ps.map(p => `
          <label class="prow" style="cursor:pointer">
            <div>
              <h3>${esc(p.name)}</h3>
              <div class="meta">${esc(p.desc)}</div>
              <div class="tags">
                ${p.data.map(d => `<span class="tagx">${esc(d)}</span>`).join('')}
                <span class="tagx">Kept: ${esc(p.ret)}</span>
              </div>
            </div>
            <div class="act">
              <span class="row">
                <span class="sr">Allow</span>
                <input type="checkbox" data-pick="${p.id}" ${S.noticePick[p.id] ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--accent)">
                <span>Allow</span>
              </span>
            </div>
          </label>
        `).join('')}
      </div>
      <div class="row" style="margin-top:16px">
        <button class="btn btn--p" data-act="notice-submit">${any ? 'Save my choices' : 'Decline both'}</button>
        <span style="color:var(--ink-2);font-size:13px">${any ? 'Only the boxes you ticked are granted.' : 'Nothing is granted unless you tick it.'}</span>
      </div>
    </section>
  `;
}
