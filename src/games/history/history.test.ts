import { describe, expect, it } from 'vitest';
import { createRng } from '../../core/rng';
import { Round } from '../../core/round';
import { HISTORY_EVENTS, chronologicalEvents, formatHistoryYear } from './data';
import { makeHistoryQuestion } from './questions';
import { historyGame } from './index';
import { historyStudy } from './study';

describe('History Timeline', () => {
  it('has at least sixteen sourced, bilingual events in each independent level', () => {
    expect(Object.keys(HISTORY_EVENTS)).toEqual(['dutch', 'world']);
    for (const events of Object.values(HISTORY_EVENTS)) {
      expect(events.length).toBeGreaterThanOrEqual(16);
      expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
      for (const event of events) {
        expect(Number.isInteger(event.year)).toBe(true);
        expect(event.source).toMatch(/^https:\/\//);
        for (const lang of ['nl', 'en'] as const) {
          expect(event.title[lang].trim()).not.toBe('');
          expect(event.description[lang].trim()).not.toBe('');
        }
      }
    }
  });

  it('sorts earlier events first deterministically, using id only to break ties', () => {
    const sample = [{ id: 'c', year: 5 }, { id: 'b', year: 2 }, { id: 'a', year: 2 }];
    expect(chronologicalEvents(sample).map((event) => event.id)).toEqual(['a', 'b', 'c']);
    expect(chronologicalEvents(sample).map((event) => event.id)).toEqual(['a', 'b', 'c']);
  });

  it('formats astronomical BCE years without exposing year zero and marks estimates', () => {
    expect(formatHistoryYear(0, false, 'nl')).toBe('1 v.Chr.');
    expect(formatHistoryYear(-1, false, 'en')).toBe('2 BCE');
    expect(formatHistoryYear(-3099, true, 'nl')).toBe('ca. 3100 v.Chr.');
    expect(formatHistoryYear(-3099, true, 'en')).toBe('c. 3100 BCE');
  });

  it('generates four distinct events and reveals dates and chronology only after an answer', () => {
    for (const level of historyGame.levels) {
      const q = makeHistoryQuestion(level, createRng(19), []);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices.map((choice) => choice.id)).size).toBe(4);
      const pool = HISTORY_EVENTS[level.id as keyof typeof HISTORY_EVENTS];
      const selected = pool.filter((event) => q.choices.some((choice) => choice.id === event.id))
        .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
      expect(q.answerId).toBe(selected[0].id);
      for (const lang of ['nl', 'en'] as const) {
        const before = q.visual!({ lang, picked: null }).textContent ?? '';
        expect(before).not.toMatch(/\b\d{3,4}\b/);
        expect(before).not.toContain(selected[0].title[lang]);
        const after = q.visual!({ lang, picked: { id: 'wrong', answerId: q.answerId } });
        expect(after.textContent).toContain(formatHistoryYear(selected[0].year, selected[0].approximate, lang));
        expect(after.textContent!.indexOf(selected[0].title[lang])).toBeLessThan(after.textContent!.indexOf(selected[1].title[lang]));
        expect(after.querySelectorAll('.history-event')).toHaveLength(4);
      }
    }
  });

  it('creates ten non-repeating questions per round in both levels', () => {
    for (const level of historyGame.levels) {
      const round = new Round(historyGame, level, createRng(520));
      const keys = new Set<string>();
      do {
        expect(keys.has(round.current.key)).toBe(false);
        keys.add(round.current.key);
        expect(round.current.choices).toHaveLength(4);
        round.answer(round.current.answerId);
      } while (round.next());
      expect(keys.size).toBe(10);
    }
  });

  it('provides chronological study cards with localized years, titles, and explanations', () => {
    for (const level of historyGame.levels) {
      for (const lang of ['nl', 'en'] as const) {
        const study = historyStudy(level, { lang });
        const cards = [...study.querySelectorAll<HTMLElement>('.history-study-event')];
        const events = chronologicalEvents(HISTORY_EVENTS[level.id as keyof typeof HISTORY_EVENTS]);
        expect(cards).toHaveLength(events.length);
        expect(cards.map((card) => Number(card.dataset.year))).toEqual(events.map((event) => event.year));
        expect(study.textContent).toContain(events[0].title[lang]);
        expect(study.textContent).toContain(events.at(-1)!.description[lang]);
      }
    }
  });
});
