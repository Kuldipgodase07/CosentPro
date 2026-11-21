/**
 * ConsentPro Front-End Application Master Entry Point
 * Bootstraps reactive stores, security hash chains, routing, and event delegation.
 */
import { S, $, $$, esc, strength, byId, stat, hex, rnd, p95, score } from './core/state.js';
import { hashPw, canon, sha } from './core/crypto.js';
import { PW, ROLES, ROLE_PERMS, PERMS, PUBLIC, ORGS, SUITES, RULES_TEXT, SAMPLE_NOTICE, SAMPLE_REQ } from './core/constants.js';
import { ic } from './components/icons.js';
import { toast } from './components/ui/toast.js';
import { initTheme, cycleTheme } from './services/theme.js';
import { addEntry, seedLedger, verifyChain, applyConsent, ledgerRows, filtered } from './services/ledger.js';
import { startSimulation } from './services/simulation.js';
import { DB } from './services/firestore-db.js';
import { AI } from './services/ai-engine.js';
import { initFirebaseAdapter } from './services/firebase-adapter.js';

import { R, can, roleHome, go, login, logout, render } from './core/router.js';
import { renderModal, closeModal, runConfirm } from './components/ui/modal.js';
import { openNotifs, closeDrawer } from './components/ui/drawer.js';
import { openCmd, closeCmd, drawCmd, navigateCmd, executeCmd, cmdList, cmdSel } from './components/ui/command-palette.js';
import { openUserMenu, closePop } from './components/ui/user-menu.js';

import { setHero, setSlide, countUp, setDemoHash, demoHTML, stageHTML } from './views/public/landing.js';
import { pwField } from './views/public/auth.js';
import { handleChat, stage, say } from './views/citizen/assistant.js';
import { obligations } from './views/dpo/dashboard.js';
import { noticeCards } from './views/ai/ai-studio.js';
import { simHTML, rulesHTML, fsHTML, opsHTML, fsStats, fsRefresh } from './views/platform/platform.js';

/* ---------- auth logic ---------- */
export async function seedUsers() {
  try {
    const saved = localStorage.getItem('cp-custom-users');
    if (saved) {
      const extra = JSON.parse(saved);
      for (const eu of extra) {
        if (!S.users.some(u => u.email.toLowerCase() === eu.email.toLowerCase())) {
          S.users.push(eu);
        }
      }
    }
  } catch (e) {}

  for (const u of S.users) {
    if (!u.pw) {
      u.pw = await hashPw(u.email, PW);
    }
  }
}

export async function doLogin(email, pw) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPw = (pw || '').trim();
  const u = S.users.find(x => x.email.toLowerCase() === cleanEmail);
  if (!u) {
    S.authErr = 'Email or password is incorrect.';
    return render();
  }
  if (!u.pw) {
    u.pw = await hashPw(u.email, PW);
  }
  const inputHash = await hashPw(u.email, cleanPw);
  const rawHash = await hashPw(u.email, pw || '');
  const isValidPw = cleanPw === PW || pw === PW || u.pw === inputHash || u.pw === rawHash;
  if (!isValidPw) {
    S.authErr = 'Email or password is incorrect.';
    return render();
  }
  S.authErr = '';
  DB.auth++;
  DB.log('auth', `signInWithPassword · role=${u.role}`, 0);
  if (u.mfa && S.settings.mfa && u.role !== 'principal') {
    S.mfa = u;
    return render();
  }
  login(u);
}

