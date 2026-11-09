import { describe, it, expect } from 'vitest';
import { FLAG_CONFIG } from '../flags/levels';
import { GAMES } from '../registry';
import { languagesGame } from './index';
import { LANGUAGE_LEVELS } from './levels';
import { languagesStudy } from './study';

const card = (root: HTMLElement, name: string) =>
  [...root.querySelectorAll('.study-card')].find((c) => c.querySelector('.study-name')!.textContent === name)!;
const detail = (root: HTMLElement, name: string) => card(root, name).querySelector('.study-detail')!.textContent;

describe('languagesStudy', () => {
  it('is the languages game study view, registered right after capitals', () => {
    expect(languagesGame.study).toBe(languagesStudy);
    const ids = GAMES.map((g) => g.id);
    expect(ids[ids.indexOf('capitals') + 1]).toBe('languages');
  });

  it('shows a card with languages for every country of the level', () => {
    for (const level of LANGUAGE_LEVELS) {
      const root = languagesStudy(level, { lang: 'nl' });
      const cards = [...root.querySelectorAll('.study-card')];
      expect(cards, level.id).toHaveLength(FLAG_CONFIG[level.id].pool.length);
      expect(cards.every((c) => (c.querySelector('.study-detail')?.textContent ?? '').length > 0), level.id).toBe(true);
    }
  });

  it('writes the languages in the current language, sorted and comma separated', () => {
    expect(detail(languagesStudy(LANGUAGE_LEVELS[0], { lang: 'en' }), 'France')).toBe('French');
    expect(detail(languagesStudy(LANGUAGE_LEVELS[0], { lang: 'nl' }), 'Frankrijk')).toBe('Frans');
    expect(detail(languagesStudy(LANGUAGE_LEVELS[5], { lang: 'en' }), 'Switzerland')).toBe('French, German, Italian');
  });

  it('groups the whole-world level by continent', () => {
    const world = languagesStudy(LANGUAGE_LEVELS[5], { lang: 'nl' });
    expect(world.querySelectorAll('h3')).toHaveLength(5);
    expect(world.querySelectorAll('.study-card')).toHaveLength(193);
  });
});
