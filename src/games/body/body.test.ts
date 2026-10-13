import { describe, it, expect } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question } from '../../core/types';
import { bodyGame } from './index';
import { ORGANS, BONES } from './data';

describe('Body Explorer', () => {
  it('provides ten fresh questions and four unambiguous bilingual options on every level', () => {
    for (const level of bodyGame.levels) {
      const previous: Question[] = [];
      const rng = createRng(201);
      for (let i = 0; i < 10; i++) {
        const q = bodyGame.makeQuestion(level, rng, previous);
        expect(previous.map(p => p.key)).not.toContain(q.key);
        expect(q.choices).toHaveLength(4);
        expect(q.choices.filter(c => c.id === q.answerId)).toHaveLength(1);
        for (const lang of ['nl', 'en'] as const) expect(new Set(q.choices.map(c => c.label[lang])).size).toBe(4);
        previous.push(q);
      }
    }
  });
  it('renders all parts, highlights exactly the target, describes its location and only reveals its name after answering', () => {
    for (const level of bodyGame.levels.filter(l => l.id !== 'functions')) {
      const previous: Question[] = [];
      for (let i = 0; i < 10; i++) {
        const q = bodyGame.makeQuestion(level, createRng(i), previous);
        const svg = q.visual!({ lang: 'en', picked: null });
        expect(svg.querySelectorAll('[data-part-id]')).toHaveLength(10);
        expect(svg.querySelectorAll('.highlighted')).toHaveLength(1);
        expect(svg.querySelector('.highlighted')?.getAttribute('data-part-id')).toBe(q.answerId);
        const name = q.choices.find(c => c.id === q.answerId)!.label.en;
        expect(svg.textContent).not.toContain(name);
        expect(q.visualLabel?.hidden.en).toContain('Orange');
        expect(q.speech?.en).toContain(q.visualLabel!.hidden.en);
        expect(q.visual!({ lang: 'en', picked: { id: q.answerId, answerId: q.answerId } }).textContent).toContain(name);
        previous.push(q);
      }
    }
  });
  it('distinguishes filtering urine from storing it and documents asymmetric and paired anatomy', () => {
    expect(ORGANS.find(o => o.id === 'kidneys')!.function.en).toMatch(/Filter blood.*urine/);
    expect(ORGANS.find(o => o.id === 'bladder')!.function.en).toMatch(/Store urine/);
    expect(ORGANS.find(o => o.id === 'liver')!.location.en).toContain("person’s right");
    expect(ORGANS.find(o => o.id === 'stomach')!.location.en).toContain("person’s left");
    expect(ORGANS.find(o => o.id === 'kidneys')!.location.en).toMatch(/Two.*behind/);
    expect(ORGANS).toHaveLength(10);
    expect(BONES).toHaveLength(10);
  });
  it('uses organ silhouettes and tubular intestines rather than generic circles', () => {
    const svg = bodyGame.makeQuestion(bodyGame.levels[0], createRng(1), []).visual!({lang:'en', picked:null});
    for (const id of ['brain','heart','lungs','stomach','liver','pancreas','kidneys','small-intestine','large-intestine']) {
      expect(svg.querySelector(`[data-organ="${id}"] path`)).not.toBeNull();
    }
    expect(svg.querySelector('[data-organ="kidneys"]')!.querySelectorAll('path')).toHaveLength(2);
  });
  it('teaches every part on every level and can read a study card aloud', () => {
    for (const level of bodyGame.levels) for (const lang of ['nl','en'] as const) {
      const spoken: string[] = [];
      const root = bodyGame.study!(level, {lang, speak:text => spoken.push(text)});
      expect(root.querySelector('h2')).not.toBeNull();
      expect(root.querySelectorAll('.study-card')).toHaveLength(10);
      expect(root.querySelectorAll('svg')).toHaveLength(10);
      root.querySelector('button')!.click();
      expect(spoken).toHaveLength(1);
      expect(spoken[0].length).toBeGreaterThan(25);
    }
  });
});