export async function doSignup() {
  const name = $('#sn')?.value.trim() || '';
  const email = $('#se')?.value.trim() || '';
  const pw = $('#sp')?.value || '';
  const org = S.stype === 'org' ? ($('#so')?.value.trim() || '') : '';

  const bad = !name ? 'Enter your full name.' :
    (S.stype === 'org' && !org) ? 'Enter your organisation name.' :
    !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email address.' :
    S.users.some(u => u.email.toLowerCase() === email.toLowerCase()) ? 'That email is already registered. Log in instead.' :
    strength(pw) < 3 ? 'Choose a stronger password: 8+ characters, mixed case, a number or symbol.' :
    !$('#st')?.checked ? 'Accept the terms to continue.' : '';

  if (bad) {
    S.authErr = bad;
    render();
    const f = { sn: name, se: email, so: org };
    Object.entries(f).forEach(([k, v]) => {
      const e = $('#' + k);
      if (e) e.value = v;
    });
    return;
  }

  const u = {
    name,
    email,
    role: S.stype === 'org' ? 'admin' : 'principal',
    status: 'Active',
    last: 'now',
    mfa: false,
    added: true
  };
  u.pw = await hashPw(email, pw);
  S.users.push(u);

  try {
    const custom = S.users.filter(x => x.added);
    localStorage.setItem('cp-custom-users', JSON.stringify(custom));
  } catch (e) {}

  if (S.stype === 'org') {
    S.tenant = { name: org, plan: 'Starter', region: 'Mumbai · asia-south1' };
    ORGS.orbit.name = org;
    S.newTenant = true;
    S.settings.dpo = '';
    S.settings.dpoMail = '';
    S.keys = [];
    S.hooks = [];
  }
  login(u);
}

export function rerenderKeep() {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(msg);
  } catch (e) {
    toast('Copy is blocked here. Select the text and copy it.');
  }
}

/* ==========================================================================
   Global Event Handlers & Delegation
   ========================================================================== */
