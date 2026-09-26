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

  it('joins the prompt and choices with a colon when the prompt has no trailing punctuation', () => {
    const q: Question = {
      key: '6:7',
      prompt: { nl: '6 keer 7', en: '6 times 7' },
      choices: [
        { id: 'a', label: { nl: '42', en: '42' } },
        { id: 'b', label: { nl: '35', en: '35' } },
        { id: 'c', label: { nl: '49', en: '49' } },
        { id: 'd', label: { nl: '43', en: '43' } },
      ],
      answerId: 'a',
    };
    expect(questionSpeech(q, 'nl', true)).toBe('6 keer 7: 42, 35, 49 of 43');
  });

  it('never lists the choices of a question answered on the visual', () => {
    const q: Question = {
      key: 'DE',
      prompt: { nl: 'Waar ligt Duitsland?', en: 'Where is Germany?' },
      answerOn: 'visual',
      choices: [
        { id: 'DE', label: { nl: 'Duitsland', en: 'Germany' } },
        { id: 'FR', label: { nl: 'Frankrijk', en: 'France' } },
      ],
      answerId: 'DE',
    };
    expect(questionSpeech(q, 'nl', true)).toBe('Waar ligt Duitsland?');
  });
});
