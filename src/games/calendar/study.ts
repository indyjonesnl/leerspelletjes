import type { Level, StudyContext } from '../../core/types';
import { el } from '../../core/ui';
import { MONTHS, WEEKDAYS } from './data';

export function calendarStudy(level: Level, { lang, speak }: StudyContext): HTMLElement {
  const examples: Record<string, { title: string; text: string }[]> = {
    weekdays: lang === 'nl'
      ? [{ title: 'Weekdagen', text: 'Na zondag komt maandag. Vóór maandag is zondag.' }, { title: 'Tip', text: 'De week begint hier op maandag.' }]
      : [{ title: 'Weekdays', text: 'Monday comes after Sunday. Sunday comes before Monday.' }, { title: 'Tip', text: 'The week starts on Monday here.' }],
    months: lang === 'nl'
      ? [{ title: 'Maanden', text: 'Januari is de eerste maand. December is de laatste.' }, { title: 'Tip', text: 'Zet de maanden in de volgorde van de kalender.' }]
      : [{ title: 'Months', text: 'January is the first month. December is the last.' }, { title: 'Tip', text: 'Put the months in calendar order.' }],
    dates: lang === 'nl'
      ? [{ title: 'Een kalender lezen', text: 'Zoek eerst de naam van de maand en tel dan de dagen.' }, { title: 'Tip', text: 'Een schrikkeljaar heeft 29 dagen in februari.' }]
      : [{ title: 'Reading a calendar', text: 'Find the month name first, then count the days.' }, { title: 'Tip', text: 'A leap year has 29 days in February.' }],
    elapsed: lang === 'nl'
      ? [{ title: 'Dagen tellen', text: 'Tel vanaf de volgende dag. Na 30 april komt 1 mei.' }, { title: 'Tip', text: 'Let op wanneer je bij een nieuwe maand komt.' }]
      : [{ title: 'Counting days', text: 'Start with the next day. May 1 comes after April 30.' }, { title: 'Tip', text: 'Watch for the point where a new month begins.' }],
  };
  const rows = examples[level.id] ?? [];
  const list = level.id === 'weekdays'
    ? el('ol', { class: 'calendar-study-days' }, ...WEEKDAYS.map((day) => el('li', {}, day.name[lang])))
    : level.id === 'months'
      ? el('ol', { class: 'calendar-study-months' }, ...MONTHS.map((month) => el('li', {}, month.name[lang])))
      : undefined;
  const content = el('section', { class: 'study calendar-study' },
    el('h2', {}, level.label[lang]),
    el('p', { class: 'subtitle' }, level.example[lang]),
    ...(list ? [list] : []),
    ...rows.map((row) => el('article', { class: 'calendar-study-example' }, el('strong', {}, row.title), el('p', {}, row.text))),
  );
  if (speak) {
    const button = el('button', { type: 'button', class: 'icon-button', 'aria-label': lang === 'nl' ? 'Lees de uitleg voor' : 'Read the lesson aloud' }, '🔈');
    button.addEventListener('click', () => speak(`${level.label[lang]}. ${rows.map((row) => `${row.title}. ${row.text}`).join('. ')}`));
    content.append(button);
  }
  return content;
}
