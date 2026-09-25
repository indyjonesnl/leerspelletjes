import { describe, it, expect } from 'vitest';
import { t, both } from './i18n';
import { nl } from '../i18n/nl';
import { en } from '../i18n/en';

describe('t', () => {
  it('translates keys', () => {
    expect(t('nl', 'playAgain')).toBe('Nog een keer');
    expect(t('en', 'playAgain')).toBe('Play again');
  });

  it('fills in variables and leaves unknown ones', () => {
    expect(t('nl', 'questionProgress', { n: 3, total: 10 })).toBe('Vraag 3 van 10');
    expect(t('en', 'questionProgress', { n: 3 })).toBe('Question 3 of {total}');
  });

  it('has the same keys and no empty strings in both languages', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(nl).sort());
    for (const value of [...Object.values(nl), ...Object.values(en)]) expect(value.trim()).not.toBe('');
  });
});

describe('both', () => {
  it('uses the same text for both languages', () => {
    expect(both('6 × 7 = ?')).toEqual({ nl: '6 × 7 = ?', en: '6 × 7 = ?' });
  });
});
