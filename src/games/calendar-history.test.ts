import { describe, expect, it } from 'vitest';
import { createRng } from '../core/rng';
import { Round } from '../core/round';
import { resolveRoute } from '../core/router';
import { GAMES } from './registry';
import { HISTORY_EVENTS } from './history/data';
import { calendarGame } from './calendar';
import { historyGame } from './history';

describe('History Timeline and Calendar Quest integration', () => {
  it('registers both games and resolves their level and Learn First routes', () => {
    expect(GAMES.map((game) => game.id)).toContain('history');
    expect(GAMES.map((game) => game.id)).toContain('calendar');
    for (const game of [historyGame, calendarGame]) {
      expect(GAMES).toContain(game);
      expect(resolveRoute(`#/${game.id}`, GAMES)?.name).toBe('levels');
      for (const level of game.levels) {
        expect(resolveRoute(`#/${game.id}/${level.id}`, GAMES)?.name).toBe('play');
        expect(resolveRoute(`#/${game.id}/${level.id}/learn`, GAMES)?.name).toBe('learn');
      }
    }
  });

  it('gives every level a bilingual study screen and ten-question round', () => {
    for (const game of [historyGame, calendarGame]) {
      for (const level of game.levels) {
        expect(level.roundLength ?? 10).toBe(10);
        for (const lang of ['nl', 'en'] as const) {
          const study = game.study!(level, { lang });
          expect(study.querySelector('h2')?.textContent).toBeTruthy();
          expect(study.textContent).toContain(level.label[lang]);
          expect(study.textContent).toContain(level.example[lang]);
        }
        const round = new Round(game, level, createRng(902));
        const keys = new Set<string>();
        do {
          expect(keys.has(round.current.key)).toBe(false);
          keys.add(round.current.key);
          expect(round.current.choices).toHaveLength(4);
          round.answer(round.current.answerId);
        } while (round.next());
        expect(keys.size).toBe(10);
      }
    }
  });

  it('keeps history dates and reveal order out of the unanswered visual and accessible label', () => {
    for (const level of historyGame.levels) {
      const question = historyGame.makeQuestion(level, createRng(4), []);
      const visual = question.visual!({ lang: 'en', picked: null });
      const before = visual.textContent ?? '';
      expect(visual.querySelectorAll('.history-event')).toHaveLength(0);
      for (const event of HISTORY_EVENTS[level.id as keyof typeof HISTORY_EVENTS]) {
        expect(before).not.toContain(String(event.year));
        expect(before).not.toContain(event.title.en);
      }
      const after = question.visual!({ lang: 'en', picked: { id: question.answerId, answerId: question.answerId } });
      expect(after.querySelectorAll('.history-event')).toHaveLength(4);
      expect(question.visualLabel).toBeUndefined();
    }
  });
});
