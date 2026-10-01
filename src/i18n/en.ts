import type { StringKey } from './nl';

export const en: Record<StringKey, string> = {
  appTitle: 'Learning Games',
  home: 'Home',
  language: 'Language',
  sound: 'Sound',
  chooseLevel: 'Choose a level',
  questionProgress: 'Question {n} of {total}',
  speak: 'Read aloud',
  help: 'Help me',
  correct: 'Well done!',
  wrong: 'Almost! The right answer is:',
  markRight: 'Right',
  markWrong: 'Wrong',
  continue: 'Next',
  score: '{score} out of {total}!',
  endGreat: 'Super job!',
  endGood: 'Good work!',
  endPractice: 'Keep practising, you are getting better!',
  playAgain: 'Play again',
  nextLevel: 'Next level',
  loading: 'Loading…',
  loadFailed: "Couldn't load the game.",
  retry: 'Try again',
  learnFirst: 'Learn first',
  practiseNow: 'Practise now',
  backToLevels: 'Back to the levels',
  capital: 'Capital',
  capitalIs: 'The capital is {city}.',
  or: 'or',
  privacy: 'Privacy',
  privacyBody:
    'This website is free and you do not need an account.\n\n' +
    'We do not collect any personal data. There are no cookies, no ads and no analytics or tracking.\n\n' +
    'All files (fonts, flags, pictures and sounds) come from this website itself. Your browser does not connect to anyone else.\n\n' +
    'Your browser only stores your language choice and whether sound is on or off. That data never leaves your device.\n\n' +
    'Reading aloud uses the voices on your device. We pick voices that run on the device itself. If there is none, your browser may use an online voice from the browser maker.',
};
