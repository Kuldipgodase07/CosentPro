/**
 * Developer SDK Sandbox View
 * Live interactive consent verification against in-memory state
 */
import { S, SUBJ, esc } from '../../core/state.js';
import { SNIP } from '../../core/constants.js';
import { ic } from '../../components/icons.js';

export function oSdk() {
  const orbit = S.purposes.filter(p => p.org === 'orbit');
  return `
    <div class="pagehead">
      <div>
        <h1>Integrations</h1>
        <p>Web, Android, iOS and REST. Every call checks live consent before your system uses the data.</p>
      </div>
    </div>
    <div class="grid g21">
      <section class="card">
        <div class="row" role="tablist" aria-label="SDK">
          ${[['web', 'Web'], ['android', 'Android'], ['ios', 'iOS'], ['rest', 'REST']].map(([k, l]) => `
            <button class="chip" role="tab" aria-pressed="${S.tab === k}" data-tab="${k}">${l}</button>
          `).join('')}
          <span class="spacer" style="flex:1"></span>
          <button class="btn btn--sm" data-act="copy-snip">${ic('copy')}Copy</button>
        </div>
        <pre class="code" id="snip" style="margin-top:14px">${SNIP[S.tab]}</pre>
        <div style="margin-top:10px">
          <span class="demo" style="display:inline-flex;gap:6px;align-items:center;font-size:12px;color:var(--ink-2)">
            ${ic('alert')}Shows the planned SDK shape. The package is not published yet.
          </span>
        </div>
      </section>

      <section class="card">
        <h2>Try a consent check</h2>
        <div class="sub">Runs against the sample citizen’s live state above.</div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
          <label class="f" for="apip">Purpose
            <select id="apip">
              ${orbit.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}
            </select>
          </label>
          <label class="f" for="apis">Subject
            <input id="apis" type="text" value="${SUBJ}" readonly>
          </label>
          <button class="btn btn--p" data-act="run-verify">${ic('play')}Run verify</button>
          <pre class="code" id="apiout" style="min-height:130px">${S.apiOut || '<span class="c">// Response appears here</span>'}</pre>
        </div>
      </section>
    </div>
  `;
}
