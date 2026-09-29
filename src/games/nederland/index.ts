import type { Game } from '../../core/types';
import { NL_LEVELS } from './levels';
import { loadNl } from './load';
import { makeNlQuestion } from './questions';

export const nederlandGame: Game = {
  id: 'nederland',
  title: { nl: 'Nederland', en: 'The Netherlands' },
  icon: 'icons/nederland.svg',
  pickerLayout: 'list',
  levels: NL_LEVELS,
  async load() {
    await loadNl();
  },
  makeQuestion: makeNlQuestion,
};
