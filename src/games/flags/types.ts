export type Continent = 'europe' | 'americas' | 'africa' | 'asia' | 'oceania';

export interface Country {
  /** ISO 3166-1 alpha-2, upper case. */
  code: string;
  continent: Continent;
  nl: string;
  en: string;
}
