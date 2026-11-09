import { describe, it, expect } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question } from '../../core/types';
import { FLAG_CONFIG } from '../flags/levels';
import { SPOKEN } from './data/spoken';
import { LANGUAGE_LEVELS } from './levels';
import { chipLanguages, languageSetId, makeLanguageQuestion } from './questions';

const worldPool = FLAG_CONFIG['6'].pool;

describe('languageSetId', () => {
  it('sorts and joins with +', () => {
    expect(languageSetId(['nl', 'fr'])).toBe('fr+nl');
    expect(languageSetId(['fr', 'nl'])).toBe('fr+nl');
  });
});

describe('chipLanguages', () => {
  it('has all correct, no minor, >= 3 distractors, 5..12 unique chips', () => {
    for (const level of LANGUAGE_LEVELS) {
      const pool = FLAG_CONFIG[level.id].pool;
      for (let seed = 0; seed < 30; seed++) {
        for (const c of pool) {
          const { main, minor = [] } = SPOKEN[c.code];
          const chips = chipLanguages(c.code, pool, createRng(seed));
          for (const m of main) expect(chips).toContain(m);
          for (const m of minor) expect(chips).not.toContain(m);
          expect(chips.length - main.length).toBeGreaterThanOrEqual(3);
          expect(chips.length).toBeGreaterThanOrEqual(5);
          expect(chips.length).toBeLessThanOrEqual(12);
          expect(new Set(chips).size).toBe(chips.length);
        }
      }
    }
  });

  it('gives JP exactly 5 chips and IN and ZA at least 3 distractors', () => {
    expect(chipLanguages('JP', worldPool, createRng(1))).toHaveLength(5);
    for (const code of ['IN', 'ZA']) {
      const chips = chipLanguages(code, worldPool, createRng(1));
      expect(chips.length - SPOKEN[code].main.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('makeLanguageQuestion', () => {
  it('uses level pool countries and the canonical answer id', () => {
    for (const level of LANGUAGE_LEVELS) {
      const pool = new Set(FLAG_CONFIG[level.id].pool.map((c) => c.code));
      for (let seed = 0; seed < 30; seed++) {
        const q = makeLanguageQuestion(level, createRng(seed), []);
        expect(pool.has(q.key)).toBe(true);
        expect(q.answerOn).toBe('interactive');
        expect(q.autoAdvance).toBe(false);
        expect(q.answerId).toBe(languageSetId(SPOKEN[q.key].main));
        expect(q.choices).toHaveLength(1);
        expect(q.choices[0].id).toBe(q.answerId);
        expect(q.visual).toBeTypeOf('function');
      }
    }
  });

  it('asks with the article and lists the correct set', () => {
    let q: Question | undefined;
    for (let seed = 0; !q || q.key !== 'US'; seed++) q = makeLanguageQuestion(LANGUAGE_LEVELS[5], createRng(seed), []);
    expect(q.prompt.nl).toBe('Welke talen worden gesproken in de Verenigde Staten? Kies alles wat past.');
    expect(q.prompt.en).toBe('Which languages are spoken in the United States? Pick all that apply.');
    expect(q.choices[0].label.en).toContain('English');
  });

  it('does not repeat a country within a round', () => {
    const previous: Question[] = [];
    for (let i = 0; i < 10; i++) previous.push(makeLanguageQuestion(LANGUAGE_LEVELS[0], createRng(i), previous));
    expect(new Set(previous.map((q) => q.key)).size).toBe(10);
  });
});
