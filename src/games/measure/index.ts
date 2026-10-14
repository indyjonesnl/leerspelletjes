import type { Game, Lang, Level, Localized, Question, Rng, StudyContext } from '../../core/types';
import { pickFresh } from '../../core/pick';

const text = (nl: string, en: string): Localized => ({ nl, en });
const units = [
  ['cm', 'centimeter', 'centimetres'], ['m', 'meter', 'metres'],
  ['kg', 'kilogram', 'kilograms'], ['l', 'liter', 'litres'],
] as const;
const objects = [
  ['cm', 'de lengte van een potlood', 'the length of a pencil'],
  ['cm', 'de breedte van een gum', 'the width of an eraser'],
  ['cm', 'de lengte van een sleutel', 'the length of a key'],
  ['cm', 'de breedte van een boek', 'the width of a book'],
  ['m', 'de lengte van een klaslokaal', 'the length of a classroom'],
  ['m', 'de hoogte van een boom', 'the height of a tree'],
  ['m', 'de lengte van een zwembad', 'the length of a swimming pool'],
  ['m', 'de lengte van een bus', 'the length of a bus'],
  ['kg', 'het gewicht van een kind', 'the weight of a child'],
  ['kg', 'het gewicht van een hond', 'the weight of a dog'],
  ['kg', 'het gewicht van een fiets', 'the weight of a bicycle'],
  ['kg', 'het gewicht van een koffer', 'the weight of a suitcase'],
  ['l', 'de hoeveelheid water in een emmer', 'the amount of water in a bucket'],
  ['l', 'de hoeveelheid water in een gieter', 'the amount of water in a watering can'],
  ['l', 'de hoeveelheid melk in een pak', 'the amount of milk in a carton'],
  ['l', 'de hoeveelheid water in een grote fles', 'the amount of water in a large bottle'],
] as const;

const levels: Level[] = [
  { id: 'units', label: text('Welke eenheid?', 'Which unit?'), example: text('cm, m, kg of l', 'cm, m, kg or l'), autoSpeak: true },
  { id: 'ruler', label: text('Meten met een liniaal', 'Measure with a ruler'), example: text('Van 2 tot 7: 5 cm', 'From 2 to 7: 5 cm'), autoSpeak: true },
  { id: 'weight', label: text('Hoe zwaar?', 'How heavy?'), example: text('Lees de weegschaal in kg', 'Read the scale in kg'), autoSpeak: true },
  { id: 'volume', label: text('Hoeveel liter?', 'How many litres?'), example: text('Vergelijk kannen met water', 'Compare jugs of water'), autoSpeak: true },
];

function element<K extends keyof HTMLElementTagNameMap>(tag: K, content?: string, cls?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (content) el.textContent = content;
  if (cls) el.className = cls;
  return el;
}

function svgNode(tag: string, attrs: Record<string, string | number>, content?: string): SVGElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (content !== undefined) node.textContent = content;
  return node;
}
function drawing(viewBox: string, label: string): SVGSVGElement {
  const svg = svgNode('svg', { viewBox, role: 'img', 'aria-label': label, class: 'measure-svg', width: '100%' }) as SVGSVGElement;
  return svg;
}

