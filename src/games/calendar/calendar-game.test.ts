import { describe, expect, it } from 'vitest';
import { createRng } from '../../core/rng';
import { Round } from '../../core/round';
import { calendarGame } from './index';
import { makeCalendarQuestion, MONTH_IDS } from './questions';


describe('Calendar Quest', () => {
  it('has four levels with ten non-repeating four-choice questions each', () => {
    expect(calendarGame.levels.map((level) => level.id)).toEqual(['weekdays', 'months', 'dates', 'elapsed']);
    for (const level of calendarGame.levels) {
      const round = new Round(calendarGame, level, createRng(821));
      const keys = new Set<string>();
      do {
        const q = round.current;
        expect(keys.has(q.key)).toBe(false);
        keys.add(q.key);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map((choice) => choice.id)).size).toBe(4);
        expect(q.choices.filter((choice) => choice.id === q.answerId)).toHaveLength(1);
        for (const lang of ['nl', 'en'] as const) {
          expect(q.prompt[lang]).toBeTruthy();
          expect(new Set(q.choices.map((choice) => choice.label[lang])).size).toBe(4);
        }
        round.answer(q.answerId);
      } while (round.next());
      expect(keys.size).toBe(10);
    }
  });

  it('wraps weekday-before and weekday-after questions across the week boundary', () => {
    const level = calendarGame.levels[0];
    const q = makeCalendarQuestion(level, createRng(14), []);
    expect(q.key).toContain('weekdays');
    expect(q.choices).toHaveLength(4);
    expect(q.choices.some((choice) => choice.id === q.answerId)).toBe(true);
    const sample = Array.from({ length: 120 }, (_, seed) => makeCalendarQuestion(level, createRng(seed), []));
    expect(sample.some((question) => question.prompt.en.includes('before') && question.answerId === 'sun')).toBe(true);
    expect(sample.some((question) => question.prompt.en.includes('after') && question.answerId === 'mon')).toBe(true);
  });

  it('generates a valid labeled monthly grid with exactly one marked day', () => {
    const level = calendarGame.levels[2];
    for (let seed = 0; seed < 40; seed++) {
      const q = makeCalendarQuestion(level, createRng(seed), []);
      const visual = q.visual!({ lang: 'en', picked: null });
      const cells = [...visual.querySelectorAll<HTMLElement>('[data-day]')];
      expect(cells.length).toBeGreaterThanOrEqual(28);
      expect(cells.length).toBeLessThanOrEqual(31);
      expect(cells.filter((cell) => cell.getAttribute('aria-current') === 'date')).toHaveLength(1);
      expect(visual.querySelector('[aria-label*="Monday"]')).not.toBeNull();
      expect(Number(q.answerId)).toBeGreaterThanOrEqual(1);
      expect(Number(q.answerId)).toBeLessThanOrEqual(cells.length);
    }
  });

  it('includes elapsed-day questions crossing a month boundary', () => {
    const level = calendarGame.levels[3];
    const questions = Array.from({ length: 100 }, (_, seed) => makeCalendarQuestion(level, createRng(seed), []));
    expect(questions.some((q) => q.key.includes('cross-month'))).toBe(true);
    for (const q of questions) expect(q.choices.some((choice) => choice.id === q.answerId)).toBe(true);
  });

  it('uses four distinct month ids for each month-order question', () => {
    const level = calendarGame.levels[1];
    for (let seed = 0; seed < 30; seed++) {
      const q = makeCalendarQuestion(level, createRng(seed), []);
      const ids = q.choices.map((choice) => choice.id.split(','));
      const visual = q.visual!({ lang: 'en', picked: null });
      const initial = [...visual.querySelectorAll<HTMLElement>('.month-card')].map((card) => card.dataset.monthId).join(',');
      expect(initial).not.toBe(q.answerId);
      expect(q.autoAdvance).toBe(false);
      expect(new Set(ids).size).toBe(4);
      expect(ids.every((sequence) => sequence.every((id) => (MONTH_IDS as readonly string[]).includes(id)))).toBe(true);
      expect(q.choices.filter((choice) => choice.id === q.answerId)).toHaveLength(1);
    }
  });

  it('provides localized study screens and examples for every level', () => {
    for (const level of calendarGame.levels) {
      for (const lang of ['nl', 'en'] as const) {
        const view = calendarGame.study!(level, { lang });
        expect(view.textContent).toContain(level.label[lang]);
        expect(view.textContent).toContain(level.example[lang]);
        expect(view.querySelectorAll('.calendar-study-example')).toHaveLength(2);
      }
    }
  });
});
