import type { AppContext, Screen } from './types';
import type { Game, Level, StudyContext } from '../core/types';
import { t } from '../core/i18n';
import { el } from '../core/ui';
import { gameHref, levelHref } from '../core/router';
import { loadStatus } from './loadStatus';

/** The "Leer eerst" screen: the game's study view for a level, then "Nu oefenen" and a way back. */
export function learnScreen(ctx: AppContext, game: Game, level: Level): Screen {
  const root = el('main', { class: 'learn' });
  let ready = false;
  let failed = false;
  let destroyed = false;
  const lang = () => ctx.settings.lang;
  const canSpeakNow = () => ctx.settings.sound && ctx.speech.isAvailable(lang());
  let speakingBuilt = false;

  function studyContext(): StudyContext {
    const L = lang();
    const canSpeak = canSpeakNow();
    speakingBuilt = canSpeak;
    return { lang: L, speak: canSpeak ? (text) => ctx.speech.speak(text, L) : undefined };
  }

  function render(): void {
    const L = lang();
    const title = el('h1', { class: 'learn-title' }, game.title[L]);
    if (!ready) {
      root.replaceChildren(title, loadStatus(L, failed, attempt));
      return;
    }
    root.replaceChildren(
      title,
      game.study!(level, studyContext()),
      el('div', { class: 'learn-actions' },
        el('a', { class: 'big-button', href: levelHref(game, level) }, t(L, 'practiseNow')),
        el('a', { class: 'back-link', href: gameHref(game) }, t(L, 'backToLevels')),
      ),
    );
  }

  function attempt(): void {
    failed = false;
    if (!game.load) {
      ready = true;
      render();
      return;
    }
    ready = false;
    render();
    game.load(level).then(
      () => {
        if (destroyed) return;
        ready = true;
        render();
      },
      () => {
        if (destroyed) return;
        failed = true;
        render();
      },
    );
  }

  const stopWatchingVoices = ctx.speech.onVoicesChanged(() => {
    if (ready && canSpeakNow() !== speakingBuilt) render();
  });
  attempt();

  return {
    el: root,
    update() {
      ctx.speech.stop();
      render();
    },
    destroy() {
      destroyed = true;
      stopWatchingVoices();
      ctx.speech.stop();
    },
  };
}
