import { describe, expect, it, vi } from 'vitest';
import { createMonthBoard } from './monthBoard';
import { createRng } from '../../core/rng';
import { calendarGame } from './index';
import { MONTHS } from './data';

const ids = ['jan', 'mar', 'jul', 'dec'];
const initial = ['jul', 'jan', 'dec', 'mar'];
const build = (submitted = false, submitAnswer = vi.fn()) => ({
  root: createMonthBoard(ids, initial.slice(), 'en', submitted, submitAnswer),
  submitAnswer,
});

function place(root: HTMLElement, month: string, slot: number) {
  root.querySelector<HTMLButtonElement>(`[data-month-id="${month}"]`)!.click();
  root.querySelector<HTMLButtonElement>(`[data-slot-index="${slot}"]`)!.click();
}

describe('accessible month ordering board', () => {
  it('moves a dragged month tile into the chosen slot', () => {
    const { root } = build();
    const tile = root.querySelector<HTMLButtonElement>('[data-month-id="jul"]')!;
    const slot = root.querySelector<HTMLButtonElement>('[data-slot-index="0"]')!;
    tile.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7 }));
    tile.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 7, clientX: 20 }));
    slot.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7 }));
    expect(root.querySelector('[data-slot-index="0"]')?.textContent).toContain('July');
  });

  it('supports selecting a tile then choosing a numbered slot', () => {
    const { root } = build();
    place(root, 'jan', 0);
    expect(root.querySelector('[data-slot-index="0"]')?.textContent).toContain('January');
    expect(root.querySelector('[data-month-id="jan"]')).toBeNull();
  });

  it('supports keyboard selection and arrow-key movement', () => {
    const { root } = build();
    const tile = root.querySelector<HTMLButtonElement>('[data-month-id="jul"]')!;
    tile.click();
    const slot = root.querySelector<HTMLButtonElement>('[data-slot-index="0"]')!;
    slot.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(root.querySelector('[data-slot-index="1"]')?.textContent).toContain('July');
    expect(root.querySelector('.month-live')?.textContent).toContain('position');
  });

  it('rejects incomplete orders and submits only after all four slots are filled', () => {
    const { root, submitAnswer } = build();
    place(root, 'jan', 0);
    root.querySelector<HTMLButtonElement>('[data-slot-index="0"]')!.click();
    root.querySelector<HTMLButtonElement>('[data-slot-index="0"]')!.click();
    root.querySelector<HTMLButtonElement>('.month-check')!.click();
    expect(submitAnswer).not.toHaveBeenCalled();
    expect(root.querySelector('.month-live')?.textContent).toMatch(/four|4/);
  });

  it('submits the arranged sequence for both correct and incorrect orders', () => {
    const correct = build();
    for (const [index, month] of ids.entries()) place(correct.root, month, index);
    correct.root.querySelector<HTMLButtonElement>('.month-check')!.click();
    expect(correct.submitAnswer).toHaveBeenCalledWith('jan,mar,jul,dec');

    const wrong = build();
    for (const [index, month] of ['dec', 'jul', 'mar', 'jan'].entries()) place(wrong.root, month, index);
    wrong.root.querySelector<HTMLButtonElement>('.month-check')!.click();
    expect(wrong.submitAnswer).toHaveBeenCalledWith('dec,jul,mar,jan');
  });

  it('disables the board after submission and reveals the correct order', () => {
    const { root } = build(true);
    expect([...root.querySelectorAll<HTMLButtonElement>('button')].every((button) => button.disabled)).toBe(true);
    expect(root.querySelector('.month-correct-order')?.textContent).toContain('January');
  });

  it('retains the in-progress arrangement when a month question is rendered again', () => {
    const q = calendarGame.makeQuestion(calendarGame.levels[1], createRng(82), []);
    expect(q.answerOn).toBe('interactive');
    const first = q.visual!({ lang: 'en', picked: null, submitAnswer: vi.fn() });
    const firstMonth = first.querySelector<HTMLButtonElement>('.month-tile')!;
    const firstId = firstMonth.dataset.monthId!;
    firstMonth.click();
    first.querySelector<HTMLButtonElement>('[data-slot-index="0"]')!.click();
    const second = q.visual!({ lang: 'nl', picked: null, submitAnswer: vi.fn() });
    expect(second.querySelector('[data-slot-index="0"]')?.textContent).toContain(MONTHS.find((month) => month.id === firstId)!.name.nl);
    expect(second.querySelector(`[data-month-id="${firstId}"]`)).toBeNull();
  });
});
