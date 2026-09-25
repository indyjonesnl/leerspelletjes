import { describe, it, expect } from 'vitest';
import { createRng } from '../../core/rng';
import { CLOCK_CONFIG, CLOCK_LEVELS } from './levels';
import { clockDistractors, makeClockQuestion, shiftMinutes, timeKey, timePool } from './questions';

describe('timePool', () => {
  it('has the right size per level', () => {
    expect(CLOCK_LEVELS.map((l) => timePool(CLOCK_CONFIG[l.id]).length)).toEqual([12, 24, 48, 144, 96]);
  });
});

describe('shiftMinutes', () => {
  it('wraps in 12-hour and 24-hour mode', () => {
    expect(shiftMinutes({ h: 12, m: 30 }, -60, '12h')).toEqual({ h: 11, m: 30 });
    expect(shiftMinutes({ h: 12, m: 30 }, 60, '12h')).toEqual({ h: 1, m: 30 });
    expect(shiftMinutes({ h: 11, m: 45 }, 15, '12h')).toEqual({ h: 12, m: 0 });
    expect(shiftMinutes({ h: 23, m: 30 }, 60, '24h')).toEqual({ h: 0, m: 30 });
    expect(shiftMinutes({ h: 2, m: 0 }, 720, '24h')).toEqual({ h: 14, m: 0 });
  });
});

describe('clockDistractors', () => {
  it('half hours: picks the near misses for 2:30', () => {
    const cfg = CLOCK_CONFIG['2'];
    for (let seed = 0; seed < 20; seed++) {
      const keys = clockDistractors({ h: 2, m: 30 }, cfg, createRng(seed)).map(timeKey);
      expect(keys).toHaveLength(3);
      for (const k of keys) expect(['1:30', '3:30', '2:0', '3:0']).toContain(k);
    }
  });

  it('is always 3 distinct valid times without the answer', () => {
    for (const level of CLOCK_LEVELS) {
      const cfg = CLOCK_CONFIG[level.id];
      const valid = new Set(timePool(cfg).map(timeKey));
      for (const answer of timePool(cfg)) {
        const keys = clockDistractors(answer, cfg, createRng(1)).map(timeKey);
        expect(new Set(keys).size).toBe(3);
        expect(keys).not.toContain(timeKey(answer));
        for (const k of keys) expect(valid.has(k)).toBe(true);
      }
    }
  });
});

describe('makeClockQuestion', () => {
  it('builds valid questions for every level', () => {
    for (const level of CLOCK_LEVELS) {
      for (let seed = 0; seed < 30; seed++) {
        const q = makeClockQuestion(level, createRng(seed), []);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map((c) => c.id)).size).toBe(4);
        expect(new Set(q.choices.map((c) => c.label.nl)).size).toBe(4);
        expect(q.choices.filter((c) => c.id === q.answerId)).toHaveLength(1);
        expect(q.key).toBe(q.answerId);
        expect(q.visual).toBeDefined();
      }
    }
  });

  it('level 1 only asks whole hours, level 5 uses 24-hour wording', () => {
    const q1 = makeClockQuestion(CLOCK_LEVELS[0], createRng(1), []);
    expect(q1.answerId.endsWith(':0')).toBe(true);
    const q5 = makeClockQuestion(CLOCK_LEVELS[4], createRng(1), []);
    expect(q5.choices[0].label.nl).toMatch(/'s (nachts|ochtends|middags|avonds)$/);
    expect(q5.visualLabel).toBeUndefined();
    expect(q5.visual!().textContent).toMatch(/^\d\d:\d\d$/);
  });

  it('hides the time from screen readers until answered (levels 1-4)', () => {
    const q = makeClockQuestion(CLOCK_LEVELS[2], createRng(1), []);
    expect(q.visualLabel!.hidden).toEqual({ nl: 'klok', en: 'clock' });
    const answer = q.choices.find((c) => c.id === q.answerId)!;
    expect(q.visualLabel!.revealed).toEqual(answer.label);
  });

  it('skips times already asked in this round', () => {
    const level = CLOCK_LEVELS[0];
    const base = makeClockQuestion(level, createRng(0), []);
    const previous = Array.from({ length: 11 }, (_, i) => ({ ...base, key: `${i + 1}:0` }));
    for (let seed = 0; seed < 10; seed++) {
      expect(makeClockQuestion(level, createRng(seed), previous).key).toBe('12:0');
    }
  });
});
