import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath, URL as NodeURL } from 'node:url';
import { COUNTRIES } from './data/countries';
import { LOOK_ALIKES } from './lookalikes';

// The test environment is jsdom, which replaces the global URL constructor with one
// that resolves relative to a fake http://localhost document instead of import.meta.url.
// Use node:url's URL explicitly so this resolves to a real file:// path.
const flagsDir = fileURLToPath(new NodeURL('../../../node_modules/flag-icons/flags/4x3/', import.meta.url));

/** Dutch names that add the name schools used to teach: "Belarus (Wit-Rusland)". */
const FORMER_NAME = new Set(['BY']);

describe('country data', () => {
  it('has the 193 UN member states with unique codes', () => {
    expect(COUNTRIES).toHaveLength(193);
    expect(new Set(COUNTRIES.map((c) => c.code)).size).toBe(193);
  });

  it('has the expected number of countries per continent', () => {
    const count = (continent: string) => COUNTRIES.filter((c) => c.continent === continent).length;
    expect({ europe: count('europe'), americas: count('americas'), africa: count('africa'), asia: count('asia'), oceania: count('oceania') })
      .toEqual({ europe: 44, americas: 35, africa: 54, asia: 46, oceania: 14 });
  });

  it('gives every country a real Dutch and English name', () => {
    for (const c of COUNTRIES) {
      expect(c.nl.length, c.code).toBeGreaterThan(2);
      expect(c.en.length, c.code).toBeGreaterThan(2);
      expect(c.en, c.code).not.toMatch(/[&()]/);
      // Parentheses are leftovers from the source data, except where we add a former name on purpose.
      if (!FORMER_NAME.has(c.code)) expect(c.nl, c.code).not.toMatch(/[&()]/);
    }
  });

  it('uses the names Dutch schools teach', () => {
    expect(COUNTRIES.find((c) => c.code === 'BY')).toMatchObject({ nl: 'Belarus (Wit-Rusland)', en: 'Belarus' });
  });

  it('has a flag SVG for every country', () => {
    for (const c of COUNTRIES) {
      expect(existsSync(`${flagsDir}${c.code.toLowerCase()}.svg`), c.code).toBe(true);
    }
  });

  it('only refers to known countries in look-alikes', () => {
    const codes = new Set(COUNTRIES.map((c) => c.code));
    for (const [code, similar] of Object.entries(LOOK_ALIKES)) {
      expect(codes.has(code), code).toBe(true);
      for (const s of similar) expect(codes.has(s), `${code} → ${s}`).toBe(true);
    }
  });
});
