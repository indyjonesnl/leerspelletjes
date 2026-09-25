import type { Lang } from './types';

/** Preferred language tags in order: exact region first, then any voice of the language. */
const PREFERRED: Record<Lang, string[]> = { nl: ['nl-nl', 'nl'], en: ['en-gb', 'en'] };

const normalize = (tag: string) => tag.replace('_', '-').toLowerCase();

function matches(voice: SpeechSynthesisVoice, pref: string): boolean {
  const tag = normalize(voice.lang);
  return pref.includes('-') ? tag === pref : tag === pref || tag.startsWith(`${pref}-`);
}

/** Picks the best voice for a language. On-device voices always win over online ones (privacy). */
export function pickVoice(voices: readonly SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | null {
  for (const local of [true, false]) {
    for (const pref of PREFERRED[lang]) {
      const found = voices.find((v) => v.localService === local && matches(v, pref));
      if (found) return found;
    }
  }
  return null;
}

export interface Speech {
  isAvailable(lang: Lang): boolean;
  speak(text: string, lang: Lang): void;
  stop(): void;
  /** Voices load asynchronously in most browsers. Returns an unsubscribe function. */
  onVoicesChanged(callback: () => void): () => void;
}

export function createSpeech(
  synth: SpeechSynthesis | undefined = globalThis.speechSynthesis,
  makeUtterance: (text: string) => SpeechSynthesisUtterance = (text) => new SpeechSynthesisUtterance(text),
): Speech {
  const voiceFor = (lang: Lang): SpeechSynthesisVoice | null => {
    if (!synth) return null;
    try {
      return pickVoice(synth.getVoices(), lang);
    } catch {
      return null;
    }
  };

  return {
    isAvailable: (lang) => voiceFor(lang) !== null,
    speak(text, lang) {
      const voice = voiceFor(lang);
      if (!synth || !voice) return;
      try {
        synth.cancel();
        const utterance = makeUtterance(text);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = 0.9;
        synth.speak(utterance);
      } catch {
        // Speech must never block play.
      }
    },
    stop() {
      try {
        synth?.cancel();
      } catch {
        // Ignore.
      }
    },
    onVoicesChanged(callback) {
      if (!synth) return () => {};
      synth.addEventListener('voiceschanged', callback);
      return () => synth.removeEventListener('voiceschanged', callback);
    },
  };
}
