import { both } from '../../core/i18n';
import { pickFresh } from '../../core/pick';
import type { Choice, Level, Localized, Question, Rng } from '../../core/types';
import { fractionVisual } from './visual';

interface Fraction { numerator: number; denominator: number }

function fractionPool(denominators: readonly number[]): Fraction[] {
  return denominators.flatMap((denominator) => Array.from({ length: denominator - 1 }, (_, i) => ({ numerator: i + 1, denominator })));
}

const pools: Record<string, Fraction[]> = {
  shapes: fractionPool([2, 3, 4, 5, 6, 8, 10, 12]),
  equivalent: fractionPool([2, 3, 4, 5, 6, 8, 10, 12]),
  decimals: fractionPool([2, 4, 5, 8, 10, 20]),
  percentages: fractionPool([2, 4, 5, 10, 20]),
};

/** Format thousandths using integers, so terminating decimals never need rounding. */
function decimalLabel(thousandths: number): Localized {
  const digits = String(thousandths % 1000).padStart(3, '0').replace(/0+$/, '');
  const whole = Math.floor(thousandths / 1000);
  const en = digits ? `${whole}.${digits}` : String(whole);
  return { nl: en.replace('.', ','), en };
}

function options(level: Level, fraction: Fraction, rng: Rng): { choices: Choice[]; answerId: string } {
  const { numerator: n, denominator: d } = fraction;
  let answer: Choice;
  let candidates: Choice[];
  if (level.id === 'decimals' || level.id === 'percentages') {
    const unit = level.id === 'decimals' ? 1000 : 100;
    // Every denominator in these levels divides the unit exactly.
    const target = n * (unit / d);
    const step = level.id === 'decimals' ? 25 : 5;
    const choice = (amount: number): Choice => ({
      id: `${level.id}:${amount}`,
      label: level.id === 'decimals' ? decimalLabel(amount) : both(`${amount}%`),
    });
    answer = choice(target);
    candidates = Array.from({ length: unit / step + 1 }, (_, i) => i * step)
      .filter((amount) => amount * d !== n * unit)
      .map(choice);
  } else {
    const multiplier = level.id === 'equivalent' ? rng.int(2, 4) : 2;
    const denominator = d * multiplier;
    const answerN = level.id === 'equivalent' ? n * multiplier : n;
    const answerD = level.id === 'equivalent' ? denominator : d;
    answer = { id: `${answerN}/${answerD}`, label: both(`${answerN}/${answerD}`) };
    candidates = Array.from({ length: denominator + 1 }, (_, numerator) => ({ numerator, denominator }))
      .filter((candidate) => candidate.numerator * d !== n * candidate.denominator)
      .map((candidate) => ({ id: `${candidate.numerator}/${candidate.denominator}`, label: both(`${candidate.numerator}/${candidate.denominator}`) }));
  }
  return { choices: rng.shuffle([answer, ...rng.shuffle(candidates).slice(0, 3)]), answerId: answer.id };
}

export function makeFractionQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const fraction = pickFresh(pools[level.id], previous, (f) => `${level.id}:${f.numerator}/${f.denominator}`, rng);
  const { numerator: n, denominator: d } = fraction;
  const shape = d <= 12 && rng.int(0, 1) === 0 ? 'circle' : 'bar';
  const prompts: Record<string, Localized> = {
    shapes: { nl: 'Welke breuk is gekleurd?', en: 'What fraction is shaded?' },
    equivalent: { nl: `Welke breuk is gelijk aan ${n}/${d}?`, en: `Which fraction equals ${n}/${d}?` },
    decimals: { nl: `Welk kommagetal is gelijk aan ${n}/${d}?`, en: `Which decimal equals ${n}/${d}?` },
    percentages: { nl: `Welk percentage is gelijk aan ${n}/${d}?`, en: `Which percentage equals ${n}/${d}?` },
  };
  const prompt = prompts[level.id];
  const description: Localized = {
    nl: `${shape === 'circle' ? 'Cirkel' : 'Balk'} met ${d} gelijke delen; ${n} zijn gekleurd.`,
    en: `${shape === 'circle' ? 'Circle' : 'Bar'} with ${d} equal parts; ${n} are shaded.`,
  };
  const speech = level.id === 'shapes' ? {
    nl: `${description.nl} ${prompt.nl}`, en: `${description.en} ${prompt.en}`,
  } : {
    nl: `${n} gedeeld door ${d}. ${prompt.nl.replace(`${n}/${d}`, 'deze breuk')}`,
    en: `${n} divided by ${d}. ${prompt.en.replace(`${n}/${d}`, 'this fraction')}`,
  };
  return {
    key: `${level.id}:${n}/${d}`,
    prompt,
    speech,
    visual: () => fractionVisual(n, d, shape),
    visualLabel: {
      hidden: description,
      revealed: description,
    },
    ...options(level, fraction, rng),
  };
}
