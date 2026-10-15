import { el } from '../../core/ui';

/** Local, unmodified RVV SVG assets from NDW; provenance: sources.md. */
export function trafficSign(code: string): HTMLImageElement {
  return el('img', {
    src: `traffic-signs/${code}.svg`,
    alt: '',
    class: 'traffic-sign',
    'data-sign-code': code,
    decoding: 'async',
  });
}
