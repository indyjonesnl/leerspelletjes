import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMonthBoard } from './monthBoard';
import { createRng } from '../../core/rng';
import { calendarGame } from './index';
import { MONTHS } from './data';

const ids = ['jan', 'mar', 'jul', 'dec'];
const initial = ['jul', 'jan', 'dec', 'mar'];
const build = (submitted = false, submitAnswer = vi.fn()) => ({
  root: createMonthBoard(ids, initial.slice(), 'en', submitted, submitAnswer), submitAnswer,
});
const order = (root: Element) => [...root.querySelectorAll<HTMLElement>('.month-card')].map((card) => card.dataset.monthId!);
const card = (root: Element, id: string) => root.querySelector<HTMLElement>(`.month-card[data-month-id="${id}"]`)!;
function sort(root: HTMLElement) {
  for (const [position, id] of ids.entries()) {
    while (order(root).indexOf(id) > position) card(root, id).querySelector<HTMLButtonElement>('.month-move-up')!.click();
  }
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

function drag(root: HTMLElement) {
  document.body.append(root);
  const list = root.querySelector<HTMLElement>('.month-list')!;
  const rectangle = (y: number, height: number) => ({ x: 0, y, top: y, bottom: y + height, left: 0, right: 300, width: 300, height, toJSON: () => ({}) });
  vi.spyOn(list, 'getBoundingClientRect').mockImplementation(() => rectangle(0, 256));
  for (const row of list.children) vi.spyOn(row, 'getBoundingClientRect').mockImplementation(() => rectangle([...list.children].indexOf(row) * 64, 64));
  const handle = card(root, 'jul').querySelector<HTMLButtonElement>('.month-handle')!;
  handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, clientX: 100, clientY: 32 }));
  handle.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 7, clientX: 100, clientY: 230 }));
  return handle;
}

describe('month sorting list', () => {
  it('starts with four filled cards in one list and no tray or empty slots', () => {
    const { root } = build();
    expect(order(root)).toEqual(initial);
    expect(root.querySelectorAll('.month-list')).toHaveLength(1);
    expect(root.querySelector('.month-tile-tray, .month-slot')).toBeNull();
    expect(root.querySelectorAll('.month-move-up')).toHaveLength(4);
    expect(root.querySelectorAll('.month-move-down')).toHaveLength(4);
  });

  it('inserts a month using up/down buttons and shifts the intervening months', () => {
    const { root } = build();
    card(root, 'jan').querySelector<HTMLButtonElement>('.month-move-up')!.click();
    expect(order(root)).toEqual(['jan', 'jul', 'dec', 'mar']);
    card(root, 'jul').querySelector<HTMLButtonElement>('.month-move-down')!.click();
    expect(order(root)).toEqual(['jan', 'dec', 'jul', 'mar']);
    expect(card(root, 'jan').querySelector<HTMLButtonElement>('.month-move-up')!.disabled).toBe(true);
    expect(card(root, 'mar').querySelector<HTMLButtonElement>('.month-move-down')!.disabled).toBe(true);
  });

  it('moves with arrow keys, retains focus on the month and announces its position', () => {
    const { root } = build();
    document.body.append(root);
    const handle = card(root, 'jul').querySelector<HTMLButtonElement>('.month-handle')!;
    handle.focus();
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(order(root)).toEqual(['jan', 'jul', 'dec', 'mar']);
    expect(document.activeElement).toBe(card(root, 'jul').querySelector('.month-handle'));
    expect(root.querySelector('.month-live')?.textContent).toContain('position 2');
  });

  it('previews drag insertion with a ghost and placeholder before committing on drop', () => {
    const { root } = build();
    drag(root);
    expect(order(root)).toEqual(['jan', 'dec', 'mar', 'jul']);
    expect(root.querySelector('.month-drag-ghost')?.textContent).toContain('July');
    expect(root.querySelector('.month-card.is-dragging')).not.toBeNull();
    root.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, clientX: 100, clientY: 230 }));
    expect(order(root)).toEqual(['jan', 'dec', 'mar', 'jul']);
    expect(root.querySelector('.month-drag-ghost, .is-dragging')).toBeNull();
  });

  it.each(['pointercancel', 'lostpointercapture', 'outside'] as const)('restores the original order after %s', (ending) => {
    const { root } = build();
    drag(root);
    root.dispatchEvent(new PointerEvent(ending === 'outside' ? 'pointerup' : ending, { bubbles: true, pointerId: 7, clientX: 100, clientY: 400 }));
    expect(order(root)).toEqual(initial);
    expect(root.querySelector('.month-drag-ghost, .is-dragging')).toBeNull();
  });

  it('submits the current complete sequence for correct and incorrect answers', () => {
    const wrong = build();
    wrong.root.querySelector<HTMLButtonElement>('.month-check')!.click();
    expect(wrong.submitAnswer).toHaveBeenCalledWith(initial.join(','));
    const correct = build();
    sort(correct.root);
    correct.root.querySelector<HTMLButtonElement>('.month-check')!.click();
    expect(correct.submitAnswer).toHaveBeenCalledWith(ids.join(','));
  });

  it('disables reordering after checking and reveals the correct sequence', () => {
    const { root } = build(true);
    expect([...root.querySelectorAll<HTMLButtonElement>('button')].every((button) => button.disabled)).toBe(true);
    expect(root.querySelector('.month-correct-order')?.textContent).toContain('January');
  });

  it('keeps the new arrangement when the question changes language', () => {
    const q = calendarGame.makeQuestion(calendarGame.levels[1], createRng(82), []);
    const first = q.visual!({ lang: 'en', picked: null, submitAnswer: vi.fn() });
    const id = order(first)[1];
    card(first, id).querySelector<HTMLButtonElement>('.month-move-up')!.click();
    const second = q.visual!({ lang: 'nl', picked: null, submitAnswer: vi.fn() });
    expect(order(second)).toEqual(order(first));
    expect(card(second, id).textContent).toContain(MONTHS.find((month) => month.id === id)!.name.nl);
  });
});
