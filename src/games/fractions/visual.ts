import { svgEl } from '../../core/ui';

export type FractionShape = 'circle' | 'bar';

/** Each part has the same area. Circles rotate one shared sector; bars share a width. */
export function fractionVisual(numerator: number, denominator: number, kind: FractionShape): SVGSVGElement {
  const svg = svgEl('svg', {
    viewBox: kind === 'circle' ? '0 0 200 200' : '0 0 320 120',
    class: `fraction-visual fraction-${kind}`,
    'data-numerator': numerator,
    'data-denominator': denominator,
  });
  const angle = 360 / denominator;
  const radians = angle * Math.PI / 180;
  const endX = 100 + 84 * Math.sin(radians);
  const endY = 100 - 84 * Math.cos(radians);
  const sector = `M 100 100 L 100 16 A 84 84 0 ${angle > 180 ? 1 : 0} 1 ${endX} ${endY} Z`;
  for (let i = 0; i < denominator; i++) {
    const attrs = {
      class: `fraction-piece${i < numerator ? ' fraction-shaded' : ''}`,
      fill: i < numerator ? '#417a54' : '#fffdf4',
      stroke: '#263e31',
      'stroke-width': 1.5,
      'stroke-linejoin': 'round',
    };
    svg.append(kind === 'bar'
      ? svgEl('rect', { ...attrs, x: 10 + i * (300 / denominator), y: 20, width: 300 / denominator, height: 80 })
      : svgEl('path', { ...attrs, d: sector, transform: `rotate(${i * angle} 100 100)` }));
  }
  return svg;
}
