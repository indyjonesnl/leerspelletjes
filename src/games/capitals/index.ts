import type { Game } from '../../core/types';
import { CAPITAL_LEVELS } from './levels';
import { makeCapitalQuestion } from './questions';
import { capitalsStudy } from './study';

export const capitalsGame: Game = {
  id: 'capitals',
  title: { nl: 'Hoofdsteden', en: 'Capitals' },
  icon: 'icons/capitals.svg',
  pickerLayout: 'list',
  levels: CAPITAL_LEVELS,
  makeQuestion: makeCapitalQuestion,
  study: capitalsStudy,
};
