import { describe, expect, it } from 'vitest';
import { GAMES } from './registry';
import { createRng } from '../core/rng';
import { Round } from '../core/round';
import type { Game, Lang } from '../core/types';

function game(id: string): Game {
  const found = GAMES.find((g) => g.id === id);
  expect(found, `${id} is available from the home screen`).toBeDefined();
  return found!;
}

const amount = (text: string) => Math.round(Number(text.replace(/[^\d,.]/g, '').replace(',', '.')) * 100);

describe.each(['money', 'words', 'patterns'])('%s rounds', (id) => {
  it('offers ten different questions per level with four distinct answers in both languages', () => {
    const g = game(id);
    for (const level of g.levels) {
      for (let seed = 0; seed < 10; seed++) {
        const round = new Round(g, level, createRng(seed));
        const keys = new Set<string>();
        do {
          const q = round.current;
          expect(keys.has(q.key), `${id}/${level.id}/${seed}`).toBe(false);
          keys.add(q.key);
          expect(q.choices).toHaveLength(4);
          expect(new Set(q.choices.map((c) => c.id)).size).toBe(4);
          expect(q.choices.filter((c) => c.id === q.answerId)).toHaveLength(1);
          for (const lang of ['nl', 'en'] as const) {
            expect(new Set(q.choices.map((c) => c.label[lang])).size).toBe(4);
            expect(q.prompt[lang]).toBeTruthy();
            expect(q.visual?.({ lang, picked: null })).toBeDefined();
          }
          expect(round.answer(q.answerId).correct).toBe(true);
        } while (round.next());
        expect(keys.size).toBe(10);
        expect(round.score).toBe(10);
      }
    }
  });
});

