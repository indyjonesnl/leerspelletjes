import { describe, it, expect } from 'vitest';
import { FLAG_CONFIG, FLAG_LEVELS } from './levels';
import { flagsGame } from './index';
import { flagsStudy } from './study';

const names = (root: HTMLElement) => [...root.querySelectorAll('.study-name')].map((n) => n.textContent!);

describe('flagsStudy', () => {
  it('is the flags game study view', () => {
    expect(flagsGame.study).toBe(flagsStudy);
  });

  it('shows one card per country of the level, under the level label', () => {
    for (const level of FLAG_LEVELS) {
      const root = flagsStudy(level, { lang: 'nl' });
      expect(root.querySelectorAll('.study-card'), level.id).toHaveLength(FLAG_CONFIG[level.id].pool.length);
      expect(root.querySelector('h2')!.textContent).toBe(level.label.nl);
    }
  });

  it('shows each flag from the site itself and no detail line', () => {
    const root = flagsStudy(FLAG_LEVELS[0], { lang: 'nl' });
    const sources = [...root.querySelectorAll('img')].map((i) => i.getAttribute('src'));
    expect(sources).toContain('flags/nl.svg');
    expect(sources.every((s) => /^flags\/[a-z]{2}\.svg$/.test(s!))).toBe(true);
    expect(root.querySelector('.study-detail')).toBeNull();
  });

  it('sorts by name in the current language', () => {
    const nl = names(flagsStudy(FLAG_LEVELS[1], { lang: 'nl' }));
    const en = names(flagsStudy(FLAG_LEVELS[1], { lang: 'en' }));
    expect(nl).toEqual([...nl].sort((a, b) => a.localeCompare(b, 'nl')));
    expect(en).toEqual([...en].sort((a, b) => a.localeCompare(b, 'en')));
    expect(nl).toContain('Duitsland');
    expect(en).toContain('Germany');
  });

  it('groups only the whole-world level under continent headings', () => {
    const world = flagsStudy(FLAG_LEVELS[5], { lang: 'nl' });
    expect([...world.querySelectorAll('h3')].map((h) => h.textContent)).toEqual(['Europa', 'Amerika', 'Afrika', 'Azië', 'Oceanië']);
    expect(world.querySelectorAll('.study-grid')).toHaveLength(5);
    expect(world.querySelectorAll('.study-card')).toHaveLength(193);
    expect([...flagsStudy(FLAG_LEVELS[5], { lang: 'en' }).querySelectorAll('h3')].map((h) => h.textContent))
      .toEqual(['Europe', 'The Americas', 'Africa', 'Asia', 'Oceania']);
    for (const level of FLAG_LEVELS.slice(0, 5)) {
      const root = flagsStudy(level, { lang: 'nl' });
      expect(root.querySelector('h3'), level.id).toBeNull();
      expect(root.querySelectorAll('.study-grid'), level.id).toHaveLength(1);
    }
  });
});
