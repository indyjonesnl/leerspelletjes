import type { Level } from '../../core/types';

export const FRACTION_LEVELS: Level[] = [
  { id: 'shapes', label: { nl: 'Gekleurde delen', en: 'Shaded shapes' }, example: { nl: 'Welk deel is gekleurd?', en: 'What fraction is shaded?' }, autoSpeak: true },
  { id: 'equivalent', label: { nl: 'Gelijkwaardige breuken', en: 'Equivalent fractions' }, example: { nl: '1/2 = 2/4', en: '1/2 = 2/4' }, autoSpeak: false },
  { id: 'decimals', label: { nl: 'Kommagetallen', en: 'Decimals' }, example: { nl: '1/4 = 0,25', en: '1/4 = 0.25' }, autoSpeak: false },
  { id: 'percentages', label: { nl: 'Procenten', en: 'Percentages' }, example: { nl: '3/4 = 75%', en: '3/4 = 75%' }, autoSpeak: false },
];
