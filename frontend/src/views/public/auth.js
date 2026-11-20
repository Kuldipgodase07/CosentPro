/**
 * Authentication Views (v4 Split Layout)
 * Supports email/password, individual and organisation registration,
 * two-step verification with 6-digit OTP, demo role direct login.
 */
import { S, esc, strength } from '../../core/state.js';
import { PW, ROLES } from '../../core/constants.js';
import { ic, LOGO } from '../../components/icons.js';

export const ROLEINFO = {
  principal: ['user', 'My consents and rights'],
  dpo: ['shield', 'Compliance command centre'],
  dev: ['code', 'API, SDK and keys'],
  auditor: ['ledger', 'Ledger and evidence'],
  admin: ['users', 'Team and settings']
};

export function slidesHTML() {
  const sl = [
    [`<div class="rcard hsc" style="min-height:0"><div class="row" style="justify-content:space-between"><b style="font-weight:500">Consent receipt</b><span class="pill" style="background:var(--c-pink);color:var(--c-night)">${ic('check')}Signed</span></div>${[['Credit scoring', 'Until loan closure', 1], ['Product offers', '12 months', 0], ['Insurance partners', '6 months', 1]].map(a => `<div class="rrow"><div>${a[0]}<small>${a[1]}</small></div><button class="sw" role="switch" tabindex="-1" aria-checked="${!!a[2]}" aria-label="${a[0]}"></button></div>`).join('')}</div>`, 'Every purpose has its own switch, its own data list and its own signed receipt.'],
    [`<div class="rcard hsc" style="min-height:0"><b style="font-weight:500">Revoked: Product offers</b><div style="margin-top:8px">${[['API gateway', '0.4 s'], ['CRM', '1.1 s'], ['Analytics warehouse', '1.9 s'], ['Messaging platform', '2.6 s']].map(a => `<div class="sys"><span class="ok">${ic('check')}</span>Stopped in ${a[0]}<span class="t">${a[1]}</span></div>`).join('')}</div></div>`, 'Withdraw once. Every connected system hears about it within seconds.'],
    [`<div class="rcard hsc" style="min-height:0"><div class="row" style="justify-content:space-between"><b style="font-weight:500">Ledger verified</b><span class="live" style="color:var(--c-mist)"><i></i>sha-256</span></div><div class="chain" style="margin-top:12px">${['#41 a91f…', '#42 3be0…', '#43 d5c8…', '#44 07fe…', '#45 9c20…', '#46 e1b7…'].map(b => `<span class="blk mono ok">${b}</span>`).join('')}</div><div class="stat"><i></i>0 breaks in 46 blocks</div></div>`, 'Each event carries the hash of the one before it. Edit one and every later hash breaks.']
  ];
  return sl.map((s, i) => `<div class="slide ${S.slide === i ? 'on' : ''}" data-sl="${i}">${s[0]}<div class="cap">${s[1]}</div></div>`).join('');
}

