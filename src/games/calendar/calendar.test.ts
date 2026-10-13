import { describe, expect, it } from 'vitest';
import { addDays, daysInMonth, weekdayForDate } from './calendar';

describe('UTC calendar helpers', () => {
  it('returns Monday-based weekday indexes for known dates', () => {
    expect(weekdayForDate(2024, 1, 1)).toBe(0); // Monday
    expect(weekdayForDate(2024, 1, 7)).toBe(6); // Sunday
    expect(weekdayForDate(2025, 1, 1)).toBe(2); // Wednesday
  });

  it('uses the correct month lengths and Gregorian leap-year rule', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(daysInMonth(2024, 4)).toBe(30);
  });

  it('adds days across year and February boundaries', () => {
    expect(addDays(2024, 12, 31, 1)).toEqual({ year: 2025, month: 1, day: 1 });
    expect(addDays(2024, 2, 28, 1)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(addDays(2025, 2, 28, 1)).toEqual({ year: 2025, month: 3, day: 1 });
    expect(addDays(2025, 3, 1, -1)).toEqual({ year: 2025, month: 2, day: 28 });
  });
});
