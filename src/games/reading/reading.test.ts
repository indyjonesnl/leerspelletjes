import { describe, it, expect } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question } from '../../core/types';
import { readingGame } from './index';
import { STORIES } from './data';

describe('Reading Detective', () => {
  it('offers twelve story targets per skill and ten fresh bilingual four-choice questions', () => {
    expect(new Set(STORIES.map(s => s.id)).size).toBeGreaterThanOrEqual(12);
    expect(readingGame.levels.map(l => l.id)).toEqual(['information','main-idea','cause-effect','vocabulary']);
    for (const level of readingGame.levels) {
      const previous: Question[] = [];
      for (let i = 0; i < 12; i++) {
        const q = readingGame.makeQuestion(level, createRng(i + 41), previous);
        expect(previous.map(p => p.key)).not.toContain(q.key);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map(c => c.id)).size).toBe(4);
        expect(q.choices.filter(c => c.id === q.answerId)).toHaveLength(1);
        for (const lang of ['nl','en'] as const) {
          expect(new Set(q.choices.map(c => c.label[lang])).size).toBe(4);
          expect(q.prompt[lang].length).toBeGreaterThan(8);
        }
        previous.push(q);
      }
    }
  });
  it('keeps the same answer across languages, leaves passages accessible, and reveals evidence only after either result', () => {
    expect(readingGame.levels).toHaveLength(4);
    for (const level of readingGame.levels) {
      const previous: Question[] = [];
      expect(level.autoSpeak).toBe(false);
      for (let i = 0; i < 12; i++) {
        const q = readingGame.makeQuestion(level, createRng(i + 5), previous);
        expect(q.autoAdvance).toBe(false);
        expect(q.visualLabel).toBeUndefined();
        for (const lang of ['nl','en'] as const) {
          const before = q.visual!({lang, picked:null});
          expect(before.matches('article')).toBe(true);
          expect(before.getAttribute('lang')).toBe(lang);
          expect(before.querySelector('h2,h3')).not.toBeNull();
          expect(before.querySelectorAll('[data-sentence]')).toHaveLength(3);
          expect(before.querySelector('[role="img"]')).toBeNull();
          expect(before.querySelector('.reading-evidence,.reading-explanation')).toBeNull();
          expect(q.speech![lang]).toContain(before.querySelector('[data-sentence]')!.textContent);
          expect(q.speech![lang]).toContain(q.prompt[lang]);
          for (const id of [q.answerId, q.choices.find(c => c.id !== q.answerId)!.id]) {
            const after = q.visual!({lang, picked:{id, answerId:q.answerId}});
            expect(after.querySelectorAll('[data-sentence]')).toHaveLength(3);
            expect(after.querySelector('.reading-evidence')).not.toBeNull();
            expect(after.querySelector('.reading-explanation')!.textContent!.length).toBeGreaterThan(20);
            expect(after.querySelector('h2,h3')!.textContent).toBe(before.querySelector('h2,h3')!.textContent);
          }
        }
        previous.push(q);
      }
    }
  });
  it('teaches every skill in both languages, with optional speech only after a click', () => {
    expect(readingGame.levels).toHaveLength(4);
    for (const level of readingGame.levels) for (const lang of ['nl','en'] as const) {
      const spoken: string[] = [];
      const root = readingGame.study!(level, {lang, speak:text => spoken.push(text)});
      expect(root.matches('.study')).toBe(true);
      expect(root.querySelector('h2')).not.toBeNull();
      expect(root.querySelector('.study-card article')).not.toBeNull();
      expect(root.querySelector('.reading-explanation')).not.toBeNull();
      expect(spoken).toEqual([]);
      root.querySelector('button')!.click();
      expect(spoken[0]).toContain(root.querySelector('[data-sentence]')!.textContent);
      expect(readingGame.study!(level, {lang}).querySelector('button')).toBeNull();
    }
  });
});
