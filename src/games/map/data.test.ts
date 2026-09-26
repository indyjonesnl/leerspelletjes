import { describe, it, expect } from 'vitest';
import { COUNTRIES } from '../flags/data/countries';
import type { Continent } from '../flags/types';
import type { RegionMap } from './types';
import { MAP as europe } from './data/europe';
import { MAP as americas } from './data/americas';
import { MAP as africa } from './data/africa';
import { MAP as asiaOceania } from './data/asia-oceania';

const REGIONS: [string, RegionMap, Continent[]][] = [
  ['europe', europe, ['europe']],
  ['americas', americas, ['americas']],
  ['africa', africa, ['africa']],
  ['asia-oceania', asiaOceania, ['asia', 'oceania']],
];
const PATH = /^(M-?[\d.]+ -?[\d.]+(L-?[\d.]+ -?[\d.]+)*Z?)+$/;

describe.each(REGIONS)('%s map', (_name, map, continents) => {
  const [, , width, height] = map.viewBox.split(' ').map(Number);

  it('has exactly one shape per country of its continents', () => {
    const expected = COUNTRIES.filter((c) => continents.includes(c.continent)).map((c) => c.code).sort();
    expect(map.countries.map((c) => c.code).sort()).toEqual(expected);
  });

  it('uses plain absolute path data', () => {
    expect(map.background).toMatch(PATH);
    for (const c of map.countries) expect(c.d, c.code).toMatch(PATH);
  });

  it('keeps centres inside the map and sizes positive', () => {
    expect(width).toBe(1000);
    for (const c of map.countries) {
      expect(c.cx, c.code).toBeGreaterThanOrEqual(0);
      expect(c.cx, c.code).toBeLessThanOrEqual(width);
      expect(c.cy, c.code).toBeGreaterThanOrEqual(0);
      expect(c.cy, c.code).toBeLessThanOrEqual(height);
      expect(c.size, c.code).toBeGreaterThan(0);
    }
  });

  it('has enough small and tappable countries for its levels', () => {
    expect(map.countries.filter((c) => c.small).length).toBeGreaterThanOrEqual(5);
    expect(map.countries.filter((c) => !c.small).length).toBeGreaterThanOrEqual(10);
  });
});

describe('small countries', () => {
  const small = (map: RegionMap) => map.countries.filter((c) => c.small).map((c) => c.code);

  it('are the tiny ones', () => {
    expect(small(europe).sort()).toEqual(['AD', 'CY', 'LI', 'LU', 'MC', 'ME', 'MT', 'SM']);
    expect(small(americas)).toContain('KN');
    expect(small(africa)).toContain('SC');
    expect(small(asiaOceania)).toEqual(expect.arrayContaining(['SG', 'TV', 'NR', 'MV']));
  });

  it('never include big countries', () => {
    for (const code of ['DE', 'FR', 'NL', 'BE']) expect(small(europe)).not.toContain(code);
    expect(small(americas)).not.toContain('US');
    expect(small(asiaOceania)).not.toContain('AU');
  });
});
