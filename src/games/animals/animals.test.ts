import { describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { animalsGame } from './index';
import { ANIMALS } from './data';
import { createRng } from '../../core/rng';
import { Round } from '../../core/round';
import type { Question } from '../../core/types';
import { playScreen } from '../../screens/play';
import type { AppContext } from '../../screens/types';

describe('Animal Detective', () => {
  it('provides ten different animals and four distinct bilingual answers in every round', () => {
    for (const level of animalsGame.levels) {
      for (let seed = 0; seed < 20; seed++) {
        const round = new Round(animalsGame, level, createRng(seed));
        const keys = new Set<string>();
        const answers = new Set<string>();
        do {
          const q = round.current;
          expect(q.key.startsWith(`${level.id}:`)).toBe(true);
          expect(keys.has(q.key)).toBe(false);
          keys.add(q.key);
          answers.add(q.answerId);
          expect(q.choices).toHaveLength(4);
          expect(new Set(q.choices.map((c) => c.id)).size).toBe(4);
          expect(q.choices.filter((c) => c.id === q.answerId)).toHaveLength(1);
          for (const lang of ['nl', 'en'] as const) {
            expect(new Set(q.choices.map((c) => c.label[lang])).size).toBe(4);
            expect(q.prompt[lang]).toBeTruthy();
            expect(q.speech?.[lang]).toBeTruthy();
          }
          round.answer(q.answerId);
        } while (round.next());
        expect(keys.size).toBe(10);
        expect(answers.size).toBe(10);
        expect(round.score).toBe(10);
      }
    }
  });

  it('serves real local illustrations for every animal with unique bilingual names', () => {
    expect(ANIMALS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(ANIMALS.map((a) => a.id)).size).toBe(ANIMALS.length);
    for (const lang of ['nl', 'en'] as const) {
      expect(new Set(ANIMALS.map((a) => a.name[lang])).size).toBe(ANIMALS.length);
    }
    for (const a of ANIMALS) {
      expect(existsSync(`public/animals/${a.codepoint}.svg`)).toBe(true);
      expect(readFileSync(`public/animals/${a.codepoint}.svg`, 'utf8')).toContain('<svg');
    }
  });

  it('hides identifying names before answers, supplies silhouette clues, and reveals each animal afterward', () => {
    expect(ANIMALS.length).toBeGreaterThanOrEqual(12);
    for (const level of animalsGame.levels) {
      const history: Question[] = [];
      for (let i = 0; i < ANIMALS.length; i++) {
        const q = animalsGame.makeQuestion(level, createRng(i), history);
        history.push(q);
        const animal = ANIMALS.find((a) => a.id === q.answerId)!;
        for (const lang of ['nl', 'en'] as const) {
          const hidden = q.visual!({ lang, picked: null });
          const revealed = q.visual!({ lang, picked: { id: q.choices.find((c) => c.id !== q.answerId)!.id, answerId: q.answerId } });
          const name = animal.name[lang];
          expect(q.speech![lang].toLowerCase()).not.toContain(name.toLowerCase());
          expect(hidden.textContent!.toLowerCase()).not.toContain(name.toLowerCase());
          const hiddenImage = hidden.querySelector('img');
          if (level.id === 'clues') {
            expect(hiddenImage).toBeNull();
            expect(hidden.textContent).toContain(animal.clue[lang]);
          } else {
            expect(hiddenImage?.getAttribute('alt')).not.toContain(name);
            expect(hiddenImage?.classList.contains('animal-silhouette')).toBe(level.id === 'silhouettes');
            if (level.id === 'silhouettes') expect(hidden.textContent).toContain(animal.clue[lang]);
          }
          expect(revealed.querySelector('img')?.getAttribute('src')).toBe(`animals/${animal.codepoint}.svg`);
          expect(revealed.querySelector('img')?.getAttribute('alt')).toBe(name);
          expect(revealed.querySelector('.animal-silhouette')).toBeNull();
          expect(revealed.textContent).toContain(name);
          expect(hidden.querySelector('a[href="https://openmoji.org/"]')).not.toBeNull();
        }
      }
    }
  });

  it('switches visual behavior when the current level changes', () => {
    const rng = createRng(8);
    const pictures = animalsGame.makeQuestion(animalsGame.levels[0], rng, []);
    const silhouettes = animalsGame.makeQuestion(animalsGame.levels[1], rng, [pictures]);
    const clues = animalsGame.makeQuestion(animalsGame.levels[2], rng, [pictures, silhouettes]);
    expect(pictures.visual!({ lang: 'en', picked: null }).querySelector('img')).not.toBeNull();
    expect(silhouettes.visual!({ lang: 'en', picked: null }).querySelector('.animal-silhouette')).not.toBeNull();
    expect(clues.visual!({ lang: 'en', picked: null }).querySelector('img')).toBeNull();
  });

  it('keeps attribution links and readable clues accessible in the real play screen before and after answering', () => {
    const ctx: AppContext = {
      settings: { lang: 'en', sound: false },
      setSettings: vi.fn(),
      speech: { isAvailable: () => false, speak: vi.fn(), stop: vi.fn(), onVoicesChanged: () => () => {} },
      games: [animalsGame],
    };
    for (const level of animalsGame.levels) {
      const screen = playScreen(ctx, animalsGame, level, createRng(2));
      try {
        const checkAccessible = () => {
          const links = screen.el.querySelectorAll<HTMLAnchorElement>('.animal-credit a');
          expect(links).toHaveLength(2);
          for (const link of links) expect(link.closest('[aria-hidden="true"]')).toBeNull();
          for (const clue of screen.el.querySelectorAll('.animal-clue, .animal-picture')) {
            expect(clue.closest('[aria-hidden="true"]')).toBeNull();
          }
        };
        checkAccessible();
        screen.el.querySelector<HTMLButtonElement>('.choice')!.click();
        checkAccessible();
      } finally {
        screen.destroy?.();
      }
    }
  });
});
