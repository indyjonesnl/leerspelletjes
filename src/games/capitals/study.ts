import type { Level, StudyContext } from '../../core/types';
import { countryStudy } from '../flags/study';
import { CAPITALS } from './data/capitals';

export function capitalsStudy(level: Level, { lang }: StudyContext): HTMLElement {
  return countryStudy(level, lang, (code, l) => CAPITALS[code][l]);
}
