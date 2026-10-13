import type { Game } from '../../core/types';
import { PATTERN_LEVELS } from './levels';
import { makePatternQuestion } from './questions';

export const patternsGame: Game = {
  id: 'patterns',
  title: { nl: 'Patronen', en: 'Pattern Puzzles' },
  icon: 'icons/patterns.svg',
  pickerLayout: 'list',
  levels: PATTERN_LEVELS,
  makeQuestion: makePatternQuestion,
};
