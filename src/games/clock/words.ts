import type { Lang } from '../../core/types';

const NL_HOURS = ['', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf'];
const EN_HOURS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const EN_MINUTES: Record<number, string> = { 5: 'five', 10: 'ten', 15: 'quarter', 20: 'twenty', 25: 'twenty-five', 30: 'half' };

const to12 = (h: number) => h % 12 || 12;

/** Spoken time the way it is taught at school, e.g. 3:25 → "vijf voor half vier" / "twenty-five past three". */
export function timeToWords(h: number, m: number, lang: Lang): string {
  if (!Number.isInteger(h) || h < 0 || h > 23 || !Number.isInteger(m) || m < 0 || m > 55 || m % 5 !== 0) {
    throw new RangeError(`Unsupported time ${h}:${m}`);
  }
  const current = to12(h);
  const next = to12(h + 1);

  if (lang === 'nl') {
    const c = NL_HOURS[current];
    const n = NL_HOURS[next];
    switch (m) {
      case 0: return `${c} uur`;
      case 5: return `vijf over ${c}`;
      case 10: return `tien over ${c}`;
      case 15: return `kwart over ${c}`;
      case 20: return `tien voor half ${n}`;
      case 25: return `vijf voor half ${n}`;
      case 30: return `half ${n}`;
      case 35: return `vijf over half ${n}`;
      case 40: return `tien over half ${n}`;
      case 45: return `kwart voor ${n}`;
      case 50: return `tien voor ${n}`;
      default: return `vijf voor ${n}`;
    }
  }

  if (m === 0) return `${EN_HOURS[current]} o'clock`;
  if (m <= 30) return `${EN_MINUTES[m]} past ${EN_HOURS[current]}`;
  return `${EN_MINUTES[60 - m]} to ${EN_HOURS[next]}`;
}

export function partOfDay(h: number, lang: Lang): string {
  const index = h < 6 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3;
  const words = lang === 'nl'
    ? ["'s nachts", "'s ochtends", "'s middags", "'s avonds"]
    : ['at night', 'in the morning', 'in the afternoon', 'in the evening'];
  return words[index];
}

export function timeToWords24(h: number, m: number, lang: Lang): string {
  return `${timeToWords(h, m, lang)} ${partOfDay(h, lang)}`;
}

export function formatDigital(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
