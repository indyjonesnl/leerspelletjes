import { describe, it, expect } from 'vitest';
import { createRng } from '../../core/rng';
import { COUNTRIES } from './data/countries';
import { FLAG_CONFIG, FLAG_LEVELS, STARTER_CODES } from './levels';
import { flagDistractors, flagUrl, makeFlagQuestion } from './questions';

const byCode = (code: string) => COUNTRIES.find((c) => c.code === code)!;

describe('levels', () => {
  it('has six levels with the agreed pools', () => {
    expect(FLAG_LEVELS.map((l) => l.id)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(FLAG_CONFIG['1'].pool.map((c) => c.code).sort()).toEqual([...STARTER_CODES].sort());
    expect(FLAG_CONFIG['2'].pool).toHaveLength(44);
    expect(FLAG_CONFIG['3'].pool).toHaveLength(35);
    expect(FLAG_CONFIG['4'].pool).toHaveLength(54);
    expect(FLAG_CONFIG['5'].pool).toHaveLength(60);
    expect(FLAG_CONFIG['6'].pool).toHaveLength(193);
    expect(FLAG_LEVELS.filter((l) => l.autoSpeak).map((l) => l.id)).toEqual(['1']);
  });
});

describe('flagDistractors', () => {
  it('prefers look-alikes that are in the pool', () => {
    const europe = FLAG_CONFIG['2'].pool;
    for (let seed = 0; seed < 10; seed++) {
      const codes = flagDistractors(byCode('NL'), europe, true, createRng(seed)).map((c) => c.code);
      expect(codes).toHaveLength(3);
      for (const code of codes) expect(['LU', 'FR', 'RU', 'HR']).toContain(code);
    }
  });

  it('stays on the same continent in the world level', () => {
    const world = FLAG_CONFIG['6'].pool;
    for (const answer of world) {
      for (const d of flagDistractors(answer, world, true, createRng(1))) {
        expect(d.continent).toBe(answer.continent);
        expect(d.code).not.toBe(answer.code);
      }
    }
  });
});

describe('makeFlagQuestion', () => {
  it('builds valid questions for every level', () => {
    for (const level of FLAG_LEVELS) {
      const pool = new Set(FLAG_CONFIG[level.id].pool.map((c) => c.code));
      for (let seed = 0; seed < 30; seed++) {
        const q = makeFlagQuestion(level, createRng(seed), []);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map((c) => c.id)).size).toBe(4);
        expect(q.choices.filter((c) => c.id === q.answerId)).toHaveLength(1);
        for (const c of q.choices) expect(pool.has(c.id)).toBe(true);
      }
    }
  });

  it('shows the flag image and reveals the country name only after answering', () => {
    const q = makeFlagQuestion(FLAG_LEVELS[0], createRng(1), []);
    const img = q.visual!() as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toBe(flagUrl(q.answerId));
    expect(img.getAttribute('alt')).toBe('');
    expect(q.visualLabel!.hidden).toEqual({ nl: 'vlag', en: 'flag' });
    const country = byCode(q.answerId);
    expect(q.visualLabel!.revealed).toEqual({ nl: country.nl, en: country.en });
  });

  it('builds relative flag URLs', () => {
    expect(flagUrl('NL')).toBe('flags/nl.svg');
  });
});
