import type { Game, Level } from '../../core/types';
import { makeHistoryQuestion } from './questions';
import { historyStudy } from './study';

const levels: Level[] = [
  { id: 'dutch', label: { nl: 'Nederlandse geschiedenis', en: 'Dutch history' }, example: { nl: 'Welke gebeurtenis gebeurde het eerst?', en: 'Which event happened first?' }, autoSpeak: true },
  { id: 'world', label: { nl: 'Wereldgeschiedenis', en: 'World history' }, example: { nl: 'Van oude beschavingen tot ruimtevaart', en: 'From ancient civilisations to spaceflight' }, autoSpeak: true },
];

export const historyGame: Game = {
  id: 'history',
  title: { nl: 'Geschiedenistijdlijn', en: 'History Timeline' },
  icon: 'icons/history.svg',
  pickerLayout: 'list',
  levels,
  study: historyStudy,
  makeQuestion: makeHistoryQuestion,
};
