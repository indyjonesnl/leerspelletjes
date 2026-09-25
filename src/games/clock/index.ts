import type { Game } from '../../core/types';
import { CLOCK_LEVELS } from './levels';
import { makeClockQuestion } from './questions';

export const clockGame: Game = {
  id: 'clock',
  title: { nl: 'Klok kijken', en: 'Telling time' },
  icon: 'icons/clock.svg',
  pickerLayout: 'list',
  levels: CLOCK_LEVELS,
  makeQuestion: makeClockQuestion,
};
