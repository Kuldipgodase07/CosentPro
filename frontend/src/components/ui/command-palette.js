/**
 * Command Palette (Ctrl + K) Component
 */
import { S, $, esc } from '../../core/state.js';
import { ic } from '../icons.js';

export let cmdSel = 0;
export let cmdList = [];

export function cmdItems(q, routes, canFn, goFn, cycleThemeFn, logoutFn) {
  const base = Object.entries(routes)
    .filter(([, r]) => canFn(r.p))
    .map(([id, r]) => ({ l: 'Go to ' + r.t, i: r.i, run: () => goFn(id) }));
  base.push(
    { l: 'Toggle theme', i: 'auto', run: () => { cycleThemeFn(); } },
    { l: 'Sign out', i: 'logout', run: logoutFn }
  );
  q = q.trim().toLowerCase();
  return base.filter(x => !q || x.l.toLowerCase().includes(q));
}

export function drawCmd(q, routes, canFn, goFn, cycleThemeFn, logoutFn) {
  cmdList = cmdItems(q, routes, canFn, goFn, cycleThemeFn, logoutFn);
  const container = $('#cmdl');
  if (!container) return;
  container.innerHTML = cmdList.length ? cmdList.map((x, i) => `
    <button class="mi ${i === cmdSel ? 'sel' : ''}" data-cmd="${i}" style="display:flex;gap:10px;align-items:center;width:100%;border:0;background:${i === cmdSel ? 'var(--surface-2)' : 'none'};padding:10px 12px;border-radius:10px;cursor:pointer;text-align:left">
      ${ic(x.i)}${esc(x.l)}
    </button>
  `).join('') : '<div class="empty">Nothing matches.</div>';
}

export function openCmd(routes, canFn, goFn, cycleThemeFn, logoutFn) {
  const c = $('#cmd');
  if (!c) return;
  c.hidden = false;
  c.innerHTML = `
    <div class="box2">
      <label class="sr" for="cmdq">Search</label>
      <input id="cmdq" type="text" placeholder="Type a page or action" autocomplete="off">
      <div id="cmdl"></div>
    </div>
  `;
  cmdSel = 0;
  drawCmd('', routes, canFn, goFn, cycleThemeFn, logoutFn);
  const inp = $('#cmdq');
  if (inp) inp.focus();
}

export function closeCmd() {
  const c = $('#cmd');
  if (c) c.hidden = true;
}

export function navigateCmd(delta) {
  cmdSel = (cmdSel + delta + cmdList.length) % Math.max(1, cmdList.length);
  const container = $('#cmdl');
  if (container) {
    const btns = container.querySelectorAll('.mi');
    btns.forEach((b, idx) => b.classList.toggle('sel', idx === cmdSel));
  }
}

export function executeCmd() {
  const it = cmdList[cmdSel];
  closeCmd();
  if (it && it.run) it.run();
}
