import type { Level } from '../../core/types';

/** Same pools as the flags game (FLAG_CONFIG), with capital examples. */
export const CAPITAL_LEVELS: Level[] = [
  { id: '1', label: { nl: 'Bekende landen', en: 'Well-known countries' }, example: { nl: 'Parijs, Berlijn, Tokio…', en: 'Paris, Berlin, Tokyo…' }, autoSpeak: true },
  { id: '2', label: { nl: 'Europa', en: 'Europe' }, example: { nl: 'Rome, Warschau, Oslo…', en: 'Rome, Warsaw, Oslo…' }, autoSpeak: false },
  { id: '3', label: { nl: 'Amerika', en: 'The Americas' }, example: { nl: 'Ottawa, Lima, Havana…', en: 'Ottawa, Lima, Havana…' }, autoSpeak: false },
  { id: '4', label: { nl: 'Afrika', en: 'Africa' }, example: { nl: 'Caïro, Nairobi, Accra…', en: 'Cairo, Nairobi, Accra…' }, autoSpeak: false },
  { id: '5', label: { nl: 'Azië en Oceanië', en: 'Asia and Oceania' }, example: { nl: 'Peking, New Delhi, Canberra…', en: 'Beijing, New Delhi, Canberra…' }, autoSpeak: false },
  { id: '6', label: { nl: 'Hele wereld', en: 'Whole world' }, example: { nl: 'Alle 193 hoofdsteden', en: 'All 193 capitals' }, autoSpeak: false },
];
