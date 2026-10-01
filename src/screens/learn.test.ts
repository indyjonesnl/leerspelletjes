import { describe, it, expect, vi } from 'vitest';
import { learnScreen } from './learn';
import type { AppContext } from './types';
import type { Game, Level, StudyContext } from '../core/types';
import type { Settings } from '../core/settings';

const level: Level = { id: '2', label: { nl: 'Twee', en: 'Two' }, example: { nl: '', en: '' }, autoSpeak: false };

function makeGame(extra: Partial<Game> = {}): Game & { seen: StudyContext[] } {
  const seen: StudyContext[] = [];
  return {
    id: 'demo',
    title: { nl: 'Demo NL', en: 'Demo EN' },
    icon: '',
    pickerLayout: 'list',
    levels: [level],
    makeQuestion: () => { throw new Error('unused'); },
    study: (_level, study) => {
      seen.push(study);
      return Object.assign(document.createElement('div'), { className: 'content', textContent: `inhoud ${study.lang}` });
    },
    seen,
    ...extra,
  };
}

function makeCtx(settings: Partial<Settings> = {}, available = true) {
  const speech = {
    isAvailable: vi.fn(() => available),
    speak: vi.fn(),
    stop: vi.fn(),
    onVoicesChanged: vi.fn((_callback: () => void) => () => {}),
  };
  const ctx: AppContext = { settings: { lang: 'nl', sound: true, ...settings }, setSettings: vi.fn(), speech, games: [] };
  return { ctx, speech };
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('learnScreen', () => {
  it('shows the game title, the study content, a practise link and a back link', () => {
    const { el } = learnScreen(makeCtx().ctx, makeGame(), level);
    expect(el.querySelector('h1')!.textContent).toBe('Demo NL');
    expect(el.querySelector('.content')!.textContent).toBe('inhoud nl');
    const practise = el.querySelector<HTMLAnchorElement>('a.big-button')!;
    expect(practise.getAttribute('href')).toBe('#/demo/2');
    expect(practise.textContent).toBe('Nu oefenen');
    const back = el.querySelector<HTMLAnchorElement>('a.back-link')!;
    expect(back.getAttribute('href')).toBe('#/demo');
    expect(back.textContent).toBe('Terug naar de niveaus');
  });

  it('rebuilds in the other language on update and stops speech', () => {
    const { ctx, speech } = makeCtx();
    const screen = learnScreen(ctx, makeGame(), level);
    ctx.settings = { ...ctx.settings, lang: 'en' };
    screen.update!();
    expect(screen.el.querySelector('h1')!.textContent).toBe('Demo EN');
    expect(screen.el.querySelector('.content')!.textContent).toBe('inhoud en');
    expect(screen.el.querySelector('a.big-button')!.textContent).toBe('Practise now');
    expect(speech.stop).toHaveBeenCalled();
  });

  it('loads first: "Laden…" until the level data is there', async () => {
    let finish!: () => void;
    const game = makeGame({ load: () => new Promise<void>((resolve) => { finish = resolve; }) });
    const screen = learnScreen(makeCtx().ctx, game, level);
    expect(screen.el.querySelector('.loading')!.textContent).toBe('Laden…');
    expect(screen.el.querySelector('.content')).toBeNull();
    finish();
    await flush();
    expect(screen.el.querySelector('.loading')).toBeNull();
    expect(screen.el.querySelector('.content')).not.toBeNull();
  });

  it('shows the failure message and retries', async () => {
    let attempts = 0;
    const game = makeGame({ load: () => (++attempts === 1 ? Promise.reject(new Error('offline')) : Promise.resolve()) });
    const screen = learnScreen(makeCtx().ctx, game, level);
    await flush();
    expect(screen.el.querySelector('[role="alert"]')!.textContent).toBe('Het spel kon niet laden.');
    screen.el.querySelector<HTMLButtonElement>('button.big-button')!.click();
    await flush();
    expect(attempts).toBe(2);
    expect(screen.el.querySelector('.content')).not.toBeNull();
  });

  it('renders nothing late after the screen is left', async () => {
    let finish!: () => void;
    const game = makeGame({ load: () => new Promise<void>((resolve) => { finish = resolve; }) });
    const screen = learnScreen(makeCtx().ctx, game, level);
    screen.destroy!();
    finish();
    await flush();
    expect(screen.el.querySelector('.content')).toBeNull();
    expect(game.seen).toHaveLength(0);
  });

  it('gives the study view a speak function only when sound is on and a voice exists', () => {
    const on = makeCtx();
    const gameOn = makeGame();
    learnScreen(on.ctx, gameOn, level);
    gameOn.seen[0].speak!('Hallo');
    expect(on.speech.speak).toHaveBeenCalledWith('Hallo', 'nl');

    const muted = makeGame();
    learnScreen(makeCtx({ sound: false }).ctx, muted, level);
    expect(muted.seen[0].speak).toBeUndefined();

    const noVoice = makeGame();
    learnScreen(makeCtx({}, false).ctx, noVoice, level);
    expect(noVoice.seen[0].speak).toBeUndefined();
  });

  it('rebuilds when voices arrive later', () => {
    const { ctx, speech } = makeCtx({}, false);
    let voicesChanged!: () => void;
    speech.onVoicesChanged.mockImplementation((callback: () => void) => { voicesChanged = callback; return () => {}; });
    const game = makeGame();
    learnScreen(ctx, game, level);
    expect(game.seen.at(-1)!.speak).toBeUndefined();
    speech.isAvailable.mockReturnValue(true);
    voicesChanged();
    expect(game.seen.at(-1)!.speak).toBeDefined();
  });
});
