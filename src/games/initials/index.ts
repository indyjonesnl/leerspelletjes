import type { Game } from '../../core/types';
import { makeInitialQuestion } from './questions';

export const initialsGame: Game = {
  id: 'initials',
  title: { nl: 'Beginletters', en: 'First Letters' },
  icon: 'icons/initials.svg',
  pickerLayout: 'list',
  levels: [{
    id: 'pictures',
    label: { nl: 'Herken het plaatje', en: 'Name the picture' },
    example: { nl: 'Kat begint met K · Appel begint met A', en: 'Cat starts with C · Apple starts with A' },
    autoSpeak: true,
  }],
  letterInput: true,
  refreshOnLanguageChange: true,
  makeQuestion: makeInitialQuestion,
};
