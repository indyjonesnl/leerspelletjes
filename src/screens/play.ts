import type { AppContext, Screen } from './types';
import type { Game, Level, Rng } from '../core/types';
import { Round, nextLevel } from '../core/round';
import { createRng } from '../core/rng';
import { t } from '../core/i18n';
import { el } from '../core/ui';
import { questionSpeech } from '../core/speechText';
import { confetti, playCorrect, playWrong } from '../core/feedback';
import { levelHref } from '../core/router';
import { loadStatus } from './loadStatus';
import { nearestInDirection, type Direction } from '../core/spatial';

export const ADVANCE_DELAY_MS = 1000;

/** Share of a round answered correctly for confetti and "endGreat" (8 of 10), and for "endGood" (5 of 10). */
const GREAT = 0.8;
const GOOD = 0.5;

/** Answer elements: choice buttons, or targets inside a visual (`answerOn: 'visual'`). */
const ANSWER_SELECTOR = '.choice, [data-choice-id]';
type Focusable = HTMLElement | SVGElement;
const ARROWS: Record<string, Direction> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };

function answerIdOf(node: Element): string | undefined {
  if (!node.matches(ANSWER_SELECTOR)) return undefined;
  return node.getAttribute('data-choice-id') ?? node.getAttribute('data-id') ?? undefined;
}

function isDisabled(node: Element): boolean {
  return (node instanceof HTMLButtonElement && node.disabled) || node.getAttribute('aria-disabled') === 'true';
}

function centreOf(node: Element): { x: number; y: number } {
  return { x: Number(node.getAttribute('data-cx')), y: Number(node.getAttribute('data-cy')) };
}

export function playScreen(ctx: AppContext, game: Game, level: Level, rng: Rng = createRng()): Screen {
  const root = el('main', { class: 'play' });
  if (!game.load) return roundScreen(ctx, game, level, rng, root);

  let inner: Screen | undefined;
  let failed = false;
  let destroyed = false;

  function renderStatus(): void {
    root.replaceChildren(loadStatus(ctx.settings.lang, failed, attempt));
  }

  function attempt(): void {
    failed = false;
    renderStatus();
    game.load!(level).then(
      () => {
        if (destroyed) return;
        root.replaceChildren();
        inner = roundScreen(ctx, game, level, rng, root);
      },
      () => {
        if (destroyed) return;
        failed = true;
        renderStatus();
      },
    );
  }

  attempt();
  return {
    el: root,
    update() {
      if (inner) inner.update?.();
      else renderStatus();
    },
    destroy() {
      destroyed = true;
      inner?.destroy?.();
    },
  };
}

