import type { AppContext, Screen } from './types';
import type { Game, Level, Rng } from '../core/types';
import { Round, nextLevel } from '../core/round';
import { createRng } from '../core/rng';
import { t } from '../core/i18n';
import { el } from '../core/ui';
import { questionSpeech } from '../core/speechText';
import { confetti, playCorrect, playWrong } from '../core/feedback';
import { levelHref } from '../core/router';

export const ADVANCE_DELAY_MS = 1000;

export function playScreen(ctx: AppContext, game: Game, level: Level, rng: Rng = createRng()): Screen {
  const root = el('main', { class: 'play' });
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
      if (round.score >= 8) confetti(root);
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
    const focusedChoiceId =
      activeBefore instanceof HTMLElement && activeBefore.classList.contains('choice') ? activeBefore.dataset.id : undefined;
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

    if (q.visual) {
      const visual = q.visual();
      const box = el('div', { class: 'visual' }, visual);
      if (q.visualLabel) {
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

    if (result) {
      body.append(el('p', { class: 'feedback' }, result.correct ? t(L, 'correct') : `${t(L, 'wrong')} ${answerLabel()}`));
      if (!result.correct) {
        const next = el('button', { type: 'button', class: 'continue' }, t(L, 'continue'));
        next.addEventListener('click', advance);
        body.append(next);
      }
    }

    if (focusedChoiceId) {
      const same = body.querySelector<HTMLButtonElement>(`.choice[data-id="${focusedChoiceId}"]`);
      if (same && !same.disabled) { same.focus(); return; }
    }
    if (focusedHint) {
      body.querySelector<HTMLButtonElement>('.hint-button')?.focus();
      return;
    }
    if ((focusWasInPlay || focusNextQuestion) && result === null) {
      body.querySelector<HTMLButtonElement>('.choice')?.focus();
      focusNextQuestion = false;
    }
  }

  function renderEnd(): void {
    const L = lang();
    const score = round.score;
    const message = score >= 8 ? 'endGreat' : score >= 5 ? 'endGood' : 'endPractice';
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

  function onKey(event: KeyboardEvent): void {
    if (destroyed || finished) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
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
