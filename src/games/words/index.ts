import type { Game } from '../../core/types';
import { WORD_LEVELS } from './levels';
import { makeWordQuestion } from './questions';

export const wordsGame: Game = {
  id: 'words',
  title: { nl: 'Woorden bouwen', en: 'Word Builder' },
  icon: 'icons/words.svg',
  pickerLayout: 'list',
  levels: WORD_LEVELS,
  makeQuestion: makeWordQuestion,
};
