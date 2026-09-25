import { describe, it, expect } from 'vitest';
import { defaultLang, loadSettings, saveSettings } from './settings';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
}

const throwingStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
} as unknown as Storage;

describe('defaultLang', () => {
  it('picks Dutch for nl browsers and English otherwise', () => {
    expect(defaultLang('nl-NL')).toBe('nl');
    expect(defaultLang('nl-BE')).toBe('nl');
    expect(defaultLang('NL')).toBe('nl');
    expect(defaultLang('en-US')).toBe('en');
    expect(defaultLang('de')).toBe('en');
    expect(defaultLang(undefined)).toBe('en');
  });
});

describe('loadSettings / saveSettings', () => {
  it('uses defaults when nothing is stored', () => {
    expect(loadSettings(memoryStorage(), 'nl-NL')).toEqual({ lang: 'nl', sound: true });
  });

  it('round-trips saved settings', () => {
    const storage = memoryStorage();
    saveSettings(storage, { lang: 'en', sound: false });
    expect(storage.getItem('eg.lang')).toBe('en');
    expect(storage.getItem('eg.sound')).toBe('off');
    expect(loadSettings(storage, 'nl-NL')).toEqual({ lang: 'en', sound: false });
  });

  it('ignores invalid stored values', () => {
    const storage = memoryStorage({ 'eg.lang': 'fr', 'eg.sound': 'loud' });
    expect(loadSettings(storage, 'en-GB')).toEqual({ lang: 'en', sound: true });
  });

  it('falls back to defaults when storage throws or is missing', () => {
    expect(loadSettings(throwingStorage, 'nl')).toEqual({ lang: 'nl', sound: true });
    expect(loadSettings(null, 'en')).toEqual({ lang: 'en', sound: true });
    expect(() => saveSettings(throwingStorage, { lang: 'nl', sound: true })).not.toThrow();
    expect(() => saveSettings(null, { lang: 'nl', sound: true })).not.toThrow();
  });
});
