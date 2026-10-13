import type { Level } from '../../core/types';

export const MONEY_LEVELS: Level[] = [
  { id: 'euros', label: { nl: 'Euro’s tellen', en: 'Count euros' }, example: { nl: '€ 1 + € 2 = ?', en: '€1 + €2 = ?' }, autoSpeak: true },
  { id: 'cents', label: { nl: 'Euro’s en centen', en: 'Euros and cents' }, example: { nl: '€ 0,50 + € 0,20 = ?', en: '€0.50 + €0.20 = ?' }, autoSpeak: false },
  { id: 'prices', label: { nl: 'Samen betalen', en: 'Add prices' }, example: { nl: '€ 1,25 + € 2,50 = ?', en: '€1.25 + €2.50 = ?' }, autoSpeak: false },
  { id: 'change', label: { nl: 'Wisselgeld', en: 'Make change' }, example: { nl: '€ 5 betalen voor € 3,75', en: 'Pay €5 for a €3.75 item' }, autoSpeak: false },
];
