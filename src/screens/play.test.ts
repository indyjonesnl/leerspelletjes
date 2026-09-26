import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playScreen, ADVANCE_DELAY_MS } from './play';
import { createRng } from '../core/rng';
import type { AppContext, Screen } from './types';
import type { Game, Level } from '../core/types';
import type { Settings } from '../core/settings';

const levels: Level[] = [
  { id: '1', label: { nl: 'Een', en: 'One' }, example: { nl: '', en: '' }, autoSpeak: true },
  { id: '2', label: { nl: 'Twee', en: 'Two' }, example: { nl: '', en: '' }, autoSpeak: false },
];

function makeGame(withImage = false): Game {
  let n = 0;
  return {
    id: 'fake',
    title: { nl: 'Nep', en: 'Fake' },
    icon: '',
    pickerLayout: 'list',
    levels,
    makeQuestion: () => {
      n++;
      const id = n;
      return {
        key: `q${id}`,
        prompt: { nl: `Vraag nummer ${id}`, en: `Question number ${id}` },
        visual: withImage ? () => Object.assign(document.createElement('img'), { src: `x${id}.svg` }) : undefined,
        visualLabel: withImage ? { hidden: { nl: 'vlag', en: 'flag' }, revealed: { nl: 'Aapland', en: 'Apeland' } } : undefined,
        choices: [
          { id: 'a', label: { nl: 'Aap', en: 'Ape' } },
          { id: 'b', label: { nl: 'Beer', en: 'Bear' } },
          { id: 'c', label: { nl: 'Cavia', en: 'Cavy' } },
        ],
        answerId: 'a',
      };
    },
  };
}

function makeCtx(settings: Partial<Settings> = {}, available = true) {
  const speech = {
    isAvailable: vi.fn(() => available),
    speak: vi.fn(),
    stop: vi.fn(),
    onVoicesChanged: vi.fn(() => () => {}),
  };
  const ctx: AppContext = { settings: { lang: 'nl', sound: true, ...settings }, setSettings: vi.fn(), speech, games: [] };
  return { ctx, speech };
}

let screen: Screen | undefined;
function start(ctx: AppContext, game = makeGame(), level = levels[1]): Screen {
  screen = playScreen(ctx, game, level, createRng(1));
  document.body.replaceChildren(screen.el);
  return screen;
}
const text = (selector: string) => document.querySelector(selector)?.textContent ?? null;
const choice = (id: string) => document.querySelector<HTMLButtonElement>(`.choice[data-id="${id}"]`)!;
const press = (key: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key }));
function answerCorrectly() {
  choice('a').click();
  vi.advanceTimersByTime(ADVANCE_DELAY_MS);
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  screen?.destroy?.();
  screen = undefined;
  vi.useRealTimers();
});

