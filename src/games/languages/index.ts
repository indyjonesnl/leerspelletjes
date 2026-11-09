import type { Game } from '../../core/types';
import { LANGUAGE_LEVELS } from './levels';
import { makeLanguageQuestion } from './questions';
import { languagesStudy } from './study';

export const languagesGame: Game = {
  id: 'languages',
  title: { nl: 'Talen', en: 'Languages' },
  icon: 'icons/languages.svg',
  pickerLayout: 'list',
  levels: LANGUAGE_LEVELS,
  makeQuestion: makeLanguageQuestion,
  study: languagesStudy,
};
