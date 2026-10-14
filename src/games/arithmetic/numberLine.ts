import { svgEl } from '../../core/ui';

export interface ArithmeticStep { from: number; to: number; amount: number }

/** An empty number line: space separates steps; it does not represent a measured distance. */
export function numberLine(steps: readonly ArithmeticStep[], reveal: boolean, unknownJump = false): SVGElement {
  const values = [steps[0].from, ...steps.map((step) => step.to)];
  const forward = values[values.length - 1] >= values[0];
  const x = (index: number) => 32 + 376 * (forward ? index : values.length - 1 - index) / (values.length - 1);
  const labels = values.map((value, index) => !reveal && index === values.length - 1 ? '?' : String(value));
  const amounts = steps.map((step) => unknownJump ? '+?' : `${step.amount > 0 ? '+' : '−'}${Math.abs(step.amount)}`);
  const root = svgEl('svg', { class: 'arithmetic-line', viewBox: '0 0 440 126', role: 'img', 'aria-label': labels.map((label, index) => `${label}${amounts[index] ? ` ${amounts[index]} →` : ''}`).join(' ') });
  root.append(svgEl('line', { x1: 14, x2: 426, y1: 80, y2: 80, class: 'jump-axis' }));
  for (const [index, label] of labels.entries()) {
    root.append(svgEl('line', { x1: x(index), x2: x(index), y1: 75, y2: 87, class: 'jump-tick' }));
    const text = svgEl('text', { x: x(index), y: 111, 'text-anchor': 'middle', class: 'jump-label' });
    text.textContent = label;
    root.append(text);
  }
  for (const [index] of steps.entries()) {
    const a = x(index), b = x(index + 1), middle = (a + b) / 2;
    root.append(svgEl('path', { d: `M ${a} 74 Q ${middle} 12 ${b} 74`, class: 'jump-arc' }));
    const direction = b > a ? 1 : -1;
    root.append(svgEl('path', { d: `M ${b} 74 L ${b - direction * 10} 68 L ${b - direction * 3} 62 Z`, class: 'jump-arrow' }));
    const text = svgEl('text', { x: middle, y: 32, 'text-anchor': 'middle', class: 'jump-amount' });
    text.textContent = amounts[index];
    root.append(text);
  }
  return root;
}
