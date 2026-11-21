/**
 * Plain-Language AI Assistant View
 * Conversational interface powered by Google Gemini for discovering consent status
 * and executing safe revocations/grants under DPDP Act 2023.
 */
import { S, stat, esc } from '../../core/state.js';
import { ORGS } from '../../core/constants.js';
import { ic } from '../../components/icons.js';
import { AI } from '../../services/ai-engine.js';

export function say(html, from = 'bot') {
  S.chat.push({ from, html });
}

export function stage(p, intent) {
  S.pending = { id: p.id, do: intent };
  say(`You want to <b>${intent}</b> “${esc(p.name)}” for ${esc(ORGS[p.org].name)}. This ${intent === 'revoke' ? 'stops them using' : 'lets them use'} your ${p.data.map(esc).join(' and ').toLowerCase()}. Confirm?
    <div class="row" style="margin-top:8px">
      <button class="btn btn--sm ${intent === 'revoke' ? 'btn--r' : 'btn--p'}" data-act="chat-confirm">Yes, ${intent}</button>
      <button class="btn btn--sm" data-act="chat-cancel">No</button>
    </div>
  `);
}

export async function handleChat(text, renderCallback) {
  say(esc(text), 'me');
  if (renderCallback) renderCallback();

  const t = text.toLowerCase();
  const intent = /\b(revoke|withdraw|stop|remove|turn off|disable|cancel)\b/.test(t) ? 'revoke' :
                 /\b(grant|allow|agree|turn on|enable|start)\b/.test(t) ? 'grant' :
                 /\b(who|what|which|show|list|have)\b/.test(t) ? 'list' : null;

  if (intent === 'list') {
    const act = S.purposes.filter(p => stat(p) === 'granted');
    const orgs = [...new Set(act.map(p => ORGS[p.org].name))];
    say(`${orgs.length} organisations can use your data for ${act.length} purposes: <b>${orgs.join(', ')}</b>. Open <b>My consents</b> to see each one.`);
    if (renderCallback) renderCallback();
    return;
  }

  const scored = S.purposes.map(p => {
    let s = 0;
    p.kw.forEach(k => { if (t.includes(k)) s += 2; });
    ORGS[p.org].name.toLowerCase().split(' ').forEach(w => { if (w.length > 3 && t.includes(w)) s += 1; });
    return [p, s];
  }).filter(x => x[1] > 0).filter(([p]) => intent === 'revoke' ? stat(p) === 'granted' : stat(p) !== 'granted').sort((a, b) => b[1] - a[1]);

  if (scored.length > 0) {
    if (scored.length > 1 && scored[0][1] === scored[1][1]) {
      say('Which one do you mean?');
      S.chat[S.chat.length - 1].html += `
        <div class="row" style="margin-top:8px">
          ${scored.slice(0, 3).map(([p]) => `
            <button class="chip" data-act="chat-pick" data-id="${p.id}" data-do="${intent}">${esc(ORGS[p.org].name)}: ${esc(p.name)}</button>
          `).join('')}
        </div>
      `;
      if (renderCallback) renderCallback();
      return;
    }
    stage(scored[0][0], intent);
    if (renderCallback) renderCallback();
    return;
  }

  // Ask Gemini directly for plain-language assistance
  try {
    const geminiReply = await AI.askCitizenAssistant(text, S.purposes, S.lang);
    if (geminiReply) {
      say(`<span style="display:inline-flex;gap:5px;align-items:center;color:var(--accent);font-size:12px;margin-bottom:4px">${ic('bolt')}Gemini Live Assistant</span><br>${esc(geminiReply)}`);
      if (renderCallback) renderCallback();
      return;
    }
  } catch (err) {
    console.warn('Gemini chat helper note:', err);
  }

  say('I can list who has your data, explain your DPDP rights, or prepare a grant or revoke. Try “stop marketing from Orbit Bank”.');
  if (renderCallback) renderCallback();
}

export function cAssistant() {
  if (!S.chat.length) {
    S.chat.push({
      from: 'bot',
      html: 'Hi Aarav. Ask me who has your data, or tell me what to change, for example <b>“stop marketing from Orbit Bank”</b>. Powered by Gemini, I understand natural speech and wait for your confirmation before anything changes.'
    });
  }

  return `
    <div class="pagehead">
      <div>
        <h1>Assistant</h1>
        <p>Speak or type in plain words. It explains and prepares; only you make the change.</p>
      </div>
      <span class="spacer"></span>
      <span class="demo" style="display:inline-flex;gap:6px;align-items:center;font-size:12px;color:var(--ink-2)">
        ${ic('bolt')}Live Gemini 3.5 Assistant in English and Indian languages.
      </span>
    </div>

    <section class="card">
      <div class="chat" id="chat" style="display:flex;flex-direction:column;gap:12px;max-height:460px;overflow-y:auto;padding:8px 0">
        ${S.chat.map(m => `
          <div class="msg ${m.from}" style="padding:12px 16px;border-radius:16px;max-width:85%;${m.from === 'me' ? 'align-self:flex-end;background:var(--accent);color:var(--accent-ink)' : 'align-self:flex-start;background:var(--surface-2);color:var(--ink)'}">
            ${m.html}
          </div>
        `).join('')}
      </div>
      <div class="row" style="margin-top:14px">
        ${['Who has my data?', 'Stop marketing from Orbit Bank', 'Allow reminders from MediNova', 'Revoke ad measurement'].map(t => `
          <button class="chip" data-act="chip" data-t="${esc(t)}">${esc(t)}</button>
        `).join('')}
      </div>
      <form id="chatform" class="row" style="margin-top:12px;flex-wrap:nowrap">
        <label class="sr" for="chatin">Message</label>
        <input id="chatin" type="text" placeholder="Tell me what you want to change…" autocomplete="off" style="flex:1;padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface)">
        <button class="btn btn--p" type="submit">${ic('bolt')}Send</button>
      </form>
    </section>
  `;
}
