import { describe, it, expect } from 'vitest';
import { timeToWords, timeToWords24, partOfDay, formatDigital } from './words';

const hour3: [number, string, string][] = [
  [0, 'drie uur', "three o'clock"],
  [5, 'vijf over drie', 'five past three'],
  [10, 'tien over drie', 'ten past three'],
  [15, 'kwart over drie', 'quarter past three'],
  [20, 'tien voor half vier', 'twenty past three'],
  [25, 'vijf voor half vier', 'twenty-five past three'],
  [30, 'half vier', 'half past three'],
  [35, 'vijf over half vier', 'twenty-five to four'],
  [40, 'tien over half vier', 'twenty to four'],
  [45, 'kwart voor vier', 'quarter to four'],
  [50, 'tien voor vier', 'ten to four'],
  [55, 'vijf voor vier', 'five to four'],
];

describe('timeToWords', () => {
  it.each(hour3)('3:%i → %s / %s', (m, nl, en) => {
    expect(timeToWords(3, m, 'nl')).toBe(nl);
    expect(timeToWords(3, m, 'en')).toBe(en);
  });

  it('wraps around twelve', () => {
    expect(timeToWords(12, 25, 'nl')).toBe('vijf voor half één');
    expect(timeToWords(12, 30, 'nl')).toBe('half één');
    expect(timeToWords(12, 35, 'en')).toBe('twenty-five to one');
    expect(timeToWords(11, 45, 'nl')).toBe('kwart voor twaalf');
    expect(timeToWords(0, 0, 'nl')).toBe('twaalf uur');
    expect(timeToWords(1, 0, 'nl')).toBe('één uur');
  });

  it('treats afternoon hours like morning hours', () => {
    expect(timeToWords(13, 0, 'nl')).toBe('één uur');
    expect(timeToWords(14, 30, 'en')).toBe('half past two');
  });

  it('gives all 144 five-minute times a unique wording per language', () => {
    for (const lang of ['nl', 'en'] as const) {
      const words = new Set<string>();
      for (let h = 1; h <= 12; h++) for (let m = 0; m < 60; m += 5) words.add(timeToWords(h, m, lang));
      expect(words.size).toBe(144);
    }
  });

  it('rejects unsupported times', () => {
    expect(() => timeToWords(3, 7, 'nl')).toThrow(RangeError);
    expect(() => timeToWords(24, 0, 'nl')).toThrow(RangeError);
    expect(() => timeToWords(-1, 0, 'en')).toThrow(RangeError);
  });
});

describe('partOfDay / timeToWords24', () => {
  it('uses the agreed boundaries', () => {
    expect([0, 5, 6, 11, 12, 17, 18, 23].map((h) => partOfDay(h, 'nl'))).toEqual([
      "'s nachts", "'s nachts", "'s ochtends", "'s ochtends", "'s middags", "'s middags", "'s avonds", "'s avonds",
    ]);
    expect([0, 6, 12, 18].map((h) => partOfDay(h, 'en'))).toEqual([
      'at night', 'in the morning', 'in the afternoon', 'in the evening',
    ]);
  });

  it('adds the part of day to the wording', () => {
    expect(timeToWords24(14, 30, 'nl')).toBe("half drie 's middags");
    expect(timeToWords24(0, 15, 'nl')).toBe("kwart over twaalf 's nachts");
    expect(timeToWords24(6, 0, 'nl')).toBe("zes uur 's ochtends");
    expect(timeToWords24(18, 45, 'nl')).toBe("kwart voor zeven 's avonds");
    expect(timeToWords24(14, 30, 'en')).toBe('half past two in the afternoon');
  });
});

describe('formatDigital', () => {
  it('pads hours and minutes', () => {
    expect(formatDigital(9, 5)).toBe('09:05');
    expect(formatDigital(14, 30)).toBe('14:30');
    expect(formatDigital(0, 0)).toBe('00:00');
  });
});
