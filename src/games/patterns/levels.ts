import type { Level } from '../../core/types';

export const PATTERN_LEVELS: Level[] = [
  { id: 'shapes', label: { nl: 'Vormen herhalen', en: 'Repeating shapes' }, example: { nl: '● ▲ ● ▲ ?', en: '● ▲ ● ▲ ?' }, autoSpeak: true },
  { id: 'counting', label: { nl: 'Verder tellen', en: 'Counting sequences' }, example: { nl: '2, 4, 6, 8, ?', en: '2, 4, 6, 8, ?' }, autoSpeak: true },
  { id: 'missing', label: { nl: 'Het ontbrekende getal', en: 'Missing numbers' }, example: { nl: '5, 10, ?, 20, 25', en: '5, 10, ?, 20, 25' }, autoSpeak: false },
  { id: 'growing', label: { nl: 'Steeds grotere stappen', en: 'Growing steps' }, example: { nl: '1, 2, 4, 7, ?', en: '1, 2, 4, 7, ?' }, autoSpeak: false },
];
