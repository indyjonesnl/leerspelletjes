import type { Level, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import { numberLine, type ArithmeticStep } from './numberLine';

interface Exercise { id: string; a: number; b: number; operation: '+' | '-'; result: number }
const pools = new Map<string, Exercise[]>();
function exercisePool(levelId: string): Exercise[] {
  const cached = pools.get(levelId);
  if (cached) return cached;
  if (!['addition', 'subtraction', 'bridging', 'missing'].includes(levelId)) throw new Error(`Unknown arithmetic level: ${levelId}`);
  const pool: Exercise[] = [];
  for (let a = 10; a <= 100; a++) for (let b = 1; b <= 40; b++) {
    for (const operation of ['+', '-'] as const) {
      const result = operation === '+' ? a + b : a - b;
      if (result < 0 || result > 100) continue;
      const crosses = operation === '+' ? a % 10 + b % 10 >= 10 : a % 10 < b % 10;
      if (levelId === 'addition' && (operation !== '+' || crosses)) continue;
      if (levelId === 'subtraction' && (operation !== '-' || crosses)) continue;
      if (levelId === 'bridging' && !crosses) continue;
      if (levelId === 'missing' && operation !== '+') continue;
      pool.push({ id: `${levelId}:${operation}:${a}:${b}`, a, b, operation, result });
    }
  }
  pools.set(levelId, pool);
  return pool;
}

export function arithmeticSteps(a: number, b: number, operation: '+' | '-'): ArithmeticStep[] {
  const steps: ArithmeticStep[] = [];
  let current = a;
  const sign = operation === '+' ? 1 : -1;
  const append = (amount: number) => { if (amount) { steps.push({ from: current, to: current + amount, amount }); current += amount; } };
  append(sign * Math.floor(b / 10) * 10);
  const units = b % 10;
  const distance = operation === '+' ? 10 - current % 10 : current % 10;
  if (distance > 0 && units > distance) { append(sign * distance); append(sign * (units - distance)); }
  else append(sign * units);
  return steps;
}

export function makeArithmeticQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const exercise = pickFresh(exercisePool(level.id), previous, (item) => item.id, rng);
  const { a, b, operation, result } = exercise;
  const missing = level.id === 'missing';
  const answer = missing ? b : result;
  const wrong = new Set<number>();
  for (const offset of rng.shuffle([-10, 10, -1, 1, -2, 2, -5, 5, -20, 20])) {
    const candidate = answer + offset;
    if (candidate >= 0 && candidate <= 100 && candidate !== answer) wrong.add(candidate);
    if (wrong.size === 3) break;
  }
  const symbol = operation === '+' ? '+' : '−';
  const equation = missing ? `${a} + ? = ${result}` : `${a} ${symbol} ${b} = ?`;
  const steps = arithmeticSteps(a, b, operation);
  return {
    key: exercise.id,
    prompt: { nl: missing ? 'Welk getal ontbreekt?' : 'Wat is het antwoord?', en: missing ? 'Which number is missing?' : 'What is the answer?' },
    speech: {
      nl: missing ? `${a} plus welk getal is ${result}?` : `Hoeveel is ${a} ${operation === '+' ? 'plus' : 'min'} ${b}?`,
      en: missing ? `${a} plus which number equals ${result}?` : `What is ${a} ${operation === '+' ? 'plus' : 'minus'} ${b}?`,
    },
    autoAdvance: false,
    choices: rng.shuffle([answer, ...wrong]).map((value) => ({ id: String(value), label: { nl: String(value), en: String(value) } })),
    answerId: String(answer),
    hint: () => missing ? numberLine([{ from: a, to: result, amount: b }], true, true) : numberLine(steps, false),
    visual: ({ lang, picked }) => {
      const root = el('section', { class: 'arithmetic-visual' }, el('p', { class: 'arithmetic-equation' }, equation));
      if (picked) root.append(el('div', { class: 'arithmetic-explanation' },
        el('h3', {}, lang === 'nl' ? 'Zo kun je rekenen' : 'A way to work it out'),
        missing ? numberLine([{ from: a, to: result, amount: b }], true) : numberLine(steps, true),
        missing ? el('p', {}, `${result} − ${a} = ${b}. ${a} + ${b} = ${result}.`)
          : el('ol', { class: 'arithmetic-steps' }, ...steps.map((step) => el('li', {}, `${step.from} ${step.amount > 0 ? '+' : '−'} ${Math.abs(step.amount)} = ${step.to}`))),
      ));
      return root;
    },
  };
}
