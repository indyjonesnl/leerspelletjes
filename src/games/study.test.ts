import { describe, it, expect } from 'vitest';
import { GAMES } from './registry';

describe('study screens', () => {
  it('exist for geography and traffic signs', () => {
    expect(GAMES.filter((g) => g.study).map((g) => g.id)).toEqual(['flags', 'map', 'capitals', 'nederland', 'traffic']);
    expect(GAMES.filter((g) => !g.study).map((g) => g.id)).toEqual(['clock', 'tables', 'money', 'words', 'patterns', 'initials', 'fractions', 'animals']);
  });

  it('render a heading and something to look at on every level, in both languages', async () => {
    for (const game of GAMES.filter((g) => g.study)) {
      for (const level of game.levels) {
        await game.load?.(level);
        for (const lang of ['nl', 'en'] as const) {
          const root = game.study!(level, { lang });
          const where = `${game.id} level ${level.id} (${lang})`;
          expect(root.querySelector('h2'), where).not.toBeNull();
          expect(root.querySelector('.study-card, .country.target, button.chip'), where).not.toBeNull();
        }
      }
    }
  });
});
