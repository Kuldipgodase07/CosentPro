/**
 * Landing Page View (v4 Interactive Redesign)
 * Full showcase with live SHA-256 demo, animated counters, timeline, audiences tabs
 */
import { S, $, $$, daysTo, esc } from '../../core/state.js';
import { sha } from '../../core/crypto.js';
import { FEATS, STEPS, FAQ, SNIP, ROLES } from '../../core/constants.js';
import { ic, LOGO } from '../../components/icons.js';
import { ring } from '../../components/ui/charts.js';

export const HTABS = ['Data principal', 'DPO', 'Auditor'];
export const HSTAT = ['Consent recorded · receipt signed in 0.2 s', 'Revocation reached 4 systems in 2.6 s'];

export function heroPanel(i) {
  const on = k => S.hero[k];
  if (i === 0) {
    return `
      <div class="rcard hsc">
        <div class="row" style="justify-content:space-between;margin-bottom:6px">
          <b style="font-weight:500">Orbit Bank asks for</b>
          <span class="pill pill--granted" style="background:var(--c-pink);color:var(--c-night)">${ic('check')}Signed receipt</span>
        </div>
        ${[['Credit scoring', 'Bank statements · until loan closure'], ['Product offers', 'Contact details · 12 months'], ['Insurance partners', 'Income band · 6 months']].map(([a, b], k) => `
          <div class="rrow">
            <div>${a}<small>${b}</small></div>
            <button class="sw" role="switch" aria-checked="${on(k)}" aria-label="${a}" data-act="herotoggle" data-i="${k}"></button>
          </div>
        `).join('')}
        <div class="stat"><i></i><span id="herostat">${HSTAT[0]}</span></div>
      </div>
    `;
  }
  if (i === 1) {
    const d = daysTo(2027, 5, 14);
    return `
      <div class="rcard hsc">
        <div class="row" style="justify-content:space-between">
          <b style="font-weight:500">Compliance command centre</b>
          <span style="font-size:12px;opacity:.8">Orbit Bank</span>
        </div>
        <div class="row" style="gap:18px;margin:10px 0 8px;flex-wrap:nowrap">
          ${ring(56, 92, 9)}
          <div>
            <div style="font-size:40px;font-weight:200;line-height:1">${d}</div>
            <small>days to 14 May 2027 · main duties apply</small>
          </div>
        </div>
        ${[['s.5', 'Notice to Data Principals', 'mid', 'Partly'], ['s.6', 'Free, specific consent', 'ok', 'Ready'], ['s.8(6)', 'Breach intimation', 'gap', 'Gap'], ['s.11–14', 'Rights of Data Principals', 'ok', 'Ready']].map(r => `
          <div class="mini">
            <span class="s">${r[0]}</span>${r[1]}
            <span class="r ${r[2]}">${r[3]}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  return `
    <div class="rcard hsc">
      <div class="row" style="justify-content:space-between">
        <b style="font-weight:500">Audit ledger</b>
        <span class="live" style="color:var(--c-mist)"><i></i>sha-256</span>
      </div>
      <p style="font-size:13px;opacity:.85;margin:8px 0">Each block holds the hash of the one before. Verify it yourself, then try to tamper.</p>
      <div class="chain" id="hchain">
        ${[41, 42, 43, 44, 45, 46].map((n, k) => `
          <span class="blk mono" data-n="${k}">
            <em>#${n}</em>${['a91f3c', '3be077', 'd5c819', '07feb6', '9c20d4', 'e1b758'][k]}…
          </span>
        `).join('')}
      </div>
      <div class="btns">
        <button class="btn btn--r btn--sm" data-hv="verify">Verify chain</button>
        <button class="btn btn--ghost btn--sm" data-hv="tamper">Tamper with #43</button>
      </div>
      <div class="stat"><i></i><span id="hvstat">Not yet verified</span></div>
    </div>
  `;
}

export const AUDS = [
  ['user', 'Data principals', 'See and control', 'See and control every consent', 'One place to see who holds your data, why, and for how long. Withdraw in one tap or one spoken sentence.', ['Plain-language notices in Indian languages', 'Revoke any purpose as easily as you granted it', 'Rights requests with a visible due date (s.11–14)', 'A complaint route to the Data Protection Board (s.13)'], `<div class="li">Credit scoring<span class="pl">Granted</span></div><div class="li">Product offers<span class="pl pk">Revoked</span></div><div class="li">Insurance partners<span class="pl">Granted</span></div><div class="li"><svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Request: copy of my data<small>due in 21 d</small></div>`],
  ['shield', 'DPOs and compliance', 'Prove readiness', 'A live view of every DPDP duty', 'A command centre that maps open work to the sections of the Act and shows what to fix first.', ['Readiness score across s.5, 6, 8, 9, 10 and 11–14', 'Rights-request queue with deadlines and owners', 'Penalty ceilings from the Schedule, for prioritising', 'Board-ready summary in one click'], `<div class="li">s.5 Notice<span class="pl pk">Partly</span></div><div class="li">s.6 Consent<span class="pl">Ready</span></div><div class="li">s.8(6) Breach<span class="pl pk">Gap</span></div><div class="li">s.11–14 Rights<span class="pl">Ready</span></div>`],
  ['code', 'Developers', 'Ship in a day', 'Check consent in one line', 'Call verify before using personal data. If consent is missing, stop. Webhooks tell you when it changes.', ['Web, Android, iOS SDKs and a REST API', 'Scoped API keys and signed webhooks', 'Sandbox with receipt, FHIR and OIDC test suites', 'Typed responses and clear error codes'], `<pre class="mono">const r = await cp.verify({\n  subject: 'dp_7c41e2',\n  purpose: 'credit_scoring'\n});\nif (!r.allowed) return;</pre>`],
  ['ledger', 'Auditors and regulators', 'Verify, do not trust', 'Evidence you can recompute', 'A hash-chained record that auditors verify in their own browser, without asking you for a report.', ['Re-hash a random sample of entries', 'Tamper test that proves the chain breaks', 'Evidence coverage mapped to DPDP sections', 'Read-only role with no access to personal data'], `<div class="li mono">#41 a91f…c02e<span class="pl">verified</span></div><div class="li mono">#42 3be0…77d1<span class="pl">verified</span></div><div class="li mono">#43 d5c8…19aa<span class="pl">verified</span></div><div class="li">0 breaks in 25 sampled entries</div>`],
  ['building', 'Government and public sector', 'Sovereign by design', 'Built for public-sector scrutiny', 'India-region hosting, role-based access and a sovereign AI mode so personal data never leaves your boundary.', ['Mumbai and Delhi regions, multi-zone', 'Sovereign mode: AI on Gemma inside your boundary', 'SSO and custom roles for departments', 'Open-source core planned for self-hosting'], `<div class="li"><svg class="ic" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>Data residency<span class="pl">India</span></div><div class="li"><svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>Languages<span class="pl">22 planned</span></div><div class="li"><svg class="ic" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18 14.8c1.9.7 3.2 2.5 3.7 5.2"/></svg>Roles<span class="pl">Custom</span></div><div class="li"><svg class="ic" viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/></svg>AI mode<span class="pl">Sovereign</span></div>`]
];

export function audPanel() {
  const a = AUDS[S.aud];
  return `
    <div>
      <div class="eyebrow">${a[2]}</div>
      <h3>${a[3]}</h3>
      <p>${a[4]}</p>
      <ul>${a[5].map(x => `<li>${ic('check')}${x}</li>`).join('')}</ul>
      <button class="btn btn--p" style="margin-top:22px" data-go="signup">Get started</button>
    </div>
    <div class="vis">${a[6]}</div>
  `;
}

export const stageHTML = () => {
  const s = STEPS[S.step];
  return `<h3>${s[1]}</h3><p>${s[2]}</p>${s[3]()}`;
};

export const DEMOP = [
  ['a', 'Credit scoring', 'Bank statements', 'Until loan closure'],
  ['b', 'Product offers', 'Contact details', '12 months'],
  ['c', 'Insurance partners', 'Income band', '6 months']
];

export let demoTs = new Date().toISOString().slice(0, 19) + 'Z';

export function demoJSON() {
  return JSON.stringify({
    receipt: 'RC-9F2A41C7',
    subject: 'dp_7c41e2',
    recorded: demoTs,
    consents: DEMOP.map(p => ({
      purpose: p[1],
      data: p[2],
      status: S.demo[p[0]] ? 'granted' : 'revoked'
    }))
  }, null, 2);
}

export function demoHTML() {
  return `
    <div class="card">
      <h2>Orbit Bank asks for</h2>
      <div style="margin-top:8px">
        ${DEMOP.map(p => `
          <div class="prow" style="grid-template-columns:minmax(0,1fr) auto;align-items:center">
            <div>
              <h3>${p[1]}</h3>
              <div class="meta">${p[2]} · ${p[3]}</div>
            </div>
            <button class="sw dk" role="switch" aria-checked="${S.demo[p[0]]}" aria-label="${p[1]}" data-act="demotoggle" data-k="${p[0]}"></button>
          </div>
        `).join('')}
      </div>
      <div class="row" style="margin-top:14px">
        <button class="btn btn--r btn--sm" data-act="demorevoke">Revoke all</button>
      </div>
    </div>
    <div class="card" style="background:var(--c-night);color:var(--c-mist);border-color:var(--line)">
      <div class="row" style="justify-content:space-between">
        <b style="font-weight:500">Live consent receipt</b>
        <span class="live" style="color:var(--c-mist)"><i></i>sha-256</span>
      </div>
      <pre class="code" style="margin-top:12px;background:transparent;border:0;padding:0">${esc(demoJSON())}</pre>
      <div class="mono" id="demohash" style="margin-top:12px;word-break:break-all;color:var(--c-pink)">hash …</div>
    </div>
  `;
}

export async function setDemoHash() {
  const el = $('#demohash');
  if (el) {
    const h = await sha(demoJSON());
    const e2 = $('#demohash');
    if (e2) e2.textContent = 'sha256 ' + h;
  }
}

export const SECG = [
  ['lock', 'Encrypted everywhere', 'TLS in transit and Cloud KMS keys at rest, with rotation.'],
  ['globe', 'India data residency', 'Stored in Mumbai and Delhi with multi-zone availability.'],
  ['ledger', 'Tamper-evident log', 'Hash-chained events. Changing one breaks every later hash.'],
  ['users', 'Least-privilege access', 'Five roles and a permission matrix. Auditors never see personal data.'],
  ['bolt', 'Sovereign AI mode', 'Gemma runs inside your boundary. Personal data is not sent out.'],
  ['eye', 'Data minimisation', 'Purpose-bound requests. Nothing pre-ticked, nothing bundled.']
];

export function landing() {
  const u = S.user;
  const d1 = daysTo(2027, 5, 14);
  const now = Date.now();
  const mil = [
    ['14 Nov 2025', 'Rules notified', 'Data Protection Board constituted. The Rules were published.', new Date(2025, 10, 14)],
    ['14 Nov 2026', 'Consent Managers', 'Consent Manager registration and Board provisions apply.', new Date(2026, 10, 14)],
    ['14 May 2027', 'Main duties', 'Notice, consent, security, breach and rights duties apply in full.', new Date(2027, 4, 14)]
  ];
  const cur = mil.findLastIndex ? mil.findLastIndex(m => m[3] <= now) : 0;

  return `
    <nav class="lnav" id="lnav">
      <div class="wrap">
        <a class="brand" href="#" data-scroll="top">
          ${LOGO}
          <span>ConsentPro</span>
        </a>
        <div class="links">
          ${[['product', 'Product'], ['audiences', 'Who it is for'], ['how', 'How it works'], ['compliance', 'Compliance'], ['dev', 'Developers'], ['pricing', 'Pricing'], ['faq', 'FAQ']].map(([k, l]) => `<button data-scroll="${k}" data-spy="${k}">${l}</button>`).join('')}
        </div>
        <span class="spacer" style="flex:1"></span>
        <button class="iconbtn" data-act="theme" aria-label="Change theme">
          ${ic(S.theme === 'dark' ? 'moon' : S.theme === 'light' ? 'sun' : 'auto')}
        </button>
        ${u ? `<button class="btn btn--p" data-go="${ROLES[u.role].home}">Open dashboard</button>` : `
          <button class="btn hide-m" data-go="login">Log in</button>
          <button class="btn btn--p hide-m" data-go="signup">Get started</button>
        `}
        <button class="iconbtn mmb" data-menu="1" aria-label="Menu" aria-expanded="${S.menu}">
          ${ic('list')}
        </button>
      </div>
      <div class="mm" id="mm" ${S.menu ? '' : 'hidden'}>
        ${[['product', 'Product'], ['audiences', 'Who it is for'], ['how', 'How it works'], ['compliance', 'Compliance'], ['dev', 'Developers'], ['pricing', 'Pricing'], ['faq', 'FAQ']].map(([k, l]) => `<button data-scroll="${k}">${l}</button>`).join('')}
        ${u ? '' : `
          <button data-go="login">Log in</button>
          <button class="btn btn--p" data-go="signup">Get started</button>
        `}
      </div>
    </nav>

    <section class="h3">
      <i class="blob b1"></i>
      <i class="blob b2"></i>
      <div class="grid"></div>
      <div class="wrap">
        <div>
          <span class="tag"><i></i>DPDP Rules 2025 · ${d1} days to full enforcement</span>
          <h1>Consent people can <b>see, change</b> and you can <b>prove</b>.</h1>
          <p class="lead">One place for every person to manage what they agreed to. An SDK, an API and a tamper-evident audit trail for the teams that must answer to a regulator.</p>
          <div class="row" style="margin-top:32px">
            <button class="btn btn--r btn--xl" data-go="signup">Start free</button>
            <button class="btn btn--ghost btn--xl" data-go="login">Explore the live demo</button>
          </div>
          <div class="badges">
            <span>${ic('shield')}DPDP Act 2023</span>
            <span>${ic('globe')}GDPR aligned</span>
            <span>${ic('lock')}India data residency</span>
            <span>${ic('ledger')}Hash-chained audit</span>
          </div>
        </div>

        <div class="show">
          <div class="tabs3" role="tablist" aria-label="Product preview">
            ${HTABS.map((t, i) => `<button role="tab" aria-selected="${S.heroTab === i}" data-htab="${i}">${t}</button>`).join('')}
          </div>
          <div id="hpanel">${heroPanel(S.heroTab)}</div>
          <div class="float2 f1">${ic('bolt')}Revoked · 2.6 s</div>
          <div class="float2 f2">${ic('check')}Hash verified</div>
          <div class="hnote">Interactive preview · sample data</div>
        </div>
      </div>

      <div class="cstrip">
        <div class="wrap">
          ${[[2.6, ' s', 'median revocation reach (design target under 5 s)', 1], [9, '', 'DPDP duties tracked, s.5 to s.14', 0], [22, '', 'scheduled Indian languages planned', 0], [250, ' cr', 'highest penalty under the Act, ₹', 0]].map(c => `
            <div class="c">
              <div class="n">
                <span class="cnt" data-to="${c[0]}" data-d="${c[3]}" data-suf="${c[1]}">${c[0]}${c[1]}</span>
              </div>
              <div class="l">${c[2]}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="sect" id="why">
      <div class="wrap rv">
        <div class="eyebrow">Why now</div>
        <h2>The law is here. Most consent screens are not ready.</h2>
        <div class="tl">
          ${mil.map((m, i) => `
            <div class="m ${i < cur ? 'done' : i === cur ? 'now' : ''}">
              <span class="d"></span>
              <small>${m[0]}</small>
              <b>${m[1]}</b>
              <small>${m[2]}</small>
              <span class="tg">${i < cur ? 'In force' : i === cur ? 'In force now' : 'Upcoming'}</span>
            </div>
          `).join('')}
        </div>
        <div class="cd">
          <div class="big">${d1}</div>
          <div>
            <b style="font-weight:500">days until the main duties apply</b>
            <div style="color:var(--ink-2);font-size:14px">Counted to 14 May 2027, 18 months after the Rules were notified.</div>
          </div>
        </div>
        <div class="facts">
          <div class="card fact">
            <div class="big">4.1%</div>
            <p>of 6,000+ Indian websites showed any consent mechanism in a 2026 scan.</p>
            <div class="src">ComplyZero study, Feb 2026 (vendor research)</div>
          </div>
          <div class="card fact">
            <div class="big">₹250 cr</div>
            <p>is the highest penalty under the Digital Personal Data Protection Act, 2023.</p>
            <div class="src">DPDP Act 2023, Schedule</div>
          </div>
          <div class="card fact">
            <div class="big">s.6(4)</div>
            <p>says withdrawing consent must be as easy as giving it. Most flows still bury the button.</p>
            <div class="src">DPDP Act 2023</div>
          </div>
        </div>
      </div>
    </section>

    <section class="sect alt" id="audiences">
      <div class="wrap rv">
        <div class="eyebrow">Who it is for</div>
        <h2>One platform for everyone in the consent chain.</h2>
        <div class="aud">
          <div class="nv" role="tablist">
            ${AUDS.map((a, i) => `
              <button role="tab" aria-selected="${S.aud === i}" data-aud="${i}">
                ${ic(a[0])}
                <span><b>${a[1]}</b><small>${a[2]}</small></span>
              </button>
            `).join('')}
          </div>
          <div class="card pn" id="audpn">${audPanel()}</div>
        </div>
      </div>
    </section>

    <section class="sect" id="product">
      <div class="wrap rv">
        <div class="eyebrow">Product</div>
        <h2>Everything a consent programme needs.</h2>
        <div class="feats">
          ${FEATS.map(f => `
            <div class="card feat">
              <div class="tile">${ic(f[0])}</div>
              <h3>${f[1]}</h3>
              <p>${f[2]}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="sect alt" id="how">
      <div class="wrap rv">
        <div class="eyebrow">How it works</div>
        <h2>Six steps from notice to proof.</h2>
        <div class="stepper">
          <div class="tabs" role="tablist">
            ${STEPS.map((s, i) => `
              <button class="tab" role="tab" aria-selected="${S.step === i}" data-step="${i}">
                <i>${i + 1}</i>
                <span><b>${s[0]}</b><small>${s[1]}</small></span>
              </button>
            `).join('')}
          </div>
          <div class="stage" id="stage">${stageHTML()}</div>
        </div>
      </div>
    </section>

    <section class="sect" id="demo">
      <div class="wrap rv">
        <div class="eyebrow">Try it</div>
        <h2>Flip a switch. Watch the receipt change.</h2>
        <p class="sub2">This runs in your browser. The hash is a real SHA-256 of the receipt.</p>
        <div class="demo2" id="demopane">${demoHTML()}</div>
      </div>
    </section>

    <section class="sect sec3">
      <div class="wrap rv">
        <div class="eyebrow">Trust and security</div>
        <h2>Designed to hold up under scrutiny.</h2>
        <div class="sgrid">
          ${SECG.map(s => `
            <div class="s">
              ${ic(s[0])}
              <h3>${s[1]}</h3>
              <p>${s[2]}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="sect" id="compliance">
      <div class="wrap rv">
        <div class="eyebrow">Compliance</div>
        <h2>Mapped to the clauses that matter.</h2>
        <div class="card scroll" style="margin-top:36px;padding:8px 16px">
          <table class="tbl">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>DPDP Act 2023</th>
                <th>GDPR</th>
                <th>In ConsentPro</th>
              </tr>
            </thead>
            <tbody>
              ${[['Clear notice', 's.5', 'Art. 13–14', 'Multilingual notice per purpose'], ['Free, specific, informed consent', 's.6', 'Art. 6–7', 'Purpose-bound, nothing pre-ticked'], ['Withdrawal as easy as giving', 's.6(4)', 'Art. 7(3)', 'One-tap and voice revoke'], ['Reasonable security safeguards', 's.8(5)', 'Art. 32', 'Encryption, RBAC, key rotation, audit log'], ['Children’s data', 's.9', 'Art. 8', 'Guardian consent flow (roadmap)'], ['Breach intimation', 's.8(6)', 'Art. 33', 'Alert workflow (roadmap)'], ['Access, correction, erasure, grievance', 's.11–14', 'Art. 15–22', 'Rights-request queue with due dates']].map(r => `
                <tr>
                  <td><b style="font-weight:500">${r[0]}</b></td>
                  <td>${r[1]}</td>
                  <td>${r[2]}</td>
                  <td>${r[3]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="sect band" id="dev">
      <div class="wrap rv">
        <div class="eyebrow">Developers</div>
        <h2 style="color:var(--c-mist)">Check consent in one line.</h2>
        <p class="sub2">Web, Android, iOS and REST. Preview of the planned interface; package names are placeholders.</p>
        <div class="row" style="margin:28px 0 12px">
          ${[['web', 'Web'], ['rest', 'REST']].map(([k, l]) => `
            <button class="chip" style="background:${S.ltab === k ? 'var(--c-pink)' : 'transparent'};color:${S.ltab === k ? 'var(--c-night)' : 'var(--c-mist)'};border-color:rgba(242,230,238,.4)" data-ltab="${k}">${l}</button>
          `).join('')}
        </div>
        <div style="position:relative">
          <pre class="code" id="lcode" style="background:rgba(0,3,61,.7);border-color:rgba(242,230,238,.18)">${SNIP[S.ltab]}</pre>
          <button class="btn btn--ghost btn--sm copyb" data-copycode="1">Copy</button>
        </div>
      </div>
    </section>

    <section class="sect" id="pricing">
      <div class="wrap rv">
        <div class="eyebrow">Pricing</div>
        <h2>Start free. Pay as consent volume grows.</h2>
        <p class="sub2">Illustrative pricing, to be set with pilot partners.</p>
        <div class="price">
          ${[['Starter', 'Free', 'Sandbox and open-source core', ['Up to 1,000 consent events a month', 'Web SDK and REST API', 'Community support'], 'Start free', ''], ['Growth', '₹24,999', '/ month · illustrative', ['Up to 5 lakh events a month', 'All SDKs, webhooks, 4 languages', 'DPO console and rights queue', 'Evidence reports'], 'Start trial', 'hot'], ['Enterprise', 'Custom', 'Government and large fiduciaries', ['Sovereign mode on Gemma', 'All 22 scheduled languages', 'SSO, custom roles, dedicated region', 'Support with response targets'], 'Talk to us', '']].map(p => `
            <div class="card plan ${p[5]}">
              <b style="font-weight:600">${p[0]}</b>
              <div class="p">${p[1]} <small>${p[2]}</small></div>
              <ul>${p[3].map(x => `<li>${ic('check')}${x}</li>`).join('')}</ul>
              <button class="btn ${p[5] ? 'btn--r' : 'btn--p'}" data-go="signup">${p[4]}</button>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="sect alt">
      <div class="wrap rv">
        <div class="eyebrow">Roadmap</div>
        <h2>Three phases to production.</h2>
        <div class="phases">
          ${[['Phase 1', 'Core consent manager', ['Receipts and purpose binding', 'Granular revocation', 'Hash-chained audit log']], ['Phase 2', 'SDKs and interoperability', ['Web, Android, iOS SDKs', 'Receipt, FHIR and OIDC suites', 'Rights-request workflows']], ['Phase 3', 'Scale and sovereignty', ['Sovereign Gemma mode', '22-language notices', 'Regulator-ready reporting']]].map(p => `
            <div class="card phase">
              <div class="n">${p[0]}</div>
              <h3>${p[1]}</h3>
              <ul>${p[2].map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="sect" id="faq">
      <div class="wrap rv">
        <div class="eyebrow">FAQ</div>
        <h2>Straight answers.</h2>
        <div style="margin-top:32px;max-width:820px">
          ${FAQ.map(f => `<details class="q"><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}
        </div>
      </div>
    </section>

    <section class="sect" style="padding-top:0">
      <div class="wrap rv">
        <div class="cta">
          <h2>Give your users a say. Give your auditors proof.</h2>
          <div class="row" style="justify-content:center;margin-top:28px">
            <button class="btn btn--r btn--xl" data-go="signup">Create a free account</button>
            <button class="btn btn--ghost btn--xl" data-go="login">Explore with demo accounts</button>
          </div>
        </div>
      </div>
    </section>

    <footer class="foot3">
      <div class="wrap">
        <div class="cols">
          <div>
            <a class="brand" href="#" data-scroll="top">${LOGO}<span>ConsentPro</span></a>
            <p style="margin-top:12px;max-width:34ch">Consent, in your hands. Built for the DPDP Act 2023 and GDPR.</p>
          </div>
          <div>
            <h4>Product</h4>
            ${[['product', 'Features'], ['how', 'How it works'], ['pricing', 'Pricing']].map(([k, l]) => `<button data-scroll="${k}">${l}</button>`).join('')}
          </div>
          <div>
            <h4>Compliance</h4>
            ${[['compliance', 'DPDP and GDPR map'], ['why', 'Enforcement timeline'], ['faq', 'FAQ']].map(([k, l]) => `<button data-scroll="${k}">${l}</button>`).join('')}
          </div>
          <div>
            <h4>Get started</h4>
            <button data-go="login">Log in</button>
            <button data-go="signup">Create account</button>
            <button data-scroll="dev">Developers</button>
          </div>
        </div>
        <div class="bt">
          <span>© 2026 ConsentPro · Built by Team Data Geeks</span>
          <span>Demo build · sample data only</span>
        </div>
      </div>
    </footer>
  `;
}

let v4t = null;
let v4io = null;

export function afterPublic() {
  if (S.route === 'home') {
    setDemoHash();
    document.documentElement.classList.add('js-rv');
    if ('IntersectionObserver' in window) {
      if (v4io) v4io.disconnect();
      v4io = new IntersectionObserver(es => {
        es.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            if (e.target.querySelector('.cnt')) countUp(e.target);
            v4io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      $$('.rv').forEach(el => v4io.observe(el));
      const cs = $('.cstrip');
      if (cs) {
        const o = new IntersectionObserver(es => {
          if (es[0].isIntersecting) {
            countUp(cs);
            o.disconnect();
          }
        }, { threshold: 0.3 });
        o.observe(cs);
      }
    } else {
      $$('.rv').forEach(el => el.classList.add('in'));
    }
  } else {
    document.documentElement.classList.remove('js-rv');
  }

  clearInterval(v4t);
  v4t = setInterval(() => {
    if (S.route === 'home' && !S.heroHold && !document.hidden) {
      S.heroTab = (S.heroTab + 1) % 3;
      setHero();
    }
    if (S.route === 'login' || S.route === 'signup') {
      if (!S.slideHold && $('#slides')) setSlide((S.slide + 1) % 3);
    }
  }, 5500);
}

export function setHero() {
  const p = $('#hpanel');
  if (!p) return;
  p.innerHTML = heroPanel(S.heroTab);
  $$('[data-htab]').forEach(b => b.setAttribute('aria-selected', +b.dataset.htab === S.heroTab));
}

export function setSlide(i) {
  S.slide = i;
  $$('.slide').forEach(s => s.classList.toggle('on', +s.dataset.sl === i));
  $$('#dots button').forEach((b, k) => b.classList.toggle('on', k === i));
}

export function countUp(root) {
  $$('.cnt', root).forEach(el => {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    const to = +el.dataset.to, dec = +el.dataset.d, suf = el.dataset.suf, t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
