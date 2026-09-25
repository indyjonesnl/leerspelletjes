import type { Lang } from './types';

export interface Settings {
  lang: Lang;
  sound: boolean;
}

const LANG_KEY = 'eg.lang';
const SOUND_KEY = 'eg.sound';

/** localStorage, or null when the browser blocks it (even reading the property can throw). */
export function getStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function defaultLang(browserLang: string | undefined): Lang {
  return browserLang?.toLowerCase().startsWith('nl') ? 'nl' : 'en';
}

export function loadSettings(storage: Storage | null, browserLang: string | undefined): Settings {
  const settings: Settings = { lang: defaultLang(browserLang), sound: true };
  try {
    const lang = storage?.getItem(LANG_KEY);
    if (lang === 'nl' || lang === 'en') settings.lang = lang;
    const sound = storage?.getItem(SOUND_KEY);
    if (sound === 'on' || sound === 'off') settings.sound = sound === 'on';
  } catch {
    // Storage blocked: keep defaults.
  }
  return settings;
}

export function saveSettings(storage: Storage | null, settings: Settings): void {
  try {
    storage?.setItem(LANG_KEY, settings.lang);
    storage?.setItem(SOUND_KEY, settings.sound ? 'on' : 'off');
  } catch {
    // Storage blocked: settings last for this visit only.
  }
}
