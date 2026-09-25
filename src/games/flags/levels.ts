import type { Level } from '../../core/types';
import type { Continent, Country } from './types';
import { COUNTRIES } from './data/countries';

export const STARTER_CODES: readonly string[] = ['NL', 'BE', 'DE', 'FR', 'GB', 'ES', 'IT', 'US', 'CA', 'BR', 'CN', 'JP', 'AU', 'TR', 'MA'];

export const FLAG_LEVELS: Level[] = [
  { id: '1', label: { nl: 'Bekende landen', en: 'Well-known countries' }, example: { nl: 'Nederland, Duitsland, Japan…', en: 'Netherlands, Germany, Japan…' }, autoSpeak: true },
  { id: '2', label: { nl: 'Europa', en: 'Europe' }, example: { nl: 'Italië, Polen, Zweden…', en: 'Italy, Poland, Sweden…' }, autoSpeak: false },
  { id: '3', label: { nl: 'Amerika', en: 'The Americas' }, example: { nl: 'Canada, Mexico, Brazilië…', en: 'Canada, Mexico, Brazil…' }, autoSpeak: false },
  { id: '4', label: { nl: 'Afrika', en: 'Africa' }, example: { nl: 'Kenia, Ghana, Egypte…', en: 'Kenya, Ghana, Egypt…' }, autoSpeak: false },
  { id: '5', label: { nl: 'Azië en Oceanië', en: 'Asia and Oceania' }, example: { nl: 'India, Japan, Nieuw-Zeeland…', en: 'India, Japan, New Zealand…' }, autoSpeak: false },
  { id: '6', label: { nl: 'Hele wereld', en: 'Whole world' }, example: { nl: 'Alle 193 landen', en: 'All 193 countries' }, autoSpeak: false },
];

const on = (...continents: Continent[]) => COUNTRIES.filter((c) => continents.includes(c.continent));

export const FLAG_CONFIG: Record<string, { pool: readonly Country[]; sameContinent: boolean }> = {
  '1': { pool: COUNTRIES.filter((c) => STARTER_CODES.includes(c.code)), sameContinent: false },
  '2': { pool: on('europe'), sameContinent: true },
  '3': { pool: on('americas'), sameContinent: true },
  '4': { pool: on('africa'), sameContinent: true },
  '5': { pool: on('asia', 'oceania'), sameContinent: true },
  '6': { pool: COUNTRIES, sameContinent: true },
};
