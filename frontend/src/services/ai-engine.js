/**
 * Gemini AI Studio Engine
 * Provides notice analysis & compliance scoring under DPDP Act,
 * automated multilingual notice card generation, request classification & triage,
 * and readiness advisor.
 */
import { DAY, DATA_T, PURP_T, CEIL, CP_CONFIG } from '../core/constants.js';
import { DB } from './firestore-db.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

export const LOCAL = {
  lint({ text }) {
    const t = (text || '').trim();
    const sents = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    const words = t.split(/\s+/).filter(Boolean).length;
    const avg = sents.length ? words / sents.length : 0;
    const orgM = t.match(/^([A-Z][\w&. ]{2,32}?)\s+(would|wants|collects|may|will)\b/);
    const org = orgM ? orgM[1] : 'This organisation';

    let carry = [], cards = [];
    const any = { d: new Set(), p: new Set() };
    sents.forEach(s => {
      const d = Object.keys(DATA_T).filter(k => DATA_T[k].test(s));
      const p = Object.keys(PURP_T).filter(k => PURP_T[k].test(s));
      d.forEach(x => any.d.add(x));
      p.forEach(x => any.p.add(x));
      const dm = s.match(/(\d+)\s*(day|month|year)s?/i);
      if (d.length) carry = d;
      p.forEach(k => {
        if (!cards.some(c => c.p === k)) {
          cards.push({ p: k, d: d.length ? d : carry, dur: dm ? { n: +dm[1], u: dm[2].toLowerCase() } : null });
        }
      });
    });
    const gm = t.match(/(\d+)\s*(day|month|year)s?/i);
    cards.forEach(c => {
      if (!c.dur && gm) c.dur = { n: +gm[1], u: gm[2].toLowerCase() };
    });

    const bundled = /by (continuing|using|clicking|signing|accessing)|agree to all|accept all|deemed|implied/i.test(t);
    const pre = /pre-?(ticked|selected|checked)|opt.?out by default/i.test(t);
    const withdraw = /withdraw|revoke|opt.?out|unsubscribe|stop (using|processing)/i.test(t);
    const complaint = /data protection board|grievance|complain/i.test(t);
    const rights = /access|correct|erase|delete|nominat|your rights/i.test(t);
    const vague = /as long as (necessary|required)|indefinite|for as long|until further notice/i.test(t);
    const explicit = !!gm;
    const legal = /hereinafter|notwithstanding|aforesaid|pursuant|whereas/i.test(t);
    const shareNoName = any.p.has('sharing') && !/named|following|listed|such as|including/i.test(t);

    const c = (id, sec, label, st, msg) => ({ id, sec, label, st, msg });
    const checks = [
      c('notice', 's.5', 'Says which data and why', any.d.size && any.p.size ? 'ok' : 'fail', any.d.size && any.p.size ? `Found ${any.d.size} data type(s) and ${any.p.size} purpose(s).` : 'Name the personal data and the purpose in plain words.'),
      c('bundle', 's.6(1)', 'Consent is explicit, not implied', bundled ? 'fail' : 'ok', bundled ? 'Wording like “by continuing, you agree” is not a clear affirmative action. Use a separate switch per purpose.' : 'No implied-consent wording found.'),
      c('purposes', 's.6(1)', 'One choice per purpose', any.p.size > 1 ? 'warn' : 'ok', any.p.size > 1 ? `${any.p.size} purposes appear in one notice. Ask for each one separately so the person can say yes to some and no to others.` : 'A single purpose.'),
      c('pre', 's.6(1)', 'Nothing pre-ticked', pre ? 'fail' : 'ok', pre ? 'Pre-ticked or opt-out-by-default wording found.' : 'No pre-ticked wording found.'),
      c('withdraw', 's.6(4)', 'Says how to withdraw', withdraw ? 'ok' : 'fail', withdraw ? 'Withdrawal is mentioned.' : 'Tell people they can withdraw, and how. It must be as easy as giving consent.'),
      c('retain', 's.8(7)', 'Clear retention period', explicit && !vague ? 'ok' : 'fail', explicit && !vague ? 'A time period is stated.' : vague ? '“As long as necessary” is vague. State a period or the event that ends it.' : 'No retention period found.'),
      c('rights', 's.5(1)', 'Rights and Board complaint route', complaint && rights ? 'ok' : complaint || rights ? 'warn' : 'fail', complaint && rights ? 'Rights and complaint route are both present.' : 'Explain how to use rights (s.11–14) and how to complain to the Data Protection Board.'),
      c('share', 's.5', 'Recipients are named', shareNoName ? 'warn' : 'ok', shareNoName ? 'Sharing with “partners” is mentioned without naming them or their category.' : 'No unnamed sharing found.'),
      c('plain', 's.5', 'Plain language', legal || avg > 28 ? 'warn' : 'ok', legal ? 'Legal jargon found. Rewrite in everyday words.' : avg > 28 ? `Sentences average ${avg.toFixed(0)} words. Aim for under 25.` : `Sentences average ${avg.toFixed(0)} words.`)
    ];
    const score = Math.round(checks.reduce((a, k) => a + (k.st === 'ok' ? 1 : k.st === 'warn' ? 0.5 : 0), 0) / checks.length * 100);
    return { org, checks, score, cards };
  },

  triage({ text }) {
    const t = text || '';
    const T = [
      ['Erasure', 's.12(3)', /delet|erase|remove my (data|account|details)|forget me/i],
      ['Correction', 's.12(1)', /correct|incorrect|wrong|update my|change my (name|address|phone|email|number)/i],
      ['Grievance', 's.13', /complain|grievance|not happy|harass|spam|unsolicited|ignored|refus/i],
      ['Nomination', 's.14', /nominat|nominee|death|incapacit/i],
      ['Access', 's.11', /copy|summary|what data|access|which (data|companies)|who (has|holds|received)/i]
    ];
    const m = T.find(x => x[2].test(t));
    const withdraw = /stop (sending|using|contact)|unsubscribe|withdraw|revoke/i.test(t) && !m;
    const type = m ? m[0] : withdraw ? 'Withdrawal' : 'Grievance';
    const sec = m ? m[1] : withdraw ? 's.6(4)' : 's.13';
    const urgent = /urgent|immediately|asap|harass|threat|leak|breach|fraud/i.test(t);
    const hasId = /\b\d{2}x+\d{2,}|@|\b\d{10}\b/.test(t) || /registered (mobile|email)/i.test(t);

    const steps = {
      Erasure: ['Verify the requester', 'Check retention duties (loan, tax, audit records can lawfully be kept)', 'Erase the rest and log it in the ledger', 'Confirm completion to the person'],
      Correction: ['Verify the requester', 'Ask for the corrected value or proof', 'Update every system', 'Confirm the change'],
      Access: ['Verify the requester', 'Compile a summary of data and recipients', 'Share it securely', 'Log the disclosure'],
      Grievance: ['Acknowledge within 24 hours', 'Assign an owner', 'Reply with a decision', 'Tell the person they can approach the Data Protection Board if unresolved'],
      Nomination: ['Verify the requester', 'Record the nominee details', 'Confirm in writing'],
      Withdrawal: ['Treat as consent withdrawal, not a rights request', 'Revoke the purpose now', 'Confirm propagation to all systems']
    }[type];

    const draft = {
      Erasure: 'Thank you for your request. We have verified your identity and started deleting the personal data you asked about. Some records, such as those we must keep by law, will be retained and we will tell you which ones. We will confirm when the deletion is complete.',
      Correction: 'Thank you for telling us. Please share the corrected details. Once we have them we will update our records everywhere we use them and confirm to you.',
      Access: 'Thank you for your request. After verifying your identity we will send you a summary of the personal data we hold about you and who it was shared with.',
      Grievance: 'We are sorry for the trouble. We have logged your complaint and a team member will reply with a decision. If you are not satisfied, you may complain to the Data Protection Board of India.',
      Nomination: 'Thank you. We will record your nominee once we have verified your identity and received their details.',
      Withdrawal: 'Your consent has been withdrawn. We have stopped using your data for that purpose and told the systems that were using it.'
    }[type];

    const flags = [];
    if (!hasId) flags.push('No identifier in the message. Verify identity before disclosing anything.');
    if (urgent) flags.push('Urgent wording. Escalate to the DPO today.');
    if (type === 'Erasure') flags.push('Check lawful retention before deleting everything.');

    return {
      type,
      sec,
      priority: urgent ? 'High' : 'Normal',
      due: Date.now() + 30 * DAY,
      steps,
      draft,
      flags,
      match: m ? m[2].source.split('|').slice(0, 3).join(', ') : 'no clear keyword'
    };
  },

  advise(obligationsList) {
    const STEPS = {
      's.5': ['Add retention and the Board complaint route to every notice', 'Publish notices in Hindi and one regional language'],
      's.6': ['Split bundled purposes', 'Remove any pre-ticked option', 'Record one receipt per purpose'],
      's.6(4)': ['Add one-tap withdrawal in the app', 'Test that revocation reaches systems in under 5 seconds'],
      's.8(5)': ['Turn on two-step sign-in for staff roles', 'Rotate API keys every 90 days', 'Review the permission matrix'],
      's.8(6)': ['Name a breach owner', 'Draft a 72-hour report template for the Board', 'Route alerts to the DPO'],
      's.8(7)': ['Set a retention period per purpose', 'Schedule erasure jobs', 'Log every erasure in the ledger'],
      's.9': ['Add an age check', 'Add verifiable parent or guardian consent', 'Switch off tracking and targeted ads for children'],
      's.10': ['Check whether the Board has notified you as a Significant Data Fiduciary', 'Appoint an India-based DPO', 'Plan an independent data audit and impact assessment'],
      's.11–14': ['Clear overdue requests', 'Assign an owner to each one', 'Acknowledge within 24 hours']
    };
    const OWN = {
      's.5': 'DPO', 's.6': 'DPO', 's.6(4)': 'Developer', 's.8(5)': 'Admin',
      's.8(6)': 'DPO', 's.8(7)': 'Developer', 's.9': 'DPO', 's.10': 'Admin', 's.11–14': 'DPO'
    };
    const rank = { gap: 2, partial: 1 };
    const items = obligationsList.filter(o => o[3] !== 'done').sort((a, b) =>
      (rank[b[3]] - rank[a[3]]) ||
      ((CEIL[b[0]] ? parseInt(CEIL[b[0]].replace(/\D/g, '')) : 0) - (CEIL[a[0]] ? parseInt(CEIL[a[0]].replace(/\D/g, '')) : 0))
    ).slice(0, 4);

    return {
      items: items.map(o => ({
        sec: o[0],
        title: o[1],
        st: o[3],
        ceil: CEIL[o[0]] || '',
        steps: STEPS[o[0]] || [],
        owner: OWN[o[0]] || 'DPO',
        go: o[4]
      })),
      ready: obligationsList.filter(o => o[3] === 'done').length,
      total: obligationsList.length
    };
  }
};

export const AI = {
  async call(name, payload, obligationsListGetter) {
    const t0 = performance.now();
    let out = null, engine = 'demo';
    if (CP_CONFIG.aiEndpoint) {
      try {
        const r = await fetch(CP_CONFIG.aiEndpoint + '/' + name, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        out = await r.json();
        engine = CP_CONFIG.model;
      } catch (e) {
        out = null;
      }
    }
    if (!out) {
      await wait(500 + Math.random() * 500);
      if (name === 'advise') {
        const obs = obligationsListGetter ? obligationsListGetter() : [];
        out = LOCAL.advise(obs);
      } else {
        out = LOCAL[name](payload);
      }
    }
    DB.fn++;
    DB.log('call', `functions/ai${name[0].toUpperCase() + name.slice(1)}`, 0);
    return { out, engine, ms: Math.round(performance.now() - t0) };
  }
};
