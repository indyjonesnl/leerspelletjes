import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { loadNl } from './load';
import { NL_LEVELS } from './levels';
import { PROVINCES } from './provinces';
import { nederlandGame } from './index';
import { nederlandStudy } from './study';

beforeAll(async () => {
  await loadNl();
});
afterEach(() => document.body.replaceChildren());

const mount = (id: string, lang: 'nl' | 'en' = 'nl', speak?: (text: string) => void) => {
  const root = nederlandStudy(NL_LEVELS.find((l) => l.id === id)!, { lang, speak });
  document.body.replaceChildren(root);
  return root;
};
const province = (root: HTMLElement, code: string) => root.querySelector<SVGElement>(`.country.target[data-choice-id="${code}"]`)!;
const tap = (node: Element) => node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const texts = (root: HTMLElement, selector: string) => [...root.querySelectorAll(selector)].map((n) => n.textContent!);

describe('nederlandGame.study', () => {
  it('is the Nederland study view', () => {
    expect(nederlandGame.study).toBe(nederlandStudy);
  });
});

describe('nederlandStudy: the map levels share one screen', () => {
  it('shows the map with all 12 provinces, 12 capitals and the credit', () => {
    for (const id of ['1', '2', '3']) {
      const root = mount(id);
      expect(root.querySelector('h2')!.textContent, id).toBe('Provincies en hoofdsteden');
      expect(root.querySelectorAll('.country.target'), id).toHaveLength(12);
      expect(root.querySelectorAll('.cap-dot'), id).toHaveLength(12);
      expect(texts(root, '.study-label.name').sort(), id).toEqual(PROVINCES.map((p) => p.name.nl).sort());
      expect(texts(root, '.study-label.city').sort(), id).toEqual(PROVINCES.map((p) => p.capital.nl).sort());
      expect(root.querySelector('.map-credit')!.textContent).toBe('Kaart: CBS, Kadaster (CC BY 4.0)');
    }
  });

  it('speaks English when asked to', () => {
    const root = mount('1', 'en');
    expect(root.querySelector('h2')!.textContent).toBe('Provinces and capitals');
    expect(texts(root, '.study-label.name')).toContain('North Holland');
    expect(texts(root, '.study-label.city')).toContain('The Hague');
    expect(root.querySelector('.info-hint')!.textContent).toBe('Tap a province');
  });

  it('names the provinces for a screen reader, unlike the quiz', () => {
    expect(province(mount('1'), 'NH').getAttribute('aria-label')).toBe('Noord-Holland');
    expect(province(mount('1', 'en'), 'NH').getAttribute('aria-label')).toBe('North Holland');
  });

  it('shows flag, name and capital of the tapped province', () => {
    const root = mount('1');
    expect(root.querySelector('.info-hint')!.textContent).toBe('Tik op een provincie');
    tap(province(root, 'OV'));
    expect(root.querySelector('.info-name')!.textContent).toBe('Overijssel');
    expect(root.querySelector('.info-capital')!.textContent).toBe('Hoofdstad: Zwolle');
    expect(root.querySelector('.info-card img')!.getAttribute('src')).toBe('flags-nl/ov.svg');
    expect(province(root, 'OV').classList.contains('selected')).toBe(true);
    tap(province(root, 'GE'));
    expect(province(root, 'OV').classList.contains('selected')).toBe(false);
    expect(root.querySelector('.info-name')!.textContent).toBe('Gelderland');
  });

  it('also selects the province when its capital dot is tapped, and with the keyboard', () => {
    const root = mount('1');
    tap(root.querySelector('.cap-dot[data-choice-id="ZE"]')!);
    expect(root.querySelector('.info-name')!.textContent).toBe('Zeeland');
    province(root, 'FR').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(root.querySelector('.info-name')!.textContent).toBe('Friesland');
  });

  it('reads the province and its capital aloud only when it can speak', () => {
    expect(mount('1').querySelector('button.speak')).toBeNull();
    const speak = vi.fn();
    const root = mount('1', 'nl', speak);
    tap(province(root, 'ZH'));
    root.querySelector<HTMLButtonElement>('button.speak')!.click();
    expect(speak).toHaveBeenCalledWith('Zuid-Holland. De hoofdstad is Den Haag.');
  });
});

describe('nederlandStudy: level 4, the flags', () => {
  it('shows the 12 province flags with name and capital, sorted by name, without a map', () => {
    const root = mount('4');
    expect(root.querySelector('h2')!.textContent).toBe('Vlaggen');
    expect(root.querySelector('svg')).toBeNull();
    const cards = [...root.querySelectorAll('.study-card')];
    expect(cards).toHaveLength(12);
    const names = texts(root, '.study-name');
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'nl')));
    const overijssel = cards.find((c) => c.querySelector('.study-name')!.textContent === 'Overijssel')!;
    expect(overijssel.querySelector('img')!.getAttribute('src')).toBe('flags-nl/ov.svg');
    expect(overijssel.querySelector('.study-detail')!.textContent).toBe('Zwolle');
  });

  it('uses the English names in English', () => {
    const names = texts(mount('4', 'en'), '.study-name');
    expect(names).toContain('North Brabant');
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
  });
});
