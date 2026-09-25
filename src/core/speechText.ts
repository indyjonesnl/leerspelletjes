import type { Lang, Question } from './types';
import { t } from './i18n';

/** Text to read aloud: the question, optionally followed by "a, b or c". */
export function questionSpeech(question: Question, lang: Lang, withChoices: boolean): string {
  const base = (question.speech ?? question.prompt)[lang];
  if (!withChoices) return base;
  const labels = question.choices.map((c) => c.label[lang]);
  const list =
    labels.length > 1 ? `${labels.slice(0, -1).join(', ')} ${t(lang, 'or')} ${labels[labels.length - 1]}` : labels.join('');
  const sep = /[.?!:]$/.test(base) ? ' ' : ': ';
  return `${base}${sep}${list}`;
}
