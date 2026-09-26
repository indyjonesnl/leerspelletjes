import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playScreen, ADVANCE_DELAY_MS } from './play';
import { createRng } from '../core/rng';
import { svgEl } from '../core/ui';
import type { AppContext, Screen } from './types';
import type { Game, Level, VisualState } from '../core/types';
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

/** Three targets on a small SVG: a (10,10) key 1, b (50,10) key 2, c (10,50) no key. Answer: a. */
function makeVisualGame(): Game {
  let n = 0;
  const targets: [string, number, number, string | undefined][] = [['a', 10, 10, '1'], ['b', 50, 10, '2'], ['c', 10, 50, undefined]];
  return {
    ...makeGame(),
    makeQuestion: () => {
      n++;
      const id = n;
      return {
        key: `v${id}`,
        prompt: { nl: `Waar ligt ${id}?`, en: `Where is ${id}?` },
        answerOn: 'visual',
        visual: ({ picked }: VisualState) => {
          const svg = svgEl('svg', { class: 'map' });
          for (const [cid, x, y, key] of targets) {
            const cls = picked?.answerId === cid ? 'correct' : picked?.id === cid ? 'wrong' : '';
            svg.append(svgEl('rect', {
              class: cls, 'data-choice-id': cid, 'data-cx': x, 'data-cy': y, 'data-key': key,
              tabindex: picked ? undefined : 0, 'aria-disabled': picked ? 'true' : undefined,
            }));
          }
          return svg;
        },
        visualLabel: { hidden: { nl: 'kaart', en: 'map' }, revealed: { nl: 'Aapland', en: 'Apeland' } },
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
const target = (id: string) => document.querySelector<SVGElement>(`[data-choice-id="${id}"]`)!;
const tap = (node: Element) => node.dispatchEvent(new MouseEvent('click', { bubbles: true }));

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

describe('playScreen with answers on the visual', () => {
  it('shows no answer buttons and labels the visual as a group', () => {
    start(makeCtx().ctx, makeVisualGame());
    expect(document.querySelectorAll('.choice')).toHaveLength(0);
    const box = document.querySelector('.visual')!;
    expect(box.getAttribute('role')).toBe('group');
    expect(box.getAttribute('aria-label')).toBe('kaart');
    expect(box.querySelector('svg')!.getAttribute('aria-hidden')).toBeNull();
  });

  it('answers correctly by tapping a target and hands the pick to the visual', () => {
    start(makeCtx().ctx, makeVisualGame());
    tap(target('a'));
    expect(target('a').classList.contains('correct')).toBe(true);
    expect(target('a').getAttribute('aria-disabled')).toBe('true');
    expect(text('.feedback')).toBe('Goed zo!');
    expect(document.querySelector('.visual')!.getAttribute('aria-label')).toBe('Aapland');
    vi.advanceTimersByTime(ADVANCE_DELAY_MS);
    expect(text('.progress')).toBe('Vraag 2 van 10');
  });

  it('shows the right answer after a wrong tap and ignores a second tap', () => {
    start(makeCtx().ctx, makeVisualGame());
    tap(target('b'));
    tap(target('a'));
    expect(target('b').classList.contains('wrong')).toBe(true);
    expect(target('a').classList.contains('correct')).toBe(true);
    expect(text('.feedback')).toBe('Bijna! Het goede antwoord is: Aap');
    expect(document.querySelector('button.continue')).not.toBeNull();
  });

  it('number keys pick the target with that data-key', () => {
    start(makeCtx().ctx, makeVisualGame());
    press('3');
    expect(document.querySelector('.feedback')).toBeNull();
    press('2');
    expect(target('b').classList.contains('wrong')).toBe(true);
  });

  it('arrow keys move focus to the nearest target and Enter answers', () => {
    start(makeCtx().ctx, makeVisualGame());
    target('a').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(target('b'));
    press('ArrowLeft');
    expect(document.activeElement).toBe(target('a'));
    press('ArrowDown');
    expect(document.activeElement).toBe(target('c'));
    press('ArrowLeft');
    expect(document.activeElement).toBe(target('c'));
    press('Enter');
    expect(target('c').classList.contains('wrong')).toBe(true);
  });

  it('keeps focus on the same target after a language change and moves it to the next question after a correct answer', () => {
    const { ctx } = makeCtx();
    const s = start(ctx, makeVisualGame());
    target('b').focus();
    ctx.settings = { ...ctx.settings, lang: 'en' };
    s.update!();
    expect(document.activeElement).toBe(target('b'));
    target('a').focus();
    tap(target('a'));
    vi.advanceTimersByTime(ADVANCE_DELAY_MS);
    expect(document.activeElement).toBe(target('a'));
    expect(target('a').getAttribute('aria-disabled')).toBeNull();
  });

  it('reads only the question aloud on autoSpeak levels', () => {
    const { ctx, speech } = makeCtx();
    start(ctx, makeVisualGame(), levels[0]);
    expect(speech.speak).toHaveBeenCalledWith('Waar ligt 1?', 'nl');
  });
});

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

describe('playScreen with game.load', () => {
  it('waits for load before the first question', async () => {
    let resolve!: () => void;
    const game = { ...makeGame(), load: vi.fn(() => new Promise<void>((r) => { resolve = r; })) };
    start(makeCtx().ctx, game);
    expect(game.load).toHaveBeenCalledWith(levels[1]);
    expect(text('.loading')).toBe('Laden…');
    expect(document.querySelector('.prompt')).toBeNull();
    resolve();
    await flush();
    expect(text('.prompt')).toBe('Vraag nummer 1');
  });

  it('shows a retry button when loading fails', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    start(makeCtx().ctx, { ...makeGame(), load });
    await flush();
    expect(text('[role="alert"]')).toBe('Het spel kon niet laden.');
    [...document.querySelectorAll('button')].find((b) => b.textContent === 'Probeer opnieuw')!.click();
    expect(text('.loading')).toBe('Laden…');
    await flush();
    expect(text('.prompt')).toBe('Vraag nummer 1');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('translates the loading text when the language changes', () => {
    const { ctx } = makeCtx();
    const s = start(ctx, { ...makeGame(), load: () => new Promise<void>(() => {}) });
    ctx.settings = { ...ctx.settings, lang: 'en' };
    s.update!();
    expect(text('.loading')).toBe('Loading…');
  });

  it('shows nothing when destroyed before loading finishes', async () => {
    let resolve!: () => void;
    const { ctx, speech } = makeCtx();
    const s = start(ctx, { ...makeGame(), load: () => new Promise<void>((r) => { resolve = r; }) }, levels[0]);
    s.destroy!();
    resolve();
    await flush();
    expect(document.querySelector('.prompt')).toBeNull();
    expect(speech.speak).not.toHaveBeenCalled();
    screen = undefined;
  });
});
