import type { AppContext, Screen } from './types';
import { t } from '../core/i18n';
import { el } from '../core/ui';

export function privacyScreen(ctx: AppContext): Screen {
  const lang = ctx.settings.lang;
  const paragraphs = t(lang, 'privacyBody').split('\n\n').map((text) => el('p', {}, text));
  return { el: el('main', { class: 'privacy' }, el('h1', {}, t(lang, 'privacy')), ...paragraphs) };
}
