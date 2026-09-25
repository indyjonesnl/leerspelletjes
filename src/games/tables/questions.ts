import type { Level, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { both } from '../../core/i18n';
import { TABLE_CONFIG } from './levels';
import { dotGrid } from './DotGrid';

interface Pair {
  a: number;
  n: number;
}

const pairKey = (p: Pair) => `${p.a}x${p.n}`;

export function tableDistractors(a: number, n: number, rng: Rng): number[] {
  const answer = a * n;
  const out: number[] = [];
  const add = (x: number) => {
    if (x > 0 && x !== answer && !out.includes(x) && out.length < 3) out.push(x);
  };
  rng.shuffle([(a - 1) * n, (a + 1) * n, answer - 1, answer + 1]).forEach(add);
  for (let d = 2; out.length < 3; d++) {
    add(answer + d);
    add(answer - d);
  }
  return out;
}

export function makeTableQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const pool = TABLE_CONFIG[level.id].tables.flatMap((n) =>
    Array.from({ length: 10 }, (_, i) => ({ a: i + 1, n })),
  );
  const { a, n } = pickFresh(pool, previous, pairKey, rng);
  const answer = a * n;
  const options = rng.shuffle([answer, ...tableDistractors(a, n, rng)]);
  return {
    key: pairKey({ a, n }),
    prompt: both(`${a} × ${n} = ?`),
    speech: { nl: `${a} keer ${n}`, en: `${a} times ${n}` },
    hint: n <= 5 ? () => dotGrid(a, n) : undefined,
    choices: options.map((x) => ({ id: String(x), label: both(String(x)) })),
    answerId: String(answer),
  };
}
