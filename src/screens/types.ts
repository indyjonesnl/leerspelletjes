import type { Game } from '../core/types';
import type { Settings } from '../core/settings';
import type { Speech } from '../core/speech';

export interface AppContext {
  settings: Settings;
  setSettings(patch: Partial<Settings>): void;
  speech: Speech;
  games: readonly Game[];
}

export interface Screen {
  el: HTMLElement;
  /** Called after a settings change. Screens without it are re-created instead. */
  update?(): void;
  destroy?(): void;
}
