import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import './styles.css';
import { GAMES } from './games/registry';
import { resolveRoute, type Route } from './core/router';
import { getStorage, loadSettings, saveSettings } from './core/settings';
import { createSpeech } from './core/speech';
import { t } from './core/i18n';
import { el } from './core/ui';
import type { AppContext, Screen } from './screens/types';
import { header } from './screens/header';
import { homeScreen } from './screens/home';
import { levelsScreen } from './screens/levels';
import { privacyScreen } from './screens/privacy';
import { playScreen } from './screens/play';
import { learnScreen } from './screens/learn';

const storage = getStorage();
const app = document.getElementById('app')!;
const headerSlot = el('div');
const screenSlot = el('div', { class: 'screen' });
app.append(headerSlot, screenSlot);

let screen: Screen | null = null;
let showHome = false;

const ctx: AppContext = {
  settings: loadSettings(storage, navigator.language),
  speech: createSpeech(),
  games: GAMES,
  setSettings(patch) {
    ctx.settings = { ...ctx.settings, ...patch };
    saveSettings(storage, ctx.settings);
    renderHeader();
    if (screen?.update) screen.update();
    else renderScreen();
  },
};

function renderHeader(): void {
  const active = document.activeElement;
  const focusKey =
    active instanceof HTMLElement && headerSlot.contains(active) ? active.getAttribute('data-focus-key') : null;
  document.documentElement.lang = ctx.settings.lang;
  document.title = t(ctx.settings.lang, 'appTitle');
  headerSlot.replaceChildren(header(ctx, showHome));
  if (focusKey) headerSlot.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus();
}

function createScreen(route: Route): Screen {
  switch (route.name) {
    case 'home': return homeScreen(ctx);
    case 'privacy': return privacyScreen(ctx);
    case 'levels': return levelsScreen(ctx, route.game);
    case 'play': return playScreen(ctx, route.game, route.level);
    case 'learn': return learnScreen(ctx, route.game, route.level);
  }
}

function renderScreen(): void {
  const route = resolveRoute(location.hash, GAMES);
  if (!route) {
    location.replace('#/'); // fires hashchange, which renders home
    return;
  }
  screen?.destroy?.();
  showHome = route.name !== 'home';
  screen = createScreen(route);
  screenSlot.replaceChildren(screen.el);
  renderHeader();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', renderScreen);
renderScreen();
