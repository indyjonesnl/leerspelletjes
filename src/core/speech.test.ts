import { describe, it, expect, vi } from 'vitest';
import { pickVoice, createSpeech } from './speech';

const voice = (lang: string, localService = true, name = lang) =>
  ({ lang, localService, name }) as SpeechSynthesisVoice;

describe('pickVoice', () => {
  it('prefers nl-NL over other Dutch voices', () => {
    const v = pickVoice([voice('nl-BE'), voice('nl-NL'), voice('en-GB')], 'nl');
    expect(v?.lang).toBe('nl-NL');
  });

  it('prefers an on-device voice over an online one', () => {
    const v = pickVoice([voice('nl-NL', false), voice('nl-BE', true)], 'nl');
    expect(v?.lang).toBe('nl-BE');
  });

  it('prefers en-GB, then any English voice', () => {
    expect(pickVoice([voice('en-US'), voice('en-GB')], 'en')?.lang).toBe('en-GB');
    expect(pickVoice([voice('en-US')], 'en')?.lang).toBe('en-US');
  });

  it('accepts Android-style tags with underscores', () => {
    expect(pickVoice([voice('nl_NL')], 'nl')?.lang).toBe('nl_NL');
  });

  it('returns null when no voice matches', () => {
    expect(pickVoice([voice('de-DE')], 'nl')).toBeNull();
    expect(pickVoice([], 'en')).toBeNull();
  });
});

function fakeSynth(voices: SpeechSynthesisVoice[]) {
  return {
    getVoices: vi.fn(() => voices),
    speak: vi.fn(),
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}
const makeUtterance = (text: string) => ({ text }) as SpeechSynthesisUtterance;

describe('createSpeech', () => {
  it('speaks with the chosen voice after cancelling earlier speech', () => {
    const synth = fakeSynth([voice('nl-NL')]);
    const speech = createSpeech(synth as unknown as SpeechSynthesis, makeUtterance);
    speech.speak('Hoe laat is het?', 'nl');
    expect(synth.cancel).toHaveBeenCalled();
    const utterance = synth.speak.mock.calls[0][0];
    expect(utterance.text).toBe('Hoe laat is het?');
    expect(utterance.voice.lang).toBe('nl-NL');
    expect(utterance.lang).toBe('nl-NL');
  });

  it('reports availability per language and stays silent without a voice', () => {
    const synth = fakeSynth([voice('en-GB')]);
    const speech = createSpeech(synth as unknown as SpeechSynthesis, makeUtterance);
    expect(speech.isAvailable('en')).toBe(true);
    expect(speech.isAvailable('nl')).toBe(false);
    speech.speak('Hallo', 'nl');
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it('no synth: nothing is available and nothing throws', () => {
    const speech = createSpeech(undefined, makeUtterance);
    expect(speech.isAvailable('nl')).toBe(false);
    expect(() => speech.speak('Hallo', 'nl')).not.toThrow();
    expect(() => speech.stop()).not.toThrow();
    expect(() => speech.onVoicesChanged(() => {})()).not.toThrow();
  });

  it('never throws when the synth itself fails', () => {
    const synth = fakeSynth([voice('nl-NL')]);
    synth.speak.mockImplementation(() => {
      throw new Error('boom');
    });
    const speech = createSpeech(synth as unknown as SpeechSynthesis, makeUtterance);
    expect(() => speech.speak('Hallo', 'nl')).not.toThrow();
  });

  it('subscribes and unsubscribes to voiceschanged', () => {
    const synth = fakeSynth([]);
    const speech = createSpeech(synth as unknown as SpeechSynthesis, makeUtterance);
    const cb = () => {};
    const off = speech.onVoicesChanged(cb);
    expect(synth.addEventListener).toHaveBeenCalledWith('voiceschanged', cb);
    off();
    expect(synth.removeEventListener).toHaveBeenCalledWith('voiceschanged', cb);
  });
});
