import type { Lang } from '../../core/types';
import type { RegionMap } from '../map/types';
import type { Province } from './provinces';

/** Font sizes in map units (the map is 1000 wide; on a phone one unit is about 0.36 px). */
export const NAME_SIZE = 34;
export const CITY_SIZE = 30;
/** Estimated width of one bold glyph as a share of the font size. Andika is wide; overestimating keeps labels apart. */
export const GLYPH_WIDTH = 0.62;

const SIDE_GAP = 18; // dot to a city name on its left or right
const SIDE_DROP = 10; // baseline below the dot's centre, so the name is centred on the dot
const ABOVE_GAP = 22;
const BELOW_GAP = 38;
const DOT_BOX = 12;
const NAME_BASELINE = 0.35; // baseline below the intended centre of a province name

export type Side = 'left' | 'right' | 'above' | 'below';
export type Anchor = 'start' | 'middle' | 'end';

/** Which side of its dot each city name goes. Chosen so no two labels overlap in Dutch or English (see the test). */
export const CITY_SIDE: Readonly<Record<string, Side>> = {
  GR: 'right', FR: 'left', DR: 'right', OV: 'right', FL: 'left', GE: 'right',
  UT: 'right', NH: 'right', ZH: 'left', ZE: 'right', NB: 'right', LI: 'right',
};

/** Shift of each province name from the province's centre point, in map units. */
export const NAME_SHIFT: Readonly<Record<string, readonly [number, number]>> = {
  GR: [0, -40], FR: [0, 0], DR: [0, 0], OV: [0, 40], FL: [0, -40], GE: [0, 80],
  UT: [0, -40], NH: [0, -80], ZH: [0, 0], ZE: [0, -40], NB: [0, 0], LI: [0, 0],
};

export interface MapLabel {
  /** Province code; a city label carries the code of its province. */
  id: string;
  kind: 'name' | 'city';
  text: string;
  x: number;
  y: number;
  anchor: Anchor;
  size: number;
}

export interface Box { x0: number; x1: number; y0: number; y1: number }

const round1 = (v: number) => Math.round(v * 10) / 10;

function cityPlace(dot: { x: number; y: number }, side: Side): Pick<MapLabel, 'x' | 'y' | 'anchor'> {
  switch (side) {
    case 'right': return { x: round1(dot.x + SIDE_GAP), y: round1(dot.y + SIDE_DROP), anchor: 'start' };
    case 'left': return { x: round1(dot.x - SIDE_GAP), y: round1(dot.y + SIDE_DROP), anchor: 'end' };
    case 'above': return { x: dot.x, y: round1(dot.y - ABOVE_GAP), anchor: 'middle' };
    case 'below': return { x: dot.x, y: round1(dot.y + BELOW_GAP), anchor: 'middle' };
  }
}

/** The 12 province names (on the provinces) and the 12 capital names (beside their dots). */
export function layoutLabels(
  lang: Lang,
  provinces: readonly Province[],
  map: RegionMap,
  capitals: readonly { code: string; x: number; y: number }[],
): MapLabel[] {
  const labels: MapLabel[] = [];
  for (const p of provinces) {
    const area = map.countries.find((c) => c.code === p.code)!;
    const dot = capitals.find((c) => c.code === p.code)!;
    const [dx, dy] = NAME_SHIFT[p.code];
    labels.push({
      id: p.code, kind: 'name', text: p.name[lang], size: NAME_SIZE, anchor: 'middle',
      x: round1(area.cx + dx), y: round1(area.cy + dy + NAME_SIZE * NAME_BASELINE),
    });
    labels.push({ id: p.code, kind: 'city', text: p.capital[lang], size: CITY_SIZE, ...cityPlace(dot, CITY_SIDE[p.code]) });
  }
  return labels;
}

/** Estimated outline of a label's text. */
export function labelBox(label: MapLabel): Box {
  const width = label.text.length * label.size * GLYPH_WIDTH;
  const x0 = label.anchor === 'start' ? label.x : label.anchor === 'end' ? label.x - width : label.x - width / 2;
  return { x0, x1: x0 + width, y0: label.y - label.size * 0.8, y1: label.y + label.size * 0.25 };
}

export function dotBox(point: { x: number; y: number }): Box {
  return { x0: point.x - DOT_BOX, x1: point.x + DOT_BOX, y0: point.y - DOT_BOX, y1: point.y + DOT_BOX };
}

/** Whether two boxes touch or come closer than a small margin. */
export function boxesOverlap(a: Box, b: Box): boolean {
  return a.x0 < b.x1 + 4 && b.x0 < a.x1 + 4 && a.y0 < b.y1 + 2 && b.y0 < a.y1 + 2;
}
