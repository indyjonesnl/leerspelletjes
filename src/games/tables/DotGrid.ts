import { svgEl } from '../../core/ui';

const GAP = 24;

/** `rows` rows of `cols` dots, so children can count a × n. */
export function dotGrid(rows: number, cols: number): SVGSVGElement {
  const svg = svgEl('svg', { viewBox: `0 0 ${cols * GAP} ${rows * GAP}`, class: 'dot-grid' });
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      svg.append(svgEl('circle', { cx: c * GAP + GAP / 2, cy: r * GAP + GAP / 2, r: 8, class: 'dot' }));
    }
  }
  return svg;
}
