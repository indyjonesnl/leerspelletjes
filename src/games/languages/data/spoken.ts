import { AFRICA } from './africa';
import { AMERICAS } from './americas';
import { ASIA } from './asia';
import { EUROPE } from './europe';
import type { CountryLanguages } from './types';

/** Languages per country (ISO 3166-1 alpha-2 code), all continents merged. */
export const SPOKEN: Readonly<Record<string, CountryLanguages>> = {
  ...EUROPE,
  ...AMERICAS,
  ...AFRICA,
  ...ASIA,
};
