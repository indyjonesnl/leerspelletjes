const TARGET = '[data-choice-id]';

export type HitTest = (x: number, y: number) => Element | null;

/** Lets `card` be dragged onto a `[data-choice-id]` element inside `area`. Dropping on one dispatches a click on it
 *  (SVG elements have no click()); anywhere else the card slides back. The card needs `pointer-events: none` while
 *  `.dragging` so the hit test sees what is under it. */
export function enableDrag(card: HTMLElement, area: Element, hitTest: HitTest = (x, y) => document.elementFromPoint(x, y)): void {
  let start: { x: number; y: number } | null = null;
  let pointerId: number | undefined;
  let over: Element | null = null;

  const targetAt = (x: number, y: number): Element | null => {
    const hit = hitTest(x, y)?.closest(TARGET) ?? null;
    return hit && area.contains(hit) && hit.getAttribute('aria-disabled') !== 'true' ? hit : null;
  };

  const setOver = (next: Element | null) => {
    if (next === over) return;
    over?.classList.remove('drop-over');
    next?.classList.add('drop-over');
    over = next;
  };

  // A missing pointerId (MouseEvent-based tests, and any non-pointer event) always matches.
  const samePointer = (event: PointerEvent) => event.pointerId === undefined || pointerId === undefined || event.pointerId === pointerId;

  const onMove = (event: PointerEvent) => {
    if (!start || !samePointer(event)) return;
    card.style.transform = `translate(${event.clientX - start.x}px, ${event.clientY - start.y}px)`;
    setOver(targetAt(event.clientX, event.clientY));
  };

  const onEnd = (event: PointerEvent) => {
    if (!start || !samePointer(event)) return;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onEnd);
    window.removeEventListener('pointercancel', onEnd);
    const target = event.type === 'pointerup' ? targetAt(event.clientX, event.clientY) : null;
    setOver(null);
    start = null;
    pointerId = undefined;
    card.classList.remove('dragging');
    card.style.transform = '';
    target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };

  card.addEventListener('pointerdown', (event) => {
    if (start) return; // a drag is already active; ignore a second pointer's pointerdown
    if (event.button !== 0) return;
    event.preventDefault();
    start = { x: event.clientX, y: event.clientY };
    pointerId = event.pointerId;
    card.classList.add('dragging');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  });
}
