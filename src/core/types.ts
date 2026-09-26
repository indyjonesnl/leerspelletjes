export type Lang = 'nl' | 'en';
export const LANGS: readonly Lang[] = ['nl', 'en'];
export type Localized = Record<Lang, string>;

export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export interface Level {
  id: string;
  label: Localized;
  example: Localized;
  /** Read each question (and its choices) aloud automatically. */
  autoSpeak: boolean;
  /** Questions per round; defaults to ROUND_LENGTH (10). */
  roundLength?: number;
}

export interface Choice {
  id: string;
  label: Localized;
}

export interface Question {
  /** Identity of the question, used to avoid repeats within a round. */
  key: string;
  prompt: Localized;
  /** Text read aloud instead of the prompt, e.g. "zes keer zeven". */
  speech?: Localized;
  visual?: () => HTMLElement | SVGElement;
  /** Accessible name of the visual: `hidden` before answering, `revealed` after. */
  visualLabel?: { hidden: Localized; revealed: Localized };
  /** Optional help the child can show, e.g. a dot grid. */
  hint?: () => HTMLElement | SVGElement;
  /** 'choices' (default): answer buttons. 'visual': the visual's `[data-choice-id]` elements are the answers. */
  answerOn?: 'choices' | 'visual';
  /** The possible answers with their names. With answer buttons: 3 or 4 options, shuffled, containing the answer once. */
  choices: Choice[];
  answerId: string;
}

export interface Game {
  id: string;
  title: Localized;
  /** Relative URL of the tile icon, e.g. 'icons/clock.svg'. */
  icon: string;
  pickerLayout: 'list' | 'grid';
  levels: Level[];
  makeQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question;
}
