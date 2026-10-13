import type { Lang, Level, Localized, Question, Rng } from '../../core/types';
import { el } from '../../core/ui';
import { pickFresh } from '../../core/pick';
import { numberOptions } from '../numberOptions';
import { EURO_COINS } from './coins';

// Keep every calculation in integer cents, including wrong answers.
export function formatMoney(cents: number, lang: Lang): string {
  const euros = Math.floor(cents / 100);
  const remainder = String(cents % 100).padStart(2, '0');
  return lang === 'nl' ? `€ ${euros},${remainder}` : `€${euros}.${remainder}`;
}

interface MoneyProblem { key: string; values: number[] }
const pools: Record<string, MoneyProblem[]> = { euros: [], cents: [], prices: [], change: [] };

for (let ones = 0; ones <= 6; ones++) {
  for (let twos = 0; twos <= 6 - ones; twos++) {
    if (ones + twos < 2) continue;
    pools.euros.push({ key: `euros:${ones}:${twos}`, values: [...Array<number>(ones).fill(100), ...Array<number>(twos).fill(200)] });
  }
}
const coins = [1, 2, 5, 10, 20, 50, 100, 200];
for (let i = 0; i < coins.length; i++) {
  for (let j = i + 1; j < coins.length; j++) {
    for (let count = 1; count <= 3; count++) {
      pools.cents.push({ key: `cents:${coins[i]}:${coins[j]}:${count}`, values: [...Array<number>(count).fill(coins[i]), coins[j]] });
    }
  }
}
for (let first = 50; first <= 1000; first += 25) {
  for (let second = first; second <= 1000; second += 50) {
    pools.prices.push({ key: `prices:${first}:${second}`, values: [first, second] });
  }
}
for (const payment of [500, 1000, 2000]) {
  for (let price = 25; price <= payment; price += 25) {
    pools.change.push({ key: `change:${price}:${payment}`, values: [price, payment] });
  }
}

export function makeMoneyQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const problem = pickFresh(pools[level.id], previous, (p) => p.key, rng);
  const values = problem.values;
  const counting = level.id === 'euros' || level.id === 'cents';
  const change = level.id === 'change';
  const answer = change ? values[1] - values[0] : values.reduce((a, b) => a + b, 0);
  const prompt: Localized = change
    ? { nl: 'Hoeveel wisselgeld krijg je terug?', en: 'How much change do you get?' }
    : counting ? { nl: 'Hoeveel geld ligt hier?', en: 'How much money is here?' }
      : { nl: 'Hoeveel kosten ze samen?', en: 'How much do they cost together?' };
  const descriptions = (lang: Lang) => values.map((v) => formatMoney(v, lang));
  const speechFor = (lang: Lang) => {
    const amounts = descriptions(lang);
    if (change) return lang === 'nl'
      ? `Het kost ${amounts[0]}. Je betaalt ${amounts[1]}. ${prompt.nl}`
      : `It costs ${amounts[0]}. You pay ${amounts[1]}. ${prompt.en}`;
    return `${amounts.join(' plus ')}. ${prompt[lang]}`;
  };
  return {
    key: problem.key,
    prompt,
    speech: { nl: speechFor('nl'), en: speechFor('en') },
    visual: ({ lang }) => {
      if (counting) return el('figure', { class: 'money-visual' },
        el('div', { class: 'money-coins' }, ...values.map((v) => {
          const coin = EURO_COINS[v];
          const size = Math.round(coin.diameter * 4);
          return el('img', { class: 'money-piece euro-coin', src: coin.src, alt: formatMoney(v, lang), width: size, height: size });
        })),
        el('figcaption', { class: 'coin-credit' }, lang === 'nl'
          ? 'Muntafbeeldingen: European Central Bank'
          : 'Coin images: European Central Bank'),
      );
      const labels = change
        ? (lang === 'nl' ? ['Het kost', 'Je betaalt'] : ['Price', 'You pay'])
        : (lang === 'nl' ? ['Eerste prijs', 'Tweede prijs'] : ['First price', 'Second price']);
      return el('div', { class: 'money-prices' }, ...values.map((v, i) =>
        el('div', { class: 'price-card' },
          el('span', { class: 'price-caption' }, labels[i]),
          el('strong', { class: 'money-amount' }, formatMoney(v, lang)),
        ),
      ));
    },
    choices: numberOptions(answer, level.id === 'euros' ? 100 : counting ? 10 : 25, rng).map((v) => ({
      id: String(v), label: { nl: formatMoney(v, 'nl'), en: formatMoney(v, 'en') },
    })),
    answerId: String(answer),
  };
}