describe('playScreen', () => {
  it('shows the first question with progress and choices', () => {
    start(makeCtx().ctx);
    expect(text('.progress')).toBe('Vraag 1 van 10');
    expect(text('.prompt')).toBe('Vraag nummer 1');
    expect(document.querySelectorAll('.choice')).toHaveLength(3);
  });

  it('auto-advances 1 s after a correct answer', () => {
    start(makeCtx().ctx);
    choice('a').click();
    expect(choice('a').classList.contains('correct')).toBe(true);
    expect(text('.feedback')).toBe('Goed zo!');
    vi.advanceTimersByTime(ADVANCE_DELAY_MS - 1);
    expect(text('.progress')).toBe('Vraag 1 van 10');
    vi.advanceTimersByTime(1);
    expect(text('.progress')).toBe('Vraag 2 van 10');
  });

  it('waits for the continue button after a wrong answer', () => {
    start(makeCtx().ctx);
    choice('b').click();
    expect(choice('b').classList.contains('wrong')).toBe(true);
    expect(choice('a').classList.contains('correct')).toBe(true);
    expect(text('.feedback')).toContain('Aap');
    vi.advanceTimersByTime(5000);
    expect(text('.progress')).toBe('Vraag 1 van 10');
    document.querySelector<HTMLButtonElement>('button.continue')!.click();
    expect(text('.progress')).toBe('Vraag 2 van 10');
  });

  it('answers with number keys', () => {
    start(makeCtx().ctx);
    press('2');
    expect(choice('b').classList.contains('wrong')).toBe(true);
  });

  it('ignores number keys held with a modifier', () => {
    start(makeCtx().ctx);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '2', ctrlKey: true }));
    expect(choice('b').classList.contains('wrong')).toBe(false);
  });

  it('second tap and number key after answering are ignored', () => {
    start(makeCtx().ctx);
    for (let i = 0; i < 10; i++) {
      choice('a').click();
      choice('b').click();
      press('3');
      expect(choice('b').classList.contains('wrong')).toBe(false);
      vi.advanceTimersByTime(ADVANCE_DELAY_MS);
    }
    expect(text('.end h1')).toBe('10 van 10!');
  });

  it('shows a next level link except on the last level', () => {
    start(makeCtx().ctx, makeGame(), levels[0]);
    for (let i = 0; i < 10; i++) answerCorrectly();
    expect(document.querySelector('.end a[href="#/fake/2"]')).not.toBeNull();
    screen!.destroy!();

    start(makeCtx().ctx, makeGame(), levels[1]);
    for (let i = 0; i < 10; i++) answerCorrectly();
    expect(text('.end')).not.toContain('Volgend niveau');
    expect(document.querySelector('.end a[href="#/"]')).not.toBeNull();
  });

  it('play again starts a new round', () => {
    start(makeCtx().ctx);
    for (let i = 0; i < 10; i++) answerCorrectly();
    [...document.querySelectorAll<HTMLButtonElement>('.end button')].find((b) => b.textContent === 'Nog een keer')!.click();
    expect(text('.progress')).toBe('Vraag 1 van 10');
  });

  it('keeps progress when the language changes', () => {
    const { ctx } = makeCtx();
    const s = start(ctx);
    answerCorrectly();
    answerCorrectly();
    ctx.settings = { ...ctx.settings, lang: 'en' };
    s.update!();
    expect(text('.progress')).toBe('Question 3 of 10');
    expect(text('.prompt')).toBe('Question number 3');
  });

  it('stops speech and updates the live region when the language changes', () => {
    const { ctx, speech } = makeCtx();
    const s = start(ctx);
    ctx.settings = { ...ctx.settings, lang: 'en' };
    s.update!();
    expect(speech.stop).toHaveBeenCalled();
    expect(text('.sr-only')).toBe('Question number 1');
  });

  it('moves focus between choices with the arrow keys', () => {
    start(makeCtx().ctx);
    choice('a').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(choice('b'));
    press('ArrowRight');
    expect(document.activeElement).toBe(choice('c'));
    press('ArrowLeft');
    expect(document.activeElement).toBe(choice('b'));
  });

  it('focuses the first choice of the next question after a correct answer and auto-advance', () => {
    start(makeCtx().ctx);
    choice('a').focus();
    choice('a').click();
    vi.advanceTimersByTime(ADVANCE_DELAY_MS);
    expect(text('.progress')).toBe('Vraag 2 van 10');
    expect(document.activeElement).toBe(choice('a'));
  });

  it('focuses the continue button after a wrong answer, then the first choice of the next question', () => {
    start(makeCtx().ctx);
    choice('b').focus();
    choice('b').click();
    const continueButton = document.querySelector<HTMLButtonElement>('button.continue')!;
    expect(document.activeElement).toBe(continueButton);
    continueButton.click();
    expect(text('.progress')).toBe('Vraag 2 van 10');
    expect(document.activeElement).toBe(choice('a'));
  });

  it('does nothing after being destroyed mid-advance', () => {
    const { ctx, speech } = makeCtx();
    const s = start(ctx);
    choice('a').click();
    s.destroy!();
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
    expect(text('.progress')).toBe('Vraag 1 van 10');
    expect(speech.stop).toHaveBeenCalled();
    press('2');
    expect(choice('b').classList.contains('wrong')).toBe(false);
  });

  it('reads question and choices automatically on autoSpeak levels', () => {
    const { ctx, speech } = makeCtx();
    start(ctx, makeGame(), levels[0]);
    expect(speech.speak).toHaveBeenCalledWith('Vraag nummer 1: Aap, Beer of Cavia', 'nl');
  });

  it('does not auto-speak when sound is off, but the speaker button still works', () => {
    const { ctx, speech } = makeCtx({ sound: false });
    start(ctx, makeGame(), levels[0]);
    expect(speech.speak).not.toHaveBeenCalled();
    document.querySelector<HTMLButtonElement>('.speak')!.click();
    expect(speech.speak).toHaveBeenCalledWith('Vraag nummer 1: Aap, Beer of Cavia', 'nl');
  });

  it('speaker button reads only the question on levels without autoSpeak', () => {
    const { ctx, speech } = makeCtx();
    start(ctx, makeGame(), levels[1]);
    expect(speech.speak).not.toHaveBeenCalled();
    document.querySelector<HTMLButtonElement>('.speak')!.click();
    expect(speech.speak).toHaveBeenCalledWith('Vraag nummer 1', 'nl');
  });

  it('hides the speaker button when no voice is available', () => {
    const { ctx, speech } = makeCtx({}, false);
    start(ctx, makeGame(), levels[0]);
    expect(document.querySelector('.speak')).toBeNull();
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('labels the visual generically until answered', () => {
    start(makeCtx().ctx, makeGame(true));
    expect(document.querySelector('.visual')!.getAttribute('aria-label')).toBe('vlag');
    choice('a').click();
    expect(document.querySelector('.visual')!.getAttribute('aria-label')).toBe('Aapland');
  });

  it('replaces the question when its image fails to load', () => {
    start(makeCtx().ctx, makeGame(true));
    expect(text('.prompt')).toBe('Vraag nummer 1');
    document.querySelector('.visual img')!.dispatchEvent(new Event('error'));
    expect(text('.prompt')).toBe('Vraag nummer 2');
    expect(text('.progress')).toBe('Vraag 1 van 10');
  });

  it('ends a short level after its round length and grades by percentage', () => {
    const short: Level = { ...levels[1], roundLength: 5 };
    start(makeCtx().ctx, makeGame(), short);
    expect(text('.progress')).toBe('Vraag 1 van 5');
    for (let i = 0; i < 4; i++) answerCorrectly();
    choice('b').click();
    document.querySelector<HTMLButtonElement>('button.continue')!.click();
    expect(text('.end h1')).toBe('4 van 5!');
    expect(text('.end p')).toBe('Super gedaan!');
  });
});
