import type { Lang } from '../../core/types';
import { el } from '../../core/ui';
import { MONTHS } from './data';

interface BoardState { order: string[] }
interface DragState {
  id: string;
  pointerId: number;
  x: number;
  y: number;
  rect: DOMRect;
  preview: string[];
  active: boolean;
  ghost?: HTMLElement;
}
const states = new WeakMap<readonly string[], BoardState>();
const monthName = (id: string, lang: Lang) => MONTHS.find((month) => month.id === id)?.name[lang] ?? id;

export function createMonthBoard(
  monthIds: readonly string[],
  initialOrder: readonly string[],
  lang: Lang,
  submitted: boolean,
  submitAnswer: (id: string) => void,
): HTMLElement {
  const state = states.get(initialOrder) ?? { order: [...initialOrder] };
  states.set(initialOrder, state);
  const board = el('section', { class: 'month-board', 'aria-label': lang === 'nl' ? 'Maanden sorteren' : 'Arrange the months' });
  const instructions = el('p', { class: 'month-instructions', id: 'month-instructions' }, lang === 'nl'
    ? 'Sleep de maanden op volgorde, of gebruik de pijltjes.'
    : 'Drag the months into order, or use the arrow buttons.');
  const list = el('ol', { class: 'month-list', 'aria-label': lang === 'nl' ? 'Van januari naar december' : 'From January to December' });
  const live = el('p', { class: 'sr-only month-live', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const check = el('button', {
    type: 'button', class: 'button month-check', disabled: submitted, 'data-interactive-focus': 'check-order',
  }, lang === 'nl' ? 'Controleer volgorde' : 'Check order');
  let drag: DragState | null = null;

  function announce(id: string, index: number) {
    live.textContent = `${monthName(id, lang)} ${lang === 'nl' ? 'staat nu op plek' : 'is now in position'} ${index + 1} ${lang === 'nl' ? 'van' : 'of'} ${state.order.length}.`;
  }

  function render(focusKey?: string, fallbackId?: string) {
    const active = board.contains(document.activeElement) ? document.activeElement as HTMLElement : null;
    const restoreKey = focusKey ?? active?.dataset.interactiveFocus;
    list.replaceChildren(...state.order.map((id, index) => {
      const name = monthName(id, lang);
      const handle = el('button', {
        type: 'button', class: 'month-handle', disabled: submitted,
        'data-interactive-focus': `month:${id}`,
        ...(index === 0 ? { 'data-interactive-initial-focus': 'true' } : {}),
        'aria-label': `${name}, ${lang === 'nl' ? 'plek' : 'position'} ${index + 1} ${lang === 'nl' ? 'van' : 'of'} ${state.order.length}`,
        'aria-describedby': 'month-instructions',
      }, el('span', { class: 'month-grip', 'aria-hidden': 'true' }, '⠿'), el('span', { class: 'month-name' }, name));
      const up = el('button', {
        type: 'button', class: 'month-move-up', disabled: submitted || index === 0,
        'aria-label': lang === 'nl' ? `${name} omhoog` : `Move ${name} up`, 'data-interactive-focus': `up:${id}`,
      }, '↑');
      const down = el('button', {
        type: 'button', class: 'month-move-down', disabled: submitted || index === state.order.length - 1,
        'aria-label': lang === 'nl' ? `${name} omlaag` : `Move ${name} down`, 'data-interactive-focus': `down:${id}`,
      }, '↓');
      up.addEventListener('click', () => move(id, -1));
      down.addEventListener('click', () => move(id, 1));
      return el('li', {
        class: `month-card${submitted && id === monthIds[index] ? ' is-right' : ''}`,
        'data-month-id': id, 'data-drop-label': lang === 'nl' ? 'Hier plaatsen' : 'Drop here',
      }, el('span', { class: 'month-position', 'aria-hidden': 'true' }, String(index + 1)), handle,
      el('div', { class: 'month-move-controls' }, up, down));
    }));
    if (restoreKey) {
      const same = [...list.querySelectorAll<HTMLButtonElement>('[data-interactive-focus]')]
        .find((button) => button.dataset.interactiveFocus === restoreKey && !button.disabled);
      const fallback = fallbackId ? list.querySelector<HTMLButtonElement>(`[data-interactive-focus="month:${fallbackId}"]`) : null;
      (same ?? fallback)?.focus({ preventScroll: true });
    }
  }

  function move(id: string, delta: number) {
    if (submitted || drag) return;
    const current = state.order.indexOf(id);
    const destination = current + delta;
    if (destination < 0 || destination >= state.order.length) return;
    state.order.splice(current, 1);
    state.order.splice(destination, 0, id);
    render(undefined, id);
    announce(id, destination);
  }

  function finishDrag(commit: boolean) {
    const current = drag;
    if (!current) return;
    drag = null;
    current.ghost?.remove();
    delete board.dataset.draggingMonth;
    if (board.hasPointerCapture?.(current.pointerId)) board.releasePointerCapture(current.pointerId);
    if (current.active) {
      if (commit) state.order = current.preview;
      render(`month:${current.id}`, current.id);
      if (commit) announce(current.id, state.order.indexOf(current.id));
      else live.textContent = lang === 'nl' ? 'Verplaatsen geannuleerd.' : 'Move cancelled.';
    }
    check.disabled = submitted;
  }

  board.append(instructions,
    el('p', { class: 'month-order-caption' }, lang === 'nl' ? 'Eerder in het jaar' : 'Earlier in the year'), list,
    el('p', { class: 'month-order-caption month-order-end' }, lang === 'nl' ? 'Later in het jaar' : 'Later in the year'), live, check);
  render();

  board.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drag) { event.preventDefault(); finishDrag(false); return; }
    if (submitted || !(event.target instanceof Element) || !event.target.matches('.month-handle')) return;
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const id = event.target.closest<HTMLElement>('.month-card')!.dataset.monthId!;
    move(id, event.key === 'ArrowUp' ? -1 : 1);
  });
  board.addEventListener('pointerdown', (event) => {
    if (submitted || drag || event.button !== 0 || !(event.target instanceof Element)) return;
    const handle = event.target.closest('.month-handle');
    if (!handle) return;
    const row = handle.closest<HTMLElement>('.month-card')!;
    drag = { id: row.dataset.monthId!, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      rect: row.getBoundingClientRect(), preview: [...state.order], active: false };
    // Capture on the stable board rather than a row that changes position during dragging.
    board.setPointerCapture?.(event.pointerId);
  });
  board.addEventListener('pointermove', (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.active && Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y) < 6) return;
    const row = list.querySelector<HTMLElement>(`[data-month-id="${drag.id}"]`)!;
    if (!drag.active) {
      drag.active = true;
      check.disabled = true;
      board.dataset.draggingMonth = drag.id;
      row.classList.add('is-dragging');
      drag.ghost = el('div', { class: 'month-drag-ghost', 'aria-hidden': 'true' },
        el('span', { class: 'month-grip' }, '⠿'), monthName(drag.id, lang));
      Object.assign(drag.ghost.style, { left: `${drag.rect.left}px`, top: `${drag.rect.top}px`, width: `${drag.rect.width}px`, height: `${drag.rect.height}px` });
      board.append(drag.ghost);
    }
    drag.ghost!.style.transform = `translateY(${event.clientY - drag.y}px)`;
    const others = [...list.children].filter((child) => child !== row) as HTMLElement[];
    for (const child of others) for (const animation of child.getAnimations?.() ?? []) animation.cancel();
    const destination = others.filter((child) => event.clientY > child.getBoundingClientRect().top + child.getBoundingClientRect().height / 2).length;
    const preview = others.map((child) => child.dataset.monthId!);
    preview.splice(destination, 0, drag.id);
    if (preview.join(',') === drag.preview.join(',')) return;
    const oldPositions = new Map(others.map((child) => [child, child.getBoundingClientRect().top]));
    list.insertBefore(row, others[destination] ?? null);
    // Moving a focused DOM node clears focus in browsers. Keep Escape cancellation reachable.
    row.querySelector<HTMLButtonElement>('.month-handle')!.focus({ preventScroll: true });
    drag.preview = preview;
    [...list.children].forEach((child, index) => { child.querySelector('.month-position')!.textContent = String(index + 1); });
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      for (const child of others) {
        const offset = oldPositions.get(child)! - child.getBoundingClientRect().top;
        if (offset) child.animate?.([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0)' }], { duration: 150, easing: 'ease-out' });
      }
    }
  });
  board.addEventListener('pointerup', (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = list.getBoundingClientRect();
    finishDrag(event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom);
  });
  board.addEventListener('pointercancel', (event) => { if (drag?.pointerId === event.pointerId) finishDrag(false); });
  board.addEventListener('lostpointercapture', () => finishDrag(false));
  check.addEventListener('click', () => { if (!submitted && !drag) submitAnswer(state.order.join(',')); });
  if (submitted) board.append(el('p', { class: 'month-correct-order' },
    `${lang === 'nl' ? 'Juiste volgorde:' : 'Correct order:'} ${monthIds.map((id) => monthName(id, lang)).join(' → ')}`));
  return board;
}
