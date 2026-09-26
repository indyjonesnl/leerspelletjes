import { describe, it, expect, beforeAll } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question, VisualState } from '../../core/types';
import { getRegion, loadRegion } from './regions';
import { MAP_CONFIG, levelPool } from './levels';
import { makeTapQuestion } from './questions';

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
