import { describe, it, expect } from 'vitest';
import type { RegionMap } from './types';
import { mapView } from './MapView';

const MAP: RegionMap = {
  viewBox: '0 0 1000 800',
  background: 'M0 0L10 0L10 10Z',
  countries: [
    { code: 'AA', d: 'M0 0L100 0L100 100Z', small: false, cx: 50, cy: 50, size: 100 },
    { code: 'BB', d: 'M200 0L300 0L300 100Z', small: false, cx: 250, cy: 50, size: 100 },
  ],
};
const idle = { lang: 'nl' as const, picked: null };

describe('mapView', () => {
  it('labels area targets with the given label', () => {
    const svg = mapView(MAP, { targets: new Set(['AA', 'BB']), state: idle, targetLabel: { nl: 'provincie', en: 'province' } });
    expect([...svg.querySelectorAll('[data-choice-id]')].map((t) => t.getAttribute('aria-label'))).toEqual(['provincie', 'provincie']);
  });

  it('still labels map-game targets "land" by default and mutes other areas', () => {
    const svg = mapView(MAP, { targets: new Set(['AA']), state: idle });
    expect(svg.querySelector('[data-choice-id="AA"]')!.getAttribute('aria-label')).toBe('land');
    expect(svg.querySelectorAll('.country.other')).toHaveLength(1);
  });

  it('highlights an area without making it a target, keeping others plain', () => {
    const svg = mapView(MAP, { targets: new Set(), state: idle, highlight: 'BB', untargeted: 'plain' });
    expect(svg.querySelectorAll('[data-choice-id]')).toHaveLength(0);
    expect(svg.querySelectorAll('.country.highlight')).toHaveLength(1);
    expect(svg.querySelectorAll('.country.other')).toHaveLength(0);
  });

  it('draws points as targets with hit circles, and marks them once answered', () => {
    const points = [{ id: 'AA', x: 50, y: 50, r: 30 }, { id: 'BB', x: 250, y: 50, r: 30 }];
    const svg = mapView(MAP, { targets: new Set(), state: idle, points, untargeted: 'plain' });
    const targets = [...svg.querySelectorAll('[data-choice-id]')];
    expect(targets.map((t) => t.getAttribute('data-choice-id'))).toEqual(['AA', 'BB']);
    for (const t of targets) {
      expect(t.getAttribute('aria-label')).toBe('stad');
      expect(t.getAttribute('tabindex')).toBe('0');
      expect(t.querySelector('.point-hit')!.getAttribute('r')).toBe('30');
      expect(t.querySelector('.point-dot')!.getAttribute('r')).toBe('10');
    }
    const answered = mapView(MAP, { targets: new Set(), state: { lang: 'en', picked: { id: 'BB', answerId: 'AA' } }, points });
    expect(answered.querySelector('[data-choice-id="AA"]')!.classList.contains('correct')).toBe(true);
    expect(answered.querySelector('[data-choice-id="BB"]')!.classList.contains('wrong')).toBe(true);
    expect(answered.querySelector('[data-choice-id="AA"]')!.getAttribute('aria-label')).toBe('city');
    expect(answered.querySelector('[data-choice-id="AA"]')!.getAttribute('aria-disabled')).toBe('true');
    expect(answered.querySelectorAll('.map-mark')).toHaveLength(2);
  });
});
