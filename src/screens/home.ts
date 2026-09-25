import type { AppContext, Screen } from './types';
import { t } from '../core/i18n';
import { el } from '../core/ui';
import { gameHref } from '../core/router';

export function homeScreen(ctx: AppContext): Screen {
  const lang = ctx.settings.lang;
  const tiles = el('ul', { class: 'tiles' });
  for (const game of ctx.games) {
    tiles.append(
      el('li', {},
        el('a', { class: `tile tile-${game.id}`, href: gameHref(game) },
          el('img', { class: 'tile-icon', src: game.icon, alt: '' }),
          el('span', { class: 'tile-title' }, game.title[lang]),
        ),
      ),
    );
  }
  const main = el('main', { class: 'home' },
    el('h1', { class: 'sr-only' }, t(lang, 'appTitle')),
    tiles,
    el('footer', {}, el('a', { href: '#/privacy' }, t(lang, 'privacy'))),
  );
  return { el: main };
}
