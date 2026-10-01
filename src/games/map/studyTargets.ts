import { nearestInDirection, type Direction } from '../../core/spatial';

const TARGET = '[data-choice-id]';
const ARROWS: Record<string, Direction> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };

const centreOf = (node: Element) => ({ x: Number(node.getAttribute('data-cx')), y: Number(node.getAttribute('data-cy')) });

/** Click, Enter/Space and arrow keys on the `[data-choice-id]` targets under `root`. Arrows move between the
 *  focusable ones (those with a tabindex), to the nearest in that direction. */
export function wireTargets(root: Element, onSelect: (id: string) => void): void {
  root.addEventListener('click', (event) => {
    const hit = event.target instanceof Element ? event.target.closest(TARGET) : null;
    if (hit && root.contains(hit)) onSelect(hit.getAttribute('data-choice-id')!);
  });
  root.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) return;
    const active = event.target instanceof Element ? event.target.closest(TARGET) : null;
    if (!active || !root.contains(active)) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(active.getAttribute('data-choice-id')!);
      return;
    }
    const direction = ARROWS[event.key];
    if (!direction) return;
    event.preventDefault();
    const others = [...root.querySelectorAll<HTMLElement | SVGElement>(`${TARGET}[tabindex]`)].filter((n) => n !== active);
    const i = nearestInDirection(centreOf(active), others.map(centreOf), direction);
    if (i >= 0) others[i].focus();
  });
}

/** Marks `id` as the selected target (class `selected`); targets with a role also get `aria-pressed`. */
export function markSelected(root: Element, id: string): void {
  for (const node of root.querySelectorAll(TARGET)) {
    const on = node.getAttribute('data-choice-id') === id;
    node.classList.toggle('selected', on);
    if (node.hasAttribute('role')) node.setAttribute('aria-pressed', String(on));
  }
}
