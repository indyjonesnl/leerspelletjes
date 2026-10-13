import type { Localized } from '../../core/types';

export const WEEKDAYS: readonly { id: string; name: Localized }[] = [
  { id: 'mon', name: { nl: 'maandag', en: 'Monday' } },
  { id: 'tue', name: { nl: 'dinsdag', en: 'Tuesday' } },
  { id: 'wed', name: { nl: 'woensdag', en: 'Wednesday' } },
  { id: 'thu', name: { nl: 'donderdag', en: 'Thursday' } },
  { id: 'fri', name: { nl: 'vrijdag', en: 'Friday' } },
  { id: 'sat', name: { nl: 'zaterdag', en: 'Saturday' } },
  { id: 'sun', name: { nl: 'zondag', en: 'Sunday' } },
];

export const MONTHS: readonly { id: string; name: Localized }[] = [
  { id: 'jan', name: { nl: 'januari', en: 'January' } },
  { id: 'feb', name: { nl: 'februari', en: 'February' } },
  { id: 'mar', name: { nl: 'maart', en: 'March' } },
  { id: 'apr', name: { nl: 'april', en: 'April' } },
  { id: 'may', name: { nl: 'mei', en: 'May' } },
  { id: 'jun', name: { nl: 'juni', en: 'June' } },
  { id: 'jul', name: { nl: 'juli', en: 'July' } },
  { id: 'aug', name: { nl: 'augustus', en: 'August' } },
  { id: 'sep', name: { nl: 'september', en: 'September' } },
  { id: 'oct', name: { nl: 'oktober', en: 'October' } },
  { id: 'nov', name: { nl: 'november', en: 'November' } },
  { id: 'dec', name: { nl: 'december', en: 'December' } },
];

export const WEEKDAY_HEADINGS: readonly { id: string; name: Localized }[] = [
  { id: 'mon', name: { nl: 'ma', en: 'Monday' } },
  { id: 'tue', name: { nl: 'di', en: 'Tuesday' } },
  { id: 'wed', name: { nl: 'wo', en: 'Wednesday' } },
  { id: 'thu', name: { nl: 'do', en: 'Thursday' } },
  { id: 'fri', name: { nl: 'vr', en: 'Friday' } },
  { id: 'sat', name: { nl: 'za', en: 'Saturday' } },
  { id: 'sun', name: { nl: 'zo', en: 'Sunday' } },
];

export function formatCalendarDate(year: number, month: number, day: number, lang: 'nl' | 'en'): string {
  const monthName = MONTHS[month - 1].name[lang];
  return lang === 'nl' ? `${day} ${monthName} ${year}` : `${monthName} ${day}, ${year}`;
}
