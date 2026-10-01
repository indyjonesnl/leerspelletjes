import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { getRegion, loadRegion } from './regions';
import { MAP_CONFIG, MAP_LEVELS, levelPool } from './levels';
import { mapGame } from './index';
import { countryInfo, insetMap, mapStudy } from './study';
import { countryName } from './names';

beforeAll(async () => {
  await Promise.all((['europe', 'americas', 'africa', 'asia-oceania'] as const).map(loadRegion));
});
afterEach(() => document.body.replaceChildren());

const level = (id: string) => MAP_LEVELS.find((l) => l.id === id)!;
const mount = (id: string, lang: 'nl' | 'en' = 'nl', speak?: (text: string) => void) => {
  const root = mapStudy(level(id), { lang, speak });
  document.body.replaceChildren(root);
  return root;
};
const area = (root: HTMLElement, code: string) => root.querySelector<SVGElement>(`.country[data-choice-id="${code}"]`)!;
const tap = (node: Element) => node.dispatchEvent(new MouseEvent('click', { bubbles: true }));

describe('countryInfo', () => {
  it('has flag, name, capital and what is read aloud', () => {
    expect(countryInfo('FR', 'nl')).toEqual({ flag: 'flags/fr.svg', name: 'Frankrijk', capital: 'Parijs', speech: 'Frankrijk. De hoofdstad is Parijs.' });
    expect(countryInfo('FR', 'en').speech).toBe('France. The capital is Paris.');
  });
});

describe('mapGame.study', () => {
  it('is the map study view', () => {
    expect(mapGame.study).toBe(mapStudy);
  });
});

describe('mapStudy: tap levels', () => {
  it('makes every tappable country of the level a target, with its real name', () => {
    for (const id of ['1', '2', '4', '6', '8']) {
      const config = MAP_CONFIG[id];
      const pool = levelPool(config, getRegion(config.region));
      const root = mount(id);
      expect(root.querySelectorAll('.country.target'), id).toHaveLength(pool.length);
      expect(root.querySelector('h2')!.textContent).toBe(level(id).label.nl);
    }
    const nl = mount('2');
    expect(area(nl, 'FR').getAttribute('aria-label')).toBe('Frankrijk');
    expect(area(mount('2', 'en'), 'FR').getAttribute('aria-label')).toBe('France');
  });

  it('starts with the hint, then shows flag, name and capital of the tapped country', () => {
    const root = mount('2');
    expect(root.querySelector('.info-hint')!.textContent).toBe('Tik op een land');
    tap(area(root, 'FR'));
    expect(root.querySelector('.info-name')!.textContent).toBe('Frankrijk');
    expect(root.querySelector('.info-capital')!.textContent).toBe('Hoofdstad: Parijs');
    expect(root.querySelector('.info-card img')!.getAttribute('src')).toBe('flags/fr.svg');
    expect(root.querySelector('.info-hint')).toBeNull();
    expect(mount('2', 'en').querySelector('.info-hint')!.textContent).toBe('Tap a country');
  });

  it('moves the selection to the country tapped last', () => {
    const root = mount('2');
    tap(area(root, 'FR'));
    tap(area(root, 'DE'));
    expect([...root.querySelectorAll('.selected')].map((n) => n.getAttribute('data-choice-id'))).toEqual(['DE']);
    expect(area(root, 'DE').getAttribute('aria-pressed')).toBe('true');
    expect(area(root, 'FR').getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector('.info-name')!.textContent).toBe('Duitsland');
  });

  it('selects with the keyboard', () => {
    const root = mount('2');
    area(root, 'FR').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(root.querySelector('.info-name')!.textContent).toBe('Frankrijk');
  });

  it('reads the country and its capital aloud only when it can speak', () => {
    expect(mount('2').querySelector('button.speak')).toBeNull();
    const speak = vi.fn();
    const root = mount('2', 'nl', speak);
    tap(area(root, 'FR'));
    root.querySelector<HTMLButtonElement>('button.speak')!.click();
    expect(speak).toHaveBeenCalledWith('Frankrijk. De hoofdstad is Parijs.');
  });

  it('caps the map height so the card stays in view', () => {
    expect(mount('2').querySelector('svg.map')!.getAttribute('style')).toContain('max-height: 45vh');
  });
});

describe('mapStudy: small-country levels', () => {
  it('lists the level countries as chips sorted by name, none selected', () => {
    for (const id of ['3', '5', '7', '9']) {
      const config = MAP_CONFIG[id];
      const pool = levelPool(config, getRegion(config.region));
      const chips = [...mount(id).querySelectorAll<HTMLButtonElement>('button.chip')];
      expect(chips, id).toHaveLength(pool.length);
      const names = chips.map((c) => c.textContent!);
      expect(names, id).toEqual([...names].sort((a, b) => a.localeCompare(b, 'nl')));
      expect(chips.every((c) => c.getAttribute('aria-pressed') === 'false')).toBe(true);
    }
    expect(mount('3').querySelector('.info-hint')!.textContent).toBe('Kies een land');
    expect(mount('3', 'en').querySelector('.info-hint')!.textContent).toBe('Choose a country');
  });

  it('shows a zoomed-in map and the card for the chosen chip', () => {
    const root = mount('3');
    const malta = [...root.querySelectorAll<HTMLButtonElement>('button.chip')].find((c) => c.textContent === countryName('MT').nl)!;
    malta.click();
    expect(malta.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelectorAll('button.chip[aria-pressed="true"]')).toHaveLength(1);
    expect(root.querySelector('svg.study-inset')).not.toBeNull();
    expect(root.querySelector('.info-name')!.textContent).toBe('Malta');
    expect(root.querySelector('.info-capital')!.textContent).toBe('Hoofdstad: Valletta');
  });

  it('draws the inset around the country with the country marked', () => {
    const map = getRegion('europe');
    const malta = map.countries.find((c) => c.code === 'MT')!;
    const svg = insetMap(map, malta);
    expect(svg.querySelector('.inset-country')!.getAttribute('d')).toBe(malta.d);
    expect(svg.querySelector('.inset-ring')).not.toBeNull();
    expect(svg.getAttribute('viewBox')!.split(' ')).toHaveLength(4);
  });
});

describe('mapStudy: every level', () => {
  it('renders something to explore on all nine levels', () => {
    for (const l of MAP_LEVELS) {
      const root = mount(l.id);
      expect(root.querySelector('.country.target, button.chip'), l.id).not.toBeNull();
    }
  });
});
