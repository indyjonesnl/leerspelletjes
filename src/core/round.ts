import type { Game, Level, Question, Rng } from './types';

export const ROUND_LENGTH = 10;
const MAX_ATTEMPTS = 20;
const MAX_REPLACEMENTS = 5;

export interface AnswerResult {
  correct: boolean;
  answerId: string;
}

/** Runs one round of questions: generation without repeats, answering, scoring. */
export class Round {
  readonly length: number;
  current: Question;
  private asked: Question[] = [];
  private _index = 0;
  private _score = 0;
  private _result: AnswerResult | null = null;
  private replacements = 0;

  constructor(
    private readonly game: Game,
    private readonly level: Level,
    private readonly rng: Rng,
    length = ROUND_LENGTH,
  ) {
    this.length = length;
    this.current = this.generate();
  }

  get index(): number {
    return this._index;
  }

  get score(): number {
    return this._score;
  }

  get result(): AnswerResult | null {
    return this._result;
  }

  /** Answers the current question. Later calls return the first result unchanged. */
  answer(choiceId: string): AnswerResult {
    if (this._result) return this._result;
    const correct = choiceId === this.current.answerId;
    if (correct) this._score++;
    this._result = { correct, answerId: this.current.answerId };
    return this._result;
  }

  /** Moves to the next question. Returns false when the round is over. */
  next(): boolean {
    if (!this._result) throw new Error('Answer the current question first');
    if (this._index >= this.length - 1) return false;
    this._index++;
    this._result = null;
    this.current = this.generate();
    return true;
  }

  /** Swaps an unanswered question (e.g. its image failed to load). The old one is never asked again. */
  replaceCurrent(): boolean {
    if (this._result || this.replacements >= MAX_REPLACEMENTS) return false;
    this.replacements++;
    this.current = this.generate();
    return true;
  }

  private generate(): Question {
    let question = this.game.makeQuestion(this.level, this.rng, this.asked);
    for (let i = 1; i < MAX_ATTEMPTS && this.asked.some((q) => q.key === question.key); i++) {
      question = this.game.makeQuestion(this.level, this.rng, this.asked);
    }
    this.asked.push(question);
    return question;
  }
}

export function nextLevel(game: Game, level: Level): Level | undefined {
  const i = game.levels.findIndex((l) => l.id === level.id);
  return i >= 0 ? game.levels[i + 1] : undefined;
}
