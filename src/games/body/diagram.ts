import type { Lang } from '../../core/types';
import { svgEl } from '../../core/ui';
import type { BodyPart } from './data';
import { BONES, ORGANS } from './data';

const outline = 'M160 18 C132 18 121 38 124 62 Q125 80 142 91 L141 104 Q114 105 98 119 L80 148 L48 260 Q42 280 49 289 Q57 294 63 279 L101 187 L101 273 Q100 307 112 333 L116 447 L109 512 Q94 524 103 535 L143 535 L150 442 L153 350 L167 350 L170 442 L177 535 L217 535 Q226 524 211 512 L204 447 L208 333 Q220 307 219 273 L219 187 L257 279 Q263 294 271 289 Q278 280 272 260 L240 148 L222 119 Q206 105 179 104 L178 91 Q195 80 196 62 C199 38 188 18 160 18 Z';
const organShapes: Record<string,string> = {
  brain: '<path d="M159 35 C151 29 143 34 142 40 C133 38 131 48 135 54 C127 61 137 73 145 70 C147 80 157 80 160 73 C165 80 177 78 178 70 C189 70 191 57 184 53 C190 45 182 36 176 40 C172 31 164 32 159 35 Z"/><path d="M160 36 V72 M143 43 Q155 42 150 51 Q138 49 141 60 M176 43 Q165 42 170 51 Q182 49 179 61 M148 65 Q155 59 158 66 M163 58 Q167 64 173 66" fill="none" stroke-width="1.5"/>',
  lungs: '<path d="M148 125 C141 116 122 123 116 143 L108 174 Q105 190 122 191 L147 190 Q154 185 150 170 Z"/><path d="M171 125 C179 116 197 127 203 147 L211 176 Q214 192 196 192 L181 186 Q185 173 174 164 Z"/><path d="M160 108 V136 M160 135 L136 157 M160 135 L190 157" fill="none" stroke-width="4"/>',
  heart: '<path d="M160 157 C153 148 147 159 151 172 C154 181 165 194 171 200 C179 184 187 171 180 160 Q173 151 167 158 L166 146 L159 147 Z"/><path d="M158 165 Q164 175 174 180" fill="none" stroke-width="1.5"/>',
  liver: '<path d="M110 202 Q135 191 159 203 L177 215 Q155 227 129 230 L108 227 Z"/>',
  stomach: '<path d="M178 199 L179 210 C195 202 208 215 207 230 Q207 246 190 248 Q173 249 165 236 L157 234 L157 227 Q175 232 176 222 L173 199 Z"/><path d="M187 218 Q201 217 197 233" fill="none" stroke-width="1.5"/>',
  pancreas: '<path d="M155 239 Q164 234 173 240 L205 246 Q212 250 203 254 L177 252 Q163 254 153 249 Z"/>',
  kidneys: '<path d="M115 233 C99 236 102 261 115 264 Q124 266 123 257 Q114 252 122 246 Q128 238 115 233 Z"/><path d="M205 226 C221 229 218 254 205 257 Q196 259 197 250 Q206 245 198 239 Q192 231 205 226 Z"/>',
  'large-intestine': '<path d="M126 310 L121 277 Q121 268 130 268 L191 268 Q201 268 200 279 L199 306 Q199 315 186 315 L172 315 L168 328" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>',
  'small-intestine': '<path d="M138 280 H183 Q193 280 187 286 L139 289 Q130 290 138 296 L183 298 Q190 301 182 306 H142" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
  bladder: '<path d="M160 333 C140 326 136 342 148 351 Q160 361 173 351 C185 342 181 327 160 333 Z"/><path d="M160 354 V363" fill="none" stroke-width="3"/>',
};
const boneLine = (d:string, width=7) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const boneShapes: Record<string,string> = {
  skull: '<path d="M139 37 Q160 24 181 37 Q193 50 183 72 L176 82 H144 L137 72 Q127 50 139 37 Z"/><path d="M147 58 h2 M171 58 h2 M157 67 l3 -5 l3 5 M147 75 H173" fill="none" stroke-width="4"/>',
  ribcage: [130,141,152,163,174,185].map((y,i)=>boneLine(`M155 ${y} Q${113-i} ${y-9} 116 ${y+5} Q120 ${y+17} 155 ${y+10} M165 ${y} Q${207+i} ${y-9} 204 ${y+5} Q200 ${y+17} 165 ${y+10}`,4)).join('') + boneLine('M160 122 V191',5),
  spine: Array.from({length:23},(_,i)=>`<rect x="155" y="${91+i*9}" width="10" height="7" rx="2"/>`).join(''),
  pelvis: '<path fill-rule="evenodd" d="M113 284 Q132 276 147 296 L173 296 Q188 276 207 284 L200 321 Q178 339 160 328 Q142 339 120 321 Z M127 298 Q141 292 147 307 L141 321 L128 315 Z M193 298 Q179 292 173 307 L179 321 L192 315 Z"/>',
  collarbones: boneLine('M158 113 Q143 105 113 118 M162 113 Q177 105 207 118',5),
  'upper-arm': boneLine('M106 126 L81 193 M214 126 L239 193',8),
  forearm: boneLine('M78 207 L58 266 M87 209 L66 270 M242 207 L262 266 M233 209 L254 270',5),
  thigh: boneLine('M130 329 L136 419 M190 329 L184 419',10),
  kneecap: '<path d="M130 423 Q136 419 142 423 L140 434 Q136 439 132 434 Z M178 423 Q184 419 190 423 L188 434 Q184 439 180 434 Z"/>',
  shin: boneLine('M136 444 L132 511 M184 444 L188 511',8),
};

export function bodyDiagram(target: BodyPart, skeleton: boolean, lang: Lang, reveal = false): SVGSVGElement {
  const svg = svgEl('svg', { viewBox:'0 0 320 570', class:'body-diagram', role:'img', 'aria-label':reveal ? `${target.name[lang]}. ${target.location[lang]}` : target.location[lang], width:320, height:570 });
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  const backdrop = svgEl('path', { d:outline, fill:'#f1f5f9', stroke:'#94a3b8', 'stroke-width':2 });
  svg.append(backdrop);
  const parts = skeleton ? BONES : ORGANS;
  // Back-of-abdomen structures appear first; the selected structure is lifted for visibility.
  const ordered = skeleton ? parts : [...parts].sort((a,b) => Number(b.id === 'kidneys' || b.id === 'pancreas') - Number(a.id === 'kidneys' || a.id === 'pancreas'));
  for (const p of ordered.filter(p => p.id !== target.id).concat(target)) {
    const selected = p.id === target.id;
    const group = svgEl('g', { 'data-part-id':p.id, [skeleton ? 'data-bone' : 'data-organ']:p.id, class:selected ? 'body-part highlighted' : 'body-part', fill:'currentColor', stroke:selected ? '#9a3412' : '#64748b', 'stroke-width':1.3, color:selected ? '#f97316' : '#cbd5e1' });
    group.innerHTML = (skeleton ? boneShapes : organShapes)[p.id];
    svg.append(group);
  }
  const caption = svgEl('text', { x:160, y:557, 'text-anchor':'middle', fill:'#475569', stroke:'none', 'font-size':10 });
  caption.textContent = lang === 'nl' ? 'Vereenvoudigd vooraanzicht' : 'Simplified front view';
  svg.append(caption);
  if (reveal) {
    const label = svgEl('text', {x:160,y:15,'text-anchor':'middle',fill:'#9a3412','font-size':14,'font-weight':700});
    label.textContent = target.name[lang];
    svg.append(label);
  }
  return svg;
}
