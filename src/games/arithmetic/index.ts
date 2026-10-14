import type { Game, Level } from '../../core/types';
import { makeArithmeticQuestion } from './questions';
import { arithmeticStudy } from './study';

const levels: Level[] = [
  { id: 'addition', label: { nl: 'Optellen tot 100', en: 'Addition to 100' }, example: { nl: '45 + 23, zonder tientalovergang', en: '45 + 23, without crossing a ten' }, autoSpeak: false },
  { id: 'subtraction', label: { nl: 'Aftrekken tot 100', en: 'Subtraction to 100' }, example: { nl: '68 − 23, zonder tientalovergang', en: '68 − 23, without crossing a ten' }, autoSpeak: false },
  { id: 'bridging', label: { nl: 'Over het tiental', en: 'Crossing tens' }, example: { nl: '34 + 8 of 62 − 17', en: '34 + 8 or 62 − 17' }, autoSpeak: false },
  { id: 'missing', label: { nl: 'Het ontbrekende getal', en: 'Missing numbers' }, example: { nl: '27 + ? = 39', en: '27 + ? = 39' }, autoSpeak: false },
];
export const arithmeticGame: Game = {
  id: 'arithmetic', title: { nl: 'Rekensprongen', en: 'Number Jumps' }, icon: 'icons/arithmetic.svg',
  pickerLayout: 'list', levels, study: arithmeticStudy, makeQuestion: makeArithmeticQuestion,
};
