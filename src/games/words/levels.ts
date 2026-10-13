import type { Level } from '../../core/types';

export const WORD_LEVELS: Level[] = [
  { id: 'short', label: { nl: 'Korte woorden', en: 'Short words' }, example: { nl: '2–3 letters · kat, zon', en: '2–3 letters · cat, sun' }, autoSpeak: false },
  { id: 'medium', label: { nl: 'Meer letters', en: 'More letters' }, example: { nl: '4–5 letters · boek, fiets', en: '4–5 letters · book, bike' }, autoSpeak: false },
  { id: 'long', label: { nl: 'Lange woorden', en: 'Long words' }, example: { nl: '6+ letters · banaan, olifant', en: '6+ letters · banana, elephant' }, autoSpeak: false },
];
