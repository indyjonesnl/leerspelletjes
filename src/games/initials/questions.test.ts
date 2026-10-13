import { describe, expect, it } from 'vitest';
import { GAMES } from '../registry';
import { Round } from '../../core/round';
import { createRng } from '../../core/rng';

function game() {
  const found = GAMES.find((g) => g.id === 'initials');
  expect(found, 'First Letters is available on the home screen').toBeDefined();
  return found!;
}

describe('First Letters', () => {
  it('offers four distinct letters with the first letter of the pictured word as the answer', () => {
    const g = game();
    for (let seed = 0; seed < 100; seed++) {
      const q = g.makeQuestion(g.levels[0], createRng(seed), []);
      for (const lang of ['nl', 'en'] as const) {
        const picture = q.visual!({ lang, picked: null });
        const word = picture.querySelector('[role="img"]')!.getAttribute('aria-label')!;
        expect(word).toMatch(/^[a-z]+$/);
        expect(picture.querySelector('.initial-word')).toBeNull();
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map((c) => c.label[lang])).size).toBe(4);
        for (const c of q.choices) expect(c.label[lang]).toMatch(/^[A-Z]$/);
        expect(q.choices.find((c) => c.id === q.answerId)!.label[lang]).toBe(word[0].toUpperCase());
        expect(q.speech![lang]).toContain(word);
        expect(q.visual!({ lang, picked: { id: q.answerId, answerId: q.answerId } }).querySelector('.initial-word')!.textContent).toContain(word);
      }
    }
  });

  it('uses K for kat and C for cat with the same picture', () => {
    const g = game();
    let seen = false;
    for (let seed = 0; seed < 100; seed++) {
      const q = g.makeQuestion(g.levels[0], createRng(seed), []);
      if (q.key !== 'cat') continue;
      seen = true;
      const correct = q.choices.find((c) => c.id === q.answerId)!;
      expect(correct.label).toEqual({ nl: 'K', en: 'C' });
      expect(q.visual!({ lang: 'nl', picked: null }).querySelector('[role="img"]')!.textContent).toBe('🐱');
    }
    expect(seen).toBe(true);
  });

  it('finishes a ten-question round without repeating pictures', () => {
    const g = game();
    const round = new Round(g, g.levels[0], createRng(4));
    const keys = new Set<string>();
    do {
      expect(keys.has(round.current.key)).toBe(false);
      keys.add(round.current.key);
      round.answer(round.current.answerId);
    } while (round.next());
    expect(keys.size).toBe(10);
    expect(round.score).toBe(10);
  });
});
