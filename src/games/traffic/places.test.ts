import { describe, expect, it } from 'vitest';
import { createRng } from '../../core/rng';
import { Round } from '../../core/round';
import { trafficGame } from './index';

function placesLevel() {
  const level = trafficGame.levels.find(level => level.id === 'places');
  expect(level, 'photo recognition is available in the traffic game').toBeDefined();
  return level!;
}

describe('Recognise the traffic scene', () => {
  it('plays ten fresh bilingual questions without showing the same photograph twice in a row', () => {
    for (let seed = 0; seed < 20; seed++) {
      const round = new Round(trafficGame, placesLevel(), createRng(seed));
      const keys = new Set<string>();
      let lastPhoto: string | null = null;
      do {
        const q = round.current;
        expect(keys.has(q.key)).toBe(false);
        keys.add(q.key);
        expect(q.autoAdvance).toBe(false);
        expect(q.choices).toHaveLength(4);
        expect(q.choices.filter(c => c.id === q.answerId)).toHaveLength(1);
        for (const lang of ['nl', 'en'] as const) {
          expect(new Set(q.choices.map(c => c.label[lang])).size).toBe(4);
          expect(q.prompt[lang]).toBeTruthy();
          const before = q.visual!({ lang, picked: null });
          const photo = before.querySelector('img')!;
          expect(photo.getAttribute('src')).toMatch(/^traffic-places\/.+\.(jpg|png)$/);
          expect(photo.getAttribute('alt')).toBeTruthy();
          expect(before.querySelector('.traffic-place-explanation')).toBeNull();
          expect(before.querySelector('.traffic-photo-credit a[href^="https://commons.wikimedia.org/"]')).not.toBeNull();
          expect(before.querySelector('.traffic-photo-credit a[href^="https://creativecommons.org/"]')).not.toBeNull();
          if (lang === 'nl') {
            expect(photo.getAttribute('src')).not.toBe(lastPhoto);
            lastPhoto = photo.getAttribute('src');
          }
          for (const id of [q.answerId, q.choices.find(c => c.id !== q.answerId)!.id]) {
            expect(q.visual!({ lang, picked: { id, answerId: q.answerId } }).querySelector('.traffic-place-explanation')?.textContent).toBeTruthy();
          }
        }
        round.answer(q.answerId);
      } while (round.next());
      expect(keys.size).toBe(10);
      expect(round.score).toBe(10);
    }
  });

  it('offers six credited photographs in both Learn First languages', () => {
    for (const lang of ['nl', 'en'] as const) {
      const study = trafficGame.study!(placesLevel(), { lang });
      expect(study.querySelectorAll('.study-card')).toHaveLength(6);
      const images = [...study.querySelectorAll('img')];
      expect(new Set(images.map(image => image.getAttribute('src'))).size).toBe(6);
      expect(study.querySelectorAll('.traffic-photo-credit')).toHaveLength(6);
      expect(study.textContent).toContain(lang === 'nl' ? 'Haaientanden' : 'Give-way triangles');
      expect(study.textContent).toContain(lang === 'nl' ? 'Rotonde' : 'Roundabout');
      expect(study.textContent).toContain(lang === 'nl' ? 'Zebrapad' : 'Zebra crossing');
    }
  });
});
