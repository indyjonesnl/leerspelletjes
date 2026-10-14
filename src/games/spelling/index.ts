import type { Game } from '../../core/types';
import { makeSpellingQuestion } from './questions';
import { spellingStudy } from './study';

export const spellingGame: Game = {
  id: 'spelling',
  title: { nl: 'Spellingdetective', en: 'Spelling Detective' },
  icon: 'icons/spelling.svg',
  pickerLayout: 'list',
  levels: [
    { id: 'ng-nk', label: { nl: 'ng en nk', en: 'ng and nk' }, example: { nl: 'Luister naar ng en nk · ring, bank', en: 'Dutch ng and nk sounds · ring, bank' }, autoSpeak: false, roundLength: 10 },
    { id: 'eer-oor-eur', label: { nl: 'eer, oor en eur', en: 'eer, oor and eur' }, example: { nl: 'Woorden met eer, oor en eur · beer, spoor, deur', en: 'Dutch eer, oor and eur words · beer, spoor, deur' }, autoSpeak: false, roundLength: 10 },
    { id: 'diminutives', label: { nl: 'Verkleinwoorden', en: 'Small words: diminutives' }, example: { nl: 'Maak een woord klein · huisje, boompje', en: 'Make a Dutch word small · huisje, boompje' }, autoSpeak: false, roundLength: 10 },
    { id: 'vowels', label: { nl: 'Lange en korte klinkers', en: 'Long and short vowel sounds' }, example: { nl: 'Eerste stap met klankstukken · bomen, katten', en: 'First steps with Dutch sound chunks · bomen, katten' }, autoSpeak: false, roundLength: 10 },
  ],
  study: spellingStudy,
  makeQuestion: makeSpellingQuestion,
};
