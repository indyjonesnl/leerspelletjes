import type { Lang, Level, Localized, StudyContext } from '../../core/types';
import { el } from '../../core/ui';
import { sortedBy, studyGrid, type StudyItem } from '../../screens/StudyCards';
import type { Continent, Country } from './types';
import { FLAG_CONFIG } from './levels';
import { flagUrl } from './questions';

/** The whole-world level is long, so its cards are grouped by continent. */
const GROUPED_LEVEL = '6';
const CONTINENT_ORDER: readonly Continent[] = ['europe', 'americas', 'africa', 'asia', 'oceania'];
const CONTINENT_NAMES: Record<Continent, Localized> = {
  europe: { nl: 'Europa', en: 'Europe' },
  americas: { nl: 'Amerika', en: 'The Americas' },
  africa: { nl: 'Afrika', en: 'Africa' },
  asia: { nl: 'Azië', en: 'Asia' },
  oceania: { nl: 'Oceanië', en: 'Oceania' },
};

/** Cards for the countries of a flag-style level, sorted by name; `detailOf` adds a second line (the capital). */
export function countryStudy(level: Level, lang: Lang, detailOf?: (code: string, lang: Lang) => string): HTMLElement {
  const { pool } = FLAG_CONFIG[level.id];
  const cards = (countries: readonly Country[]) =>
    studyGrid(
      sortedBy(countries, (c) => c[lang], lang).map((c): StudyItem => ({
        key: c.code, flag: flagUrl(c.code), name: c[lang], detail: detailOf?.(c.code, lang),
      })),
    );
  const root = el('section', { class: 'study' }, el('h2', {}, level.label[lang]));
  if (level.id !== GROUPED_LEVEL) {
    root.append(cards(pool));
    return root;
  }
  for (const continent of CONTINENT_ORDER) {
    root.append(el('h3', {}, CONTINENT_NAMES[continent][lang]), cards(pool.filter((c) => c.continent === continent)));
  }
  return root;
}

export function flagsStudy(level: Level, { lang }: StudyContext): HTMLElement {
  return countryStudy(level, lang);
}
