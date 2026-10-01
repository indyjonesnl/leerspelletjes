import { describe, it, expect, vi, afterEach } from 'vitest';
import { svgEl } from '../../core/ui';
import { markSelected, wireTargets } from './studyTargets';

function makeSvg() {
  const svg = svgEl('svg');
  for (const [id, x, y] of [['A', 10, 10], ['B', 50, 10], ['C', 10, 50]] as const) {
    svg.append(svgEl('rect', { 'data-choice-id': id, 'data-cx': x, 'data-cy': y, role: 'button', tabindex: 0 }));
  }
  svg.append(svgEl('circle', { 'data-choice-id': 'A', 'data-cx': 12, 'data-cy': 12 })); // a dot: clickable, not focusable
  document.body.replaceChildren(svg);
  return svg;
}
const target = (svg: Element, id: string) => svg.querySelector<SVGElement>(`rect[data-choice-id="${id}"]`)!;
const key = (node: Element, k: string) => node.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

afterEach(() => document.body.replaceChildren());

describe('wireTargets', () => {
  it('selects on click, also on a decoration that carries the id', () => {
    const svg = makeSvg();
    const select = vi.fn();
    wireTargets(svg, select);
    target(svg, 'B').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    svg.querySelector('circle')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    svg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(select.mock.calls).toEqual([['B'], ['A']]);
  });

  it('selects the focused target with Enter and Space only', () => {
    const svg = makeSvg();
    const select = vi.fn();
    wireTargets(svg, select);
    key(target(svg, 'C'), 'Enter');
    key(target(svg, 'C'), ' ');
    key(target(svg, 'C'), 'a');
    expect(select.mock.calls).toEqual([['C'], ['C']]);
  });

  it('moves focus between focusable targets with the arrow keys', () => {
    const svg = makeSvg();
    wireTargets(svg, vi.fn());
    target(svg, 'A').focus();
    key(target(svg, 'A'), 'ArrowRight');
    expect(document.activeElement).toBe(target(svg, 'B'));
    key(target(svg, 'B'), 'ArrowLeft');
    expect(document.activeElement).toBe(target(svg, 'A'));
    key(target(svg, 'A'), 'ArrowDown');
    expect(document.activeElement).toBe(target(svg, 'C'));
  });
});

describe('markSelected', () => {
  it('marks only the chosen id, and sets aria-pressed on the ones with a role', () => {
    const svg = makeSvg();
    markSelected(svg, 'B');
    expect(target(svg, 'B').classList.contains('selected')).toBe(true);
    expect(target(svg, 'B').getAttribute('aria-pressed')).toBe('true');
    expect(target(svg, 'A').classList.contains('selected')).toBe(false);
    expect(target(svg, 'A').getAttribute('aria-pressed')).toBe('false');
    expect(svg.querySelector('circle')!.hasAttribute('aria-pressed')).toBe(false);
    markSelected(svg, 'A');
    expect(target(svg, 'B').classList.contains('selected')).toBe(false);
    expect(svg.querySelector('circle')!.classList.contains('selected')).toBe(true);
  });
});
