import type { Game, Level } from '../../core/types';
import { makeCalendarQuestion } from './questions';
import { calendarStudy } from './study';

const levels: Level[] = [
  { id: 'weekdays', label: { nl: 'Weekdagen', en: 'Weekdays' }, example: { nl: 'Welke dag is vóór of na een andere dag?', en: 'Which day comes before or after another day?' }, autoSpeak: true },
  { id: 'months', label: { nl: 'Maanden op volgorde', en: 'Arrange the months' }, example: { nl: 'Zet vier maanden in de juiste volgorde', en: 'Put four months in the right order' }, autoSpeak: true },
  { id: 'dates', label: { nl: 'Lees de kalender', en: 'Read the calendar' }, example: { nl: 'Zoek een omcirkelde datum', en: 'Find a marked date' }, autoSpeak: true },
  { id: 'elapsed', label: { nl: 'Dagen tellen', en: 'Count the days' }, example: { nl: 'Reken uit welke datum eerder of later is', en: 'Work out which date is earlier or later' }, autoSpeak: true },
];

export const calendarGame: Game = {
  id: 'calendar',
  title: { nl: 'Kalender Quest', en: 'Calendar Quest' },
  icon: 'icons/calendar.svg',
  pickerLayout: 'list',
  levels,
  study: calendarStudy,
  makeQuestion: makeCalendarQuestion,
};
