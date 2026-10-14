import type { Level, Localized, StudyContext } from '../../core/types';
import { el } from '../../core/ui';
import { exerciseNote } from './questions';

interface StudyExample { words: string; explanation: Localized }
const EXAMPLES: Record<string, StudyExample[]> = {
  'ng-nk': [
    { words: 'ring · slang · tong', explanation: { nl: 'De ng-klank schrijf je met ng.', en: 'Write the Dutch ng sound with ng.' } },
    { words: 'bank · plank · pink', explanation: { nl: 'Bij de ng-klank met een k schrijf je nk. Zet er geen g tussen.', en: 'For the Dutch ng sound followed by k, write nk. Leave out the g.' } },
    { words: 'winkel · donker', explanation: { nl: 'Ook midden in een woord kun je nk horen en schrijven.', en: 'You can hear and write nk in the middle of a Dutch word, too.' } },
  ],
  'eer-oor-eur': [
    { words: 'beer · peer · veer', explanation: { nl: 'Onthoud het stukje eer. Je schrijft twee e’s vóór de r.', en: 'Remember the Dutch letter group eer: two e letters before r.' } },
    { words: 'oor · boor · spoor', explanation: { nl: 'Onthoud het stukje oor. Je schrijft twee o’s vóór de r.', en: 'Remember the Dutch letter group oor: two o letters before r.' } },
    { words: 'deur · geur · beurt', explanation: { nl: 'Onthoud het stukje eur. Je schrijft eu vóór de r.', en: 'Remember the Dutch letter group eur: write eu before r.' } },
  ],
  diminutives: [
    { words: 'huis → huisje · boek → boekje', explanation: { nl: 'Met een verkleinwoord maak je iets klein. Hier zet je je achter het woord.', en: 'A Dutch diminutive makes something small. Here, add je to the word.' } },
    { words: 'boom → boompje · raam → raampje', explanation: { nl: 'Deze woorden krijgen pje. Vergeet de p niet.', en: 'These Dutch words take pje. Remember the p.' } },
    { words: 'stoel → stoeltje · tafel → tafeltje', explanation: { nl: 'Deze woorden krijgen tje. Vergeet de t niet.', en: 'These Dutch words take tje. Remember the t.' } },
  ],
  vowels: [
    { words: 'boom → bomen · boot → boten', explanation: { nl: 'Zeg het woord in klankstukken: bo-men, bo-ten. Je hoort een lange klinker aan het eind van het eerste stukje. Schrijf één klinker.', en: 'Say the Dutch sound chunks: bo-men, bo-ten. The first chunk ends with a long vowel sound. Write one vowel there.' } },
    { words: 'kat → katten · kip → kippen', explanation: { nl: 'Je hoort een korte klinker: kat-ten, kip-pen. Schrijf daarna twee dezelfde medeklinkers.', en: 'You hear a short vowel sound: kat-ten, kip-pen. Double the consonant after it.' } },
    { words: 'ra-men · sok-ken', explanation: { nl: 'Luister naar het eerste klankstuk. Lange a: ramen. Korte o: sokken. Dit zijn je eerste oefenwoorden.', en: 'Listen to the first sound chunk. Long a: ramen. Short o: sokken. These are your first practice words.' } },
  ],
};

export function spellingStudy(level: Level, { lang, speak }: StudyContext): HTMLElement {
  const rows = EXAMPLES[level.id];
  const view = el('section', { class: 'study spelling-study' },
    el('h2', {}, level.label[lang]),
    el('p', { class: 'spelling-note' }, exerciseNote[lang]),
    ...rows.map(row => el('article', { class: 'study-card' },
      el('strong', { lang: 'nl' }, row.words),
      el('p', {}, row.explanation[lang]),
    )),
    el('p', { class: 'subtitle' }, lang === 'nl'
      ? 'Lees de zin en kies de juiste spelling. Na je antwoord zie je de uitleg. Druk daarna op Verder.'
      : 'Read the Dutch sentence and choose the correct spelling. After answering, read the explanation, then press Continue.'),
  );
  if (lang === 'nl' && speak) {
    const button = el('button', { type: 'button', class: 'icon-button', 'aria-label': 'Lees de uitleg voor' }, '🔈');
    button.addEventListener('click', () => speak(rows.map(row => `${row.words}. ${row.explanation.nl}`).join(' ')));
    view.append(button);
  }
  return view;
}
