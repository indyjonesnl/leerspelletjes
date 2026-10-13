import { describe, expect, it } from 'vitest';
import { GAMES } from './registry';
import { resolveRoute } from '../core/router';
import { Round } from '../core/round';
import { createRng } from '../core/rng';

describe.each(['solar', 'body'])('%s integration', (id) => {
  it('opens practice and study routes for each level and uses the intended round length', () => {
    const game = GAMES.find((g) => g.id === id);
    expect(game, `${id} is available on the home screen`).toBeDefined();
    expect(game!.study).toBeDefined();
    for (const level of game!.levels) {
      expect(resolveRoute(`#/${id}/${level.id}`, GAMES)?.name).toBe('play');
      expect(resolveRoute(`#/${id}/${level.id}/learn`, GAMES)?.name).toBe('learn');
      const round = new Round(game!, level, createRng(5));
      expect(round.length).toBe(id === 'solar' && level.id === 'planets' ? 8 : 10);
      for (const lang of ['nl', 'en'] as const) {
        const view = game!.study!(level, { lang });
        expect(view.querySelector('h2')?.textContent).toBeTruthy();
        expect(view.querySelectorAll('.study-card').length).toBeGreaterThanOrEqual(8);
      }
    }
  });
});
