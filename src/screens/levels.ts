import type { AppContext, Screen } from './types';
import type { Game } from '../core/types';
import { t } from '../core/i18n';
import { el } from '../core/ui';
import { learnHref, levelHref } from '../core/router';

export function levelsScreen(ctx: AppContext, game: Game): Screen {
  const lang = ctx.settings.lang;
  const list = el('ul', { class: `levels levels-${game.pickerLayout}` });
  for (const level of game.levels) {
    const item = el('li', { class: game.study ? 'with-learn' : undefined },
      el('a', { class: 'level', href: levelHref(game, level) },
        el('span', { class: 'level-label' }, level.label[lang]),
        el('span', { class: 'level-example' }, level.example[lang]),
      ),
    );
    if (game.study) item.append(el('a', { class: 'learn-link', href: learnHref(game, level) }, t(lang, 'learnFirst')));
    list.append(item);
  }
  const main = el('main', { class: 'levels-screen' },
    el('h1', {}, game.title[lang]),
    el('p', { class: 'subtitle' }, t(lang, 'chooseLevel')),
    list,
  );
  return { el: main };
}
