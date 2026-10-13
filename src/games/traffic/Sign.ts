import { svgEl } from '../../core/ui';

const RED = '#d20a24';
const BLUE = '#0054a4';
const INK = '#111';

function person(colour: string): SVGGElement {
  const group = svgEl('g');
  group.append(svgEl('circle', { cx: 60, cy: 32, r: 8, fill: colour }),
    svgEl('path', { d: 'M56 47 66 59 81 65 M56 47 43 61 M56 47 55 71 37 92 M55 71 75 91', fill: 'none', stroke: colour, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  return group;
}

function bicycle(colour: string): SVGGElement {
  const group = svgEl('g', { fill: 'none', stroke: colour, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  group.append(svgEl('circle', { cx: 32, cy: 73, r: 14 }), svgEl('circle', { cx: 88, cy: 73, r: 14 }),
    svgEl('path', { d: 'M32 73 47 45 63 73 Z M47 45 H77 L63 73 M77 45 88 73 M73 34 H81 L77 45 M41 41 H51' }));
  return group;
}

/** Original SVG drawings of the Dutch RVV common sign shapes and symbols. */
export function trafficSign(code: string): SVGSVGElement {
  const svg = svgEl('svg', { viewBox: '0 0 120 120', class: 'traffic-sign', 'data-sign-code': code, focusable: 'false' });
  const circle = (fill: string) => svg.append(svgEl('circle', { cx: 60, cy: 60, r: 55, fill, stroke: '#fff', 'stroke-width': 2 }));
  const warning = code.startsWith('J');
  if (warning) {
    svg.append(svgEl('polygon', { points: '60,5 116,108 4,108', fill: RED, stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
      svgEl('polygon', { points: '60,25 98,98 22,98', fill: '#fff' }));
  } else if (code === 'B1') {
    svg.append(svgEl('polygon', { points: '60,4 116,60 60,116 4,60', fill: '#fff', stroke: INK, 'stroke-width': 2 }),
      svgEl('polygon', { points: '60,17 103,60 60,103 17,60', fill: '#ffdc00', stroke: INK, 'stroke-width': 1 }));
  } else if (code === 'B6') {
    svg.append(svgEl('polygon', { points: '4,12 116,12 60,113', fill: RED, stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
      svgEl('polygon', { points: '22,23 98,23 60,92', fill: '#fff' }));
  } else if (code === 'B7') {
    svg.append(svgEl('polygon', { points: '37,5 83,5 115,37 115,83 83,115 37,115 5,83 5,37', fill: RED, stroke: '#fff', 'stroke-width': 3 }));
    const text = svgEl('text', { x: 60, y: 74, 'text-anchor': 'middle', fill: '#fff', 'font-family': 'Arial, sans-serif', 'font-size': 35, 'font-weight': 700 });
    text.textContent = 'STOP';
    svg.append(text);
  } else if (code === 'C2') {
    circle(RED);
    svg.append(svgEl('rect', { x: 19, y: 47, width: 82, height: 26, fill: '#fff' }));
  } else if (code.startsWith('C')) {
    circle(RED);
    svg.append(svgEl('circle', { cx: 60, cy: 60, r: 42, fill: '#fff' }));
  } else if (code === 'G13') {
    svg.append(svgEl('rect', { x: 3, y: 34, width: 114, height: 52, rx: 3, fill: BLUE, stroke: '#fff', 'stroke-width': 3 }));
    const text = svgEl('text', { x: 60, y: 67, 'text-anchor': 'middle', fill: '#fff', 'font-family': 'Arial, sans-serif', 'font-size': 21, 'font-weight': 700 });
    text.textContent = 'fietspad';
    svg.append(text);
  } else if (code === 'L2') {
    svg.append(svgEl('rect', { x: 4, y: 4, width: 112, height: 112, rx: 3, fill: BLUE, stroke: '#fff', 'stroke-width': 2 }),
      svgEl('polygon', { points: '60,20 105,102 15,102', fill: '#fff' }));
  } else {
    circle(BLUE);
  }

  if (['C14', 'G11', 'J24'].includes(code)) {
    const bike = bicycle(code === 'G11' ? '#fff' : INK);
    if (warning) bike.setAttribute('transform', 'translate(15 27) scale(.75)');
    else if (code === 'C14') bike.setAttribute('transform', 'translate(9 7) scale(.85)');
    svg.append(bike);
  }
  if (['C16', 'G7', 'J22', 'L2'].includes(code)) {
    const walker = person(code === 'G7' ? '#fff' : INK);
    if (warning || code === 'L2') walker.setAttribute('transform', 'translate(15 26) scale(.75)');
    else if (code === 'C16') walker.setAttribute('transform', 'translate(8 7) scale(.85)');
    svg.append(walker);
    if (code === 'J22' || code === 'L2') {
      for (let i = 0; i < 4; i++) svg.append(svgEl('polygon', { points: `${30 + i * 15},89 ${39 + i * 15},89 ${34 + i * 15},98 ${25 + i * 15},98`, fill: INK }));
    }
  }
  if (code === 'D2') svg.append(svgEl('path', { d: 'M30 30 79 79 M59 84 88 88 84 59', fill: 'none', stroke: '#fff', 'stroke-width': 12, 'stroke-linejoin': 'miter' }));
  if (code === 'D4') svg.append(svgEl('path', { d: 'M51 96 V54 H35 L60 26 85 54 H69 V96 Z', fill: '#fff' }));
  if (code === 'D5') svg.append(svgEl('path', { d: 'M47 94 V52 Q47 40 59 40 H74 V25 L98 49 74 73 V58 H65 V94 Z', fill: '#fff' }));
  if (code === 'J16') {
    const worker = person(INK);
    worker.setAttribute('transform', 'translate(5 27) scale(.7)');
    svg.append(worker, svgEl('path', { d: 'M65 67 82 90', fill: 'none', stroke: INK, 'stroke-width': 4 }),
      svgEl('polygon', { points: '70,98 87,83 96,98', fill: INK }));
  }
  if (code === 'J21') {
    const first = person(INK);
    const second = person(INK);
    first.setAttribute('transform', 'translate(9 29) scale(.68)');
    second.setAttribute('transform', 'translate(45 48) scale(.48)');
    svg.append(first, second);
  }
  if (code === 'J37') svg.append(svgEl('path', { d: 'M55 42 H65 L63 77 H57 Z', fill: INK }), svgEl('circle', { cx: 60, cy: 88, r: 5, fill: INK }));
  return svg;
}
