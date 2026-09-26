import { describe, it, expect, beforeAll } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question, VisualState } from '../../core/types';
import { getRegion, loadRegion } from './regions';
import { MAP_CONFIG, MAP_LEVELS, levelPool } from './levels';
import { makeMapQuestion, makeSmallQuestion, makeTapQuestion, nearestSmall } from './questions';

beforeAll(async () => {
  await Promise.all((['europe', 'americas', 'africa', 'asia-oceania'] as const).map(loadRegion));
});

const render = (q: Question, state: VisualState) => q.visual!(state) as Element;

describe('makeTapQuestion', () => {
  it('asks a tappable country of the level and lists every tappable country as a choice', () => {
    const config = MAP_CONFIG['2'];
    const pool = levelPool(config, getRegion('europe')).map((c) => c.code);
    for (let seed = 0; seed < 20; seed++) {
      const q = makeTapQuestion(config, createRng(seed), []);
      expect(q.answerOn).toBe('visual');
      expect(pool).toContain(q.answerId);
      expect(q.key).toBe(q.answerId);
      expect(q.choices.map((c) => c.id).sort()).toEqual([...pool].sort());
    }
  });

  it('words the prompt with the country name', () => {
    const q = makeTapQuestion(MAP_CONFIG['1'], createRng(3), []);
    expect(q.prompt.nl).toMatch(/^Waar (ligt|liggen) .+\?$/);
    expect(q.visualLabel!.revealed.nl).toBe(q.choices.find((c) => c.id === q.answerId)!.label.nl);
  });

  it('does not repeat a country within a round', () => {
    const previous: Question[] = [];
    for (let i = 0; i < 10; i++) previous.push(makeTapQuestion(MAP_CONFIG['1'], createRng(7), previous));
    expect(new Set(previous.map((q) => q.key)).size).toBe(10);
  });

  it('draws only the level countries as targets, labelled generically', () => {
    const q = makeTapQuestion(MAP_CONFIG['1'], createRng(1), []);
    const svg = render(q, { lang: 'nl', picked: null });
    const targets = [...svg.querySelectorAll('[data-choice-id]')];
    expect(targets).toHaveLength(15);
    expect(svg.querySelectorAll('.country.other').length).toBe(44 - 15);
    for (const t of targets) {
      expect(t.getAttribute('tabindex')).toBe('0');
      expect(t.getAttribute('role')).toBe('button');
      expect(t.getAttribute('aria-label')).toBe('land');
      expect(Number(t.getAttribute('data-cx'))).toBeGreaterThan(0);
    }
    expect(render(q, { lang: 'en', picked: null }).querySelector('[data-choice-id]')!.getAttribute('aria-label')).toBe('country');
  });

  it('marks the answer and a wrong pick once answered', () => {
    const q = makeTapQuestion(MAP_CONFIG['1'], createRng(1), []);
    const wrongId = q.choices.find((c) => c.id !== q.answerId)!.id;
    const svg = render(q, { lang: 'nl', picked: { id: wrongId, answerId: q.answerId } });
    expect(svg.querySelector(`[data-choice-id="${q.answerId}"]`)!.classList.contains('correct')).toBe(true);
    expect(svg.querySelector(`[data-choice-id="${wrongId}"]`)!.classList.contains('wrong')).toBe(true);
    expect([...svg.querySelectorAll('.map-mark')].map((m) => m.textContent).sort()).toEqual(['✓', '✗']);
    for (const t of svg.querySelectorAll('[data-choice-id]')) {
      expect(t.getAttribute('aria-disabled')).toBe('true');
      expect(t.getAttribute('tabindex')).toBeNull();
    }
  });
});

describe('nearestSmall', () => {
  it('returns the closest other small countries, nearest first', () => {
    const pool = levelPool(MAP_CONFIG['3'], getRegion('europe'));
    const monaco = pool.find((c) => c.code === 'MC')!;
    const near = nearestSmall(monaco, pool);
    const dist = (c: { cx: number; cy: number }) => Math.hypot(c.cx - monaco.cx, c.cy - monaco.cy);
    expect(near).toHaveLength(3);
    expect(near.map((c) => c.code)).not.toContain('MC');
    for (let i = 1; i < near.length; i++) expect(dist(near[i])).toBeGreaterThanOrEqual(dist(near[i - 1]));
    const others = pool.filter((c) => c.code !== 'MC' && !near.includes(c));
    for (const o of others) expect(dist(o)).toBeGreaterThanOrEqual(dist(near[2]));
  });
});

describe('makeSmallQuestion', () => {
  it('shows the answer and three other small countries as boxes', () => {
    for (const id of ['3', '5', '7', '9']) {
      const config = MAP_CONFIG[id];
      const q = makeSmallQuestion(config, createRng(2), []);
      expect(q.answerOn).toBe('visual');
      expect(q.choices).toHaveLength(4);
      expect(q.choices.map((c) => c.id)).toContain(q.answerId);
      for (const c of q.choices) expect(getRegion(config.region).countries.find((m) => m.code === c.id)!.small).toBe(true);
      const view = render(q, { lang: 'nl', picked: null });
      expect(view.querySelectorAll('.box[data-choice-id]')).toHaveLength(4);
    }
  });

  it('never repeats a country within a 5-question round', () => {
    for (const id of ['3', '5', '7', '9']) {
      for (let seed = 0; seed < 10; seed++) {
        const previous: Question[] = [];
        for (let i = 0; i < 5; i++) previous.push(makeSmallQuestion(MAP_CONFIG[id], createRng(seed), previous));
        expect(new Set(previous.map((q) => q.key)).size, `level ${id} seed ${seed}`).toBe(5);
      }
    }
  });
});

describe('makeMapQuestion', () => {
  it('uses the question type of the level', () => {
    for (const level of MAP_LEVELS) {
      const q = makeMapQuestion(level, createRng(1), []);
      expect(q.choices.length > 4, level.id).toBe(MAP_CONFIG[level.id].kind === 'tap');
    }
  });
});
