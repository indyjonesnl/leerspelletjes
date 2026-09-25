import type { AppContext, Screen } from './types';
import type { Game } from '../core/types';
import { t } from '../core/i18n';
import { el } from '../core/ui';
import { levelHref } from '../core/router';

export function levelsScreen(ctx: AppContext, game: Game): Screen {
  const lang = ctx.settings.lang;
  const list = el('ul', { class: `levels levels-${game.pickerLayout}` });
  for (const level of game.levels) {
    list.append(
      el('li', {},
        el('a', { class: 'level', href: levelHref(game, level) },
          el('span', { class: 'level-label' }, level.label[lang]),
          el('span', { class: 'level-example' }, level.example[lang]),
        ),
      ),
    );
  }
  const main = el('main', { class: 'levels-screen' },
    el('h1', {}, game.title[lang]),
    el('p', { class: 'subtitle' }, t(lang, 'chooseLevel')),
    list,
  );
  return { el: main };
}
