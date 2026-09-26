import type { Localized } from '../../core/types';
import { COUNTRIES } from '../flags/data/countries';

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

/** Names that need an article, and plural names ("Waar liggen de Filipijnen?" / "Where are the Philippines?"). */
const NL_ARTICLE: Record<string, 'de' | 'het'> = {
  AE: 'de', BS: 'de', CD: 'de', CF: 'de', DO: 'de', GB: 'het', KM: 'de', MH: 'de', MV: 'de', PH: 'de', SB: 'de', SC: 'de', US: 'de',
};
const NL_PLURAL = new Set(['AE', 'BS', 'KM', 'MH', 'MV', 'PH', 'SB', 'SC', 'US']);
const EN_THE = new Set(['AE', 'BS', 'CD', 'CF', 'CG', 'DO', 'GB', 'GM', 'KM', 'MH', 'MV', 'NL', 'PH', 'SB', 'SC', 'US']);
const EN_PLURAL = new Set(['BS', 'KM', 'MH', 'MV', 'PH', 'SB', 'SC']);

export function countryName(code: string): Localized {
  const country = BY_CODE.get(code);
  if (!country) throw new Error(`Unknown country ${code}`);
  return { nl: country.nl, en: country.en };
}

export function whereIs(code: string): Localized {
  const name = countryName(code);
  const nl = NL_ARTICLE[code] ? `${NL_ARTICLE[code]} ${name.nl}` : name.nl;
  const en = EN_THE.has(code) ? `the ${name.en}` : name.en;
  return {
    nl: `Waar ${NL_PLURAL.has(code) ? 'liggen' : 'ligt'} ${nl}?`,
    en: `Where ${EN_PLURAL.has(code) ? 'are' : 'is'} ${en}?`,
  };
}
