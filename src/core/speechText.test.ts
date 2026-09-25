import { describe, it, expect } from 'vitest';
import { questionSpeech } from './speechText';
import type { Question } from './types';

const question: Question = {
  key: '3:0',
  prompt: { nl: 'Hoe laat is het?', en: 'What time is it?' },
  choices: [
    { id: '3:0', label: { nl: 'drie uur', en: "three o'clock" } },
    { id: '4:0', label: { nl: 'vier uur', en: "four o'clock" } },
    { id: '6:0', label: { nl: 'zes uur', en: "six o'clock" } },
  ],
  answerId: '3:0',
};

describe('questionSpeech', () => {
  it('reads only the prompt without choices', () => {
    expect(questionSpeech(question, 'nl', false)).toBe('Hoe laat is het?');
  });

  it('reads the prompt followed by the choices', () => {
    expect(questionSpeech(question, 'nl', true)).toBe('Hoe laat is het? drie uur, vier uur of zes uur');
    expect(questionSpeech(question, 'en', true)).toBe("What time is it? three o'clock, four o'clock or six o'clock");
  });

  it('prefers the speech text over the prompt', () => {
    const q = { ...question, speech: { nl: 'zes keer zeven', en: 'six times seven' } };
    expect(questionSpeech(q, 'en', false)).toBe('six times seven');
  });
});
