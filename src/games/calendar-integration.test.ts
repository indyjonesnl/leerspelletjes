import { describe, expect, it } from 'vitest';
import { createRng } from '../core/rng';
import { Round } from '../core/round';
import { resolveRoute } from '../core/router';
import { GAMES } from './registry';
import { calendarGame } from './calendar';

describe('Calendar Quest integration', () => {
  it('does not register the removed history game or resolve its former routes', () => {
    expect(GAMES.some((game) => game.id === 'history')).toBe(false);
    for (const route of ['#/history', '#/history/dutch', '#/history/world', '#/history/dutch/learn', '#/history/world/learn']) {
      expect(resolveRoute(route, GAMES)).toBeNull();
    }
  });

  it('registers Calendar Quest and resolves its level and Learn First routes', () => {
    expect(GAMES).toContain(calendarGame);
    expect(resolveRoute('#/calendar', GAMES)?.name).toBe('levels');
    for (const level of calendarGame.levels) {
      expect(resolveRoute(`#/calendar/${level.id}`, GAMES)?.name).toBe('play');
      expect(resolveRoute(`#/calendar/${level.id}/learn`, GAMES)?.name).toBe('learn');
    }
  });

  it('gives every level a bilingual study screen and ten-question round', () => {
    for (const level of calendarGame.levels) {
      expect(level.roundLength ?? 10).toBe(10);
      for (const lang of ['nl', 'en'] as const) {
        const study = calendarGame.study!(level, { lang });
        expect(study.querySelector('h2')?.textContent).toBeTruthy();
        expect(study.textContent).toContain(level.label[lang]);
        expect(study.textContent).toContain(level.example[lang]);
      }
      const round = new Round(calendarGame, level, createRng(902));
      const keys = new Set<string>();
      do {
        expect(keys.has(round.current.key)).toBe(false);
        keys.add(round.current.key);
        expect(round.current.choices).toHaveLength(4);
        round.answer(round.current.answerId);
      } while (round.next());
      expect(keys.size).toBe(10);
    }
  });
});