function ruler(start: number, end: number, lang: Lang): SVGSVGElement {
  const description = text(`Liniaal met markeringen van 0 tot 12 cm. Het potlood begint bij ${start} cm en eindigt bij ${end} cm.`, `Ruler marked from 0 to 12 cm. The pencil starts at ${start} cm and ends at ${end} cm.`);
  const svg = drawing('0 0 360 145', description[lang]);
  svg.append(svgNode('rect', { x: 14, y: 64, width: 332, height: 64, rx: 8, fill: '#fff3cc', stroke: '#70592e', 'stroke-width': 2 }));
  for (let i = 0; i <= 12; i++) {
    const x = 24 + i * 26;
    svg.append(svgNode('line', { x1: x, x2: x, y1: 65, y2: 88, stroke: '#26334b', 'stroke-width': 2 }));
    svg.append(svgNode('text', { x, y: 111, 'text-anchor': 'middle', 'font-size': 17, fill: '#26334b' }, String(i)));
  }
  const a = 24 + start * 26, b = 24 + end * 26;
  svg.append(svgNode('path', { d: `M ${a} 30 L ${b - 10} 30 L ${b} 42 L ${b - 10} 54 L ${a} 54 Z`, fill: '#f3a546', stroke: '#70441d', 'stroke-width': 2 }));
  for (const x of [a, b]) svg.append(svgNode('line', { x1: x, x2: x, y1: 23, y2: 89, stroke: '#26334b', 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
  svg.append(svgNode('text', { x: 336, y: 141, 'text-anchor': 'end', 'font-size': 15, fill: '#26334b' }, 'cm'));
  return svg;
}

function scale(weight: number, lang: Lang): SVGSVGElement {
  const svg = drawing('0 0 360 235', text(`Weegschaal in kg met markeringen van 0 tot 12. De wijzer wijst naar ${weight}.`, `Scale in kg, marked from 0 to 12. The pointer points to ${weight}.`)[lang]);
  svg.append(svgNode('path', { d: 'M 28 184 A 152 152 0 0 1 332 184 L 332 218 L 28 218 Z', fill: '#eaf3ff', stroke: '#26334b', 'stroke-width': 2 }));
  const point = (n: number, radius: number) => {
    const angle = Math.PI - n * Math.PI / 12;
    return [180 + Math.cos(angle) * radius, 184 - Math.sin(angle) * radius];
  };
  for (let n = 0; n <= 12; n++) {
    const [x1, y1] = point(n, 120), [x2, y2] = point(n, 132), [x, y] = point(n, 151);
    svg.append(svgNode('line', { x1, y1, x2, y2, stroke: '#26334b', 'stroke-width': 2 }));
    svg.append(svgNode('text', { x, y: y + 6, class: 'measure-scale-mark', 'text-anchor': 'middle', 'font-size': 18, fill: '#26334b' }, String(n)));
  }
  const [x, y] = point(weight, 118);
  svg.append(svgNode('line', { x1: 180, y1: 184, x2: x, y2: y, stroke: '#b94024', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  svg.append(svgNode('circle', { cx: 180, cy: 184, r: 7, fill: '#26334b' }));
  svg.append(svgNode('text', { x: 180, y: 215, 'text-anchor': 'middle', 'font-size': 20, fill: '#26334b' }, 'kg'));
  return svg;
}

function jugs(values: number[], lang: Lang): SVGSVGElement {
  const label = text('Vier kannen: ', 'Four jugs: ')[lang] + values.map((v, i) => `${'ABCD'[i]}: ${v} l`).join(', ');
  const svg = drawing('0 0 360 210', label);
  values.forEach((value, i) => {
    const x = i * 88 + 8;
    svg.append(svgNode('path', { d: `M ${x + 60} 43 Q ${x + 88} 43 ${x + 82} 83 Q ${x + 80} 98 ${x + 60} 94`, fill: 'none', stroke: '#26334b', 'stroke-width': 3 }));
    svg.append(svgNode('rect', { x, y: 32, width: 60, height: 132, rx: 5, fill: '#f3f8ff', stroke: '#26334b', 'stroke-width': 2 }));
    svg.append(svgNode('rect', { x: x + 2, y: 162 - value * 20, width: 56, height: value * 20, fill: '#77c9ed' }));
    for (let n = 1; n <= 6; n++) svg.append(svgNode('line', { x1: x + 44, x2: x + 58, y1: 162 - n * 20, y2: 162 - n * 20, stroke: '#26334b' }));
    svg.append(svgNode('text', { x: x + 30, y: 23, 'text-anchor': 'middle', 'font-size': 21, fill: '#26334b' }, 'ABCD'[i]));
    svg.append(svgNode('text', { x: x + 30, y: 195, 'text-anchor': 'middle', 'font-size': 21, fill: '#26334b' }, `${value} l`));
  });
  return svg;
}

function numericChoices(answer: number, unit: string, rng: Rng) {
  const values = [answer];
  for (const n of [answer - 1, answer + 1, answer + 2, answer - 2, 1, 2, 3, 4]) {
    if (n > 0 && !values.includes(n) && values.length < 4) values.push(n);
  }
  return rng.shuffle(values).map(n => ({ id: String(n), label: text(`${n} ${unit}`, `${n} ${unit}`) }));
}

function makeQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  let key: string, prompt: Localized, answerId: string, choices: Question['choices'], explanation: Localized;
  let draw: (lang: Lang) => HTMLElement | SVGElement;
  switch (level.id) {
    case 'units': {
      const index = pickFresh(objects.map((_, i) => i), previous, i => `units:${i}`, rng);
      const [unit, nl, en] = objects[index];
      key = `units:${index}`; answerId = unit;
      prompt = text(`Welke eenheid past het best bij ${nl}?`, `Which unit best fits ${en}?`);
      choices = rng.shuffle(units).map(([id, nlName, enName]) => ({ id, label: text(`${id} (${nlName})`, `${id} (${enName})`) }));
      const reason = unit === 'cm' ? text('Kleine lengtes meten we in centimeter.', 'We measure small lengths in centimetres.')
        : unit === 'm' ? text('Grote lengtes meten we in meter.', 'We measure large lengths in metres.')
        : unit === 'kg' ? text('Gewicht meten we in kilogram.', 'We measure weight in kilograms.')
        : text('Hoeveel vloeistof ergens in past meten we in liter.', 'We measure how much liquid a container holds in litres.');
      explanation = text(`${unit}: ${reason.nl}`, `${unit}: ${reason.en}`);
      draw = lang => element('p', text(nl, en)[lang], 'measure-object');
      break;
    }
    case 'ruler': {
      const pool = Array.from({ length: 5 }, (_, start) => Array.from({ length: 8 }, (_, i) => ({ start, end: start + i + 1 }))).flat();
      const { start, end } = pickFresh(pool, previous, p => `ruler:${p.start}:${p.end}`, rng);
      key = `ruler:${start}:${end}`; answerId = String(end - start);
      prompt = text('Hoe lang is het potlood?', 'How long is the pencil?');
      choices = numericChoices(end - start, 'cm', rng);
      explanation = text(`Eindpunt − beginpunt: ${end} − ${start} = ${end - start} cm.`, `End − start: ${end} − ${start} = ${end - start} cm.`);
      draw = lang => ruler(start, end, lang);
      break;
    }
    case 'weight': {
      const weight = pickFresh(Array.from({ length: 12 }, (_, i) => i + 1), previous, w => `weight:${w}`, rng);
      key = `weight:${weight}`; answerId = String(weight);
      prompt = text('Hoeveel kilogram wijst de weegschaal aan?', 'How many kilograms does the scale show?');
      choices = numericChoices(weight, 'kg', rng);
      explanation = text(`De wijzer staat bij ${weight}. Het gewicht is ${weight} kg.`, `The pointer is at ${weight}. The weight is ${weight} kg.`);
      draw = lang => scale(weight, lang);
      break;
    }
    case 'volume': {
      const pool: { mode: string; values: number[] }[] = [];
      for (let a = 1; a <= 3; a++) for (let b = a + 1; b <= 4; b++) for (let c = b + 1; c <= 5; c++) for (let d = c + 1; d <= 6; d++) {
        for (const mode of ['most', 'least']) pool.push({ mode, values: [a, b, c, d] });
      }
      // Include all assignments in the fresh pool so the question identity is exactly the displayed evidence.
      const permutations = (values: number[]): number[][] => values.length === 0 ? [[]]
        : values.flatMap((value, i) => permutations(values.filter((_, j) => j !== i)).map(rest => [value, ...rest]));
      const assignments = pool.flatMap(p => permutations(p.values).map(values => ({ mode: p.mode, values })));
      const keyOf = (p: { mode: string; values: number[] }) => `volume:${p.mode}:${p.values.join(':')}`;
      const { mode, values } = pickFresh(assignments, previous, keyOf, rng);
      key = keyOf({ mode, values });
      const target = mode === 'most' ? Math.max(...values) : Math.min(...values);
      answerId = 'ABCD'[values.indexOf(target)];
      prompt = mode === 'most' ? text('In welke kan zit het meeste water?', 'Which jug has the most water?') : text('In welke kan zit het minste water?', 'Which jug has the least water?');
      choices = rng.shuffle(['A', 'B', 'C', 'D']).map(id => ({ id, label: text(`Kan ${id}`, `Jug ${id}`) }));
      explanation = text(`Kan ${answerId} bevat ${target} l. Dat is ${mode === 'most' ? 'meer' : 'minder'} dan in elke andere kan.`, `Jug ${answerId} holds ${target} l. That is ${mode === 'most' ? 'more' : 'less'} than every other jug.`);
      draw = lang => jugs(values, lang);
      break;
    }
    default: throw new Error(`Unknown measurement level: ${level.id}`);
  }
  return { key, prompt, choices, answerId, autoAdvance: false, visual: ({ lang, picked }) => {
    const root = element('div', undefined, 'measure-visual');
    root.append(draw(lang));
    if (picked) root.append(element('p', explanation[lang], 'measure-explanation'));
    return root;
  } };
}

function study(level: Level, { lang, speak }: StudyContext): HTMLElement {
  const root = element('div', undefined, 'study measure-study');
  root.append(element('h2', level.label[lang]), element('p', level.example[lang], 'subtitle'));
  const examples: Record<string, Localized[]> = {
    units: [text('cm voor kleine lengtes, m voor grote lengtes, kg voor gewicht en l voor vloeistof.', 'cm for small lengths, m for large lengths, kg for weight and l for liquid.'), text('Een potlood meten we in cm. Een klaslokaal in m. Een kind weegt een aantal kg. In een emmer past een aantal l.', 'Measure a pencil in cm and a classroom in m. A child weighs a number of kg. A bucket holds a number of l.')],
    ruler: [text('Kijk bij welk getal het potlood begint en eindigt. Trek het beginpunt van het eindpunt af.', 'Look at the marks where the pencil starts and ends. Subtract the start from the end.'), text('Het potlood begint bij 2 cm en eindigt bij 7 cm: 7 − 2 = 5 cm.', 'The pencil starts at 2 cm and ends at 7 cm: 7 − 2 = 5 cm.')],
    weight: [text('De weegschaal heeft genummerde streepjes. Kijk precies naar het streepje waar de wijzer staat.', 'The scale has numbered marks. Look at the mark where the pointer points.'), text('De wijzer staat bij 4: het gewicht is 4 kg.', 'The pointer is at 4: the weight is 4 kg.')],
    volume: [text('Liter vertelt hoeveel water er in een kan zit. Vergelijk de getallen bij de kannen.', 'Litres tell us how much water a jug holds. Compare the numbers beside the jugs.'), text('A: 1 l, B: 3 l, C: 5 l, D: 2 l. Kan C heeft het meeste, kan A het minste water.', 'A: 1 l, B: 3 l, C: 5 l, D: 2 l. Jug C has the most water, jug A has the least.')],
  };
  const card = element('div', undefined, 'study-card');
  for (const line of examples[level.id]) card.append(element('p', line[lang]));
  if (level.id === 'ruler') card.append(ruler(2, 7, lang));
  if (level.id === 'weight') card.append(scale(4, lang));
  if (level.id === 'volume') card.append(jugs([1, 3, 5, 2], lang));
  if (speak) {
    const button = element('button', text('Lees voor', 'Read aloud')[lang], 'pill');
    button.type = 'button';
    button.addEventListener('click', () => speak(examples[level.id].map(line => line[lang]).join(' ')));
    card.append(button);
  }
  root.append(card);
  return root;
}

export const measureGame: Game = {
  id: 'measure', title: text('Meetmeester', 'Measure Master'), icon: 'icons/measure.svg',
  pickerLayout: 'list', levels, makeQuestion, study,
};
