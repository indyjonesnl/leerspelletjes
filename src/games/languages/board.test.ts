import { describe, it, expect, vi } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question, VisualState } from '../../core/types';
import { SPOKEN } from './data/spoken';
import { LANGUAGE_LEVELS } from './levels';
import { compareSelection, languageBoard } from './board';
import { makeLanguageQuestion } from './questions';

const open: VisualState = { lang: 'nl', picked: null, submitAnswer: () => {} };

function beQuestion(): Question {
  const level = LANGUAGE_LEVELS.find((l) => l.id === '6')!;
  for (let seed = 0; seed < 3000; seed++) {
    const q = makeLanguageQuestion(level, createRng(seed), []);
    if (q.key === 'BE') return q;
  }
  throw new Error('no BE question found');
}
const chip = (root: Element, code: string) =>
  root.querySelector<HTMLButtonElement>(`[data-interactive-focus="chip-${code}"]`)!;
const check = (root: Element) => root.querySelector<HTMLButtonElement>('[data-interactive-focus="check"]')!;

describe('compareSelection', () => {
  it('reports missed and extra codes', () => {
    expect(compareSelection(['nl', 'fr'], ['nl', 'de'])).toEqual({ missed: ['fr'], extra: ['de'] });
  });
  it('treats an empty pick as everything missed', () => {
    expect(compareSelection(['nl', 'fr'], []).missed.sort()).toEqual(['fr', 'nl']);
    expect(compareSelection(['nl', 'fr'], []).extra).toEqual([]);
  });
  it('is empty on an exact match', () => {
    expect(compareSelection(['nl', 'fr'], ['fr', 'nl'])).toEqual({ missed: [], extra: [] });
  });
});

describe('languageBoard', () => {
  it('renders chips as buttons with the first as initial focus', () => {
    const root = languageBoard({ chips: ['nl', 'fr', 'de'], answer: ['nl'], selected: new Set() }, open);
    const chips = [...root.querySelectorAll<HTMLButtonElement>('.chip')];
    expect(chips).toHaveLength(3);
    expect(chips[0].hasAttribute('data-interactive-initial-focus')).toBe(true);
    expect(chips[1].hasAttribute('data-interactive-initial-focus')).toBe(false);
    expect(chips.every((c) => c.type === 'button' && c.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('shows missed and extra languages in Dutch and English, with marks, after a miss', () => {
    const opts = { chips: ['nl', 'fr', 'de'], answer: ['nl', 'fr'], selected: new Set(['nl', 'de']) };
    const picked = { id: 'de+nl', answerId: 'fr+nl' };
    const nl = languageBoard(opts, { lang: 'nl', picked });
    expect(nl.querySelector('.language-detail')!.textContent).toBe('Gemist: Frans · Dit hoort er niet bij: Duits');
    const en = languageBoard(opts, { lang: 'en', picked });
    expect(en.querySelector('.language-detail')!.textContent).toBe('Missed: French · Does not belong: German');
    expect([...en.querySelectorAll('button')].every((b) => b.disabled)).toBe(true);
    expect(chip(en, 'nl').classList.contains('correct')).toBe(true);
    expect(chip(en, 'fr').classList.contains('missed')).toBe(true);
    expect(chip(en, 'de').classList.contains('wrong')).toBe(true);
    expect(chip(en, 'nl').querySelector('[role="img"][aria-label]')!.textContent).toBe('✓');
    expect(chip(en, 'de').querySelector('[role="img"][aria-label]')!.textContent).toBe('✗');
    expect(chip(en, 'fr').querySelector('[role="img"][aria-label]')!.textContent).toBe('✓');
  });

  it('omits an empty half of the detail', () => {
    const opts = { chips: ['nl', 'fr', 'de'], answer: ['nl', 'fr'], selected: new Set(['nl']) };
    const root = languageBoard(opts, { lang: 'en', picked: { id: 'nl', answerId: 'fr+nl' } });
    expect(root.querySelector('.language-detail')!.textContent).toBe('Missed: French');
  });

  it('adds no detail after a correct answer', () => {
    const opts = { chips: ['nl', 'fr', 'de'], answer: ['nl', 'fr'], selected: new Set(['nl', 'fr']) };
    const root = languageBoard(opts, { lang: 'nl', picked: { id: 'fr+nl', answerId: 'fr+nl' } });
    expect(root.querySelector('.language-detail')).toBeNull();
  });
});

describe('language question board', () => {
  it('keeps ticks across a re-render and a language switch', () => {
    const q = beQuestion();
    const first = q.visual!({ ...open, lang: 'nl' });
    chip(first, 'nl').click();
    expect(chip(first, 'nl').getAttribute('aria-pressed')).toBe('true');
    const second = q.visual!({ ...open, lang: 'en' });
    expect(chip(second, 'nl').getAttribute('aria-pressed')).toBe('true');
    expect(check(second).disabled).toBe(false);
  });

  it('has no visualLabel (it would hide the buttons) and a real flag alt in both languages', () => {
    const q = beQuestion();
    expect(q.visualLabel).toBeUndefined();
    for (const lang of ['nl', 'en'] as const) {
      const alt = q.visual!({ ...open, lang }).querySelector('img')!.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  it('enables Check only while something is ticked', () => {
    const q = beQuestion();
    const root = q.visual!(open);
    expect(check(root).disabled).toBe(true);
    chip(root, 'nl').click();
    expect(check(root).disabled).toBe(false);
    chip(root, 'nl').click();
    expect(check(root).disabled).toBe(true);
  });

  it.each([[['nl', 'fr']], [['fr', 'nl']]])('submits the canonical id once for %j', (order) => {
    expect([...SPOKEN.BE.main].sort()).toEqual(['fr', 'nl']);
    const q = beQuestion();
    const submitAnswer = vi.fn();
    const root = q.visual!({ ...open, submitAnswer });
    for (const code of order) chip(root, code).click();
    check(root).click();
    expect(submitAnswer).toHaveBeenCalledTimes(1);
    expect(submitAnswer).toHaveBeenCalledWith('fr+nl');
  });
});
