import type { Level, StudyContext } from '../../core/types';
import { countryStudy } from '../flags/study';
import { LANGUAGES } from './data/languages';
import { SPOKEN } from './data/spoken';

export function languagesStudy(level: Level, { lang }: StudyContext): HTMLElement {
  return countryStudy(level, lang, (code, l) =>
    SPOKEN[code].main
      .map((id) => LANGUAGES[id][l])
      .sort((a, b) => a.localeCompare(b, l))
      .join(', '),
  );
}
