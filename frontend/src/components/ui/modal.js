/**
 * Modal Dialog Controller
 * Manages consent grant/revoke confirmations, receipt inspect, and key export
 */
import { S, $, byId, stat, esc, short } from '../../core/state.js';
import { ORGS, SYSTEMS, SUBJ } from '../../core/constants.js';
import { ic } from '../icons.js';
import { applyConsent } from '../../services/ledger.js';

export function renderModal(renderCallback) {
  const m = S.modal, el = $('#modal');
  if (!m) {
    if (el) {
      el.hidden = true;
      el.innerHTML = '';
    }
    return;
  }
  const p = byId(m.id);
  el.hidden = false;
  let h = '';

  if (m.type === 'receipt') {
    const e = [...S.ledger].reverse().find(x => x.receipt === p.receipt);
    h = `
      <h2>Consent receipt</h2>
      <p class="lead">Proof you can keep. It lists exactly what you agreed to.</p>
      <pre class="code" style="margin-top:16px">${esc(JSON.stringify({
        receipt: p.receipt,
        subject: SUBJ,
        fiduciary: ORGS[p.org].name,
        purpose: p.name,
        data: p.data,
        retention: p.ret,
        status: stat(p),
        recorded: new Date(p.updated).toISOString(),
        ledger_hash: e ? short(e.hash) : 'pending',
        signature: 'demo-signature (Cloud KMS in production)'
      }, null, 2))}</pre>
      <div class="row" style="margin-top:18px;justify-content:flex-end">
        <button class="btn btn--p" data-act="close">Done</button>
      </div>
    `;
  } else if (m.step === 'ask') {
    const rev = m.do === 'revoke';
    h = `
      <h2>${rev ? 'Revoke this consent?' : (p.status === 'pending' ? 'Review this request' : 'Grant this consent?')}</h2>
      <p class="lead">${esc(ORGS[p.org].name)} · ${esc(p.name)}</p>
      <div class="box">
        <b style="font-weight:500">${rev ? 'They will stop using:' : 'They will be allowed to use:'}</b>
        <div class="tags" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          ${p.data.map(d => `<span class="tagx" style="background:var(--surface)">${esc(d)}</span>`).join('')}
        </div>
        <p style="margin-top:12px;color:var(--ink-2)">${esc(p.desc)} Kept: ${esc(p.ret)}.</p>
      </div>
      <p style="margin-top:14px;color:var(--ink-2);font-size:13.5px">
        ${rev ? 'Takes effect across connected systems within seconds. You can grant it again any time.' : 'You can withdraw this later as easily as you give it.'}
      </p>
      <div class="row" style="margin-top:18px;justify-content:flex-end">
        <button class="btn" data-act="close">Cancel</button>
        <button class="btn ${rev ? 'btn--r' : 'btn--p'}" data-act="confirm">${rev ? 'Revoke consent' : 'Grant consent'}</button>
      </div>
    `;
  } else {
    const rev = m.do === 'revoke';
    const sys = rev ? SYSTEMS : [['Signing receipt', 0.3], ['Writing to ledger', 0.7]];
    h = `
      <h2>${m.step === 'done' ? (rev ? 'Consent revoked' : 'Consent granted') : (rev ? 'Revoking…' : 'Recording…')}</h2>
      <p class="lead">${esc(ORGS[p.org].name)} · ${esc(p.name)}</p>
      <ul class="steps">
        ${sys.map(([n, t], i) => `
          <li class="${m.k > i ? 'on' : ''}">
            <span class="dot">${m.k > i ? ic('check') : ''}</span>
            <span>${rev ? 'Stopped in ' : ''}${n}</span>
            <span class="spacer" style="flex:1"></span>
            <span class="num">${m.k > i ? t.toFixed(1) + ' s' : ''}</span>
          </li>
        `).join('')}
      </ul>
      ${m.step === 'done' ? `
        <div class="box">
          Receipt <span class="mono">${m.receipt}</span><br>
          <span style="color:var(--ink-2)">${rev ? 'Reached all 4 systems in 2.6 s (simulated).' : 'Recorded in the audit ledger.'}</span>
        </div>
        <div class="row" style="margin-top:18px;justify-content:flex-end">
          <button class="btn btn--p" data-act="close">Done</button>
        </div>
      ` : ''}
    `;
  }
  el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Consent">${h}</div>`;
}

export function closeModal(renderCallback) {
  if (S.modal && S.modal.step === 'working') return;
  S.modal = null;
  renderModal();
  if (renderCallback) renderCallback();
}

export function runConfirm(renderCallback) {
  const m = S.modal;
  const rev = m.do === 'revoke';
  m.step = 'working';
  m.k = 0;
  m.receipt = applyConsent(m.id, m.do);
  renderModal();

  const n = rev ? SYSTEMS.length : 2;
  const tick = () => {
    m.k++;
    if (m.k >= n) {
      m.step = 'done';
      renderModal();
      if (renderCallback) renderCallback();
      return;
    }
    renderModal();
    setTimeout(tick, 380);
  };
  setTimeout(tick, 380);
}
