import { describe, it, expect } from 'vitest';
import { FLAG_CONFIG } from '../flags/levels';
import { capitalsGame } from './index';
import { CAPITAL_LEVELS } from './levels';
import { CAPITALS } from './data/capitals';
import { capitalsStudy } from './study';

const card = (root: HTMLElement, name: string) =>
  [...root.querySelectorAll('.study-card')].find((c) => c.querySelector('.study-name')!.textContent === name)!;

describe('capitalsStudy', () => {
  it('is the capitals game study view', () => {
    expect(capitalsGame.study).toBe(capitalsStudy);
  });

  it('shows a card with the capital for every country of the level', () => {
    for (const level of CAPITAL_LEVELS) {
      const root = capitalsStudy(level, { lang: 'nl' });
      const cards = [...root.querySelectorAll('.study-card')];
      expect(cards, level.id).toHaveLength(FLAG_CONFIG[level.id].pool.length);
      expect(cards.every((c) => (c.querySelector('.study-detail')?.textContent ?? '').length > 0), level.id).toBe(true);
    }
  });

  it('writes the capital in the current language', () => {
    expect(card(capitalsStudy(CAPITAL_LEVELS[0], { lang: 'nl' }), 'Frankrijk').querySelector('.study-detail')!.textContent).toBe(CAPITALS.FR.nl);
    expect(card(capitalsStudy(CAPITAL_LEVELS[0], { lang: 'en' }), 'France').querySelector('.study-detail')!.textContent).toBe('Paris');
  });

  it('groups the whole-world level by continent, like the flags study', () => {
    const world = capitalsStudy(CAPITAL_LEVELS[5], { lang: 'nl' });
    expect(world.querySelectorAll('h3')).toHaveLength(5);
    expect(world.querySelectorAll('.study-card')).toHaveLength(193);
  });
});
