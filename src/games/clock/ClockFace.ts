import { el, svgEl } from '../../core/ui';
import { formatDigital } from './words';

export function handAngles(h: number, m: number): { hour: number; minute: number } {
  return { hour: ((h % 12) + m / 60) * 30, minute: m * 6 };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const point = (radius: number, degrees: number) => {
  const a = (degrees * Math.PI) / 180;
  return { x: round2(100 + radius * Math.sin(a)), y: round2(100 - radius * Math.cos(a)) };
};

/** Analog clock, 200×200 viewBox, centre at (100, 100). */
export function clockFace(h: number, m: number): SVGSVGElement {
  const svg = svgEl('svg', { viewBox: '0 0 200 200', class: 'clock-face' });
  svg.append(svgEl('circle', { cx: 100, cy: 100, r: 95, class: 'clock-rim' }));
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const from = point(major ? 80 : 86, i * 6);
    const to = point(90, i * 6);
    svg.append(svgEl('line', { x1: from.x, y1: from.y, x2: to.x, y2: to.y, class: major ? 'tick-major' : 'tick' }));
  }
  for (let n = 1; n <= 12; n++) {
    const p = point(66, n * 30);
    const text = svgEl('text', { x: p.x, y: p.y, class: 'clock-number', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    text.textContent = String(n);
    svg.append(text);
  }
  const { hour, minute } = handAngles(h, m);
  svg.append(svgEl('line', { x1: 100, y1: 100, x2: 100, y2: 52, class: 'hand-hour', transform: `rotate(${hour} 100 100)` }));
  svg.append(svgEl('line', { x1: 100, y1: 100, x2: 100, y2: 24, class: 'hand-minute', transform: `rotate(${minute} 100 100)` }));
  svg.append(svgEl('circle', { cx: 100, cy: 100, r: 5, class: 'clock-center' }));
  return svg;
}

export function digitalClock(h: number, m: number): HTMLElement {
  return el('div', { class: 'digital-clock' }, formatDigital(h, m));
}
