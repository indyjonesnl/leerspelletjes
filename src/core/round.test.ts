import { describe, it, expect } from 'vitest';
import { Round, nextLevel, ROUND_LENGTH } from './round';
import { createRng } from './rng';
import type { Game, Level } from './types';

const level: Level = { id: '1', label: { nl: 'Een', en: 'One' }, example: { nl: '', en: '' }, autoSpeak: false };
const level2: Level = { ...level, id: '2' };

function fakeGame(keys: string[]): Game {
  return {
    id: 'fake',
    title: { nl: 'Nep', en: 'Fake' },
    icon: '',
    pickerLayout: 'list',
    levels: [level, level2],
    makeQuestion: (_level, rng) => {
      const key = rng.pick(keys);
      return {
        key,
        prompt: { nl: key, en: key },
        choices: [
          { id: 'right', label: { nl: 'goed', en: 'right' } },
          { id: 'wrong', label: { nl: 'fout', en: 'wrong' } },
        ],
        answerId: 'right',
      };
    },
  };
}
const manyKeys = Array.from({ length: 20 }, (_, i) => `k${i}`);

describe('Round', () => {
  it('has 10 questions, then next() returns false', () => {
    const round = new Round(fakeGame(manyKeys), level, createRng(1));
    let count = 1;
    round.answer('right');
    while (round.next()) {
      count++;
      round.answer('right');
    }
    expect(count).toBe(ROUND_LENGTH);
    expect(round.index).toBe(ROUND_LENGTH - 1);
  });

  it('counts only correct answers', () => {
    const round = new Round(fakeGame(manyKeys), level, createRng(1));
    expect(round.answer('right')).toEqual({ correct: true, answerId: 'right' });
    round.next();
    expect(round.answer('wrong')).toEqual({ correct: false, answerId: 'right' });
    expect(round.score).toBe(1);
  });

  it('answer twice: only the first answer counts', () => {
    const round = new Round(fakeGame(manyKeys), level, createRng(1));
    round.answer('wrong');
    expect(round.answer('right')).toEqual({ correct: false, answerId: 'right' });
    expect(round.score).toBe(0);
  });

  it('refuses to move on before the question is answered', () => {
    const round = new Round(fakeGame(manyKeys), level, createRng(1));
    expect(() => round.next()).toThrow();
  });

  it('does not repeat a question when the pool is big enough', () => {
    const round = new Round(fakeGame(manyKeys), level, createRng(2));
    const keys = [round.current.key];
    round.answer('right');
    while (round.next()) {
      keys.push(round.current.key);
      round.answer('right');
    }
    expect(new Set(keys).size).toBe(ROUND_LENGTH);
  });

  it('small pool: finishes a round even with only 3 possible questions', () => {
    const round = new Round(fakeGame(['a', 'b', 'c']), level, createRng(3));
    let count = 1;
    round.answer('right');
    while (round.next()) {
      count++;
      round.answer('right');
    }
    expect(count).toBe(ROUND_LENGTH);
  });

  it('replaceCurrent swaps the question without moving on, at most 5 times', () => {
    const round = new Round(fakeGame(manyKeys), level, createRng(4));
    const first = round.current.key;
    expect(round.replaceCurrent()).toBe(true);
    expect(round.current.key).not.toBe(first);
    expect(round.index).toBe(0);
    for (let i = 0; i < 4; i++) expect(round.replaceCurrent()).toBe(true);
    expect(round.replaceCurrent()).toBe(false);
  });

  it('replaceCurrent does nothing after answering', () => {
    const round = new Round(fakeGame(manyKeys), level, createRng(4));
    round.answer('right');
    const key = round.current.key;
    expect(round.replaceCurrent()).toBe(false);
    expect(round.current.key).toBe(key);
  });
});

describe('nextLevel', () => {
  it('returns the following level, or undefined on the last one', () => {
    const game = fakeGame(manyKeys);
    expect(nextLevel(game, level)).toBe(level2);
    expect(nextLevel(game, level2)).toBeUndefined();
  });
});
