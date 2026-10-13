import type { Game } from '../../core/types';
import { MONEY_LEVELS } from './levels';
import { makeMoneyQuestion } from './questions';

export const moneyGame: Game = {
  id: 'money',
  title: { nl: 'Geld & wisselgeld', en: 'Money & Change' },
  icon: 'icons/money.svg',
  pickerLayout: 'list',
  levels: MONEY_LEVELS,
  makeQuestion: makeMoneyQuestion,
};
