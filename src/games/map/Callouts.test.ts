import { describe, it, expect } from 'vitest';
import type { MapCountry, RegionMap } from './types';
import { calloutsView, cropAround, insetViewBox, layoutBoxes } from './Callouts';

const country = (code: string, cx: number, cy: number, size = 2): MapCountry => ({ code, d: `M${cx} ${cy}L${cx + 1} ${cy}Z`, small: true, cx, cy, size });
const four = [country('C', 600, 300), country('A', 100, 200), country('D', 900, 100), country('B', 400, 250)];
const map: RegionMap = { viewBox: '0 0 1000 700', countries: four, background: 'M0 0L1 0Z' };

describe('cropAround', () => {
  it('contains every country with a margin and stays inside the map', () => {
    const crop = cropAround(four, 1000, 700);
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1000);
    expect(crop.y + crop.height).toBeLessThanOrEqual(700);
    for (const c of four) {
      expect(c.cx).toBeGreaterThan(crop.x);
      expect(c.cx).toBeLessThan(crop.x + crop.width);
      expect(c.cy).toBeGreaterThan(crop.y);
      expect(c.cy).toBeLessThan(crop.y + crop.height);
    }
  });

  it('is at least 40 % of the map wide and half as high as wide', () => {
    const close = [country('A', 500, 300), country('B', 510, 305), country('C', 505, 310), country('D', 495, 300)];
    const crop = cropAround(close, 1000, 700);
    expect(crop.width).toBeCloseTo(400, 0);
    expect(crop.height).toBeGreaterThanOrEqual(crop.width * 0.5 - 0.1);
  });
});

describe('layoutBoxes', () => {
  it('puts equal boxes in a row under the crop, ordered by x, numbered 1-4', () => {
    const crop = { x: 0, y: 0, width: 1000, height: 700 };
    const boxes = layoutBoxes(four, crop);
    expect(boxes.map((b) => b.code)).toEqual(['A', 'B', 'C', 'D']);
    expect(boxes.map((b) => b.key)).toEqual([1, 2, 3, 4]);
    expect(new Set(boxes.map((b) => b.size)).size).toBe(1);
    for (const b of boxes) {
      expect(b.y).toBeGreaterThan(700);
      expect(b.x + b.size).toBeLessThanOrEqual(1000);
    }
    for (let i = 1; i < 4; i++) expect(boxes[i].x).toBeGreaterThan(boxes[i - 1].x + boxes[i - 1].size);
  });
});

describe('insetViewBox', () => {
  it('centres a square window on the country, clamped between 6 and 80 units', () => {
    expect(insetViewBox(country('M', 100, 50, 1))).toBe('97 47 6 6');
    expect(insetViewBox(country('L', 100, 50, 10))).toBe('92 42 16 16');
    expect(insetViewBox(country('K', 100, 50, 200))).toBe('60 10 80 80');
  });
});

describe('calloutsView', () => {
  const name = { nl: 'Aapland', en: 'Apeland' };

  it('draws four numbered boxes, a dot and line per country, and the name card', () => {
    const view = calloutsView(map, { countries: four, name, state: { lang: 'nl', picked: null } });
    const boxes = [...view.querySelectorAll('.box')];
    expect(boxes.map((b) => b.getAttribute('data-choice-id'))).toEqual(['A', 'B', 'C', 'D']);
    expect(boxes.map((b) => b.getAttribute('data-key'))).toEqual(['1', '2', '3', '4']);
    expect(boxes[0].getAttribute('aria-label')).toBe('Vak 1');
    expect(boxes[0].getAttribute('tabindex')).toBe('0');
    expect(view.querySelectorAll('.callout-dot')).toHaveLength(4);
    expect(view.querySelectorAll('.callout-line')).toHaveLength(4);
    const boxA = view.querySelector('.box[data-choice-id="A"]')!;
    const insetA = boxA.previousElementSibling as SVGSVGElement;
    expect(insetA.matches('svg.inset')).toBe(true);
    expect(insetA.getAttribute('viewBox')).toBe('97 197 6 6');
    expect(view.querySelector('.name-card')!.textContent).toBe('Aapland');
    const layer = view.querySelector('g[id^="map-layer-"]')!;
    expect(insetA.querySelector('use')!.getAttribute('href')).toBe(`#${layer.id}`);
  });

  it('keeps the inset out of the interactive box and marks it non-interactive', () => {
    const view = calloutsView(map, { countries: four, name, state: { lang: 'nl', picked: null } });
    for (const box of view.querySelectorAll('.box')) expect(box.querySelector('svg, use')).toBeNull();
    for (const inset of view.querySelectorAll('svg.inset')) expect(inset.getAttribute('pointer-events')).toBe('none');
  });

  it('labels boxes in English and marks the answer and a wrong pick', () => {
    const view = calloutsView(map, { countries: four, name, state: { lang: 'en', picked: { id: 'B', answerId: 'C' } } });
    expect(view.querySelector('.box')!.getAttribute('aria-label')).toBe('Box 1');
    expect(view.querySelector('.box[data-choice-id="C"]')!.classList.contains('correct')).toBe(true);
    expect(view.querySelector('.box[data-choice-id="B"]')!.classList.contains('wrong')).toBe(true);
    expect(view.querySelectorAll('.box .map-mark')).toHaveLength(2);
    for (const b of view.querySelectorAll('.box')) expect(b.getAttribute('aria-disabled')).toBe('true');
    expect(view.querySelector('.name-card')!.classList.contains('done')).toBe(true);
  });

  it('lets the card be dragged only before answering', () => {
    const open = calloutsView(map, { countries: four, name, state: { lang: 'nl', picked: null } });
    document.body.replaceChildren(open);
    const card = open.querySelector<HTMLElement>('.name-card')!;
    card.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(card.classList.contains('dragging')).toBe(true);
    window.dispatchEvent(new MouseEvent('pointercancel'));

    const done = calloutsView(map, { countries: four, name, state: { lang: 'nl', picked: { id: 'A', answerId: 'A' } } });
    const doneCard = done.querySelector<HTMLElement>('.name-card')!;
    doneCard.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(doneCard.classList.contains('dragging')).toBe(false);
  });
});
