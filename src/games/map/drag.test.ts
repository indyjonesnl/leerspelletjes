import { describe, it, expect, vi } from 'vitest';
import { el, svgEl } from '../../core/ui';
import { enableDrag } from './drag';

function setup() {
  const area = svgEl('svg');
  const box = svgEl('rect', { 'data-choice-id': 'MC' });
  const sea = svgEl('rect');
  area.append(box, sea);
  const card = el('div', { class: 'name-card' }, 'Monaco');
  document.body.replaceChildren(area, card);
  let under: Element | null = null;
  enableDrag(card, area, () => under);
  const clicked = vi.fn();
  box.addEventListener('click', clicked);
  return { box, sea, card, clicked, setUnder: (node: Element | null) => { under = node; } };
}
const fire = (target: EventTarget, type: string, x = 0, y = 0) =>
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));

describe('enableDrag', () => {
  it('follows the pointer, highlights the box under it and clicks it on drop', () => {
    const { box, card, clicked, setUnder } = setup();
    fire(card, 'pointerdown', 10, 10);
    expect(card.classList.contains('dragging')).toBe(true);
    setUnder(box);
    fire(window, 'pointermove', 50, 80);
    expect(card.style.transform).toBe('translate(40px, 70px)');
    expect(box.classList.contains('drop-over')).toBe(true);
    fire(window, 'pointerup', 50, 80);
    expect(clicked).toHaveBeenCalledOnce();
    expect(card.style.transform).toBe('');
    expect(card.classList.contains('dragging')).toBe(false);
    expect(box.classList.contains('drop-over')).toBe(false);
  });

  it('returns without answering when dropped outside a box', () => {
    const { sea, card, clicked, setUnder } = setup();
    fire(card, 'pointerdown', 10, 10);
    setUnder(sea);
    fire(window, 'pointermove', 30, 30);
    fire(window, 'pointerup', 30, 30);
    expect(clicked).not.toHaveBeenCalled();
    expect(card.style.transform).toBe('');
  });

  it('ignores disabled boxes and cancelled drags', () => {
    const { box, card, clicked, setUnder } = setup();
    setUnder(box);
    fire(card, 'pointerdown');
    fire(window, 'pointercancel');
    box.setAttribute('aria-disabled', 'true');
    fire(card, 'pointerdown');
    fire(window, 'pointerup');
    expect(clicked).not.toHaveBeenCalled();
  });

  it('does nothing on pointer moves without a press', () => {
    const { card, setUnder, box, clicked } = setup();
    setUnder(box);
    fire(window, 'pointermove', 40, 40);
    fire(window, 'pointerup', 40, 40);
    expect(card.style.transform).toBe('');
    expect(clicked).not.toHaveBeenCalled();
  });

  it('ignores a second pointer moving or dropping the card, but the first pointer still answers', () => {
    const { box, card, clicked, setUnder } = setup();
    setUnder(box);

    const down = new MouseEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 });
    Object.defineProperty(down, 'pointerId', { value: 1 });
    card.dispatchEvent(down);
    expect(card.classList.contains('dragging')).toBe(true);

    // A second finger touches down: ignored while the first pointer's drag is active.
    const otherDown = new MouseEvent('pointerdown', { bubbles: true, clientX: 5, clientY: 5 });
    Object.defineProperty(otherDown, 'pointerId', { value: 2 });
    card.dispatchEvent(otherDown);

    const otherMove = new MouseEvent('pointermove', { bubbles: true, clientX: 90, clientY: 90 });
    Object.defineProperty(otherMove, 'pointerId', { value: 2 });
    window.dispatchEvent(otherMove);
    expect(card.style.transform).toBe('');

    const otherUp = new MouseEvent('pointerup', { bubbles: true, clientX: 90, clientY: 90 });
    Object.defineProperty(otherUp, 'pointerId', { value: 2 });
    window.dispatchEvent(otherUp);
    expect(clicked).not.toHaveBeenCalled();
    expect(card.classList.contains('dragging')).toBe(true);

    // The original pointer's move and drop still work.
    const move = new MouseEvent('pointermove', { bubbles: true, clientX: 50, clientY: 80 });
    Object.defineProperty(move, 'pointerId', { value: 1 });
    window.dispatchEvent(move);
    expect(card.style.transform).toBe('translate(40px, 70px)');

    const up = new MouseEvent('pointerup', { bubbles: true, clientX: 50, clientY: 80 });
    Object.defineProperty(up, 'pointerId', { value: 1 });
    window.dispatchEvent(up);
    expect(clicked).toHaveBeenCalledOnce();
  });
});
