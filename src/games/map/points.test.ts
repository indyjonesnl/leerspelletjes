import { describe, it, expect } from 'vitest';
import { hitRadii } from './points';

describe('hitRadii', () => {
  it('caps at the maximum when points are far apart', () => {
    expect(hitRadii([{ x: 0, y: 0 }, { x: 500, y: 0 }])).toEqual([40, 40]);
  });

  it('never lets neighbouring hit circles overlap', () => {
    const pts = [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 50 }, { x: 200, y: 200 }];
    const r = hitRadii(pts);
    expect(r[0]).toBe(15);
    expect(r[1]).toBe(15);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        expect(r[i] + r[j]).toBeLessThanOrEqual(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) + 1e-9);
      }
    }
  });
});
