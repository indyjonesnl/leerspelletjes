import type { Lang } from '../core/types';
import { t } from '../core/i18n';
import { el } from '../core/ui';

/** What to show while a game's data loads ("Laden…") or after loading failed (message and retry button). */
export function loadStatus(lang: Lang, failed: boolean, onRetry: () => void): HTMLElement {
  if (!failed) return el('p', { class: 'loading', role: 'status' }, t(lang, 'loading'));
  const retry = el('button', { type: 'button', class: 'big-button' }, t(lang, 'retry'));
  retry.addEventListener('click', onRetry);
  return el('section', { class: 'end' }, el('p', { role: 'alert' }, t(lang, 'loadFailed')), retry);
}
