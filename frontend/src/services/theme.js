/**
 * Theme Management Service
 * Supports Light, Dark, and System modes with localStorage persistence
 */
import { S } from '../core/state.js';

export function applyTheme() {
  const r = document.documentElement;
  if (S.theme === 'system') {
    r.removeAttribute('data-theme');
  } else {
    r.setAttribute('data-theme', S.theme);
  }
  try {
    localStorage.setItem('cp-theme', S.theme);
  } catch (e) {}
}

export function cycleTheme(onUpdate) {
  S.theme = { system: 'light', light: 'dark', dark: 'system' }[S.theme];
  applyTheme();
  if (onUpdate) onUpdate();
}

export function initTheme() {
  try {
    const t = localStorage.getItem('cp-theme');
    if (t) {
      S.theme = t;
      applyTheme();
    }
  } catch (e) {}
}
