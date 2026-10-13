import type { Game } from '../../core/types';
import { FRACTION_LEVELS } from './levels';
import { makeFractionQuestion } from './questions';

export const fractionsGame: Game = {
  id: 'fractions',
  title: { nl: 'Breuken', en: 'Fraction Match' },
  icon: 'icons/fractions.svg',
  pickerLayout: 'list',
  levels: FRACTION_LEVELS,
  makeQuestion: makeFractionQuestion,
};
