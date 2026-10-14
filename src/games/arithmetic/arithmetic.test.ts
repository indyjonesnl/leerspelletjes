import { describe, expect, it } from 'vitest';
import { createRng } from '../../core/rng';
import { Round } from '../../core/round';
import { arithmeticGame } from './index';
import { arithmeticSteps, makeArithmeticQuestion } from './questions';

describe('Rekensprongen', () => {
  it('shows correct bridging and tens/units strategies', () => {
    expect(arithmeticSteps(34, 8, '+')).toEqual([{ from: 34, to: 40, amount: 6 }, { from: 40, to: 42, amount: 2 }]);
    expect(arithmeticSteps(62, 17, '-')).toEqual([{ from: 62, to: 52, amount: -10 }, { from: 52, to: 50, amount: -2 }, { from: 50, to: 45, amount: -5 }]);
    expect(arithmeticSteps(45, 23, '+')).toEqual([{ from: 45, to: 65, amount: 20 }, { from: 65, to: 68, amount: 3 }]);
    expect(arithmeticSteps(40, 7, '-')).toEqual([{ from: 40, to: 33, amount: -7 }]);
  });

  it('generates valid sums to 100 with distinct choices and the intended difficulty', () => {
    expect(arithmeticGame.levels.map((level) => level.id)).toEqual(['addition', 'subtraction', 'bridging', 'missing']);
    for (const level of arithmeticGame.levels) for (let seed = 0; seed < 80; seed++) {
      const q = makeArithmeticQuestion(level, createRng(seed), []);
      const [, operation, aText, bText] = q.key.split(':');
      const [a, b] = [Number(aText), Number(bText)];
      const result = operation === '+' ? a + b : a - b;
      expect(Number(q.answerId)).toBe(level.id === 'missing' ? b : result);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
      if (level.id === 'addition') expect(a % 10 + b % 10).toBeLessThan(10);
      if (level.id === 'subtraction') expect(a % 10).toBeGreaterThanOrEqual(b % 10);
      if (level.id === 'bridging') expect(operation === '+' ? a % 10 + b % 10 >= 10 : a % 10 < b % 10).toBe(true);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices.map((choice) => choice.id)).size).toBe(4);
      expect(q.choices.filter((choice) => choice.id === q.answerId)).toHaveLength(1);
      for (const choice of q.choices) {
        expect(Number(choice.id)).toBeGreaterThanOrEqual(0);
        expect(Number(choice.id)).toBeLessThanOrEqual(100);
        expect(choice.label.nl).toBe(choice.label.en);
      }
      expect(q.autoAdvance).toBe(false);
    }
  });

  it('provides an optional unanswered number-line hint and reveals worked steps only after answering', () => {
    for (const level of arithmeticGame.levels) {
      const q = makeArithmeticQuestion(level, createRng(3), []);
      expect(q.hint).toBeDefined();
      const hint = q.hint!();
      expect(hint.querySelectorAll('.jump-label').item(hint.querySelectorAll('.jump-label').length - 1)?.textContent).toBe(level.id === 'missing' ? q.key.split(':').slice(2).map(Number).reduce((a, b) => a + b).toString() : '?');
      if (level.id === 'missing') expect(hint.querySelector('.jump-amount')?.textContent).toBe('+?');
      for (const lang of ['nl', 'en'] as const) {
        expect(q.visual!({ lang, picked: null }).querySelector('.arithmetic-explanation')).toBeNull();
        for (const id of [q.answerId, q.choices.find((choice) => choice.id !== q.answerId)!.id]) {
          const after = q.visual!({ lang, picked: { id, answerId: q.answerId } });
          expect(after.querySelector('.arithmetic-explanation')?.textContent).toContain(q.answerId);
        }
      }
    }
  });

  it('runs ten nonrepeating questions and teaches an example for every level in both languages', () => {
    for (const level of arithmeticGame.levels) {
      const round = new Round(arithmeticGame, level, createRng(90));
      const keys = new Set<string>();
      do { keys.add(round.current.key); round.answer(round.current.answerId); } while (round.next());
      expect(keys.size).toBe(10);
      for (const lang of ['nl', 'en'] as const) {
        const view = arithmeticGame.study!(level, { lang });
        expect(view.querySelector('h2')?.textContent).toBe(level.label[lang]);
        expect(view.querySelector('.study-card')).not.toBeNull();
      }
    }
  });
});
