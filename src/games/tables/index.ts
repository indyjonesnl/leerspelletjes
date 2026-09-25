import type { Game } from '../../core/types';
import { TABLE_LEVELS } from './levels';
import { makeTableQuestion } from './questions';

export const tablesGame: Game = {
  id: 'tables',
  title: { nl: 'Tafels', en: 'Times tables' },
  icon: 'icons/tables.svg',
  pickerLayout: 'grid',
  levels: TABLE_LEVELS,
  makeQuestion: makeTableQuestion,
};
