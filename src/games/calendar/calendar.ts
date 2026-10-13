export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

/** Number of days in a Gregorian month; month is 1–12. */
export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError('month must be 1–12');
  return utcDate(year, month + 1, 0).getUTCDate();
}

/** Monday-based weekday index (Monday 0 … Sunday 6) for a valid Gregorian date. */
export function weekdayForDate(year: number, month: number, day: number): number {
  if (day < 1 || day > daysInMonth(year, month)) throw new RangeError('day is outside the selected month');
  return (utcDate(year, month, day).getUTCDay() + 6) % 7;
}

/** Adds whole calendar days without relying on the host timezone. */
export function addDays(year: number, month: number, day: number, delta: number): CalendarDate {
  if (!Number.isInteger(delta)) throw new RangeError('delta must be a whole number of days');
  if (day < 1 || day > daysInMonth(year, month)) throw new RangeError('day is outside the selected month');
  const date = utcDate(year, month, day);
  date.setUTCDate(date.getUTCDate() + delta);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}