document.addEventListener('click', async ev => {
  const t = ev.target.closest('[data-go],[data-scroll],[data-act],[data-filter],[data-lang],[data-tab],[data-step],[data-ltab],[data-rf],[data-stype],[data-cmd],[data-htab],[data-aud],[data-hv],[data-menu],[data-pw],[data-slide],[data-otpfill],[data-copycode],[data-aitab],[data-airun],[data-ailang],[data-aisample],[data-aimk],[data-fs],[data-copyrules],.scrim');

  if (!ev.target.closest('#pop') && !(t && t.dataset.act === 'umenu')) {
    closePop();
  }

  if (!t) {
    if (ev.target.closest('.cmd') && !ev.target.closest('.box2')) {
      closeCmd();
    }
    return;
  }

  if (t.classList.contains('scrim')) {
    if (ev.target === t) closeModal(render);
    return;
  }

  const d = t.dataset;

  // Navigation
  if (d.scroll) {
    ev.preventDefault();
    if (d.scroll === 'top') {
      return window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const target = document.getElementById(d.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (S.menu) {
      S.menu = false;
      const m = $('#mm');
      if (m) m.hidden = true;
    }
    return;
  }

  if (d.go) {
    ev.preventDefault();
    closeCmd();
    const dr = $('#drawer');
    if (dr) dr.hidden = true;
    return go(d.go);
  }

  if (d.step !== undefined) {
    S.step = +d.step;
    const stg = $('#stage');
    if (stg) stg.innerHTML = stageHTML();
    $$('.tab').forEach((b, i) => b.setAttribute('aria-selected', i === S.step));
    return;
  }

  if (d.ltab) {
    S.ltab = d.ltab;
    return rerenderKeep();
  }

  if (d.stype) {
    const v = ['sn', 'se', 'so'].map(k => $('#' + k)?.value || '');
    S.stype = d.stype;
    S.authErr = '';
    render();
    ['sn', 'se', 'so'].forEach((k, i) => {
      const e = $('#' + k);
      if (e) e.value = v[i];
    });
    return;
  }

  if (d.rf) {
    S.rf = d.rf;
    return render();
  }

  if (d.cmd !== undefined) {
    const it = cmdList[+d.cmd];
    closeCmd();
    return it && it.run();
  }

  if (d.filter) {
    S.filter = d.filter;
    return render();
  }

  if (d.lang) {
    S.lang = d.lang;
    return render();
  }

  if (d.tab) {
    S.tab = d.tab;
    return render();
  }

  // Interactive showcase
  if (d.htab !== undefined) {
    S.heroTab = +d.htab;
    S.heroHold = true;
    return setHero();
  }

  if (d.aud !== undefined) {
    S.aud = +d.aud;
    import('./views/public/landing.js').then(m => {
      const pn = $('#audpn');
      if (pn) pn.innerHTML = m.audPanel();
    });
    $$('[data-aud]').forEach(b => b.setAttribute('aria-selected', +b.dataset.aud === S.aud));
    return;
  }

  if (d.hv) {
    const bl = $$('#hchain .blk'), st = $('#hvstat');
    bl.forEach(b => b.classList.remove('ok', 'bad'));
    if (d.hv === 'verify') {
      if (st) st.textContent = 'Recomputing…';
      bl.forEach((b, k) => setTimeout(() => {
        b.classList.add('ok');
        if (k === bl.length - 1 && st) st.textContent = 'Chain verified · 0 breaks in 6 blocks';
      }, 160 * (k + 1)));
    } else {
      if (st) st.textContent = 'Recomputing…';
      bl.forEach((b, k) => setTimeout(() => {
        b.classList.add(k < 2 ? 'ok' : 'bad');
        if (k === 2) b.innerHTML = '<em>#43</em>EDITED…';
        if (k === bl.length - 1 && st) st.textContent = 'Break found at #43. Every later hash fails.';
      }, 160 * (k + 1)));
    }
    return;
  }

  if (d.menu) {
    ev.preventDefault();
    S.menu = !S.menu;
    const mm = $('#mm');
    if (mm) mm.hidden = !S.menu;
    t.setAttribute('aria-expanded', S.menu);
    return;
  }

  if (d.pw === 'toggle') {
    const i = t.parentElement.querySelector('input');
    if (i) {
      const show = i.type === 'password';
      i.type = show ? 'text' : 'password';
      t.textContent = show ? 'Hide' : 'Show';
      t.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    }
    return;
  }

  if (d.pw === 'forgot') {
    ev.preventDefault();
    const fnote = $('#fnote');
    if (fnote) fnote.hidden = false;
    return;
  }

  if (d.slide !== undefined) {
    S.slideHold = true;
    return setSlide(+d.slide);
  }

  if (d.otpfill) {
    ev.preventDefault();
    '482913'.split('').forEach((c, k) => {
      const el = $$('.od')[k];
      if (el) el.value = c;
    });
    const c = $('#code');
    if (c) c.value = '482913';
    return;
  }

  if (d.copycode) {
    const txt = $('#lcode')?.textContent || '';
    return copyText(txt, 'Code copied');
  }

  // AI Studio
  if (d.aitab) {
    S.ai.tab = d.aitab;
    return rerenderKeep();
  }

  if (d.aisample) {
    if (d.aisample === 'notice') S.ai.text = SAMPLE_NOTICE;
    else S.ai.req = SAMPLE_REQ;
    return rerenderKeep();
  }

  if (d.ailang) {
    S.ai.lang = d.ailang;
    $$('[data-ailang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.ailang === S.ai.lang));
    const c = $('#ai-cards');
    if (c) c.innerHTML = noticeCards();
    return;
  }

  if (d.airun) {
    if (d.airun === 'lint') S.ai.text = $('#ai-notice')?.value || S.ai.text;
    if (d.airun === 'triage') S.ai.req = $('#ai-req')?.value || S.ai.req;
    S.ai.busy = d.airun;
    rerenderKeep();
    const r = await AI.call(d.airun, { text: d.airun === 'lint' ? S.ai.text : S.ai.req }, obligations);
    S.ai.res[d.airun] = r;
    S.ai.busy = '';
    return rerenderKeep();
  }

  if (d.aimk) {
    const o = S.ai.res.triage && S.ai.res.triage.out;
    if (!o) return;
    const n = 1044 + S.requests.length;
    S.requests.push({ id: 'RQ-' + n, type: o.type, by: 'dp_7c41e2', text: S.ai.req, ts: Date.now(), due: o.due, status: 'Open' });
    toast(`Added RQ-${n} to the rights queue.`);
    DB.sync();
    return;
  }

  if (d.fs) {
    S.ai.fs = d.fs;
    return fsRefresh();
  }

  if (d.copyrules) {
    return copyText(RULES_TEXT, 'Rules copied.');
  }

  // Actions
  const a = d.act;
  const id = d.id;

  switch (a) {
    case 'rail':
      S.rail = !S.rail;
      return render();
    case 'drawer':
      S.drawerOpen = !S.drawerOpen;
      return $('#app')?.classList.toggle('open', S.drawerOpen);
    case 'umenu':
      return $('#pop')?.hidden ? openUserMenu(t) : closePop();
    case 'cmd':
      return openCmd(R, can, go, () => cycleTheme(render), logout);
    case 'notifs':
      openNotifs(render);
      return render() || openNotifs(render);
    case 'closedrawer':
      return closeDrawer();
    case 'readall':
      S.notifs.forEach(n => n.un = false);
      openNotifs(render);
      return render();
    case 'theme':
      return cycleTheme(render);
    case 'logout':
      return logout();
    case 'as': {
      const u = S.users.find(x => x.email === d.email);
      closePop();
      if (u) {
        S.user = u;
        go(roleHome());
        toast('Viewing as ' + ROLES[u.role].n);
      }
      return;
    }
    case 'herotoggle': {
      S.hero[+d.i] = !S.hero[+d.i];
      t.setAttribute('aria-checked', S.hero[+d.i]);
      setTimeout(() => {
        const el = $('#herostat');
        if (el) el.textContent = S.hero[+d.i] ? 'Consent recorded · receipt signed in 0.2 s' : 'Revocation reached 4 systems in 2.6 s';
      }, 0);
      S.heroHold = true;
      return;
    }
    case 'demotoggle':
      S.demo[d.k] = !S.demo[d.k];
      $('#demopane').innerHTML = demoHTML();
      return setDemoHash();
    case 'demorevoke':
      S.demo = { a: false, b: false, c: false };
      $('#demopane').innerHTML = demoHTML();
      return setDemoHash();
    case 'demo-login': {
      const u = S.users.find(x => x.email === d.email);
      if (u) return doLogin(u.email, PW);
      return;
    }
    case 'mfa-cancel':
      S.mfa = null;
      S.authErr = '';
      return render();
    case 'ask':
      S.modal = { type: 'confirm', id, do: d.do, step: 'ask' };
      return renderModal(render);
    case 'receipt':
      S.modal = { type: 'receipt', id };
      return renderModal(render);
    case 'close':
      return closeModal(render);
    case 'confirm':
      return runConfirm(render);
    case 'notice-submit': {
      const ps = S.purposes.filter(p => p.status === 'pending');
      let g = 0;
      ps.forEach(p => {
        if (S.noticePick[p.id]) {
          applyConsent(p.id, 'grant');
          g++;
        } else {
          p.status = 'revoked';
          p.updated = Date.now();
          addEntry({ type: 'DECLINE', org: p.org, purpose: p.name, subject: 'dp_7c41e2', receipt: 'RC-' + hex(8).toUpperCase() });
        }
      });
      S.noticePick = { t1: false, t2: false };
      toast(g ? `Saved. ${g} purpose${g > 1 ? 's' : ''} granted.` : 'Declined. Nothing was granted.');
      return render();
    }
    case 'chip':
      await handleChat(d.t, render);
      return render();
    case 'chat-pick':
      stage(byId(id), d.do);
      return render();
    case 'chat-confirm':
      if (S.pending) {
        const p = byId(S.pending.id);
        const r = applyConsent(S.pending.id, S.pending.do);
        say(`Done. “${esc(p.name)}” is now <b>${S.pending.do === 'revoke' ? 'revoked' : 'granted'}</b>. Receipt <span class="mono">${r}</span>.`);
        S.pending = null;
        render();
      }
      return;
    case 'chat-cancel':
      S.pending = null;
      say('No change made.');
      return render();
    case 'copy-snip':
      return copyText($('#snip')?.textContent || '', 'Code copied');
    case 'run-verify': {
      const p = byId($('#apip')?.value);
      if (!p) return;
      const t0 = performance.now();
      await new Promise(r => setTimeout(r, rnd(60, 130)));
      const ok = stat(p) === 'granted';
      const ms = Math.round(performance.now() - t0);
      S.lat.push(ms);
      addEntry({ type: 'VERIFY', org: 'orbit', purpose: p.name, subject: 'dp_7c41e2', receipt: p.receipt });
      S.apiOut = JSON.stringify({ allowed: ok, purpose: p.id, status: stat(p), receipt: p.receipt, evaluated_in_ms: ms }, null, 2)
        .replace(/"([a-z_]+)":/g, '<span class="c">"$1"</span>:');
      const o = $('#apiout');
      if (o) o.innerHTML = S.apiOut;
      return;
    }
    case 'comp-done':
      if (!can('purposes')) return toast('Only a DPO or admin can change this.');
      S.comp.find(c => c.id === id).state = 'done';
      return render();
    case 'verify':
      if (!can('verify')) return toast('Your role cannot run verification.');
      t.disabled = true;
      await verifyChain();
      render();
      return toast(S.verified.ok ? 'Chain verified' : 'Chain broken at #' + S.verified.at);
    case 'tamper': {
      if (!can('verify')) return toast('Your role cannot run this test.');
      if (S.tamper) {
        const e = S.ledger.find(x => x.seq === S.tamper);
        if (e && S.backup) Object.assign(e, S.backup);
        S.tamper = null;
        S.backup = null;
        S.verified = null;
      } else {
        const e = S.ledger[Math.floor(S.ledger.length / 2)];
        if (e) {
          S.backup = { org: e.org, purpose: e.purpose };
          S.tamper = e.seq;
          e.org = 'telco';
          e.purpose = 'Altered after the fact';
          S.verified = null;
        }
      }
      return render();
    }
    case 'copy-bundle':
      return copyText(JSON.stringify({
        exported: new Date().toISOString(),
        entries: S.ledger.length,
        head: S.ledger[S.ledger.length - 1]?.hash,
        ledger: S.ledger.slice(-50)
      }, null, 2), 'Evidence bundle copied');
    case 'req': {
      const r = S.requests.find(x => x.id === id);
      if (r) {
        r.status = d.to;
        if (r.by === 'dp_7c41e2') {
          S.notifs.unshift({ id: Date.now() + Math.random(), to: ['principal'], t: `Your request ${r.id} is now ${d.to.toLowerCase()}.`, ts: Date.now(), un: true });
        }
        toast(r.id + ' is ' + d.to.toLowerCase());
        return render();
      }
      return;
    }
    case 'selp':
      S.sel = id;
      return render();
    case 'nstat':
      S.nstat[d.k] = d.v === 'ok' ? 'draft' : 'ok';
      return render();
    case 'keyrev': {
      const k = S.keys.find(x => x.id === id);
      if (k) k.status = 'revoked';
      toast('Key revoked. It stops working immediately.');
      return render();
    }
    case 'copykey':
      return copyText(d.v, 'Key copied');
    case 'hooktest': {
      const ms = Math.round(rnd(80, 240));
      S.deliv.unshift({ code: 200, event: 'consent.revoked (test)', ms });
      toast('Test delivered, 200 in ' + ms + ' ms');
      return render();
    }
    case 'runtests': {
      if (!can('tests')) return;
      S.running = true;
      S.tests = SUITES.map(() => null);
      render();
      for (let i = 0; i < SUITES.length; i++) {
        S.tests[i] = { done: false };
        if (S.route === 'o-tests') render();
        await new Promise(r => setTimeout(r, 420));
        const n = SUITES[i][2].length, w = i === 4 ? 1 : 0;
        S.tests[i] = { done: true, pass: n - w, warn: w, warnAt: 2, ms: Math.round(rnd(180, 900)) };
      }
      S.running = false;
      if (S.route === 'o-tests') render();
      return toast('Suites finished');
    }
    case 'tsel':
      S.testSel = +d.i;
      return render();
    case 'accept': {
      const u = S.users.find(x => x.email === d.email);
      if (u) {
        u.status = 'Active';
        u.last = 'just now';
        return render();
      }
      return;
    }
    case 'rmuser':
      S.users = S.users.filter(x => x.email !== d.email);
      toast('Member removed');
      return render();
    case 'goreq':
      S.rtype = d.t;
      return go('c-requests');
    case 'board':
      return copyText(
        `Board summary · ${S.tenant.name} · ${new Date().toDateString()}\nDPDP readiness ${score()}%\nActive consents ${S.stats.active}\nRights requests open ${S.requests.filter(r => r.status !== 'Resolved').length}\nObligations ready ${obligations().filter(o => o[3] === 'done').length} of ${obligations().length}\nRevocation avg ${S.stats.prop.toFixed(1)} s`,
        'Board summary copied'
      );
    case 'sample': {
      const pool = [...S.ledger].sort(() => Math.random() - 0.5).slice(0, 25);
      S.sample = [];
      for (const e of pool) {
        S.sample.push({ ...e, ok: (await sha(canon(e))) === e.hash });
      }
      toast('Sample of ' + S.sample.length + ' drawn');
      return render();
    }
    case 'setmfa':
      S.settings.mfa = !S.settings.mfa;
      return render();
    case 'lang': {
      const l = d.l, a2 = S.settings.langs;
      S.settings.langs = a2.includes(l) ? (a2.length > 1 ? a2.filter(x => x !== l) : a2) : [...a2, l];
      return render();
    }
  }
});

/* change events */
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.pick) {
    S.noticePick[t.dataset.pick] = t.checked;
    render();
  } else if (t.id === 'ft') {
    S.ftype = t.value;
    const b = $('#lbody');
    if (b) b.innerHTML = ledgerRows();
  } else if (t.dataset.perm) {
    const r = t.dataset.prole, p = t.dataset.perm, a = ROLE_PERMS[r];
    ROLE_PERMS[r] = t.checked ? [...new Set([...a, p])] : a.filter(x => x !== p);
    toast(`${ROLES[r].n}: ${PERMS[p]} ${t.checked ? 'allowed' : 'removed'}`);
    render();
  } else if (t.dataset.set) {
    S.settings[t.dataset.set] = t.value;
    toast('Saved');
  } else if (t.id && t.id.startsWith('sim-')) {
    const s = S.ai.sim;
    if (t.id === 'sim-role') s.role = t.value;
    if (t.id === 'sim-op') s.op = t.value;
    if (t.id === 'sim-col') s.col = t.value;
    if (t.id === 'sim-own') s.own = t.checked;
    const sim = $('#sim');
    if (sim) sim.innerHTML = simHTML();
    const rv = $('#rules-view');
    if (rv) rv.innerHTML = rulesHTML();
    const h = $('#rules-view .hl');
    if (h) h.scrollIntoView({ block: 'nearest' });
  }
});

