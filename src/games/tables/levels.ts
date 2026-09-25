import type { Level } from '../../core/types';

const single: Level[] = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  const example = `${n}, ${2 * n}, ${3 * n}…`;
  return {
    id: String(n),
    label: { nl: `Tafel van ${n}`, en: `${n} times table` },
    example: { nl: example, en: example },
    autoSpeak: n <= 5,
  };
});

export const TABLE_LEVELS: Level[] = [
  ...single,
  { id: 'mix5', label: { nl: 'Tafels 1 t/m 5', en: 'Tables 1 to 5' }, example: { nl: '3 × 4, 5 × 2…', en: '3 × 4, 5 × 2…' }, autoSpeak: false },
  { id: 'mix10', label: { nl: 'Tafels 1 t/m 10', en: 'Tables 1 to 10' }, example: { nl: '7 × 8, 9 × 6…', en: '7 × 8, 9 × 6…' }, autoSpeak: false },
];

const upTo = (max: number) => Array.from({ length: max }, (_, i) => i + 1);

export const TABLE_CONFIG: Record<string, { tables: number[] }> = {
  ...Object.fromEntries(upTo(10).map((n) => [String(n), { tables: [n] }])),
  mix5: { tables: upTo(5) },
  mix10: { tables: upTo(10) },
};