function roundScreen(ctx: AppContext, game: Game, level: Level, rng: Rng, root: HTMLElement): Screen {
  const live = el('p', { class: 'sr-only', 'aria-live': 'polite' });
  const body = el('div');
  root.append(live, body);

  let round = new Round(game, level, rng);
  let chosenId: string | null = null;
  let hintShown = false;
  let finished = false;
  let destroyed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let speakerShown = ctx.speech.isAvailable(ctx.settings.lang);
  /** Whether focus should move to the first choice once the next question is shown (set when a
   *  correct answer is chosen while focus is in the play area; the answered choice is disabled and
   *  removed before the auto-advance timer fires, so real focus can't carry it across the wait). */
  let focusNextQuestion = false;
  const lang = () => ctx.settings.lang;

  function speakQuestion(automatic: boolean): void {
    if (!ctx.speech.isAvailable(lang())) return;
    if (automatic && (!level.autoSpeak || !ctx.settings.sound)) return;
    ctx.speech.speak(questionSpeech(round.current, lang(), level.autoSpeak), lang());
  }

  function showQuestion(): void {
    render();
    live.textContent = round.current.prompt[lang()];
    speakQuestion(true);
  }

  function choose(id: string): void {
    if (destroyed || finished || round.result) return;
    const wasFocusedInPlay = !!document.activeElement && body.contains(document.activeElement);
    chosenId = id;
    const result = round.answer(id);
    if (ctx.settings.sound) (result.correct ? playCorrect : playWrong)();
    render();
    live.textContent = result.correct ? t(lang(), 'correct') : `${t(lang(), 'wrong')} ${answerLabel()}`;
    if (result.correct) {
      focusNextQuestion = wasFocusedInPlay;
      timer = setTimeout(advance, ADVANCE_DELAY_MS);
    } else {
      body.querySelector<HTMLButtonElement>('.continue')?.focus();
    }
  }

  function advance(): void {
    clearTimeout(timer);
    timer = undefined;
    if (destroyed || !round.result) return;
    if (round.next()) {
      chosenId = null;
      hintShown = false;
      showQuestion();
    } else {
      finished = true;
      render();
      live.textContent = t(lang(), 'score', { score: round.score, total: round.length });
      if (round.score >= round.length * GREAT) confetti(root);
    }
  }

  function onVisualError(): void {
    if (destroyed || round.result) return;
    if (round.replaceCurrent()) showQuestion();
  }

  function answerLabel(): string {
    const q = round.current;
    return q.choices.find((c) => c.id === q.answerId)!.label[lang()];
  }

  function render(): void {
    if (finished) return renderEnd();
    const L = lang();
    const q = round.current;
    const result = round.result;

    const activeBefore = document.activeElement;
    const focusedChoiceId = activeBefore instanceof Element ? answerIdOf(activeBefore) : undefined;
    const focusedHint = activeBefore instanceof HTMLElement && activeBefore.classList.contains('hint-button');
    const focusWasInPlay = !!activeBefore && body.contains(activeBefore);

    body.replaceChildren();

    const top = el('div', { class: 'play-top' },
      el('div', {},
        el('h1', { class: 'play-title' }, game.title[L]),
        el('p', { class: 'progress' }, t(L, 'questionProgress', { n: round.index + 1, total: round.length })),
      ),
    );
    if (ctx.speech.isAvailable(L)) {
      const speak = el('button', { type: 'button', class: 'icon-button speak', 'aria-label': t(L, 'speak') }, '🔈');
      speak.addEventListener('click', () => speakQuestion(false));
      top.append(speak);
    }
    body.append(top);

    const visualMode = q.answerOn === 'visual';
    if (q.visual) {
      const picked = result && chosenId ? { id: chosenId, answerId: q.answerId } : null;
      const visual = q.visual({ lang: L, picked });
      const box = el('div', { class: 'visual' }, visual);
      if (visualMode) {
        box.setAttribute('role', 'group');
        if (q.visualLabel) box.setAttribute('aria-label', (result ? q.visualLabel.revealed : q.visualLabel.hidden)[L]);
        box.addEventListener('click', (event) => {
          const hit = event.target instanceof Element ? event.target.closest('[data-choice-id]') : null;
          if (hit && !isDisabled(hit)) choose(hit.getAttribute('data-choice-id')!);
        });
      } else if (q.visualLabel) {
        box.setAttribute('role', 'img');
        box.setAttribute('aria-label', (result ? q.visualLabel.revealed : q.visualLabel.hidden)[L]);
        visual.setAttribute('aria-hidden', 'true');
      }
      const images = visual instanceof HTMLImageElement ? [visual] : [...visual.querySelectorAll('img')];
      for (const img of images) {
        img.addEventListener('error', () => { if (img.isConnected) onVisualError(); }, { once: true });
      }
      body.append(box);
    }

    if (q.hint) {
      const hintButton = el('button', { type: 'button', class: 'hint-button', 'aria-expanded': String(hintShown) }, t(L, 'help'));
      hintButton.addEventListener('click', () => {
        hintShown = !hintShown;
        render();
      });
      body.append(hintButton);
      if (hintShown) body.append(el('div', { class: 'hint' }, q.hint()));
    }

    body.append(el('p', { class: 'prompt' }, q.prompt[L]));

    if (!visualMode) {
      const grid = el('div', { class: 'choices' });
      q.choices.forEach((c, i) => {
        const isAnswer = result !== null && c.id === q.answerId;
        const isWrongPick = result !== null && !result.correct && c.id === chosenId;
        const classes = ['choice', isAnswer ? 'correct' : '', isWrongPick ? 'wrong' : ''].filter(Boolean).join(' ');
        const button = el('button', { type: 'button', class: classes, 'data-id': c.id, disabled: result !== null },
          el('span', { class: 'key', 'aria-hidden': 'true' }, String(i + 1)),
          el('span', { class: 'label' }, c.label[L]),
        );
        if (isAnswer) button.append(el('span', { class: 'mark', role: 'img', 'aria-label': t(L, 'markRight') }, '✓'));
        if (isWrongPick) button.append(el('span', { class: 'mark', role: 'img', 'aria-label': t(L, 'markWrong') }, '✗'));
        button.addEventListener('click', () => choose(c.id));
        grid.append(button);
      });
      body.append(grid);
    }

    if (result) {
      body.append(el('p', { class: 'feedback' }, result.correct ? t(L, 'correct') : `${t(L, 'wrong')} ${answerLabel()}`));
      if (!result.correct) {
        const next = el('button', { type: 'button', class: 'continue' }, t(L, 'continue'));
        next.addEventListener('click', advance);
        body.append(next);
      }
    }

    if (focusedChoiceId) {
      const same = [...body.querySelectorAll<Focusable>(ANSWER_SELECTOR)].find((n) => answerIdOf(n) === focusedChoiceId);
      if (same && !isDisabled(same)) { same.focus(); return; }
    }
    if (focusedHint) {
      body.querySelector<HTMLButtonElement>('.hint-button')?.focus();
      return;
    }
    if ((focusWasInPlay || focusNextQuestion) && result === null) {
      body.querySelector<Focusable>(ANSWER_SELECTOR)?.focus();
      focusNextQuestion = false;
    }
  }

  function renderEnd(): void {
    const L = lang();
    const score = round.score;
    const message = score >= round.length * GREAT ? 'endGreat' : score >= round.length * GOOD ? 'endGood' : 'endPractice';
    const activeBefore = document.activeElement;
    const focusWasInPlay = (!!activeBefore && body.contains(activeBefore)) || focusNextQuestion;
    focusNextQuestion = false;
    const again = el('button', { type: 'button', class: 'big-button' }, t(L, 'playAgain'));
    again.addEventListener('click', () => {
      round = new Round(game, level, rng);
      finished = false;
      chosenId = null;
      hintShown = false;
      showQuestion();
    });
    const following = nextLevel(game, level);
    body.replaceChildren(
      el('section', { class: 'end' },
        el('h1', {}, t(L, 'score', { score, total: round.length })),
        el('p', {}, t(L, message)),
        again,
        ...(following ? [el('a', { class: 'big-button', href: levelHref(game, following) }, t(L, 'nextLevel'))] : []),
        el('a', { class: 'big-button secondary', href: '#/' }, t(L, 'home')),
      ),
    );
    if (focusWasInPlay) again.focus();
  }

  function onVisualKey(event: KeyboardEvent): void {
    const n = Number(event.key);
    if (Number.isInteger(n) && n >= 1) {
      const numbered = body.querySelector(`[data-choice-id][data-key="${n}"]`);
      if (numbered) {
        event.preventDefault();
        choose(numbered.getAttribute('data-choice-id')!);
      }
      return;
    }
    const active = document.activeElement;
    if (!active || !active.matches('[data-choice-id]') || !body.contains(active)) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(active.getAttribute('data-choice-id')!);
      return;
    }
    const dir = ARROWS[event.key];
    if (!dir) return;
    event.preventDefault();
    const others = [...body.querySelectorAll<Focusable>('[data-choice-id]')].filter((t) => t !== active && !isDisabled(t));
    const i = nearestInDirection(centreOf(active), others.map(centreOf), dir);
    if (i >= 0) others[i].focus();
  }

  function onKey(event: KeyboardEvent): void {
    if (destroyed || finished) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (round.current.answerOn === 'visual') {
      onVisualKey(event);
      return;
    }
    const buttons = [...body.querySelectorAll<HTMLButtonElement>('.choice')];
    const n = Number(event.key);
    if (Number.isInteger(n) && n >= 1 && n <= buttons.length) {
      event.preventDefault();
      choose(buttons[n - 1].dataset.id!);
      return;
    }
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      buttons[(i + 1) % buttons.length].focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      buttons[(i - 1 + buttons.length) % buttons.length].focus();
    }
  }

  document.addEventListener('keydown', onKey);
  const stopWatchingVoices = ctx.speech.onVoicesChanged(() => {
    const available = ctx.speech.isAvailable(lang());
    if (available !== speakerShown) {
      speakerShown = available;
      render();
    }
  });

  showQuestion();

  return {
    el: root,
    update() {
      ctx.speech.stop();
      speakerShown = ctx.speech.isAvailable(lang());
      render();
      live.textContent = finished
        ? t(lang(), 'score', { score: round.score, total: round.length })
        : round.current.prompt[lang()];
    },
    destroy() {
      destroyed = true;
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      stopWatchingVoices();
      ctx.speech.stop();
    },
  };
}
