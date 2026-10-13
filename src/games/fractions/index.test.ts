import { describe, expect, it } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question } from '../../core/types';
import { fractionsGame } from './index';
import { fractionVisual } from './visual';

function value(label: string): [number, number] {
  if (label.includes('/')) return label.split('/').map(Number) as [number, number];
  if (label.endsWith('%')) return [Number(label.slice(0, -1)), 100];
  const parts = label.replace(',', '.').split('.');
  const denominator = 10 ** (parts[1]?.length ?? 0);
  return [Number(parts.join('')), denominator];
}

describe('Fraction Match', () => {
  it('offers complete nonrepeating rounds and exactly one mathematically correct choice in both languages', () => {
    expect(fractionsGame.levels.map((l) => l.id)).toEqual(['shapes', 'equivalent', 'decimals', 'percentages']);
    for (const level of fractionsGame.levels) {
      for (let seed = 0; seed < 30; seed++) {
        const rng = createRng(seed);
        const previous: Question[] = [];
        for (let i = 0; i < 10; i++) {
          const question = fractionsGame.makeQuestion(level, rng, previous);
          expect(previous.map((q) => q.key)).not.toContain(question.key);
          const visual = question.visual!({ lang: 'en', picked: null });
          const numerator = Number(visual.getAttribute('data-numerator'));
          const denominator = Number(visual.getAttribute('data-denominator'));
          expect(Number.isInteger(numerator)).toBe(true);
          expect(Number.isInteger(denominator)).toBe(true);
          expect(numerator).toBeGreaterThanOrEqual(0);
          expect(numerator).toBeLessThanOrEqual(denominator);
          expect(denominator).toBeGreaterThan(0);
          expect(visual.querySelectorAll('.fraction-piece')).toHaveLength(denominator);
          expect(visual.querySelectorAll('.fraction-shaded')).toHaveLength(numerator);
          expect(question.choices).toHaveLength(4);
          expect(new Set(question.choices.map((c) => c.id)).size).toBe(4);
          for (const lang of ['nl', 'en'] as const) {
            expect(question.prompt[lang]).toBeTruthy();
            expect(question.speech?.[lang]).toBeTruthy();
            expect(new Set(question.choices.map((c) => c.label[lang])).size).toBe(4);
            const correct = question.choices.filter((choice) => {
              const [n, d] = value(choice.label[lang]);
              expect(n).toBeGreaterThanOrEqual(0);
              expect(n).toBeLessThanOrEqual(d);
              return n * denominator === numerator * d;
            });
            expect(correct.map((c) => c.id)).toEqual([question.answerId]);
            const values = question.choices.map((c) => value(c.label[lang]));
            for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
              expect(values[a][0] * values[b][1]).not.toBe(values[b][0] * values[a][1]);
            }
          }
          if (level.id === 'equivalent') {
            const [n, d] = value(question.choices.find((c) => c.id === question.answerId)!.label.en);
            expect(d).toBeGreaterThan(denominator);
            expect(n).toBeGreaterThan(numerator);
          }
          if (level.id === 'decimals') {
            for (const choice of question.choices) {
              expect(choice.label.en).toMatch(/^0(?:\.\d{1,3})?$|^1$/);
              expect(choice.label.nl).toBe(choice.label.en.replace('.', ','));
            }
          }
          if (level.id === 'percentages') {
            for (const choice of question.choices) expect(choice.label.en).toMatch(/^\d+%$/);
          }
          previous.push(question);
        }
      }
    }
  });

  it('uses stable choices and describes the quantities needed to solve the shape with a screen reader', () => {
    for (const level of fractionsGame.levels) {
      const question = fractionsGame.makeQuestion(level, createRng(17), []);
      const ids = question.choices.map((c) => c.id);
      question.visual!({ lang: 'nl', picked: null });
      question.visual!({ lang: 'en', picked: null });
      expect(question.choices.map((c) => c.id)).toEqual(ids);
      expect(question.visualLabel?.hidden.nl).toBeTruthy();
      expect(question.visualLabel?.hidden.en).toBeTruthy();
      if (level.id === 'shapes') {
        const visual = question.visual!({ lang: 'en', picked: null });
        const n = visual.getAttribute('data-numerator');
        const d = visual.getAttribute('data-denominator');
        expect(question.visualLabel!.hidden.en).toContain(`${d} equal parts`);
        expect(question.visualLabel!.hidden.en).toContain(`${n} are shaded`);
        expect(question.speech!.en).toContain(`${n} are shaded`);
        expect(question.visualLabel!.hidden.en).not.toContain(`${n}/${d}`);
      }
    }
  });

  it('converts known eighths, fifths, and quarters without rounding', () => {
    const fixtures: Record<string, Record<string, [string, string]>> = {
      decimals: { '1/8': ['0,125', '0.125'], '3/4': ['0,75', '0.75'], '1/5': ['0,2', '0.2'] },
      percentages: { '3/4': ['75%', '75%'], '1/5': ['20%', '20%'], '1/20': ['5%', '5%'] },
    };
    for (const [levelId, known] of Object.entries(fixtures)) {
      const level = fractionsGame.levels.find((l) => l.id === levelId)!;
      const previous: Question[] = [];
      const seen = new Set<string>();
      const rng = createRng(7);
      for (let i = 0; i < 50; i++) {
        const question = fractionsGame.makeQuestion(level, rng, previous);
        const fraction = question.key.slice(levelId.length + 1);
        const expected = known[fraction];
        if (expected) {
          const answer = question.choices.find((c) => c.id === question.answerId)!;
          expect([answer.label.nl, answer.label.en]).toEqual(expected);
          seen.add(fraction);
        }
        previous.push(question);
      }
      expect([...seen].sort()).toEqual(Object.keys(known).sort());
    }
  });
});

