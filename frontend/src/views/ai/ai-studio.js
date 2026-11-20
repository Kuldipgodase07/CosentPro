/**
 * Gemini AI Studio View (v5)
 * Notice Linting, Multilingual Purpose Extraction, Request Triage & Readiness Advisor
 */
import { S, fmtD, esc } from '../../core/state.js';
import { L10N } from '../../core/constants.js';
import { ic } from '../../components/icons.js';
import { secTag, stPill } from '../../components/ui/charts.js';

export const engBadge = e =>
  e === 'demo'
    ? `<span class="demo" style="display:inline-flex;gap:6px;align-items:center;font-size:12px;color:var(--ink-2)">${ic('alert')}Demo engine · rules in the browser</span>`
    : `<span class="pill pill--granted">${ic('bolt')}${esc(e)} via Cloud Functions</span>`;

export const stIcon = s =>
  s === 'ok' ? `<span class="pill pill--granted">${ic('check')}Pass</span>` :
  s === 'warn' ? `<span class="pill pill--pending">${ic('alert')}Improve</span>` :
  `<span class="pill pill--revoked">${ic('x')}Fix</span>`;

export function noticeCards() {
  const w = S.ai.res.lint;
  if (!w) return '';
  const r = w.out, L = L10N[S.ai.lang];
  return r.cards.length ? r.cards.map(c => `
    <div class="ncard">
      <div class="row" style="justify-content:space-between">
        <b>${L.p[c.p]}</b>
        <span class="chip" style="cursor:default">${secTag('s.5')}</span>
      </div>
      <dl>
        <dt>${L.who}</dt><dd>${esc(r.org)}</dd>
        <dt>${L.data}</dt><dd>${c.d.length ? c.d.map(x => L.d[x]).join(', ') : L.u.none}</dd>
        <dt>${L.why}</dt><dd>${L.p[c.p]}</dd>
        <dt>${L.long}</dt><dd>${c.dur ? c.dur.n + ' ' + L.u[c.dur.u] : L.u.none}</dd>
      </dl>
      <p class="hint">${L.out}</p>
    </div>
  `).join('') : `<div class="empty">No purposes found. Add more detail to the notice.</div>`;
}

