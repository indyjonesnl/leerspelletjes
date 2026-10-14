import type { Level, StudyContext } from '../../core/types';
import { el } from '../../core/ui';
import { arithmeticSteps } from './questions';
import { numberLine } from './numberLine';

export function arithmeticStudy(level: Level, { lang, speak }: StudyContext): HTMLElement {
  const examples: Record<string, { a: number; b: number; op: '+' | '-'; text: { nl: string; en: string } }> = {
    addition: { a: 45, b: 23, op: '+', text: { nl: 'Splits 23 in 20 en 3. Tel eerst de tientallen erbij, dan de losse eenheden.', en: 'Split 23 into 20 and 3. Add the tens first, then the ones.' } },
    subtraction: { a: 68, b: 23, op: '-', text: { nl: 'Splits 23 in 20 en 3. Haal eerst de tientallen eraf, dan de losse eenheden.', en: 'Split 23 into 20 and 3. Subtract the tens first, then the ones.' } },
    bridging: { a: 34, b: 8, op: '+', text: { nl: 'Maak eerst het volgende tiental: 34 + 6 = 40. Van de 8 blijven er nog 2 over. 40 + 2 = 42.', en: 'Reach the next ten first: 34 + 6 = 40. There are 2 left from the 8. 40 + 2 = 42.' } },
    missing: { a: 27, b: 12, op: '+', text: { nl: 'Bij 27 + ? = 39 kun je terugrekenen: 39 − 27 = 12. Controleer: 27 + 12 = 39.', en: 'For 27 + ? = 39, work backwards: 39 − 27 = 12. Check: 27 + 12 = 39.' } },
  };
  const example = examples[level.id];
  if (!example) throw new Error(`Unknown arithmetic study level: ${level.id}`);
  const explanation = example.text[lang];
  const root = el('section', { class: 'study arithmetic-study' },
    el('h2', {}, level.label[lang]), el('p', { class: 'subtitle' }, level.example[lang]),
    el('article', { class: 'study-card' }, el('h3', {}, lang === 'nl' ? 'Reken in stappen' : 'Work in steps'),
      el('p', {}, explanation), numberLine(arithmeticSteps(example.a, example.b, example.op), true)),
    el('article', { class: 'study-card' }, el('h3', {}, lang === 'nl' ? 'Hulp tijdens het oefenen' : 'Help while practising'),
      el('p', {}, lang === 'nl' ? 'Gebruik de hulpknop voor een lege getallenlijn. Na je antwoord zie je de rekenstappen. Kies daarna Verder.' : 'Use the help button for an empty number line. After answering, explore the worked steps, then choose Continue.')),
  );
  if (speak) {
    const button = el('button', { type: 'button', class: 'icon-button', 'aria-label': lang === 'nl' ? 'Lees het voorbeeld voor' : 'Read the example aloud' }, '🔈');
    button.addEventListener('click', () => speak(explanation));
    root.append(button);
  }
  return root;
}