describe('equal-area fraction shapes', () => {
  it('draws exactly three of eight equally wide bar segments shaded', () => {
    const visual = fractionVisual(3, 8, 'bar');
    const pieces = [...visual.querySelectorAll('rect.fraction-piece')];
    expect(pieces).toHaveLength(8);
    expect(pieces.filter((p) => p.classList.contains('fraction-shaded'))).toHaveLength(3);
    const widths = pieces.map((p) => Number(p.getAttribute('width')));
    expect(new Set(widths).size).toBe(1);
    expect(widths[0]).toBeGreaterThan(0);
    const xs = pieces.map((p) => Number(p.getAttribute('x')));
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeCloseTo(widths[0]);
    expect(new Set(pieces.map((p) => p.getAttribute('height'))).size).toBe(1);
  });

  it('draws exactly five of six identical circle sectors rotated by sixty degrees', () => {
    const visual = fractionVisual(5, 6, 'circle');
    const pieces = [...visual.querySelectorAll('path.fraction-piece')];
    expect(pieces).toHaveLength(6);
    expect(pieces.filter((p) => p.classList.contains('fraction-shaded'))).toHaveLength(5);
    expect(new Set(pieces.map((p) => p.getAttribute('d'))).size).toBe(1);
    expect(pieces.map((p) => p.getAttribute('transform'))).toEqual([
      'rotate(0 100 100)', 'rotate(60 100 100)', 'rotate(120 100 100)',
      'rotate(180 100 100)', 'rotate(240 100 100)', 'rotate(300 100 100)',
    ]);
    const numbers = pieces[0].getAttribute('d')!.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    // The shared sector starts at the top, has radius 84, and ends sixty degrees clockwise.
    expect(numbers.slice(0, 7)).toEqual([100, 100, 100, 16, 84, 84, 0]);
    expect(numbers.slice(-2)[0]).toBeCloseTo(172.746, 2);
    expect(numbers.slice(-1)[0]).toBeCloseTo(58, 2);
  });

  it('renders empty and whole shapes with truthful shading counts', () => {
    for (const kind of ['circle', 'bar'] as const) {
      expect(fractionVisual(0, 4, kind).querySelectorAll('.fraction-shaded')).toHaveLength(0);
      expect(fractionVisual(4, 4, kind).querySelectorAll('.fraction-shaded')).toHaveLength(4);
    }
  });
});
