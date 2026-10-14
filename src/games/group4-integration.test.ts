import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRng } from '../core/rng';
import { resolveRoute } from '../core/router';
import { GAMES } from './registry';
import { arithmeticGame } from './arithmetic';
import { spellingGame } from './spelling';
import { readingGame } from './reading';
import { measureGame } from './measure';
import { playScreen } from '../screens/play';
import type { AppContext, Screen } from '../screens/types';

const games = [arithmeticGame, spellingGame, readingGame, measureGame];
let screen: Screen | undefined;
afterEach(() => { screen?.destroy?.(); screen = undefined; document.body.replaceChildren(); vi.useRealTimers(); });

describe('groep 4 games integration', () => {
  it('registers all four games and every lesson and quiz route', () => {
    for (const game of games) {
      expect(GAMES).toContain(game);
      expect(resolveRoute(`#/${game.id}`, GAMES)?.name).toBe('levels');
      expect(game.levels).toHaveLength(4);
      for (const level of game.levels) {
        expect(resolveRoute(`#/${game.id}/${level.id}`, GAMES)?.name).toBe('play');
        expect(resolveRoute(`#/${game.id}/${level.id}/learn`, GAMES)?.name).toBe('learn');
        for (const lang of ['nl', 'en'] as const) {
          const study = game.study!(level, { lang });
          expect(study.querySelector('h2')?.textContent).toBeTruthy();
          expect(study.querySelector('.study-card')).not.toBeNull();
        }
      }
    }
  });

  for (const game of games) for (const level of game.levels) for (const correct of [true, false]) {
    it(`${game.id}/${level.id} reveals its ${correct ? 'correct' : 'incorrect'} answer and waits for Continue`, () => {
      vi.useFakeTimers();
      const ctx: AppContext = {
        settings: { lang: 'nl', sound: false }, setSettings: vi.fn(), games: [],
        speech: { isAvailable: vi.fn(() => false), speak: vi.fn(), stop: vi.fn(), onVoicesChanged: vi.fn(() => () => {}) },
      };
      const q = game.makeQuestion(level, createRng(43), []);
      screen = playScreen(ctx, game, level, createRng(43));
      document.body.replaceChildren(screen.el);
      const id = correct ? q.answerId : q.choices.find((choice) => choice.id !== q.answerId)!.id;
      const chosen = [...document.querySelectorAll<HTMLButtonElement>('.choice')].find((button) => button.dataset.id === id)!;
      chosen.focus(); chosen.click();
      expect(document.querySelector('.feedback')?.textContent).toContain(correct ? 'Goed zo!' : q.choices.find((choice) => choice.id === q.answerId)!.label.nl);
      expect(document.querySelector('.arithmetic-explanation, .spelling-feedback, .reading-explanation, .measure-explanation')).not.toBeNull();
      const next = document.querySelector<HTMLButtonElement>('.continue')!;
      expect(next).not.toBeNull();
      expect(document.activeElement).toBe(next);
      vi.advanceTimersByTime(30_000);
      expect(document.querySelector('.progress')?.textContent).toBe('Vraag 1 van 10');
      next.click();
      expect(document.querySelector('.progress')?.textContent).toBe('Vraag 2 van 10');
      expect(document.querySelectorAll('.choice')).toHaveLength(4);
    });
  }
});