/* input events */
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q') {
    S.q = t.value;
    const b = $('#lbody');
    if (b) b.innerHTML = ledgerRows();
  } else if (t.id === 'sp') {
    const s = strength(t.value);
    $$('#str i').forEach((i, k) => i.classList.toggle('on', k < s));
    const l = $('#strl');
    if (l) l.textContent = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][s];
  } else if (t.id === 'cmdq') {
    drawCmd(t.value, R, can, go, () => cycleTheme(render), logout);
  } else if (t.classList && t.classList.contains('od')) {
    t.value = t.value.replace(/\D/g, '').slice(-1);
    const all = $$('.od'), k = all.indexOf(t);
    if (t.value && all[k + 1]) all[k + 1].focus();
    const c = $('#code');
    if (c) c.value = all.map(x => x.value).join('');
  }
});

/* form submits */
document.addEventListener('submit', async e => {
  e.preventDefault();
  const id = e.target.id;
  const v = k => $('#' + k)?.value.trim() || '';

  if (id === 'loginform') return doLogin(v('le'), ($('#lp')?.value || '').trim());
  if (id === 'signupform') return doSignup();
  if (id === 'mfaform') {
    const code = ($('#code')?.value || $$('.od').map(x => x.value).join('')).trim();
    if (code === '482913') return login(S.mfa);
    S.authErr = 'That code is not right. Use 482913 in this demo.';
    return render();
  }
  if (id === 'chatform') {
    const i = $('#chatin'), x = i?.value.trim();
    if (x) {
      if (i) i.value = '';
      await handleChat(x, render);
      render();
      $('#chatin')?.focus();
    }
    return;
  }
  if (id === 'pform') {
    const p = {
      id: 'n' + Date.now(),
      org: 'orbit',
      name: v('pn'),
      desc: v('pd'),
      data: v('pc').split(',').map(s => s.trim()).filter(Boolean),
      ret: $('#pr')?.value || '12 months',
      status: 'pending',
      exp: null,
      kw: [],
      receipt: 'RC-' + hex(8).toUpperCase(),
      updated: Date.now(),
      rate: 0,
      count: 0
    };
    S.purposes.push(p);
    S.notifs.unshift({ id: Date.now() + Math.random(), to: ['principal'], t: `${ORGS.orbit.name} sent you a consent request: ${p.name}.`, ts: Date.now(), un: true });
    toast('Purpose published. The sample citizen has a new request.');
    return render();
  }
  if (id === 'rform') {
    const n = 1044 + S.requests.filter(r => r.by === 'dp_7c41e2').length;
    S.requests.push({ id: 'RQ-' + n, type: $('#rt')?.value || 'Access', by: 'dp_7c41e2', text: v('rd'), ts: Date.now(), due: Date.now() + 30 * 864e5, status: 'Open' });
    S.notifs.unshift({ id: Date.now() + Math.random(), to: ['dpo', 'admin'], t: `New ${$('#rt')?.value.toLowerCase()} request RQ-${n} from dp_7c41e2.`, ts: Date.now(), un: true });
    toast('Request sent. Due in 30 days.');
    return render();
  }
  if (id === 'kform') {
    const name = v('kn');
    if (!name) return toast('Give the key a name.');
    const scopes = $$('input[name=ks]:checked').map(x => x.value);
    if (!scopes.length) return toast('Choose at least one scope.');
    const full = 'cp_live_' + hex(32);
    S.keys.push({ id: 'k' + Date.now(), name, prefix: full.slice(0, 12), scopes, created: Date.now(), last: 'never', status: 'active' });
    S.notifs.unshift({ id: Date.now() + Math.random(), to: ['dev', 'admin'], t: `API key “${name}” was created.`, ts: Date.now(), un: true });
    S.modal = { type: 'key' };
    const m = $('#modal');
    if (m) {
      m.hidden = false;
      m.innerHTML = `
        <div class="sheet" role="dialog" aria-modal="true">
          <h2>Copy your key now</h2>
          <p class="lead">This is the only time the full key is shown.</p>
          <div class="box mono" style="word-break:break-all">${full}</div>
          <div class="row" style="margin-top:18px;justify-content:flex-end">
            <button class="btn" data-act="copykey" data-v="${full}">${ic('copy')}Copy</button>
            <button class="btn btn--p" data-act="close">I have stored it</button>
          </div>
        </div>
      `;
    }
    return;
  }
  if (id === 'hform') {
    const u = v('hu');
    if (!/^https:\/\/\S+\.\S+/.test(u)) return toast('Enter a full https:// address.');
    S.hooks.push({ id: 'w' + Date.now(), url: u, events: ['consent.revoked', 'consent.granted'], status: 'active' });
    return render();
  }
  if (id === 'iform') {
    const n = v('in'), em = v('ie');
    if (!n || !/^\S+@\S+\.\S+$/.test(em)) return toast('Enter a name and a valid email.');
    if (S.users.some(u => u.email.toLowerCase() === em.toLowerCase())) return toast('That email is already a member.');
    const newMember = { name: n, email: em, role: $('#ir')?.value || 'dev', status: 'Invited', last: '–', mfa: true, added: true, pw: await hashPw(em, PW) };
    S.users.push(newMember);
    toast('Invite sent to ' + em);
    return render();
  }
  if (id === 'sform') {
    S.tenant.name = v('tn') || S.tenant.name;
    ORGS.orbit.name = S.tenant.name;
    Object.assign(S.settings, { dpo: v('td'), dpoMail: v('tm'), retention: $('#tr')?.value || '12 months', region: $('#tg')?.value || 'Mumbai' });
    S.tenant.region = (S.settings.region === 'Mumbai' ? 'Mumbai · asia-south1' : 'Delhi · asia-south2');
    toast('Settings saved');
    return render();
  }
});

