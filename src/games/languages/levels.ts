import type { Level } from '../../core/types';

/** Same pools as the flags game (FLAG_CONFIG), with language examples. */
export const LANGUAGE_LEVELS: Level[] = [
  { id: '1', label: { nl: 'Bekende landen', en: 'Well-known countries' }, example: { nl: 'Nederlands, Frans, Japans…', en: 'Dutch, French, Japanese…' }, autoSpeak: true },
  { id: '2', label: { nl: 'Europa', en: 'Europe' }, example: { nl: 'Pools, Fins, Catalaans…', en: 'Polish, Finnish, Catalan…' }, autoSpeak: false },
  { id: '3', label: { nl: 'Amerika', en: 'The Americas' }, example: { nl: 'Spaans, Quechua, Portugees…', en: 'Spanish, Quechua, Portuguese…' }, autoSpeak: false },
  { id: '4', label: { nl: 'Afrika', en: 'Africa' }, example: { nl: 'Swahili, Zoeloe, Arabisch…', en: 'Swahili, Zulu, Arabic…' }, autoSpeak: false },
  { id: '5', label: { nl: 'Azië en Oceanië', en: 'Asia and Oceania' }, example: { nl: 'Hindi, Japans, Thai…', en: 'Hindi, Japanese, Thai…' }, autoSpeak: false },
  { id: '6', label: { nl: 'Hele wereld', en: 'Whole world' }, example: { nl: 'Alle 193 landen', en: 'All 193 countries' }, autoSpeak: false },
];
