import { describe, it, expect } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question } from '../../core/types';
import { COUNTRIES } from '../flags/data/countries';
import { FLAG_CONFIG } from '../flags/levels';
import { CAPITALS } from './data/capitals';
import { CAPITAL_LEVELS } from './levels';
import { makeCapitalQuestion } from './questions';

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));
const group = (code: string) => {
  const continent = byCode.get(code)!.continent;
  return continent === 'oceania' ? 'asia' : continent;
};

describe('CAPITAL_LEVELS', () => {
  it('mirrors the six flag levels', () => {
    expect(CAPITAL_LEVELS.map((l) => l.id)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(CAPITAL_LEVELS.filter((l) => l.autoSpeak).map((l) => l.id)).toEqual(['1']);
    expect(CAPITAL_LEVELS[0].label).toEqual({ nl: 'Bekende landen', en: 'Well-known countries' });
  });
});

describe('makeCapitalQuestion', () => {
  it('offers four different capitals, one of them right, from the level pool', () => {
    for (const level of CAPITAL_LEVELS) {
      const pool = new Set(FLAG_CONFIG[level.id].pool.map((c) => c.code));
      for (let seed = 0; seed < 30; seed++) {
        const q = makeCapitalQuestion(level, createRng(seed), []);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map((c) => c.id)).size).toBe(4);
        expect(new Set(q.choices.map((c) => c.label.nl)).size).toBe(4);
        expect(q.choices.filter((c) => c.id === q.answerId)).toHaveLength(1);
        for (const c of q.choices) {
          expect(pool.has(c.id)).toBe(true);
          expect(c.label).toEqual(CAPITALS[c.id]);
        }
      }
    }
  });

  it("keeps wrong answers on the answer's continent, except on level 1", () => {
    for (const level of CAPITAL_LEVELS.slice(1)) {
      for (let seed = 0; seed < 30; seed++) {
        const q = makeCapitalQuestion(level, createRng(seed), []);
        for (const c of q.choices) expect(group(c.id)).toBe(group(q.answerId));
      }
    }
  });

  it('asks with the article and shows the flag', () => {
    const levelWorld = CAPITAL_LEVELS[5];
    let q: Question | undefined;
    for (let seed = 0; !q || q.answerId !== 'US'; seed++) q = makeCapitalQuestion(levelWorld, createRng(seed), []);
    expect(q.prompt).toEqual({ nl: 'Wat is de hoofdstad van de Verenigde Staten?', en: 'What is the capital of the United States?' });
    const img = q.visual!({ lang: 'nl', picked: null }) as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('flags/us.svg');
    expect(q.visualLabel).toEqual({ hidden: { nl: 'vlag', en: 'flag' }, revealed: { nl: 'Verenigde Staten', en: 'United States' } });
    expect(q.answerOn ?? 'choices').toBe('choices');
  });

  it('does not repeat a country within a round', () => {
    const previous: Question[] = [];
    for (let i = 0; i < 10; i++) previous.push(makeCapitalQuestion(CAPITAL_LEVELS[0], createRng(i), previous));
    expect(new Set(previous.map((q) => q.key)).size).toBe(10);
  });
});
