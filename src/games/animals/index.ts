import type { Game } from '../../core/types';
import { makeAnimalQuestion } from './questions';

export const animalsGame: Game = {
  id: 'animals',
  title: { nl: 'Dierendetective', en: 'Animal Detective' },
  icon: 'icons/animals.svg',
  pickerLayout: 'list',
  levels: [
    { id: 'pictures', label: { nl: 'Plaatjes', en: 'Pictures' }, example: { nl: 'Welk dier zie je?', en: 'Which animal do you see?' }, autoSpeak: false },
    { id: 'silhouettes', label: { nl: 'Schaduwen', en: 'Silhouettes' }, example: { nl: 'Een schaduw met een aanwijzing', en: 'A silhouette with a clue' }, autoSpeak: false },
    { id: 'clues', label: { nl: 'Raadsels', en: 'Riddles' }, example: { nl: 'Raad het dier met een aanwijzing', en: 'Guess the animal from a clue' }, autoSpeak: false },
  ],
  makeQuestion: makeAnimalQuestion,
};