export function authSide() {
  return `
    <div class="aul">
      <i class="blob b1"></i>
      <i class="blob b2"></i>
      <a class="brand" href="#" data-go="home" style="color:inherit">
        ${LOGO}
        <span>ConsentPro</span>
      </a>
      <div>
        <h2>Consent that holds up in front of a <b>regulator</b>.</h2>
        <div class="slides" id="slides" style="margin-top:28px">${slidesHTML()}</div>
        <div class="dots" id="dots" style="margin-top:18px">
          ${[0, 1, 2].map(i => `<button class="${S.slide === i ? 'on' : ''}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}
        </div>
      </div>
      <div class="bd">
        <span>${ic('shield')}DPDP Act 2023</span>
        <span>${ic('globe')}GDPR aligned</span>
        <span>${ic('lock')}Hosted in India regions</span>
      </div>
    </div>
  `;
}

export const pwField = (id, label, ac) => `
  <label class="field" for="${id}">
    ${label}
    <span class="pwf">
      <input id="${id}" type="password" autocomplete="${ac}">
      <button type="button" data-pw="toggle" aria-label="Show password">Show</button>
    </span>
  </label>
`;

export function authView() {
  const su = S.route === 'signup';
  const brandTop = `<a class="brand" href="#" data-go="home">${LOGO}<span>ConsentPro</span></a>`;
  const switcher = `
    <div class="sw3" role="tablist">
      <button role="tab" aria-selected="${!su}" data-go="login">Log in</button>
      <button role="tab" aria-selected="${su}" data-go="signup">Sign up</button>
    </div>
  `;
  const top = `<div class="top">${brandTop}<a href="#" data-go="home" style="font-size:13px;color:var(--ink-2)">← Back to site</a></div>`;
  const err = S.authErr ? `<div class="field"><span class="err" role="alert">${S.authErr}</span></div>` : '';
  let form;

  if (S.mfa) {
    form = `
      <form id="mfaform" class="abox">
        ${top}
        <h1>Two-step check</h1>
        <p class="sub">${esc(S.mfa.name)}, enter the 6-digit code from your authenticator.</p>
        <div class="otp" id="otp">
          ${[0, 1, 2, 3, 4, 5].map(i => `
            <input class="od" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" autocomplete="${i ? 'off' : 'one-time-code'}">
          `).join('')}
        </div>
        <input id="code" type="hidden">
        <div class="hint">Demo code: <b class="mono">482913</b> · <a href="#" data-otpfill="1" style="color:var(--accent);font-weight:500">fill it for me</a></div>
        ${err}
        <button class="btn btn--p btn--xl" type="submit">Verify and continue</button>
        <button class="btn" type="button" data-act="mfa-cancel">Back</button>
        <div class="trust3">${ic('shield')}Roles with elevated access always use a second step.</div>
      </form>
    `;
  } else if (su) {
    form = `
      <form id="signupform" class="abox" novalidate>
        ${top}
        ${switcher}
        <h1>Create your account</h1>
        <p class="sub">Free sandbox. No card needed.</p>
        <div class="seg2" role="group" aria-label="Account type">
          <button type="button" class="opt" aria-pressed="${S.stype !== 'org'}" data-stype="ind">
            <b>Individual</b>
            <small>Manage my own consents</small>
          </button>
          <button type="button" class="opt" aria-pressed="${S.stype === 'org'}" data-stype="org">
            <b>Organisation</b>
            <small>Collect and prove consent</small>
          </button>
        </div>
        <label class="field" for="sn">Full name<input id="sn" type="text" autocomplete="name"></label>
        ${S.stype === 'org' ? `<label class="field" for="so">Organisation name<input id="so" type="text" autocomplete="organization"></label>` : ''}
        <label class="field" for="se">${S.stype === 'org' ? 'Work email' : 'Email'}<input id="se" type="text" inputmode="email" autocomplete="email"></label>
        ${pwField('sp', 'Password', 'new-password')}
        <div class="strength" id="str"><i></i><i></i><i></i><i></i></div>
        <div class="hint"><b id="strl">Too weak</b> · 8+ characters, upper and lower case, a number and a symbol.</div>
        <label class="row" style="flex-wrap:nowrap;font-size:14px">
          <input id="st" type="checkbox" style="width:20px;height:20px;accent-color:var(--accent)">
          <span>I agree to the terms and privacy notice.</span>
        </label>
        ${err}
        <button class="btn btn--p btn--xl" type="submit">Create account</button>
        <div class="trust3">${ic('lock')}Demo build: nothing leaves this page. Only a salted hash of your password is kept, in memory.</div>
      </form>
    `;
  } else {
    form = `
      <form id="loginform" class="abox" novalidate>
        ${top}
        ${switcher}
        <h1>Welcome back</h1>
        <p class="sub">Log in to manage consent, or explore with a demo role.</p>
        <label class="field" for="le">Email<input id="le" type="text" inputmode="email" autocomplete="username"></label>
        ${pwField('lp', 'Password', 'current-password')}
        <div class="row" style="justify-content:space-between">
          <span class="hint" id="caps" hidden><b>Caps Lock is on</b></span>
          <a href="#" data-pw="forgot" style="font-size:13px;color:var(--accent);font-weight:500;margin-left:auto">Forgot password?</a>
        </div>
        <div class="hint" id="fnote" hidden>Demo build: password reset is switched off. Use a demo role below.</div>
        ${err}
        <button class="btn btn--p btn--xl" type="submit">Log in</button>
        <div class="sso">
          <button type="button" class="btn" disabled title="Available on the Enterprise plan">${ic('lock')}Single sign-on</button>
        </div>
        <div class="divider">or continue as a demo role</div>
        <div class="roles">
          ${S.users.filter(u => !u.added).slice(0, 5).map(u => {
            const ri = ROLEINFO[u.role] || ['user', ''];
            return `
              <button type="button" data-act="demo-login" data-email="${esc(u.email)}">
                <span class="tl2">${ic(ri[0])}</span>
                <span style="min-width:0">
                  <b>${ROLES[u.role].n}</b>
                  <small>${ri[1]}</small>
                </span>
              </button>
            `;
          }).join('')}
        </div>
        <div class="hint">Demo password for all accounts: <b class="mono">${PW}</b></div>
      </form>
    `;
  }
  return `<div class="au">${authSide()}<div class="aur">${form}</div></div>`;
}
