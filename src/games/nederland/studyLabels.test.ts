import { describe, it, expect, beforeAll } from 'vitest';
import type { Lang } from '../../core/types';
import { PROVINCES } from './provinces';
import { getNl, loadNl } from './load';
import { CITY_SIDE, NAME_SHIFT, boxesOverlap, dotBox, labelBox, layoutLabels } from './studyLabels';

beforeAll(async () => {
  await loadNl();
});

const layout = (lang: Lang) => layoutLabels(lang, PROVINCES, getNl().map, getNl().capitals);

describe('layoutLabels', () => {
  it('has a placement for every province', () => {
    expect(Object.keys(CITY_SIDE).sort()).toEqual(PROVINCES.map((p) => p.code).sort());
    expect(Object.keys(NAME_SHIFT).sort()).toEqual(PROVINCES.map((p) => p.code).sort());
  });

  it('makes a province name and a city name for each province, in the language', () => {
    for (const lang of ['nl', 'en'] as const) {
      const labels = layout(lang);
      expect(labels.filter((l) => l.kind === 'name').map((l) => l.text).sort()).toEqual(PROVINCES.map((p) => p.name[lang]).sort());
      expect(labels.filter((l) => l.kind === 'city').map((l) => l.text).sort()).toEqual(PROVINCES.map((p) => p.capital[lang]).sort());
    }
  });

  it('keeps all 24 labels apart from each other and from the dots, inside the map (nl and en)', () => {
    const [, , width, height] = getNl().map.viewBox.split(' ').map(Number);
    const dots = getNl().capitals.map((c) => ({ id: c.code, box: dotBox(c) }));
    for (const lang of ['nl', 'en'] as const) {
      const labels = layout(lang);
      const boxes = labels.map((l) => ({ l, box: labelBox(l) }));
      for (const { l, box } of boxes) {
        const where = `${lang} ${l.kind} ${l.text}`;
        expect(box.x0, where).toBeGreaterThanOrEqual(0);
        expect(box.x1, where).toBeLessThanOrEqual(width);
        expect(box.y0, where).toBeGreaterThanOrEqual(0);
        expect(box.y1, where).toBeLessThanOrEqual(height);
        for (const dot of dots) {
          if (l.kind === 'city' && dot.id === l.id) continue; // a city name sits next to its own dot
          expect(boxesOverlap(box, dot.box), `${where} on the dot of ${dot.id}`).toBe(false);
        }
      }
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          expect(boxesOverlap(boxes[i].box, boxes[j].box), `${lang}: ${boxes[i].l.text} / ${boxes[j].l.text}`).toBe(false);
        }
      }
    }
  });
});
