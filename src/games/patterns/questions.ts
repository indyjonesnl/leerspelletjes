import type { Level, Localized, Question, Rng } from '../../core/types';
import { both } from '../../core/i18n';
import { el } from '../../core/ui';
import { pickFresh } from '../../core/pick';
import { numberOptions } from '../numberOptions';

const SHAPES = [
  { symbol: '●', name: { nl: 'cirkel', en: 'circle' } },
  { symbol: '▲', name: { nl: 'driehoek', en: 'triangle' } },
  { symbol: '■', name: { nl: 'vierkant', en: 'square' } },
  { symbol: '★', name: { nl: 'ster', en: 'star' } },
];

interface Pattern { key: string; sequence: string[]; answer: string; step: number }
const pools: Record<string, Pattern[]> = { shapes: [], counting: [], missing: [], growing: [] };
for (const a of SHAPES) {
  for (const b of SHAPES.filter((s) => s !== a)) {
    for (const third of [undefined, ...SHAPES.filter((s) => s !== a && s !== b)]) {
      const cycle = [a.symbol, b.symbol, ...(third ? [third.symbol] : [])];
      pools.shapes.push({ key: `shapes:${cycle.join('')}`, sequence: [...cycle, ...cycle, '?'], answer: cycle[0], step: 1 });
    }
  }
}
for (let start = 0; start <= 20; start++) {
  for (const step of [1, 2, 3, 5, 10]) {
    const sequence = Array.from({ length: 6 }, (_, i) => String(start + i * step));
    pools.counting.push({ key: `counting:${start}:${step}`, sequence: [...sequence.slice(0, -1), '?'], answer: sequence[5], step });
    for (const gap of [1, 2, 3, 4]) {
      pools.missing.push({ key: `missing:${start}:${step}:${gap}`, sequence: sequence.map((n, i) => i === gap ? '?' : n), answer: sequence[gap], step });
    }
  }
}
for (let start = 1; start <= 10; start++) {
  for (let step = 1; step <= 5; step++) {
    for (let growth = 1; growth <= 3; growth++) {
      const sequence = [start];
      for (let i = 0; i < 5; i++) sequence.push(sequence[i] + step + i * growth);
      pools.growing.push({ key: `growing:${start}:${step}:${growth}`, sequence: [...sequence.slice(0, -1).map(String), '?'], answer: String(sequence[5]), step: 1 });
    }
  }
}

export function makePatternQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const pattern = pickFresh(pools[level.id], previous, (p) => p.key, rng);
  const shapes = level.id === 'shapes';
  const prompt: Localized = level.id === 'missing'
    ? { nl: 'Welk getal ontbreekt?', en: 'Which number is missing?' }
    : { nl: 'Wat komt hierna?', en: 'What comes next?' };
  const spokenTerm = (term: string): Localized => term === '?'
    ? { nl: 'vraagteken', en: 'question mark' }
    : SHAPES.find((s) => s.symbol === term)?.name ?? both(term);
  const sequenceLabel: Localized = {
    nl: pattern.sequence.map((s) => spokenTerm(s).nl).join(', '),
    en: pattern.sequence.map((s) => spokenTerm(s).en).join(', '),
  };
  return {
    key: pattern.key,
    prompt,
    speech: { nl: `${sequenceLabel.nl}. ${prompt.nl}`, en: `${sequenceLabel.en}. ${prompt.en}` },
    visual: () => el('div', { class: `pattern-sequence${shapes ? ' pattern-shapes' : ''}` }, ...pattern.sequence.map((term) =>
      el('span', { class: `pattern-term${term === '?' ? ' pattern-gap' : ''}` }, term),
    )),
    visualLabel: { hidden: sequenceLabel, revealed: sequenceLabel },
    choices: shapes
      ? rng.shuffle(SHAPES.map((s) => ({ id: s.symbol, label: { nl: `${s.symbol} ${s.name.nl}`, en: `${s.symbol} ${s.name.en}` } })))
      : numberOptions(Number(pattern.answer), pattern.step, rng).map((n) => ({ id: String(n), label: both(String(n)) })),
    answerId: pattern.answer,
  };
}
