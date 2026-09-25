import { describe, it, expect } from 'vitest';
import { createRng } from '../../core/rng';
import { Round } from '../../core/round';
import { TABLE_CONFIG, TABLE_LEVELS } from './levels';
import { makeTableQuestion, tableDistractors } from './questions';
import { tablesGame } from './index';
import { dotGrid } from './DotGrid';

const level = (id: string) => TABLE_LEVELS.find((l) => l.id === id)!;

describe('levels', () => {
  it('has tables 1-10 plus two mix levels, auto-speaking tables 1-5 only', () => {
    expect(TABLE_LEVELS.map((l) => l.id)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'mix5', 'mix10']);
    expect(TABLE_LEVELS.filter((l) => l.autoSpeak).map((l) => l.id)).toEqual(['1', '2', '3', '4', '5']);
    expect(TABLE_CONFIG.mix5.tables).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('tableDistractors', () => {
  it('gives 3 distinct positive wrong answers for every a × n', () => {
    for (let n = 1; n <= 10; n++) {
      for (let a = 1; a <= 10; a++) {
        for (let seed = 0; seed < 3; seed++) {
          const d = tableDistractors(a, n, createRng(seed));
          expect(new Set(d).size).toBe(3);
          for (const x of d) {
            expect(x).toBeGreaterThan(0);
            expect(x).not.toBe(a * n);
          }
        }
      }
    }
  });

  it('prefers neighbours in the same table and off-by-one', () => {
    for (let seed = 0; seed < 10; seed++) {
      for (const x of tableDistractors(6, 7, createRng(seed))) expect([35, 49, 41, 43]).toContain(x);
    }
  });
});

describe('makeTableQuestion', () => {
  it('asks a × n with the product among 4 choices', () => {
    for (let seed = 0; seed < 30; seed++) {
      const q = makeTableQuestion(level('7'), createRng(seed), []);
      const [a, n] = q.key.split('x').map(Number);
      expect(n).toBe(7);
      expect(q.prompt.nl).toBe(`${a} × 7 = ?`);
      expect(q.speech).toEqual({ nl: `${a} keer 7`, en: `${a} times 7` });
      expect(q.answerId).toBe(String(a * 7));
      expect(q.choices).toHaveLength(4);
      expect(q.choices.filter((c) => c.id === q.answerId)).toHaveLength(1);
    }
  });

  it('mix5 only uses tables 1 to 5', () => {
    for (let seed = 0; seed < 50; seed++) {
      const n = Number(makeTableQuestion(level('mix5'), createRng(seed), []).key.split('x')[1]);
      expect(n).toBeLessThanOrEqual(5);
    }
  });

  it('offers a dot grid hint only for tables 1 to 5', () => {
    expect(makeTableQuestion(level('4'), createRng(1), []).hint).toBeDefined();
    expect(makeTableQuestion(level('6'), createRng(1), []).hint).toBeUndefined();
  });

  it('single table round has 10 distinct questions', () => {
    for (let seed = 0; seed < 20; seed++) {
      const round = new Round(tablesGame, level('3'), createRng(seed));
      const keys = [round.current.key];
      round.answer('x');
      while (round.next()) {
        keys.push(round.current.key);
        round.answer('x');
      }
      expect(new Set(keys).size).toBe(10);
    }
  });
});

describe('dotGrid', () => {
  it('draws rows × cols dots', () => {
    expect(dotGrid(3, 4).querySelectorAll('.dot')).toHaveLength(12);
  });
});
