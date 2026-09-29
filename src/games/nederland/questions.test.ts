import { describe, it, expect, beforeAll } from 'vitest';
import { createRng } from '../../core/rng';
import type { Question, VisualState } from '../../core/types';
import { PROVINCES } from './provinces';
import { NL_LEVELS } from './levels';
import { getNl, loadNl } from './load';
import { makeNlQuestion, nearestProvinces } from './questions';

beforeAll(async () => {
  await loadNl();
});

const idle: VisualState = { lang: 'nl', picked: null };
const render = (q: Question, state: VisualState = idle) => q.visual!(state) as HTMLElement;
const byCode = new Map(PROVINCES.map((p) => [p.code, p]));
const round = (levelIndex: number, seed: number) => {
  const previous: Question[] = [];
  for (let i = 0; i < 12; i++) previous.push(makeNlQuestion(NL_LEVELS[levelIndex], createRng(seed + i), previous));
  return previous;
};

describe('NL_LEVELS', () => {
  it('has three levels of 12 questions', () => {
    expect(NL_LEVELS.map((l) => [l.id, l.roundLength])).toEqual([['1', 12], ['2', 12], ['3', 12]]);
    expect(NL_LEVELS.filter((l) => l.autoSpeak).map((l) => l.id)).toEqual(['1']);
  });
});

describe('level 1: provinces', () => {
  it('asks every province once per round', () => {
    const qs = round(0, 1);
    expect(qs.map((q) => q.answerId).sort()).toEqual(PROVINCES.map((p) => p.code).sort());
  });

  it('makes all 12 provinces targets, labelled "provincie"', () => {
    const q = makeNlQuestion(NL_LEVELS[0], createRng(2), []);
    expect(q.answerOn).toBe('visual');
    expect(q.prompt.nl).toBe(`Waar ligt ${byCode.get(q.answerId)!.name.nl}?`);
    const view = render(q);
    const targets = [...view.querySelectorAll('[data-choice-id]')];
    expect(targets).toHaveLength(12);
    for (const t of targets) expect(t.getAttribute('aria-label')).toBe('provincie');
    expect(render(q, { lang: 'en', picked: null }).querySelector('[data-choice-id]')!.getAttribute('aria-label')).toBe('province');
  });

  it('shows the map credit', () => {
    const q = makeNlQuestion(NL_LEVELS[0], createRng(2), []);
    expect(render(q).querySelector('.map-credit')!.textContent).toBe('Kaart: CBS, Kadaster (CC BY 4.0)');
    expect(render(q, { lang: 'en', picked: null }).querySelector('.map-credit')!.textContent).toBe('Map: CBS, Kadaster (CC BY 4.0)');
  });
});

describe('level 2: capital names', () => {
  it('highlights the province and offers four different capitals', () => {
    for (let seed = 0; seed < 24; seed++) {
      const q = makeNlQuestion(NL_LEVELS[1], createRng(seed), []);
      const province = byCode.get(q.answerId)!;
      expect(q.answerOn ?? 'choices').toBe('choices');
      expect(q.prompt).toEqual({ nl: `Wat is de hoofdstad van ${province.name.nl}?`, en: `What is the capital of ${province.name.en}?` });
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices.map((c) => c.label.nl)).size).toBe(4);
      expect(q.choices.find((c) => c.id === q.answerId)!.label).toEqual(province.capital);
      const view = render(q);
      expect(view.querySelectorAll('[data-choice-id]')).toHaveLength(0);
      expect(view.querySelector('.country.highlight')).not.toBeNull();
    }
  });

  it('uses the capitals of the nearest provinces as wrong answers', () => {
    const q = makeNlQuestion(NL_LEVELS[1], createRng(5), []);
    const expected = [q.answerId, ...nearestProvinces(q.answerId, getNl().map)].sort();
    expect(q.choices.map((c) => c.id).sort()).toEqual(expected);
  });
});

describe('level 3: capitals on the map', () => {
  it('makes the 12 dots the targets, labelled "stad"', () => {
    const q = makeNlQuestion(NL_LEVELS[2], createRng(3), []);
    expect(q.answerOn).toBe('visual');
    const view = render(q);
    const targets = [...view.querySelectorAll('[data-choice-id]')];
    expect(targets).toHaveLength(12);
    for (const t of targets) {
      expect(t.classList.contains('point')).toBe(true);
      expect(t.getAttribute('aria-label')).toBe('stad');
    }
    expect(view.querySelectorAll('.country.target')).toHaveLength(0);
  });

  it('says "de stad" for capitals named like their province', () => {
    const qs = round(2, 11);
    const prompt = (code: string) => qs.find((q) => q.answerId === code)!.prompt;
    expect(prompt('GR')).toEqual({ nl: 'Waar ligt de stad Groningen?', en: 'Where is the city of Groningen?' });
    expect(prompt('UT')).toEqual({ nl: 'Waar ligt de stad Utrecht?', en: 'Where is the city of Utrecht?' });
    expect(prompt('ZH')).toEqual({ nl: 'Waar ligt Den Haag?', en: 'Where is The Hague?' });
  });
});