export function oAI() {
  const a = S.ai;
  const tabs = [
    ['notice', 'Notice studio', 'ledger'],
    ['triage', 'Request triage', 'flag'],
    ['advise', 'Readiness advisor', 'tasks']
  ];

  const body = a.tab === 'notice' ? (() => {
    const r = a.res.lint;
    return `
      <div class="grid g21">
        <section class="card">
          <h2>Paste a notice or privacy text</h2>
          <div class="sub">Gemini reads it, checks it against the DPDP Act and writes a plain-language version in the person’s own language.</div>
          <label class="field" for="ai-notice" style="margin-top:10px">Notice text
            <textarea id="ai-notice" rows="8" style="width:100%">${esc(a.text)}</textarea>
          </label>
          <div class="row" style="margin-top:12px">
            <button class="btn btn--p" data-airun="lint" ${a.busy ? 'disabled' : ''}>
              ${ic('bolt')}${a.busy === 'lint' ? 'Reading…' : 'Analyse with Gemini'}
            </button>
            <button class="btn" data-aisample="notice">Load sample</button>
            ${r ? engBadge(r.engine) : ''}
          </div>
        </section>
        <section class="card">
          <h2>Why it matters</h2>
          <div class="sub">Section 5 requires an itemised notice. Section 6 requires consent that is free, specific, informed and unambiguous.</div>
          <ul class="feed" style="margin-top:8px">
            <li style="grid-template-columns:auto minmax(0,1fr)">${ic('check')}<span>Scores nine DPDP checks</span></li>
            <li style="grid-template-columns:auto minmax(0,1fr)">${ic('check')}<span>Extracts one card per purpose</span></li>
            <li style="grid-template-columns:auto minmax(0,1fr)">${ic('check')}<span>Shows it in Hindi, Tamil, Bengali or Marathi</span></li>
          </ul>
        </section>
      </div>
      ${r ? `
        <div class="grid g21" style="margin-top:16px">
          <section class="card">
            <div class="panelh">
              <div>
                <h2>DPDP check</h2>
                <div class="sub">${r.out.checks.filter(k => k.st === 'ok').length} of ${r.out.checks.length} pass</div>
              </div>
              <span class="spacer"></span>
              <div class="scorebig">${r.out.score}<small>/100</small></div>
            </div>
            <div style="display:grid;gap:8px;margin-top:6px">
              ${r.out.checks.map(k => `
                <div class="chk">
                  <div>${stIcon(k.st)}</div>
                  <div>
                    <b>${k.label}</b> ${secTag(k.sec)}
                    <small>${k.msg}</small>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
          <section class="card">
            <div class="panelh">
              <h2>Plain-language cards</h2>
            </div>
            <div class="row" role="group" aria-label="Language">
              ${Object.entries(L10N).map(([k, l]) => `
                <button class="chip" aria-pressed="${a.lang === k}" data-ailang="${k}">${l.n}</button>
              `).join('')}
            </div>
            <div id="ai-cards" style="display:grid;gap:10px;margin-top:12px">
              ${noticeCards()}
            </div>
            <p class="hint" style="margin-top:10px">Draft translation. A human reviewer must approve it before it is shown to people.</p>
          </section>
        </div>
      ` : ''}
    `;
  })() : a.tab === 'triage' ? (() => {
    const r = a.res.triage, o = r && r.out;
    return `
      <div class="grid g21">
        <section class="card">
          <h2>Incoming request</h2>
          <div class="sub">Paste a message from a Data Principal. Gemini classifies it under sections 11 to 14, sets a due date and drafts the reply.</div>
          <label class="field" for="ai-req" style="margin-top:10px">Message
            <textarea id="ai-req" rows="6" style="width:100%">${esc(a.req)}</textarea>
          </label>
          <div class="row" style="margin-top:12px">
            <button class="btn btn--p" data-airun="triage" ${a.busy ? 'disabled' : ''}>
              ${ic('bolt')}${a.busy === 'triage' ? 'Reading…' : 'Triage with Gemini'}
            </button>
            <button class="btn" data-aisample="req">Load sample</button>
            ${r ? engBadge(r.engine) : ''}
          </div>
        </section>
        <section class="card">
          <h2>Human in the loop</h2>
          <div class="sub">AI proposes. A person decides. Nothing is sent or changed until the DPO approves it.</div>
        </section>
      </div>
      ${o ? `
        <div class="grid g21" style="margin-top:16px">
          <section class="card">
            <div class="row" style="gap:10px">
              <span class="pill pill--granted">${o.type}</span>
              ${secTag(o.sec)}
              <span class="pill ${o.priority === 'High' ? 'pill--revoked' : 'pill--neutral'}">${o.priority} priority</span>
              <span class="hint">Due ${fmtD(o.due)}</span>
            </div>
            <h2 style="margin-top:14px">Suggested steps</h2>
            <ol class="olist">${o.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            ${o.flags.length ? `
              <div style="margin-top:10px;display:grid;gap:6px">
                ${o.flags.map(f => `<div class="banner" style="background:var(--hi);color:var(--hi-ink)">${ic('alert')}<span>${f}</span></div>`).join('')}
              </div>
            ` : ''}
            <p class="hint" style="margin-top:10px">Matched on: ${esc(o.match)}</p>
          </section>
          <section class="card">
            <h2>Draft reply</h2>
            <p style="margin-top:8px">${esc(o.draft)}</p>
            <div class="row" style="margin-top:14px">
              <button class="btn btn--p" data-aimk="1" ${['Access', 'Correction', 'Erasure', 'Grievance'].includes(o.type) ? '' : 'disabled'}>
                ${ic('send')}Add to rights queue
              </button>
            </div>
          </section>
        </div>
      ` : ''}
    `;
  })() : (() => {
    const r = a.res.advise, o = r && r.out;
    return `
      <section class="card">
        <h2>What should we fix first?</h2>
        <div class="sub">Reads your live obligations and ranks the gaps by exposure, then proposes steps and an owner for each.</div>
        <div class="row" style="margin-top:12px">
          <button class="btn btn--p" data-airun="advise" ${a.busy ? 'disabled' : ''}>
            ${ic('bolt')}${a.busy === 'advise' ? 'Thinking…' : 'Build my plan'}
          </button>
          ${r ? engBadge(r.engine) : ''}
        </div>
      </section>
      ${o ? `
        <div class="advs" style="margin-top:16px">
          ${o.items.map((it, i) => `
            <section class="card">
              <div class="row" style="gap:10px">
                <span class="num2">${i + 1}</span>
                ${secTag(it.sec)}
                ${stPill(it.st)}
              </div>
              <h2 style="margin-top:10px">${it.title}</h2>
              ${it.ceil ? `<div class="hint">Maximum penalty under the Schedule: up to ${it.ceil}. A limit, not a prediction.</div>` : ''}
              <ul class="steps2">
                ${it.steps.map(s => `<li>${ic('check')}${s}</li>`).join('')}
              </ul>
              <div class="row" style="margin-top:12px;justify-content:space-between">
                <span class="hint">Owner: ${it.owner}</span>
                <button class="btn btn--sm" data-go="${it.go}">Open</button>
              </div>
            </section>
          `).join('')}
        </div>
        <p class="hint" style="margin-top:10px">${o.ready} of ${o.total} duties are ready today.</p>
      ` : ''}
    `;
  })();

  return `
    <div class="pagehead">
      <div>
        <h1>AI Studio</h1>
        <p>Gemini for the hard parts of privacy work: reading notices, translating them and sorting requests. People stay in control.</p>
      </div>
      <span class="spacer"></span>
      <span class="pill pill--neutral">${ic('lock')}Personal data stays in India regions</span>
    </div>
    <div class="row" role="tablist" aria-label="AI tools" style="margin-bottom:14px">
      ${tabs.map(t => `
        <button class="chip" role="tab" aria-pressed="${a.tab === t[0]}" data-aitab="${t[0]}">
          ${ic(t[2])}${t[1]}
        </button>
      `).join('')}
    </div>
    ${body}
    <section class="card" style="margin-top:16px">
      <h2>How this runs in production</h2>
      <div class="flow">
        ${[['Browser', 'Calls an authenticated callable function'], ['Cloud Function', 'Checks role claim, removes personal identifiers, applies limits'], ['Gemini on Vertex AI', 'Structured JSON output with a response schema'], ['Firestore', 'Result and prompt hash logged for audit']].map((s, i) => `
          <div class="fl">
            <i>${i + 1}</i>
            <b>${s[0]}</b>
            <small>${s[1]}</small>
          </div>
        `).join('')}
      </div>
      <p class="hint" style="margin-top:10px">This page runs a deterministic demo engine in your browser. Deploy the Firebase package and set the function URL to switch the same screens to Gemini. For government tenants, sovereign mode swaps in Gemma inside your own boundary.</p>
    </section>
  `;
}
