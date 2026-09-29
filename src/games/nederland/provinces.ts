import type { Localized } from '../../core/types';

export interface Province {
  /** Our own two-letter key, used only in this game (not ISO 3166-2). */
  code: string;
  name: Localized;
  capital: Localized;
}

/** Names as Dutch schools teach them (Friesland, 's-Hertogenbosch). */
export const PROVINCES: readonly Province[] = [
  { code: 'GR', name: { nl: 'Groningen', en: 'Groningen' }, capital: { nl: 'Groningen', en: 'Groningen' } },
  { code: 'FR', name: { nl: 'Friesland', en: 'Friesland' }, capital: { nl: 'Leeuwarden', en: 'Leeuwarden' } },
  { code: 'DR', name: { nl: 'Drenthe', en: 'Drenthe' }, capital: { nl: 'Assen', en: 'Assen' } },
  { code: 'OV', name: { nl: 'Overijssel', en: 'Overijssel' }, capital: { nl: 'Zwolle', en: 'Zwolle' } },
  { code: 'FL', name: { nl: 'Flevoland', en: 'Flevoland' }, capital: { nl: 'Lelystad', en: 'Lelystad' } },
  { code: 'GE', name: { nl: 'Gelderland', en: 'Gelderland' }, capital: { nl: 'Arnhem', en: 'Arnhem' } },
  { code: 'UT', name: { nl: 'Utrecht', en: 'Utrecht' }, capital: { nl: 'Utrecht', en: 'Utrecht' } },
  { code: 'NH', name: { nl: 'Noord-Holland', en: 'North Holland' }, capital: { nl: 'Haarlem', en: 'Haarlem' } },
  { code: 'ZH', name: { nl: 'Zuid-Holland', en: 'South Holland' }, capital: { nl: 'Den Haag', en: 'The Hague' } },
  { code: 'ZE', name: { nl: 'Zeeland', en: 'Zeeland' }, capital: { nl: 'Middelburg', en: 'Middelburg' } },
  { code: 'NB', name: { nl: 'Noord-Brabant', en: 'North Brabant' }, capital: { nl: '’s-Hertogenbosch', en: '’s-Hertogenbosch' } },
  { code: 'LI', name: { nl: 'Limburg', en: 'Limburg' }, capital: { nl: 'Maastricht', en: 'Maastricht' } },
];

export const provinceByCode = (code: string): Province => {
  const p = PROVINCES.find((x) => x.code === code);
  if (!p) throw new Error(`Unknown province ${code}`);
  return p;
};