describe('money', () => {
  it('counts only real euro denominations and marks their exact total as correct', () => {
    const g = game('money');
    for (const level of g.levels.slice(0, 2)) {
      for (let seed = 0; seed < 40; seed++) {
        const q = g.makeQuestion(level, createRng(seed), []);
        const visual = q.visual!({ lang: 'nl', picked: null });
        const values = [...visual.querySelectorAll('.money-piece')].map((p) => amount(p.getAttribute('alt')!));
        expect(values.length).toBeGreaterThan(1);
        for (const value of values) {
          expect([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]).toContain(value);
          if (level === g.levels[0]) expect(value % 100).toBe(0);
        }
        const answer = q.choices.find((c) => c.id === q.answerId)!;
        expect(amount(answer.label.nl)).toBe(values.reduce((a, b) => a + b, 0));
        expect(amount(answer.label.en)).toBe(amount(answer.label.nl));
      }
    }
  });

  it('adds displayed prices and subtracts the price from the payment for change', () => {
    const g = game('money');
    for (const level of g.levels.slice(2)) {
      for (let seed = 0; seed < 40; seed++) {
        const q = g.makeQuestion(level, createRng(seed), []);
        const visual = q.visual!({ lang: 'en', picked: null });
        const values = [...visual.querySelectorAll('.money-amount')].map((p) => amount(p.textContent!));
        expect(values).toHaveLength(2);
        const answer = amount(q.choices.find((c) => c.id === q.answerId)!.label.en);
        expect(answer).toBe(level === g.levels[2] ? values[0] + values[1] : values[1] - values[0]);
        expect(answer).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('word builder', () => {
  it('scrambles the letters of the correct local word without displaying it in order', () => {
    const g = game('words');
    for (const level of g.levels) {
      for (let seed = 0; seed < 30; seed++) {
        const q = g.makeQuestion(level, createRng(seed), []);
        for (const lang of ['nl', 'en'] as const) {
          const answer = q.choices.find((c) => c.id === q.answerId)!.label[lang];
          const visual = q.visual!({ lang, picked: null });
          const letters = [...visual.querySelectorAll('.word-letter')].map((p) => p.textContent!.toLowerCase());
          expect(letters.join('')).not.toBe(answer);
          expect(letters.sort().join('')).toBe([...answer].sort().join(''));
          expect(visual.querySelector('.word-picture')?.textContent).toBeTruthy();
          const limits = level === g.levels[0] ? [2, 3] : level === g.levels[1] ? [4, 5] : [6, 12];
          expect(answer.length).toBeGreaterThanOrEqual(limits[0]);
          expect(answer.length).toBeLessThanOrEqual(limits[1]);
          expect(q.speech?.[lang]).not.toMatch(new RegExp(`\\b${answer}\\b`, 'i'));
          expect(level.autoSpeak).toBe(false);
        }
      }
    }
  });

  it('pairs a cat picture with kat in Dutch and cat in English', () => {
    const g = game('words');
    let seen = false;
    for (let seed = 0; seed < 100; seed++) {
      const q = g.makeQuestion(g.levels[0], createRng(seed), []);
      const answer = q.choices.find((c) => c.id === q.answerId)!;
      if (answer.label.en !== 'cat') continue;
      seen = true;
      expect(answer.label.nl).toBe('kat');
      expect(q.visual!({ lang: 'nl', picked: null }).querySelector('.word-picture')!.textContent).toBe('🐱');
      expect(q.speech!.nl).toContain('miauwt');
      expect(q.speech!.en).toContain('meows');
      expect(q.visual!({ lang: 'en', picked: null }).querySelector('.word-picture')!.getAttribute('aria-label')).toContain('meows');
    }
    expect(seen).toBe(true);
  });
});

describe('patterns', () => {
  const terms = (g: Game, level: number, seed: number, lang: Lang = 'en') => {
    const q = g.makeQuestion(g.levels[level], createRng(seed), []);
    const visual = q.visual!({ lang, picked: null });
    const sequence = [...visual.querySelectorAll('.pattern-term')].map((p) => p.textContent!);
    const answer = q.choices.find((c) => c.id === q.answerId)!.label[lang].split(' ')[0];
    return { sequence, answer };
  };

  it('repeats a visible shape cycle at least twice before asking what comes next', () => {
    const g = game('patterns');
    for (let seed = 0; seed < 40; seed++) {
      const { sequence, answer } = terms(g, 0, seed);
      expect(sequence.pop()).toBe('?');
      const period = sequence.findIndex((s, i) => i > 0 && s === sequence[0]);
      expect(period).toBeGreaterThanOrEqual(2);
      expect(sequence.length).toBeGreaterThanOrEqual(2 * period);
      sequence.forEach((s, i) => expect(s).toBe(sequence[i % period]));
      expect(answer).toBe(sequence[sequence.length % period]);
    }
  });

  it('names the shape choices so they can be read aloud', () => {
    const g = game('patterns');
    const q = g.makeQuestion(g.levels[0], createRng(1), []);
    expect(q.choices.map((c) => c.label.en)).toEqual(expect.arrayContaining(['● circle', '▲ triangle', '■ square', '★ star']));
    expect(q.choices.map((c) => c.label.nl)).toEqual(expect.arrayContaining(['● cirkel', '▲ driehoek', '■ vierkant', '★ ster']));
  });

  it('uses a constant positive step for counting and missing-number sequences', () => {
    const g = game('patterns');
    for (const level of [1, 2]) {
      for (let seed = 0; seed < 40; seed++) {
        const { sequence, answer } = terms(g, level, seed);
        expect(sequence.filter((s) => s === '?')).toHaveLength(1);
        const completed = sequence.map((s) => Number(s === '?' ? answer : s));
        const step = completed[1] - completed[0];
        expect(step).toBeGreaterThan(0);
        completed.slice(1).forEach((n, i) => expect(n - completed[i]).toBe(step));
        if (level === 2) expect(sequence.indexOf('?')).toBeGreaterThan(0);
      }
    }
  });

  it('increases the step consistently in harder sequences', () => {
    const g = game('patterns');
    for (let seed = 0; seed < 40; seed++) {
      const { sequence, answer } = terms(g, 3, seed);
      expect(sequence.pop()).toBe('?');
      const completed = [...sequence, answer].map(Number);
      const differences = completed.slice(1).map((n, i) => n - completed[i]);
      const growth = differences[1] - differences[0];
      expect(growth).toBeGreaterThan(0);
      differences.slice(1).forEach((n, i) => expect(n - differences[i]).toBe(growth));
    }
  });
});
