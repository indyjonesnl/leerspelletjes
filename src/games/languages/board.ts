import type { VisualState } from '../../core/types';
import { el } from '../../core/ui';

/** Stub: Task 4 renders the language chips and the Check button here. */
export function languageBoard(
  _opts: { chips: readonly string[]; answer: readonly string[]; selected: Set<string> },
  _state: VisualState,
): HTMLElement {
  return el('div', {});
}
