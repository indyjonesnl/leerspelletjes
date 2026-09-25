import type { Lang, Localized } from './types';
import { nl, type StringKey } from '../i18n/nl';
import { en } from '../i18n/en';

export type { StringKey };

const STRINGS: Record<Lang, Record<StringKey, string>> = { nl, en };

/** Translates a UI string and fills in `{name}` placeholders. */
export function t(lang: Lang, key: StringKey, vars: Record<string, string | number> = {}): string {
  return STRINGS[lang][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Same text in every language, e.g. for numbers. */
export function both(text: string): Localized {
  return { nl: text, en: text };
}
