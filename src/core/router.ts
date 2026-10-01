import type { Game, Level } from './types';

export type Route =
  | { name: 'home' }
  | { name: 'privacy' }
  | { name: 'levels'; game: Game }
  | { name: 'play'; game: Game; level: Level }
  | { name: 'learn'; game: Game; level: Level };

/** Resolves a location hash. Returns null for anything unknown; the caller redirects home. */
export function resolveRoute(hash: string, games: readonly Game[]): Route | null {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  if (parts.length === 1 && parts[0] === 'privacy') return { name: 'privacy' };
  const game = games.find((g) => g.id === parts[0]);
  if (!game || parts.length > 3) return null;
  if (parts.length === 1) return { name: 'levels', game };
  const level = game.levels.find((l) => l.id === parts[1]);
  if (!level) return null;
  if (parts.length === 2) return { name: 'play', game, level };
  return parts[2] === 'learn' && game.study ? { name: 'learn', game, level } : null;
}

export const gameHref = (game: Game) => `#/${game.id}`;
export const levelHref = (game: Game, level: Level) => `#/${game.id}/${level.id}`;
export const learnHref = (game: Game, level: Level) => `${levelHref(game, level)}/learn`;
