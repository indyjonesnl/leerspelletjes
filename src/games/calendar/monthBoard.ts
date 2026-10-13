import type { Lang } from '../../core/types';
import { el } from '../../core/ui';
import { MONTHS } from './data';

interface BoardState {
  tray: string[];
  slots: (string | null)[];
  selected: { id: string; slot: number | null } | null;
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
  let state = states.get(initialOrder);
  if (!state) {
    state = { tray: [...initialOrder], slots: Array(monthIds.length).fill(null), selected: null };
    states.set(initialOrder, state);
  }
  const board = el('section', { class: 'month-board', 'aria-label': lang === 'nl' ? 'Maanden sorteren' : 'Arrange the months' });
  const instruction = el('p', { class: 'month-instructions' }, lang === 'nl'
    ? 'Sleep een maand naar een vak. Je kunt ook een maand kiezen en daarna een vak kiezen. Gebruik de pijltjestoetsen op een vak om maanden te verplaatsen.'
    : 'Drag a month into a slot, or select a month and then a slot. Use the arrow keys on a slot to move months.');
  const trayHeading = el('h3', { class: 'month-tray-heading' }, lang === 'nl' ? 'Maanden' : 'Months');
  const tray = el('div', { class: 'month-tile-tray', 'aria-label': lang === 'nl' ? 'Beschikbare maanden' : 'Available months' });
  const slotsHeading = el('h3', { class: 'month-slots-heading' }, lang === 'nl' ? 'Volgorde' : 'Order');
  const slots = el('ol', { class: 'month-slots', 'aria-label': lang === 'nl' ? 'Maandposities' : 'Month positions' });
  const live = el('p', { class: 'month-live', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const labels = { empty: lang === 'nl' ? 'Kies een maand' : 'Choose a month' };
  const disabled = submitted;
  const check = el('button', { type: 'button', class: 'button month-check', disabled }, lang === 'nl' ? 'Controleer volgorde' : 'Check order');
  let pointerPending: { id: string; sourceSlot: number | null; pointerId: number; x: number; y: number } | null = null;
  let dragActive = false;
  let suppressNextClick = false;

  function announce(message: string) {
    live.textContent = message;
  }

  function placeMonth(id: string, sourceSlot: number | null, targetSlot: number) {
    if (disabled || targetSlot < 0 || targetSlot >= state!.slots.length) return;
    const displaced = state!.slots[targetSlot];
    if (sourceSlot === null) {
      const trayIndex = state!.tray.indexOf(id);
      if (trayIndex < 0) return;
      state!.tray.splice(trayIndex, 1);
      if (displaced) state!.tray.push(displaced);
      state!.slots[targetSlot] = id;
    } else {
      state!.slots[targetSlot] = id;
      state!.slots[sourceSlot] = displaced;
    }
    state!.selected = null;
    render();
    announce(`${monthName(id, lang)} ${lang === 'nl' ? 'staat nu op plek' : 'is now in position'} ${targetSlot + 1}.`);
  }

  function selectMonth(id: string, slot: number | null) {
    if (disabled) return;
    state!.selected = state!.selected?.id === id ? null : { id, slot };
    announce(state!.selected
      ? `${monthName(id, lang)} ${lang === 'nl' ? 'gekozen. Kies een genummerd vak.' : 'selected. Choose a numbered slot.'}`
      : (lang === 'nl' ? 'Selectie opgeheven.' : 'Selection cleared.'));
    render();
  }

  function moveSelectedTo(targetSlot: number) {
    if (state!.selected) placeMonth(state!.selected.id, state!.selected.slot, targetSlot);
    else {
      const id = state!.slots[targetSlot];
      if (id) selectMonth(id, targetSlot);
      else announce(labels.empty);
    }
  }

  function render() {
    const focused = board.contains(document.activeElement) ? document.activeElement as HTMLElement : null;
    const focusMonth = focused?.dataset.monthId;
    const focusSlot = focused?.dataset.slotIndex;
    tray.replaceChildren(...state!.tray.map((id) => {
      const selected = state!.selected?.id === id;
      const button = el('button', {
        type: 'button', class: `month-tile${selected ? ' is-selected' : ''}`,
        'data-month-id': id,
        'aria-pressed': String(selected),
        'aria-label': `${monthName(id, lang)}${selected ? (lang === 'nl' ? ', gekozen' : ', selected') : ''}`,
        draggable: 'true', disabled,
      }, monthName(id, lang));
      button.addEventListener('click', () => selectMonth(id, null));
      return button;
    }));
    slots.replaceChildren(...state!.slots.map((id, index) => {
      const slot = el('li', { class: 'month-board-row' },
        el('button', {
          type: 'button', class: 'month-slot', 'data-slot-index': String(index),
          'aria-label': `${lang === 'nl' ? 'Plek' : 'Position'} ${index + 1}${id ? `, ${monthName(id, lang)}` : `, ${labels.empty}`}`,
          disabled,
        }, `${index + 1}. ${id ? monthName(id, lang) : labels.empty}`),
      );
      const button = slot.querySelector<HTMLButtonElement>('.month-slot')!;
      button.addEventListener('click', () => {
        if (state!.selected?.slot === index && state!.selected.id === id && id) {
          state!.slots[index] = null;
          state!.tray.push(id);
          state!.selected = null;
          render();
          announce(`${monthName(id, lang)} ${lang === 'nl' ? 'terug bij de maanden.' : 'returned to the month tray.'}`);
        } else if (state!.selected) placeMonth(state!.selected.id, state!.selected.slot, index);
        else if (id) selectMonth(id, index);
        else announce(lang === 'nl' ? 'Kies eerst een maand.' : 'Choose a month first.');
      });
      return slot;
    }));
    board.dataset.selectedMonth = state!.selected?.id ?? '';
    if (focusMonth) board.querySelector<HTMLButtonElement>(`[data-month-id="${focusMonth}"]`)?.focus();
    else if (focusSlot !== undefined) board.querySelector<HTMLButtonElement>(`[data-slot-index="${focusSlot}"]`)?.focus();
  }

  board.append(instruction, trayHeading, tray, slotsHeading, slots, live, check);
  render();
  board.addEventListener('pointerdown', (event) => {
    if (disabled) return;
    const target = event.target as HTMLElement;
    const tile = target.closest<HTMLButtonElement>('.month-tile');
    if (tile?.dataset.monthId) {
      pointerPending = { id: tile.dataset.monthId, sourceSlot: null, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      return;
    }
    const sourceSlot = target.closest<HTMLButtonElement>('.month-slot');
    if (sourceSlot) {
      const index = Number(sourceSlot.dataset.slotIndex);
      const id = state!.slots[index];
      if (id) pointerPending = { id, sourceSlot: index, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    }
  });
  board.addEventListener('pointermove', (event) => {
    if (!pointerPending || pointerPending.pointerId !== event.pointerId) return;
    if (Math.abs(event.clientX - pointerPending.x) + Math.abs(event.clientY - pointerPending.y) < 6) return;
    dragActive = true;
    state!.selected = { id: pointerPending.id, slot: pointerPending.sourceSlot };
    board.dataset.draggingMonth = pointerPending.id;
  });
  board.addEventListener('pointerup', (event) => {
    if (!pointerPending || pointerPending.pointerId !== event.pointerId) return;
    const target = event.target as HTMLElement;
    const slot = target.closest<HTMLButtonElement>('.month-slot');
    if (dragActive && slot) {
      placeMonth(pointerPending.id, pointerPending.sourceSlot, Number(slot.dataset.slotIndex));
      suppressNextClick = true;
    } else if (dragActive) {
      state!.selected = null;
      render();
    }
    pointerPending = null;
    dragActive = false;
    delete board.dataset.draggingMonth;
  });
  board.addEventListener('pointercancel', () => {
    if (dragActive) {
      state!.selected = null;
      render();
    }
    pointerPending = null;
    dragActive = false;
    delete board.dataset.draggingMonth;
  });
  board.addEventListener('click', (event) => {
    if (!suppressNextClick) return;
    suppressNextClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  board.addEventListener('keydown', (event) => {
    if (disabled || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const target = event.target as HTMLElement;
    const slot = target.closest<HTMLButtonElement>('.month-slot');
    if (!slot) {
      const tile = target.closest<HTMLButtonElement>('.month-tile');
      if (tile && (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowLeft')) {
        event.preventDefault();
        const tiles = [...board.querySelectorAll<HTMLButtonElement>('.month-tile')];
        const current = tiles.indexOf(tile);
        const next = current + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1);
        tiles[(next + tiles.length) % tiles.length]?.focus();
        return;
      }
      return;
    }
    const current = Number(slot.dataset.slotIndex);
    const destination = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? current - 1 : current + 1;
    if (destination < 0 || destination >= state!.slots.length) return;
    event.preventDefault();
    if (!state!.selected && state!.slots[current]) state!.selected = { id: state!.slots[current]!, slot: current };
    if (state!.selected) {
      placeMonth(state!.selected.id, state!.selected.slot, destination);
      board.querySelector<HTMLButtonElement>(`[data-slot-index="${destination}"]`)?.focus();
    } else moveSelectedTo(destination);
  });
  check.addEventListener('click', () => {
    if (disabled) return;
    if (state!.slots.some((id) => id === null)) {
      announce(lang === 'nl' ? 'Vul eerst alle vier de plekken.' : 'Fill all four slots first.');
      return;
    }
    submitAnswer(state!.slots.join(','));
  });
  if (submitted) {
    const correct = el('p', { class: 'month-correct-order' },
      `${lang === 'nl' ? 'Juiste volgorde:' : 'Correct order:'} ${monthIds.map((id) => monthName(id, lang)).join(' → ')}`,
    );
    board.append(correct);
  }
  return board;
}
