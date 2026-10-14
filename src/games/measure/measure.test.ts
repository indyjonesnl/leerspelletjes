// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question } from '../../core/types';
import { measureGame } from './index';

describe('Measure Master', () => {
  for (const id of ['units', 'ruler', 'weight', 'volume']) {
    it(`${id}: offers four distinct bilingual choices and ten fresh questions`, () => {
      const level = measureGame.levels.find(l => l.id === id)!;
      const previous: Question[] = [];
      const rng = createRng(37);
      for (let i = 0; i < 12; i++) {
        const q = measureGame.makeQuestion(level, rng, previous);
        expect(previous.some(p => p.key === q.key)).toBe(false);
        expect(q.choices).toHaveLength(4);
        expect(q.choices.filter(c => c.id === q.answerId)).toHaveLength(1);
        for (const lang of ['nl', 'en'] as const) {
          expect(new Set(q.choices.map(c => c.label[lang])).size).toBe(4);
          expect(q.prompt[lang].length).toBeGreaterThan(5);
          const before = q.visual!({ lang, picked: null });
          expect(before.querySelector('.measure-explanation')).toBeNull();
          expect(before.querySelector('[data-correct], .correct')).toBeNull();
          expect(q.visualLabel).toBeUndefined();
          for (const picked of [q.answerId, q.choices.find(c => c.id !== q.answerId)!.id]) {
            const after = q.visual!({ lang, picked: { id: picked, answerId: q.answerId } });
            expect(after.querySelector('.measure-explanation')?.textContent?.length).toBeGreaterThan(8);
            expect(after.getAttribute('role')).not.toBe('img');
          }
        }
        expect(q.autoAdvance).toBe(false);
        previous.push(q);
      }
    });
    it(`${id}: includes bilingual study examples`, () => {
      const level = measureGame.levels.find(l => l.id === id)!;
      for (const lang of ['nl', 'en'] as const) {
        const view = measureGame.study!(level, { lang });
        expect(view.classList.contains('study')).toBe(true);
        expect(view.querySelector('h2')).not.toBeNull();
        expect(view.querySelector('.study-card')?.textContent?.length).toBeGreaterThan(30);
      }
    });
  }
  it('ruler answers are endpoint minus start, including shifted pencils', () => {
    const level = measureGame.levels.find(l => l.id === 'ruler')!;
    const rng = createRng(12);
    const previous: Question[] = [];
    let shifted = 0;
    for (let i = 0; i < 30; i++) {
      const q = measureGame.makeQuestion(level, rng, previous);
      const [, start, end] = q.key.split(':').map(Number);
      expect(q.answerId).toBe(String(end - start));
      shifted += Number(start > 0);
      const v = q.visual!({ lang: 'en', picked: null });
      const label = v.querySelector('svg')!.getAttribute('aria-label')!;
      expect(label).toContain(`starts at ${start} cm`);
      expect(label).toContain(`ends at ${end} cm`);
      expect(label).not.toContain('length');
      const after = q.visual!({ lang: 'en', picked: { id: q.answerId, answerId: q.answerId } });
      expect(after.textContent).toContain(`${end} − ${start} = ${end - start} cm`);
      previous.push(q);
    }
    expect(shifted).toBeGreaterThan(0);
  });
  it('scale answers match the numbered pointer; jug answers match unique extrema', () => {
    const rng = createRng(4);
    for (const id of ['weight', 'volume']) {
      const level = measureGame.levels.find(l => l.id === id)!;
      const previous: Question[] = [];
      for (let i = 0; i < 12; i++) {
        const q = measureGame.makeQuestion(level, rng, previous);
        if (id === 'weight') {
          expect(q.answerId).toBe(q.key.split(':')[1]);
          const svg = q.visual!({ lang: 'en', picked: null }).querySelector('svg')!;
          expect(svg.getAttribute('aria-label')).toContain(`points to ${q.answerId}`);
          expect(svg.querySelectorAll('.measure-scale-mark')).toHaveLength(13);
        } else {
          const [, mode, ...amounts] = q.key.split(':');
          const values = amounts.map(Number);
          expect(new Set(values).size).toBe(4);
          expect(values.every(v => Number.isInteger(v) && v >= 1 && v <= 6)).toBe(true);
          const target = mode === 'most' ? Math.max(...values) : Math.min(...values);
          expect(q.answerId).toBe('ABCD'[values.indexOf(target)]);
        }
        previous.push(q);
      }
    }
  });
  it('everyday units use cm, m, kg and l with appropriate examples', () => {
    const level = measureGame.levels.find(l => l.id === 'units')!;
    const rng = createRng(8);
    const previous: Question[] = [];
    for (let i = 0; i < 16; i++) previous.push(measureGame.makeQuestion(level, rng, previous));
    expect(new Set(previous.map(q => q.answerId))).toEqual(new Set(['cm', 'm', 'kg', 'l']));
    expect(previous.find(q => q.prompt.en.includes('pencil'))?.answerId).toBe('cm');
    expect(previous.find(q => q.prompt.en.includes('classroom'))?.answerId).toBe('m');
    expect(previous.find(q => q.prompt.en.includes('child'))?.answerId).toBe('kg');
    expect(previous.find(q => q.prompt.en.includes('bucket'))?.answerId).toBe('l');
  });
  it('allows every jug position to hold the unique most or least water', () => {
    const level = measureGame.levels.find(l => l.id === 'volume')!;
    const rng = createRng(43);
    const answers = new Set<string>();
    for (let i = 0; i < 100; i++) answers.add(measureGame.makeQuestion(level, rng, []).answerId);
    expect(answers).toEqual(new Set(['A', 'B', 'C', 'D']));
  });
});
