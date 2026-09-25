import type { Game } from '../../core/types';
import { FLAG_LEVELS } from './levels';
import { makeFlagQuestion } from './questions';

export const flagsGame: Game = {
  id: 'flags',
  title: { nl: 'Vlaggen', en: 'Flags' },
  icon: 'icons/flags.svg',
  pickerLayout: 'list',
  levels: FLAG_LEVELS,
  makeQuestion: makeFlagQuestion,
};
