import { describe, it, expect } from 'vitest';
import { COUNTRIES } from '../flags/data/countries';
import { CAPITALS } from './data/capitals';

describe('CAPITALS', () => {
  it('has exactly one capital for every country', () => {
    expect(Object.keys(CAPITALS).sort()).toEqual(COUNTRIES.map((c) => c.code).sort());
  });

  it('has no empty names', () => {
    for (const [code, name] of Object.entries(CAPITALS)) {
      expect(name.nl.trim(), code).not.toBe('');
      expect(name.en.trim(), code).not.toBe('');
    }
  });

  it('never gives two countries the same capital name', () => {
    for (const lang of ['nl', 'en'] as const) {
      const names = Object.values(CAPITALS).map((c) => c[lang]);
      expect(new Set(names).size, lang).toBe(names.length);
    }
  });

  it('follows the agreed conventions', () => {
    expect(CAPITALS.NL.nl).toBe('Amsterdam');
    expect(CAPITALS.BO.nl).toBe('Sucre');
    expect(CAPITALS.ZA.nl).toBe('Pretoria');
    expect(CAPITALS.CH.nl).toBe('Bern');
    expect(CAPITALS.UA).toEqual({ nl: 'Kyiv', en: 'Kyiv' });
    expect(CAPITALS.DK).toEqual({ nl: 'Kopenhagen', en: 'Copenhagen' });
  });
});