/* keyboard navigation */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && S.user) {
    e.preventDefault();
    return openCmd(R, can, go, () => cycleTheme(render), logout);
  }
  if (e.key === 'Escape') {
    closeCmd();
    closePop();
    const dr = $('#drawer');
    if (dr) dr.hidden = true;
    closeModal(render);
  }
  const cmd = $('#cmd');
  if (cmd && !cmd.hidden && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
    e.preventDefault();
    if (e.key === 'Enter') {
      return executeCmd();
    }
    navigateCmd(e.key === 'ArrowDown' ? 1 : -1);
  }
  const t = e.target;
  if (t.classList && t.classList.contains('od') && e.key === 'Backspace' && !t.value) {
    const all = $$('.od'), k = all.indexOf(t);
    if (all[k - 1]) {
      all[k - 1].focus();
      all[k - 1].value = '';
      const c = $('#code');
      if (c) c.value = all.map(x => x.value).join('');
    }
  }
  if (t.type === 'password' || (t.closest && t.closest('.pwf'))) {
    const c = $('#caps');
    if (c && e.getModifierState) c.hidden = !e.getModifierState('CapsLock');
  }
});

/* paste event */
document.addEventListener('paste', e => {
  const t = e.target;
  if (!(t.classList && t.classList.contains('od'))) return;
  const tx = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
  if (!tx) return;
  e.preventDefault();
  const all = $$('.od');
  tx.split('').forEach((c, k) => {
    if (all[k]) all[k].value = c;
  });
  const c = $('#code');
  if (c) c.value = tx;
  if (all[Math.min(tx.length, 5)]) all[Math.min(tx.length, 5)].focus();
});

