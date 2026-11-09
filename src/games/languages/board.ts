import type { Lang, VisualState } from '../../core/types';
import { el } from '../../core/ui';
import { LANGUAGES } from './data/languages';
import { languageSetId } from './questions';

/** Which correct languages were left out, and which picked ones do not belong. */
export function compareSelection(
  correct: readonly string[],
  picked: readonly string[],
): { missed: string[]; extra: string[] } {
  const right = new Set(correct);
  const got = new Set(picked);
  return {
    missed: correct.filter((c) => !got.has(c)),
    extra: picked.filter((p) => !right.has(p)),
  };
}

const TEXT = {
  nl: { check: 'Controleer', missed: 'Gemist', extra: 'Dit hoort er niet bij', ok: 'goed', wrong: 'fout', miss: 'gemist' },
  en: { check: 'Check', missed: 'Missed', extra: 'Does not belong', ok: 'correct', wrong: 'wrong', miss: 'missed' },
} as const;

const names = (codes: readonly string[], lang: Lang) => codes.map((c) => LANGUAGES[c]?.[lang] ?? c).join(', ');

export function languageBoard(
  opts: { chips: readonly string[]; answer: readonly string[]; selected: Set<string> },
  state: VisualState,
): HTMLElement {
  const { chips, answer, selected } = opts;
  const t = TEXT[state.lang];
  const answered = state.picked !== null;
  const pickedCodes = answered ? state.picked!.id.split('+') : [];
  const picked = new Set(pickedCodes);
  const right = new Set(answer);

  const buttons = new Map<string, HTMLButtonElement>();
  const checkButton = el('button', {
    type: 'button',
    class: 'check',
    'data-interactive-focus': 'check',
  }, t.check);
  checkButton.disabled = answered || selected.size === 0;
  checkButton.addEventListener('click', () => {
    if (selected.size > 0) state.submitAnswer?.(languageSetId([...selected]));
  });

  chips.forEach((code, i) => {
    const button = el('button', {
      type: 'button',
      class: 'chip',
      'aria-pressed': String(answered ? picked.has(code) : selected.has(code)),
      'data-interactive-focus': `chip-${code}`,
    }, LANGUAGES[code]?.[state.lang] ?? code);
    if (i === 0) button.setAttribute('data-interactive-initial-focus', 'true');
    if (answered) {
      button.disabled = true;
      const isRight = right.has(code);
      const isPicked = picked.has(code);
      if (isRight || isPicked) {
        const kind = isRight && isPicked ? 'correct' : isRight ? 'missed' : 'wrong';
        button.classList.add(kind);
        button.append(
          el('span', { class: 'mark', role: 'img', 'aria-label': kind === 'wrong' ? t.wrong : kind === 'missed' ? t.miss : t.ok }, kind === 'wrong' ? '✗' : '✓'),
        );
      }
    } else {
      button.addEventListener('click', () => {
        if (selected.has(code)) selected.delete(code);
        else selected.add(code);
        button.setAttribute('aria-pressed', String(selected.has(code)));
        checkButton.disabled = selected.size === 0;
      });
    }
    buttons.set(code, button);
  });

  const root = el('div', { class: 'language-board' }, el('div', { class: 'chips' }, ...buttons.values()), checkButton);
  if (answered) {
    const { missed, extra } = compareSelection(answer, pickedCodes);
    const parts: string[] = [];
    if (missed.length) parts.push(`${t.missed}: ${names(missed, state.lang)}`);
    if (extra.length) parts.push(`${t.extra}: ${names(extra, state.lang)}`);
    if (parts.length) root.append(el('p', { class: 'language-detail' }, parts.join(' · ')));
  }
  return root;
}
