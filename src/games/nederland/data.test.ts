import { describe, it, expect } from 'vitest';
import { CAPITAL_POINTS, MAP } from './data/nl';
import { hitRadii } from '../map/points';

const CODES = ['DR', 'FL', 'FR', 'GE', 'GR', 'LI', 'NB', 'NH', 'OV', 'UT', 'ZE', 'ZH'];

describe('Netherlands map data', () => {
  it('has the 12 provinces with valid path data', () => {
    expect(MAP.countries.map((c) => c.code).sort()).toEqual(CODES);
    const [, , w, h] = MAP.viewBox.split(' ').map(Number);
    for (const c of MAP.countries) {
      expect(c.d, c.code).toMatch(/^M[-\d. LMZ]+$/);
      expect(c.small).toBe(false);
      expect(c.cx).toBeGreaterThan(0);
      expect(c.cx).toBeLessThan(w);
      expect(c.cy).toBeGreaterThan(0);
      expect(c.cy).toBeLessThan(h);
    }
    expect(MAP.background.length).toBeGreaterThan(0);
  });

  it('has one capital point per province, inside the map', () => {
    expect(CAPITAL_POINTS.map((p) => p.code).sort()).toEqual(CODES);
    const [, , w, h] = MAP.viewBox.split(' ').map(Number);
    for (const p of CAPITAL_POINTS) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(w);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(h);
    }
  });

  it('gives every capital a tap area of at least 20 units', () => {
    for (const r of hitRadii(CAPITAL_POINTS)) expect(r).toBeGreaterThanOrEqual(20);
  });
});
