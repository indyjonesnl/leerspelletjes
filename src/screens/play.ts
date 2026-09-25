import type { AppContext, Screen } from './types';
import type { Game, Level } from '../core/types';
import { el } from '../core/ui';

export function playScreen(ctx: AppContext, game: Game, level: Level): Screen {
  return { el: el('main', {}, `${game.title[ctx.settings.lang]} ${level.id}`) };
}
