import type { Localized, VisualState } from '../../core/types';
import { svgEl } from '../../core/ui';
import type { RegionMap } from './types';

/** The name would give the answer away, so every country is just "land". */
const COUNTRY_LABEL: Localized = { nl: 'land', en: 'country' };
const CITY_LABEL: Localized = { nl: 'stad', en: 'city' };
export const DOT_RADIUS = 10;
/** An answered dot grows, so that the level showing where a city is makes the right spot obvious. */
export const ANSWERED_DOT_RADIUS = 26;
const MARK_SIZE = 48;
const POINT_MARK_SIZE = 84;

export interface MapPoint { id: string; x: number; y: number; /** Hit radius in viewBox units. */ r: number }

export interface MapViewOptions {
  targets: ReadonlySet<string>;
  state: VisualState;
  /** Accessible label of area targets; default "land" / "country". */
  targetLabel?: Localized;
  /** Accessible name per area target, overriding `targetLabel` (the study screens say the real names). */
  labelOf?: (id: string) => Localized;
  /** Area drawn with the accent colour (not a target). */
  highlight?: string;
  /** 'other' (default): non-target areas are muted, as in the map game. 'plain': they keep the normal fill. */
  untargeted?: 'other' | 'plain';
  /** Tappable dots, drawn above the areas. */
  points?: readonly MapPoint[];
  /** Accessible label of point targets; default "stad" / "city". */
  pointLabel?: Localized;
  /** Height cap of the SVG in vh (default 64); lower it when more than the prompt sits below the map. */
  maxHeightVh?: number;
}

/** 'correct' for the answer and 'wrong' for a wrong pick once answered; '' otherwise. */
export function feedbackClass(code: string, state: VisualState): '' | 'correct' | 'wrong' {
  if (!state.picked) return '';
  if (code === state.picked.answerId) return 'correct';
  return code === state.picked.id ? 'wrong' : '';
}

export function markEl(x: number, y: number, kind: 'correct' | 'wrong', fontSize: number, extraClass = ''): SVGTextElement {
  const text = svgEl('text', {
    class: ['map-mark', extraClass, kind].filter(Boolean).join(' '), x, y, 'font-size': fontSize,
    'text-anchor': 'middle', 'dominant-baseline': 'central', 'aria-hidden': 'true',
  });
  text.textContent = kind === 'correct' ? '✓' : '✗';
  return text;
}

/** Matches the `.map` rule's `max-height` in styles.css: keeps the SVG's own aspect ratio instead of the
 *  browser stretching it to fill `width: 100%`, which would letterbox it and crop the map at the sides. */
const MAX_HEIGHT_VH = 64;

/** Target attributes shared by areas and points. */
function targetAttrs(id: string, x: number, y: number, label: Localized, state: VisualState) {
  return {
    'data-choice-id': id,
    'data-cx': x,
    'data-cy': y,
    role: 'button',
    'aria-label': label[state.lang],
    tabindex: state.picked ? undefined : 0,
    'aria-disabled': state.picked ? 'true' : undefined,
  };
}

/** The region map. Areas in `targets` and all `points` carry `data-choice-id` and show ✓/✗ once answered. */
export function mapView(map: RegionMap, opts: MapViewOptions): SVGSVGElement {
  const { targets, state, targetLabel = COUNTRY_LABEL, labelOf, highlight, untargeted = 'other', points = [], pointLabel = CITY_LABEL, maxHeightVh } = opts;
  const [, , w, h] = map.viewBox.split(' ').map(Number);
  const svg = svgEl('svg', {
    class: 'map', viewBox: map.viewBox,
    style: maxHeightVh === undefined ? `max-width: calc(${MAX_HEIGHT_VH}vh * ${w} / ${h})` : `max-height: ${maxHeightVh}vh; max-width: calc(${maxHeightVh}vh * ${w} / ${h})`,
  });
  svg.append(svgEl('path', { class: 'map-bg', d: map.background }));
  const marks: SVGTextElement[] = [];
  for (const c of map.countries) {
    if (!targets.has(c.code)) {
      const kind = c.code === highlight ? 'highlight' : untargeted === 'other' ? 'other' : '';
      svg.append(svgEl('path', { class: ['country', kind].filter(Boolean).join(' '), d: c.d }));
      continue;
    }
    const result = feedbackClass(c.code, state);
    svg.append(svgEl('path', {
      class: ['country', 'target', result].filter(Boolean).join(' '),
      d: c.d,
      ...targetAttrs(c.code, c.cx, c.cy, labelOf ? labelOf(c.code) : targetLabel, state),
    }));
    if (result) marks.push(markEl(c.cx, c.cy, result, MARK_SIZE));
  }
  for (const p of points) {
    const result = feedbackClass(p.id, state);
    const dotR = result ? ANSWERED_DOT_RADIUS : DOT_RADIUS;
    const g = svgEl('g', { class: ['point', result].filter(Boolean).join(' '), ...targetAttrs(p.id, p.x, p.y, pointLabel, state) });
    g.append(
      svgEl('circle', { class: 'point-hit', cx: p.x, cy: p.y, r: p.r }),
      svgEl('circle', { class: 'point-dot', cx: p.x, cy: p.y, r: dotR }),
    );
    svg.append(g);
    if (result) marks.push(markEl(p.x, p.y - dotR - POINT_MARK_SIZE / 2, result, POINT_MARK_SIZE, 'point-mark'));
  }
  svg.append(...marks);
  return svg;
}
