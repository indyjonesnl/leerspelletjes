import { describe, it, expect } from 'vitest';
import { COUNTRIES } from '../flags/data/countries';
import { LANGUAGES } from './data/languages';
import { EUROPE } from './data/europe';
import { AMERICAS } from './data/americas';
import { AFRICA } from './data/africa';
import { ASIA } from './data/asia';
import { SPOKEN } from './data/spoken';
import type { CountryLanguages } from './data/types';

const DATA_FILES: Record<string, { data: Readonly<Record<string, CountryLanguages>>; continents: string[] }> = {
  europe: { data: EUROPE, continents: ['europe'] },
  americas: { data: AMERICAS, continents: ['americas'] },
  africa: { data: AFRICA, continents: ['africa'] },
  asia: { data: ASIA, continents: ['asia', 'oceania'] },
};

describe.each(Object.entries(DATA_FILES))('%s language data', (_name, { data, continents }) => {
  it('has an entry for every country of the continent and nothing else', () => {
    const expected = COUNTRIES.filter((c) => continents.includes(c.continent)).map((c) => c.code).sort();
    expect(Object.keys(data).sort()).toEqual(expected);
  });

  it('gives every country at least one main language', () => {
    for (const [code, entry] of Object.entries(data)) {
      expect(entry.main.length, code).toBeGreaterThan(0);
    }
  });

  it('only uses defined codes, without duplicates, keeping minor apart from main', () => {
    for (const [code, entry] of Object.entries(data)) {
      const all = [...entry.main, ...(entry.minor ?? [])];
      for (const l of all) expect(LANGUAGES[l], `${code} ${l}`).toBeDefined();
      expect(new Set(all).size, code).toBe(all.length);
    }
  });
});

describe('SPOKEN', () => {
  it('covers exactly the 193 countries', () => {
    expect(COUNTRIES.length).toBe(193);
    expect(Object.keys(SPOKEN).sort()).toEqual(COUNTRIES.map((c) => c.code).sort());
  });

  it('has no overlap between the data files', () => {
    const total = [EUROPE, AMERICAS, AFRICA, ASIA].reduce((n, d) => n + Object.keys(d).length, 0);
    expect(total).toBe(Object.keys(SPOKEN).length);
  });
});

describe('LANGUAGES', () => {
  it('names every language in NL and EN, non-empty', () => {
    for (const [code, name] of Object.entries(LANGUAGES)) {
      expect(name.nl.trim(), code).not.toBe('');
      expect(name.en.trim(), code).not.toBe('');
    }
  });

  it('has no unused language (every code is a main language somewhere, or a minor one)', () => {
    const used = new Set<string>();
    for (const { data } of Object.values(DATA_FILES)) {
      for (const e of Object.values(data)) [...e.main, ...(e.minor ?? [])].forEach((l) => used.add(l));
    }
    expect(Object.keys(LANGUAGES).filter((l) => !used.has(l))).toEqual([]);
  });
});

describe('spot checks', () => {
  it('follows the agreed conventions', () => {
    expect([...EUROPE.BE.main].sort()).toEqual(['fr', 'nl']);
    expect(EUROPE.BE.minor).toContain('de');
    expect(EUROPE.NL.main).toEqual(['nl']);
    expect(EUROPE.CH.main).toEqual(expect.arrayContaining(['de', 'fr', 'it']));
    expect(EUROPE.CH.main).not.toContain('rm');
    expect(EUROPE.IE.main).toEqual(['en']);
  });

  it('follows the agreed conventions outside Europe', () => {
    expect(AMERICAS.BR.main).toEqual(['pt']);
    expect(AMERICAS.PE.main).toEqual(expect.arrayContaining(['es', 'qu']));
    expect(AMERICAS.PY.main).toEqual(expect.arrayContaining(['es', 'gn']));
    expect([...AMERICAS.US.main].sort()).toEqual(['en', 'es']);
    expect([...AMERICAS.CA.main].sort()).toEqual(['en', 'fr']);
    expect(AFRICA.ZA.main.length).toBeGreaterThanOrEqual(6);
    expect(AFRICA.ZA.main).toContain('af');
    expect(AFRICA.NG.main).toContain('en');
    expect(ASIA.IN.main).not.toContain('en');
    expect(ASIA.IN.main).toEqual(expect.arrayContaining(['hi', 'bn']));
    expect(ASIA.CN.main).toEqual(['zh']);
    expect(ASIA.JP.main).toEqual(['ja']);
    expect(ASIA.AU.main).toEqual(['en']);
  });
});
