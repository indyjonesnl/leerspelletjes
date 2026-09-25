import { describe, it, expect, vi } from 'vitest';
import { homeScreen } from './home';
import { levelsScreen } from './levels';
import { privacyScreen } from './privacy';
import { header } from './header';
import type { AppContext } from './types';
import type { Game, Lang } from '../core/types';

const game: Game = {
  id: 'demo',
  title: { nl: 'Demo NL', en: 'Demo EN' },
  icon: 'icons/demo.svg',
  pickerLayout: 'grid',
  levels: [
    { id: '1', label: { nl: 'Een', en: 'One' }, example: { nl: 'vb 1', en: 'ex 1' }, autoSpeak: false },
    { id: '2', label: { nl: 'Twee', en: 'Two' }, example: { nl: 'vb 2', en: 'ex 2' }, autoSpeak: false },
  ],
  makeQuestion: () => { throw new Error('unused'); },
};

function makeCtx(lang: Lang = 'nl', sound = true): AppContext {
  return {
    settings: { lang, sound },
    setSettings: vi.fn(),
    speech: { isAvailable: () => false, speak: vi.fn(), stop: vi.fn(), onVoicesChanged: () => () => {} },
    games: [game],
  };
}

describe('homeScreen', () => {
  it('shows one tile per game and a privacy link', () => {
    const { el } = homeScreen(makeCtx());
    const tile = el.querySelector<HTMLAnchorElement>('a.tile-demo')!;
    expect(tile.getAttribute('href')).toBe('#/demo');
    expect(tile.textContent).toContain('Demo NL');
    expect(el.querySelector('a[href="#/privacy"]')).not.toBeNull();
  });

  it('uses the chosen language', () => {
    expect(homeScreen(makeCtx('en')).el.textContent).toContain('Demo EN');
  });
});

describe('levelsScreen', () => {
  it('lists every level as a link in the game layout', () => {
    const { el } = levelsScreen(makeCtx(), game);
    const links = [...el.querySelectorAll<HTMLAnchorElement>('a.level')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#/demo/1', '#/demo/2']);
    expect(links[0].textContent).toContain('Een');
    expect(links[0].textContent).toContain('vb 1');
    expect(el.querySelector('.levels-grid')).not.toBeNull();
    expect(el.querySelector('h1')!.textContent).toBe('Demo NL');
  });
});

describe('privacyScreen', () => {
  it('shows the privacy text as paragraphs', () => {
    const { el } = privacyScreen(makeCtx('en'));
    expect(el.querySelectorAll('p').length).toBeGreaterThanOrEqual(5);
    expect(el.textContent).toContain('no cookies');
  });
});

describe('header', () => {
  it('switches language and sound through setSettings', () => {
    const ctx = makeCtx('nl', true);
    const bar = header(ctx, true);
    const en = [...bar.querySelectorAll('button')].find((b) => b.textContent === 'EN')!;
    en.click();
    expect(ctx.setSettings).toHaveBeenCalledWith({ lang: 'en' });
    bar.querySelector<HTMLButtonElement>('button.sound')!.click();
    expect(ctx.setSettings).toHaveBeenCalledWith({ sound: false });
  });

  it('marks the active language and shows the home link only when asked', () => {
    const bar = header(makeCtx('nl'), false);
    const nl = [...bar.querySelectorAll('button')].find((b) => b.textContent === 'NL')!;
    expect(nl.getAttribute('aria-pressed')).toBe('true');
    expect(bar.querySelector('a.home-link')).toBeNull();
    expect(header(makeCtx('nl'), true).querySelector('a.home-link')!.getAttribute('aria-label')).toBe('Naar start');
  });

  it('exposes stable data-focus-key attributes for focus restoration', () => {
    const bar = header(makeCtx('nl'), false);
    expect(bar.querySelector('[data-focus-key="lang-nl"]')?.textContent).toBe('NL');
    expect(bar.querySelector('[data-focus-key="lang-en"]')?.textContent).toBe('EN');
    expect(bar.querySelector('[data-focus-key="sound"]')).not.toBeNull();
  });
});