/* window listeners */
window.addEventListener('scroll', () => {
  if (S.route !== 'home') return;
  const n = $('#lnav');
  if (n) n.classList.toggle('sc', window.scrollY > 8);
  let cur = '';
  $$('[data-spy]').forEach(b => {
    const s = document.getElementById(b.dataset.spy);
    if (s && s.getBoundingClientRect().top < 140) cur = b.dataset.spy;
  });
  $$('[data-spy]').forEach(b => b.setAttribute('aria-current', b.dataset.spy === cur));
}, { passive: true });

window.addEventListener('hashchange', () => {
  const r = location.hash.slice(1);
  if ((PUBLIC.includes(r) || R[r]) && r !== S.route) go(r);
});

// Periodic firestore store sync
setInterval(() => {
  try {
    if (S.user) {
      DB.sync();
      if (S.route === 'o-platform') fsRefresh();
    }
  } catch (e) {}
}, 1500);

/* ==========================================================================
   Application Initialization
   ========================================================================== */
(async () => {
  initTheme();
  await seedUsers();

  try {
    const em = sessionStorage.getItem('cp-session');
    const u = em && S.users.find(x => x.email === em);
    if (u) S.user = u;
  } catch (e) {}

  const r = location.hash.slice(1);
  S.route = (PUBLIC.includes(r) || R[r]) ? r : 'home';
  if (!PUBLIC.includes(S.route) && !S.user) {
    S.next = S.route;
    S.route = 'login';
  }

  render();

  await seedLedger();
  S.feed = S.ledger.filter(e => e.org === 'orbit').slice(-8).reverse();
  if (S.route === 'o-dash' || S.route === 'a-ledger') render();

  startSimulation();
  initFirebaseAdapter(render);
})();
