import { describe, expect, it } from 'vitest';
import { GAMES } from '../registry';
import { createRng } from '../../core/rng';
import { Round } from '../../core/round';
import { TRAFFIC_SIGNS } from './data';
import { trafficSign } from './Sign';

function game() {
  const g = GAMES.find((g) => g.id === 'traffic');
  expect(g, 'Dutch traffic signs are available').toBeDefined();
  return g!;
}

describe('Dutch traffic signs', () => {
  it('serves a local SVG image for every RVV code', () => {
    for (const sign of TRAFFIC_SIGNS) {
      const image = trafficSign(sign.code);
      expect(image.tagName).toBe('IMG');
      expect(image.getAttribute('src')).toBe(`traffic-signs/${sign.code}.svg`);
      expect(image.getAttribute('alt')).toBe('');
      expect(image.getAttribute('data-sign-code')).toBe(sign.code);
    }
  });
  it('has ten different signs per level and four distinct bilingual answers', () => {
    const g = game();
    for (const level of g.levels) {
      for (let seed = 0; seed < 5; seed++) {
        const round = new Round(g, level, createRng(seed));
        const signs = new Set<string>();
        do {
          const q = round.current;
          const visual = q.visual!({ lang: 'nl', picked: null });
          const code = visual.getAttribute('data-sign-code')!;
          expect(code).toMatch(/^[BCDGJL]\d+$/);
          expect(signs.has(code)).toBe(false);
          signs.add(code);
          expect(q.choices).toHaveLength(4);
          expect(q.choices.filter((c) => c.id === q.answerId)).toHaveLength(1);
          for (const lang of ['nl', 'en'] as const) {
            expect(new Set(q.choices.map((c) => c.label[lang])).size).toBe(4);
            expect(q.visual!({ lang, picked: null }).getAttribute('data-sign-code')).toBe(code);
            expect(q.prompt[lang]).toBeTruthy();
          }
          round.answer(q.answerId);
        } while (round.next());
        expect(signs.size).toBe(10);
        expect(round.score).toBe(10);
      }
    }
  });

  it('distinguishes mandatory and optional cycle paths, give way and stop signs', () => {
    const g = game();
    const seen = new Set<string>();
    const expected: Record<string, [string, string]> = {
      B6: ['Voorrang geven', 'Give way'], B7: ['Stoppen en voorrang geven', 'Stop and give way'],
      G7: ['Voetpad', 'Footpath'], G11: ['Verplicht fietspad', 'Mandatory cycle path'],
      G13: ['Onverplicht fietspad', 'Optional cycle path'],
      J22: ['Waarschuwing: zebrapad', 'Warning: pedestrian crossing ahead'],
      L2: ['Zebrapad', 'Pedestrian crossing'],
    };
    for (let seed = 0; seed < 300; seed++) {
      const q = g.makeQuestion(g.levels[1], createRng(seed), []);
      const code = q.visual!({ lang: 'nl', picked: null }).getAttribute('data-sign-code')!;
      if (!expected[code]) continue;
      seen.add(code);
      const answer = q.choices.find((c) => c.id === q.answerId)!;
      expect(answer.label).toEqual({ nl: expected[code][0], en: expected[code][1] });
    }
    expect([...seen].sort()).toEqual(Object.keys(expected).sort());
  });

  it('requires stopping at STOP even when no other traffic is present', () => {
    const g = game();
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      const q = g.makeQuestion(g.levels[2], createRng(seed), []);
      if (q.visual!({ lang: 'nl', picked: null }).getAttribute('data-sign-code') !== 'B7') continue;
      found = true;
      const answer = q.choices.find((c) => c.id === q.answerId)!;
      expect(answer.label.nl).toMatch(/altijd stoppen/i);
      expect(answer.label.nl).toMatch(/voorrang geven/i);
      expect(answer.label.en).toMatch(/always stop/i);
      expect(q.prompt.nl).toContain('fietst');
    }
    expect(found).toBe(true);
  });

  it('does not offer incomplete but true actions as wrong answers', () => {
    const g = game();
    const excludes: Record<string, string[]> = {
      B7: ['B6'], C2: ['C14'], G7: ['C14'], J16: ['J37'],
      J21: ['J37'], J22: ['J37', 'L2'], J24: ['J37'], L2: ['J22'],
    };
    for (let seed = 0; seed < 300; seed++) {
      const q = g.makeQuestion(g.levels[2], createRng(seed), []);
      for (const id of excludes[q.answerId] ?? []) {
        expect(q.choices.map((c) => c.id), `${q.answerId} must not accept ${id} as a partial truth`).not.toContain(id);
      }
    }
  });

  it('offers readable study cards for every sign in each level', () => {
    const g = game();
    expect(g.study).toBeDefined();
    for (const level of g.levels) {
      for (const lang of ['nl', 'en'] as const) {
        const root = g.study!(level, { lang });
        const cards = root.querySelectorAll('.study-card');
        expect(cards.length).toBeGreaterThanOrEqual(10);
        for (const card of cards) {
          expect(card.querySelector('img.traffic-sign')).not.toBeNull();
          expect(card.querySelector('.study-name')!.textContent).toBeTruthy();
          expect(card.querySelector('.traffic-action')!.textContent).toBeTruthy();
        }
      }
    }
  });
});
