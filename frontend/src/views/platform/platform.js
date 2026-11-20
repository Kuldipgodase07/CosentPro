/**
 * Platform View (v5)
 * Google Cloud & Firebase Architecture Diagram, Live Firestore Console,
 * Security Rules Simulator, and Buildathon Evaluation Rubric.
 */
import { S, $, esc } from '../../core/state.js';
import { CP_CONFIG, FSERV, RUBRIC, SIMT, RULES_TEXT, ROLES } from '../../core/constants.js';
import { ic } from '../../components/icons.js';
import { DB } from '../../services/firestore-db.js';

export function simResult() {
  const s = S.ai.sim;
  const t = SIMT.find(x => x[0] === s.col);
  const rl = t[3];
  const ok = rl[s.op === 'read' ? 'read' : 'write'].includes(s.role) ||
             rl[s.op === 'read' ? 'read' : 'write'].includes('*') ||
             (s.own && t[3].own && t[3].own.includes(s.op === 'read' ? 'read' : 'create') && s.role === 'principal');
  const line = RULES_TEXT.split('\n').findIndex(l => l.includes('match /' + t[2]));
  return { ok, why: t[4], line, t };
}

export function simHTML() {
  const r = simResult();
  const s = S.ai.sim;
  return `
    <div class="row" style="gap:10px;align-items:flex-end">
      <label class="field">Signed in as
        <select id="sim-role">
          ${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${s.role === k ? 'selected' : ''}>${v.n}</option>`).join('')}
        </select>
      </label>
      <label class="field">Action
        <select id="sim-op">
          <option value="read" ${s.op === 'read' ? 'selected' : ''}>Read</option>
          <option value="write" ${s.op === 'write' ? 'selected' : ''}>Write</option>
        </select>
      </label>
      <label class="field">Document
        <select id="sim-col">
          ${SIMT.map(t => `<option value="${t[0]}" ${s.col === t[0] ? 'selected' : ''}>${t[1]}</option>`).join('')}
        </select>
      </label>
      <label class="row" style="font-size:13.5px;flex-wrap:nowrap">
        <input id="sim-own" type="checkbox" ${s.own ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent)">It is my own record
      </label>
    </div>
    <div class="simout ${r.ok ? 'ok' : 'no'}" role="status">
      <b>${r.ok ? 'ALLOW' : 'DENY'}</b>
      <span>${esc(r.why)}</span>
    </div>
  `;
}

export function rulesHTML() {
  const r = simResult();
  const lines = RULES_TEXT.split('\n');
  return lines.map((l, i) => `
    <div class="rl ${r.line >= 0 && i >= r.line && i <= r.line + 5 && !(i > r.line && /match \//.test(l)) ? 'hl' : ''}">
      <i>${i + 1}</i>
      <span>${esc(l) || ' '}</span>
    </div>
  `).join('');
}

export function fsHTML() {
  const cols = DB.cols();
  const names = Object.keys(cols).sort();
  const sel = S.ai.fs && cols[S.ai.fs] ? S.ai.fs : names.find(n => /ledger/.test(n)) || names[0] || '';
  const docs = sel ? DB.list(sel).slice(0, 6) : [];

  return `
    <div class="fsw">
      <div class="fscol">
        <div class="hint" style="padding:4px 8px">Collections</div>
        ${names.map(n => `
          <button class="fsb ${n === sel ? 'on' : ''}" data-fs="${n}">
            ${ic('list')}
            <span>${n}</span>
            <em>${cols[n]}</em>
          </button>
        `).join('')}
      </div>
      <div class="fsdocs">
        <div class="hint" style="padding:4px 2px">${sel || 'No data yet'} · ${sel ? cols[sel] : 0} documents · newest first</div>
        ${docs.map(d => `
          <details class="fsd">
            <summary><b class="mono">${esc(d.id)}</b></summary>
            <pre class="code">${esc(JSON.stringify(d.data, null, 2))}</pre>
          </details>
        `).join('')}
      </div>
    </div>
  `;
}

export function opsHTML() {
  return DB.ops.slice(0, 14).map(o => `
    <div class="op">
      <span class="mono">${new Date(o.ts).toLocaleTimeString('en-GB')}</span>
      <b class="o-${o.op}">${o.op}</b>
      <span class="mono" style="min-width:0;overflow:hidden;text-overflow:ellipsis">${esc(o.path)}</span>
      <em>${o.n ? o.n + ' B' : ''}</em>
    </div>
  `).join('') || '<div class="empty">Waiting for activity…</div>';
}

export function fsStats() {
  return [
    ['Documents', DB.docs.size],
    ['Writes', DB.writes],
    ['Reads', DB.reads],
    ['Function calls', DB.fn]
  ].map(x => `
    <div class="fst">
      <b>${x[1]}</b>
      <small>${x[0]}</small>
    </div>
  `).join('');
}

export function fsRefresh() {
  const a = $('#fs-view'), b = $('#fs-ops'), c = $('#fs-stats');
  if (a && !a.contains(document.activeElement)) {
    const open = [...a.querySelectorAll('details[open] summary b')].map(x => x.textContent);
    a.innerHTML = fsHTML();
    a.querySelectorAll('details').forEach(d => {
      if (open.includes(d.querySelector('b').textContent)) d.open = true;
    });
  }
  if (b) b.innerHTML = opsHTML();
  if (c) c.innerHTML = fsStats();
}

export function archSVG() {
  const B = (x, y, w, h, t, s, cls = '') => `
    <g class="ab ${cls}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
      <text x="${x + 12}" y="${y + 22}" class="t1">${t}</text>
      ${s ? `<text x="${x + 12}" y="${y + 40}" class="t2">${s}</text>` : ''}
    </g>
  `;
  const A = d => `<path d="${d}" class="ar" marker-end="url(#ah)"/>`;

  return `
    <svg viewBox="0 0 980 430" role="img" aria-label="ConsentPro architecture on Firebase and Google Cloud" class="arch">
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" class="ahp"/>
        </marker>
      </defs>
      <text x="20" y="22" class="lab">CLIENTS</text>
      <text x="250" y="22" class="lab">EDGE AND IDENTITY</text>
      <text x="500" y="22" class="lab">LOGIC</text>
      <text x="770" y="22" class="lab">DATA</text>
      ${B(20, 40, 170, 58, 'Web app · PWA', 'Citizens and staff')}
      ${B(20, 120, 170, 58, 'SDK · REST client', 'Fiduciary apps')}
      ${B(20, 200, 170, 58, 'Auditor browser', 'Re-hashes the ledger')}
      ${B(250, 60, 190, 62, 'Firebase Hosting', 'App Check on every call', 'fb')}
      ${B(250, 150, 190, 62, 'Firebase Auth', 'Role and tenant claims', 'fb')}
      <g class="ab fb">
        <rect x="500" y="40" width="210" height="240" rx="14"/>
        <text x="514" y="64" class="t1">Cloud Functions</text>
        <text x="514" y="82" class="t2">2nd gen · asia-south1</text>
        ${['consentApi', 'ledgerTxn (SHA-256 chain)', 'aiGateway', 'webhookWorker'].map((n, i) => `
          <rect x="514" y="${98 + i * 42}" width="182" height="32" rx="8" class="in"/>
          <text x="526" y="${119 + i * 42}" class="t3">${n}</text>
        `).join('')}
      </g>
      ${B(770, 40, 190, 70, 'Cloud Firestore', 'Rules · multi-tenant', 'fb')}
      ${B(770, 130, 190, 56, 'Cloud KMS', 'Signing and field keys', 'pl')}
      ${B(770, 206, 190, 56, 'BigQuery', 'Ledger export', 'pl')}
      ${B(500, 330, 210, 66, 'Vertex AI · Gemini', 'Structured output', 'ai')}
      ${B(770, 330, 190, 66, 'Customer webhooks', 'Signed with HMAC')}
      ${A('M190 69H250')}${A('M190 149H220V91H250')}${A('M190 229H220V180H250')}${A('M440 91H470V120H500')}${A('M440 181H470V160H500')}${A('M710 75H770')}${A('M710 150H740V158H770')}${A('M860 110V120M860 186V206')}${A('M605 280V330')}${A('M710 363H770')}
      <rect x="20" y="300" width="440" height="96" rx="12" class="note"/>
      <text x="34" y="324" class="t1">Why this design</text>
      <text x="34" y="346" class="t2">Clients never write the ledger. Functions do, in one</text>
      <text x="34" y="362" class="t2">transaction, so the hash chain cannot be forged by a client.</text>
      <text x="34" y="380" class="t2">Personal data stays in Indian regions.</text>
    </svg>
  `;
}

export function oPlatform() {
  const cfgRows = [
    ['Mode', CP_CONFIG.firebase ? 'Connected to Firebase' : 'Demo: Firestore-shaped store in your browser'],
    ['Project', CP_CONFIG.project],
    ['Region', CP_CONFIG.region],
    ['AI model', CP_CONFIG.model],
    ['AI endpoint', CP_CONFIG.aiEndpoint || 'Not set · demo engine']
  ];

  return `
    <div class="pagehead">
      <div>
        <h1>Platform</h1>
        <p>How ConsentPro is built on Firebase and Google Cloud, with a live view of what it writes.</p>
      </div>
      <span class="spacer"></span>
      <a class="btn" href="#" data-go="o-ai">${ic('bolt')}Open AI Studio</a>
    </div>

    <section class="card">
      <div class="panelh">
        <div>
          <h2>Architecture</h2>
          <div class="sub">Firebase for identity, data and hosting. Cloud Functions for trusted logic. Gemini on Vertex AI for language work.</div>
        </div>
      </div>
      <div class="archw">${archSVG()}</div>
    </section>

    <div class="grid g21" style="margin-top:16px">
      <section class="card">
        <div class="panelh">
          <div>
            <h2>Firestore console</h2>
            <div class="sub">Every change you make in this app lands here as a document write.</div>
          </div>
          <span class="spacer"></span>
          <span class="live"><i></i>live</span>
        </div>
        <div id="fs-stats" class="fsstats">${fsStats()}</div>
        <div id="fs-view">${fsHTML()}</div>
      </section>

      <section class="card">
        <h2>Operations</h2>
        <div class="sub">Newest first</div>
        <div id="fs-ops" class="ops">${opsHTML()}</div>
      </section>
    </div>

    <div class="grid g21" style="margin-top:16px">
      <section class="card">
        <h2>Security rules simulator</h2>
        <div class="sub">Pick a role and a document. The answer comes from the same rules shown on the right.</div>
        <div id="sim" style="margin-top:12px">${simHTML()}</div>
        <h2 style="margin-top:22px">Services</h2>
        <div style="display:grid;gap:8px;margin-top:8px">
          ${FSERV.map(s => `
            <div class="svc">
              <div>
                <b>${s[0]}</b>
                <small>${s[1]}</small>
              </div>
              <span class="pill ${s[2] === 'live' ? 'pill--granted' : s[2] === 'pkg' ? 'pill--pending' : 'pill--neutral'}">
                ${s[2] === 'live' ? 'Emulated here' : s[2] === 'pkg' ? 'In deploy package' : 'Planned'}
              </span>
            </div>
          `).join('')}
        </div>
        <h2 style="margin-top:22px">Connection</h2>
        <div style="margin-top:6px">
          ${cfgRows.map(r => `
            <div class="statrow">
              <span>${r[0]}</span>
              <b style="font-weight:500">${esc(r[1])}</b>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="card">
        <div class="panelh">
          <h2>firestore.rules</h2>
          <span class="spacer"></span>
          <button class="btn btn--sm" data-copyrules="1">Copy</button>
        </div>
        <div class="rules" id="rules-view">${rulesHTML()}</div>
      </section>
    </div>

    <section class="card" style="margin-top:16px">
      <h2>Evaluation map</h2>
      <div class="sub">Where each buildathon criterion shows up in the product.</div>
      <div class="rub">
        ${RUBRIC.map(r => `
          <div class="rb">
            <div class="rbw">
              <b>${r[1]}%</b>
              <i style="width:${r[1] * 3}%"></i>
            </div>
            <div>
              <b>${r[0]}</b>
              <span class="pill ${r[4] === 'live' ? 'pill--granted' : 'pill--pending'}">
                ${r[4] === 'live' ? 'Working in this demo' : 'Demo engine here, Gemini in package'}
              </span>
              <p>${r[2]}</p>
              <div class="row">
                ${r[3].map(l => `<button class="btn btn--sm" data-go="${l[1]}">${l[0]}</button>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}
