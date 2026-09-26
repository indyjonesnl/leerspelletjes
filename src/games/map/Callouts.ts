import type { Localized, VisualState } from '../../core/types';
import { el, svgEl } from '../../core/ui';
import type { MapCountry, RegionMap } from './types';
import { viewSize } from './regions';
import { feedbackClass, markEl } from './MapView';

export interface Crop { x: number; y: number; width: number; height: number }
export interface BoxLayout { code: string; x: number; y: number; size: number; key: number }

const INSET_MIN = 6;
const INSET_MAX = 80;
const BOX_LABEL: Localized = { nl: 'Vak {n}', en: 'Box {n}' };
let layerCount = 0;

const round1 = (v: number) => Math.round(v * 10) / 10;

/** Grows [a, b] around its centre to at least `min` long (at most `limit`), then shifts it inside [0, limit]. */
function expand(a: number, b: number, min: number, limit: number): [number, number] {
  const length = Math.min(limit, Math.max(b - a, min));
  const start = Math.max(0, Math.min((a + b) / 2 - length / 2, limit - length));
  return [start, start + length];
}

/** The part of the map around the countries, with a margin; at least 40 % of the map wide and half as high as wide. */
export function cropAround(countries: readonly MapCountry[], mapWidth: number, mapHeight: number): Crop {
  const pad = mapWidth * 0.08;
  const xs = countries.map((c) => c.cx);
  const ys = countries.map((c) => c.cy);
  const [x0, x1] = expand(Math.min(...xs) - pad, Math.max(...xs) + pad, mapWidth * 0.4, mapWidth);
  const [y0, y1] = expand(Math.min(...ys) - pad, Math.max(...ys) + pad, (x1 - x0) * 0.5, mapHeight);
  return { x: round1(x0), y: round1(y0), width: round1(x1 - x0), height: round1(y1 - y0) };
}

/** Equal boxes in a row under the crop, ordered left to right by their country's x, numbered from 1. */
export function layoutBoxes(countries: readonly MapCountry[], crop: Crop): BoxLayout[] {
  const unit = crop.width / 1000;
  const gap = 24 * unit;
  const size = (crop.width - gap * (countries.length + 1)) / countries.length;
  return [...countries]
    .sort((a, b) => a.cx - b.cx)
    .map((c, i) => ({ code: c.code, x: crop.x + gap + i * (size + gap), y: crop.y + crop.height + 40 * unit, size, key: i + 1 }));
}

/** Square window centred on the country for its inset, big enough to show some neighbours. */
export function insetViewBox(c: MapCountry): string {
  const s = Math.min(INSET_MAX, Math.max(INSET_MIN, c.size * 1.6));
  return `${round1(c.cx - s / 2)} ${round1(c.cy - s / 2)} ${round1(s)} ${round1(s)}`;
}

/** The map around four small countries, a numbered inset box per country, and the name card to drag. */
export function calloutsView(
  map: RegionMap,
  { countries, name, state }: { countries: readonly MapCountry[]; name: Localized; state: VisualState },
): HTMLElement {
  const { width, height } = viewSize(map);
  const crop = cropAround(countries, width, height);
  const boxes = layoutBoxes(countries, crop);
  const unit = crop.width / 1000;
  const boxSize = boxes[0].size;
  const bottom = boxes[0].y + boxSize + 24 * unit;
  const svg = svgEl('svg', { class: 'map callouts', viewBox: `${crop.x} ${crop.y} ${crop.width} ${round1(bottom - crop.y)}` });

  const layerId = `map-layer-${++layerCount}`;
  const layer = svgEl('g', { id: layerId });
  layer.append(svgEl('path', { class: 'map-bg', d: map.background }));
  for (const c of map.countries) layer.append(svgEl('path', { class: 'country other', d: c.d }));
  svg.append(layer);
  // Hides the map below the crop, where the boxes go.
  svg.append(svgEl('rect', { class: 'box-row-bg', x: crop.x, y: crop.y + crop.height, width: crop.width, height: bottom - crop.y - crop.height }));

  const byCode = new Map(countries.map((c) => [c.code, c]));
  for (const box of boxes) {
    const c = byCode.get(box.code)!;
    svg.append(svgEl('line', { class: 'callout-line', x1: c.cx, y1: c.cy, x2: box.x + box.size / 2, y2: box.y }));
  }
  for (const box of boxes) {
    const c = byCode.get(box.code)!;
    svg.append(svgEl('circle', { class: ['callout-dot', feedbackClass(c.code, state)].filter(Boolean).join(' '), cx: c.cx, cy: c.cy, r: 7 * unit }));
  }
  for (const box of boxes) svg.append(boxEl(box, byCode.get(box.code)!, layerId, state, unit));

  const card = el('div', { class: state.picked ? 'name-card done' : 'name-card' }, name[state.lang]);
  return el('div', { class: 'map-visual' }, svg, card);
}

function boxEl(box: BoxLayout, c: MapCountry, layerId: string, state: VisualState, unit: number): SVGGElement {
  const result = feedbackClass(c.code, state);
  const g = svgEl('g', {
    class: ['box', result].filter(Boolean).join(' '),
    'data-choice-id': c.code,
    'data-key': box.key,
    'data-cx': round1(box.x + box.size / 2),
    'data-cy': round1(box.y + box.size / 2),
    role: 'button',
    'aria-label': BOX_LABEL[state.lang].replace('{n}', String(box.key)),
    tabindex: state.picked ? undefined : 0,
    'aria-disabled': state.picked ? 'true' : undefined,
  });
  const pad = 6 * unit;
  const vb = insetViewBox(c);
  const [vx, vy, vs] = vb.split(' ').map(Number);
  const inset = svgEl('svg', { class: 'inset', x: box.x + pad, y: box.y + pad, width: box.size - 2 * pad, height: box.size - 2 * pad, viewBox: vb });
  inset.append(
    svgEl('rect', { class: 'inset-sea', x: vx, y: vy, width: vs, height: vs }),
    svgEl('use', { href: `#${layerId}` }),
    svgEl('path', { class: 'inset-country', d: c.d }),
    svgEl('circle', { class: 'inset-ring', cx: c.cx, cy: c.cy, r: vs * 0.3 }),
  );
  const key = svgEl('text', { class: 'box-key', x: box.x + 18 * unit, y: box.y + 40 * unit, 'font-size': 30 * unit, 'aria-hidden': 'true' });
  key.textContent = String(box.key);
  g.append(svgEl('rect', { class: 'box-frame', x: box.x, y: box.y, width: box.size, height: box.size, rx: 16 * unit }), inset, key);
  if (result) g.append(markEl(box.x + box.size - 36 * unit, box.y + 40 * unit, result, 56 * unit));
  return g;
}
