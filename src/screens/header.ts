import type { AppContext } from './types';
import { LANGS } from '../core/types';
import { t } from '../core/i18n';
import { el } from '../core/ui';

export function header(ctx: AppContext, showHome: boolean): HTMLElement {
  const { lang, sound } = ctx.settings;
  const bar = el('header', { class: 'topbar' });
  if (showHome) bar.append(el('a', { class: 'icon-button home-link', href: '#/', 'aria-label': t(lang, 'home') }, '🏠'));
  bar.append(el('a', { class: 'brand', href: '#/' }, t(lang, 'appTitle')));

  const langGroup = el('div', { class: 'lang', role: 'group', 'aria-label': t(lang, 'language') });
  for (const option of LANGS) {
    const button = el(
      'button',
      { type: 'button', class: 'pill', 'aria-pressed': String(option === lang), 'data-focus-key': `lang-${option}` },
      option.toUpperCase(),
    );
    button.addEventListener('click', () => ctx.setSettings({ lang: option }));
    langGroup.append(button);
  }

  const soundButton = el(
    'button',
    {
      type: 'button',
      class: 'icon-button sound',
      'aria-pressed': String(sound),
      'aria-label': t(lang, 'sound'),
      'data-focus-key': 'sound',
    },
    sound ? '🔊' : '🔇',
  );
  soundButton.addEventListener('click', () => ctx.setSettings({ sound: !sound }));

  bar.append(el('div', { class: 'tools' }, langGroup, soundButton));
  return bar;
}
