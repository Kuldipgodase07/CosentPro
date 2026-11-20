/**
 * Developer API Keys and Webhooks View
 * Key generation, scopes, instant revocation, and webhook testing with response metrics
 */
import { S, fmtD, esc } from '../../core/state.js';
import { ic } from '../../components/icons.js';

export function oKeys() {
  return `
    <div class="pagehead">
      <div>
        <h1>API keys and webhooks</h1>
        <p>Keys let your servers check consent. Webhooks tell your systems the moment someone revokes.</p>
      </div>
    </div>
    <div class="grid g21">
      <section class="card">
        <div class="row">
          <h2>API keys</h2>
          <span class="spacer" style="flex:1"></span>
        </div>
        <div class="scroll">
          <table class="tbl" style="margin-top:8px">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Scopes</th>
                <th>Last used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${S.keys.map(k => `
                <tr>
                  <td>
                    <b style="font-weight:500">${esc(k.name)}</b>
                    <div class="sub">Created ${fmtD(k.created)}</div>
                  </td>
                  <td class="mono">${k.prefix}••••</td>
                  <td>${k.scopes.map(s => `<span class="tagx" style="margin:0 4px 4px 0">${s}</span>`).join('')}</td>
                  <td>${k.status === 'active' ? k.last : '–'}</td>
                  <td>
                    ${k.status === 'active' ? `<button class="btn btn--sm btn--r" data-act="keyrev" data-id="${k.id}">Revoke</button>` : '<span class="pill pill--expired">Revoked</span>'}
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="5"><div class="empty">No keys yet. Create your first key.</div></td></tr>'}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>New key</h2>
        <form id="kform" style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
          <label class="f" for="kn">Name
            <input id="kn" type="text" required placeholder="e.g. Staging server">
          </label>
          <div class="row">
            ${['verify', 'receipts:write', 'ledger:read'].map((s, i) => `
              <label class="row" style="gap:6px;font-size:13.5px">
                <input type="checkbox" name="ks" value="${s}" ${i === 0 ? 'checked' : ''} style="accent-color:var(--accent)">${s}
              </label>
            `).join('')}
          </div>
          <button class="btn btn--p" type="submit">${ic('key')}Create key</button>
        </form>
      </section>
    </div>

    <div class="grid g21">
      <section class="card">
        <h2>Webhook endpoints</h2>
        <ul class="feed" style="margin-top:8px">
          ${S.hooks.map(h => `
            <li style="grid-template-columns:minmax(0,1fr) auto">
              <div style="min-width:0">
                <div class="mono" style="overflow:hidden;text-overflow:ellipsis">${esc(h.url)}</div>
                <div class="t">${h.events.join(', ')}</div>
              </div>
              <button class="btn btn--sm" data-act="hooktest" data-id="${h.id}">Send test</button>
            </li>
          `).join('') || '<li><div class="empty" style="grid-column:1/-1">No endpoints yet.</div></li>'}
        </ul>
        <form id="hform" class="row" style="margin-top:14px;flex-wrap:nowrap">
          <label class="sr" for="hu">Endpoint URL</label>
          <input id="hu" type="text" placeholder="https://yourapp.example/hooks" style="flex:1;padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface)">
          <button class="btn btn--p" type="submit">${ic('plus')}Add</button>
        </form>
      </section>

      <section class="card">
        <h2>Recent deliveries</h2>
        <ul class="feed" style="margin-top:8px">
          ${S.deliv.slice(0, 6).map(d => `
            <li style="grid-template-columns:auto minmax(0,1fr) auto">
              <span class="pill pill--granted">${d.code}</span>
              <div class="mono" style="overflow:hidden;text-overflow:ellipsis">${d.event}</div>
              <span class="t">${d.ms} ms</span>
            </li>
          `).join('') || '<li><div class="empty" style="grid-column:1/-1">Send a test to see a delivery here.</div></li>'}
        </ul>
      </section>
    </div>
  `;
}
