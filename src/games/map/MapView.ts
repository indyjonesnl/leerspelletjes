import type { Localized, VisualState } from '../../core/types';
import { svgEl } from '../../core/ui';
import type { RegionMap } from './types';

/** The name would give the answer away, so every country is just "land". */
const COUNTRY_LABEL: Localized = { nl: 'land', en: 'country' };
const MARK_SIZE = 48;

/** 'correct' for the answer and 'wrong' for a wrong pick once answered; '' otherwise. */
export function feedbackClass(code: string, state: VisualState): '' | 'correct' | 'wrong' {
  if (!state.picked) return '';
  if (code === state.picked.answerId) return 'correct';
  return code === state.picked.id ? 'wrong' : '';
}

export function markEl(x: number, y: number, kind: 'correct' | 'wrong', fontSize: number): SVGTextElement {
  const text = svgEl('text', {
    class: `map-mark ${kind}`, x, y, 'font-size': fontSize,
    'text-anchor': 'middle', 'dominant-baseline': 'central', 'aria-hidden': 'true',
  });
  text.textContent = kind === 'correct' ? '✓' : '✗';
  return text;
}

/** The region map. Countries in `targets` carry `data-choice-id` and show ✓/✗ once answered. */
export function mapView(map: RegionMap, { targets, state }: { targets: ReadonlySet<string>; state: VisualState }): SVGSVGElement {
  const svg = svgEl('svg', { class: 'map', viewBox: map.viewBox });
  svg.append(svgEl('path', { class: 'map-bg', d: map.background }));
  const marks: SVGTextElement[] = [];
  for (const c of map.countries) {
    if (!targets.has(c.code)) {
      svg.append(svgEl('path', { class: 'country other', d: c.d }));
      continue;
    }
    const result = feedbackClass(c.code, state);
    svg.append(svgEl('path', {
      class: ['country', 'target', result].filter(Boolean).join(' '),
      d: c.d,
      'data-choice-id': c.code,
      'data-cx': c.cx,
      'data-cy': c.cy,
      role: 'button',
      'aria-label': COUNTRY_LABEL[state.lang],
      tabindex: state.picked ? undefined : 0,
      'aria-disabled': state.picked ? 'true' : undefined,
    }));
    if (result) marks.push(markEl(c.cx, c.cy, result, MARK_SIZE));
  }
  svg.append(...marks);
  return svg;
}
