import type { Choice, Localized } from '../../core/types';
export interface Planet { id: string; name: Localized; description: Localized; fact: Localized; image: string; credit: string; source: string }
export interface OrderProblem { id: string; missing: number[] }
export interface Riddle { id: string; answerId: string; clue: Localized }
const planet = (id: string, nl: string, en: string, description: Localized, fact: Localized, credit: string, source: string): Planet => ({id,name:{nl,en},description,fact,credit,source,image:`solar/${id}.jpg`});
export const PLANETS: readonly Planet[] = [
  planet('mercury','Mercurius','Mercury',{nl:'Grijze rotswereld met veel kraters.',en:'A grey rocky world covered in craters.'},{nl:'De kleinste planeet en het dichtst bij de zon.',en:'The smallest planet and the closest to the Sun.'},'NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington','https://science.nasa.gov/photojournal/mercury-globe-0n-180e/'),
  planet('venus','Venus','Venus',{nl:'Een wereld met een dikke laag lichte wolken.',en:'A world wrapped in thick pale clouds.'},{nl:'De heetste planeet, met een dikke dampkring.',en:'The hottest planet, with a thick atmosphere.'},'NASA/JPL-Caltech','https://science.nasa.gov/photojournal/venus-from-mariner-10/'),
  planet('earth','Aarde','Earth',{nl:'Blauwe oceanen, land en witte wolken.',en:'Blue oceans, land and white clouds.'},{nl:'Onze thuisplaneet, met oceanen en leven.',en:'Our home planet, with oceans and life.'},'NASA','https://science.nasa.gov/solar-system/planets/'),
  planet('mars','Mars','Mars',{nl:'Een roodbruine rotswereld met een grote kloof.',en:'A reddish rocky world with a large canyon.'},{nl:'De rode planeet; roest in de bodem geeft de rode kleur.',en:'The red planet; rusty iron in its soil gives it its colour.'},'NASA/JPL/USGS','https://science.nasa.gov/photojournal/global-color-views-of-mars/'),
  planet('jupiter','Jupiter','Jupiter',{nl:'Een grote wereld met wolkenbanden en een ovale storm.',en:'A large world with cloud bands and an oval storm.'},{nl:'De grootste planeet, met de Grote Rode Vlek: een enorme storm.',en:'The largest planet, with the Great Red Spot: a huge storm.'},'NASA/JPL/USGS','https://science.nasa.gov/photojournal/jupiter/'),
  planet('saturn','Saturnus','Saturn',{nl:'Een goudkleurige wereld met brede, heldere ringen.',en:'A golden world with broad, bright rings.'},{nl:'De zesde planeet, bekend om zijn brede, heldere ringen.',en:'The sixth planet, famous for its broad, bright rings.'},'NASA/JPL-Caltech/Space Science Institute','https://images.nasa.gov/details/PIA21345'),
  planet('uranus','Uranus','Uranus',{nl:'Een lichtblauwe ijsreus met weinig zichtbare wolken.',en:'A pale blue ice giant with few visible clouds.'},{nl:'De zevende planeet; hij draait bijna op zijn zij.',en:'The seventh planet; it spins almost on its side.'},'NASA/JPL-Caltech','https://images.nasa.gov/details/PIA18182'),
  planet('neptune','Neptunus','Neptune',{nl:'Een blauwe ijsreus met wolken en stormen.',en:'A blue ice giant with clouds and storms.'},{nl:'De achtste en verste planeet; een jaar duurt ongeveer 165 aardse jaren.',en:'The eighth and farthest planet; a year lasts about 165 Earth years.'},'NASA/JPL','https://images.nasa.gov/details/PIA01492'),
];
export const ORDER_PROBLEMS: readonly OrderProblem[] = [
  ...PLANETS.map((_,i) => ({id:`single-${i}`,missing:[i]})),
  ...PLANETS.slice(0,-1).map((_,i) => ({id:`pair-${i}`,missing:[i,i+1]})),
];
export const SPACE_OBJECTS: readonly Choice[] = [
  ...PLANETS.map(p => ({id:p.id,label:p.name})),
  {id:'sun',label:{nl:'Zon',en:'Sun'}}, {id:'moon',label:{nl:'Maan',en:'Moon'}},
  {id:'pluto',label:{nl:'Pluto (dwergplaneet)',en:'Pluto (dwarf planet)'}},
];
export const RIDDLES: readonly Riddle[] = [
  ...PLANETS.map(p => ({id:p.id,answerId:p.id,clue:p.fact})),
  {id:'sun',answerId:'sun',clue:{nl:'Ik ben de ster in het midden van ons zonnestelsel. Ik geef licht en warmte.',en:'I am the star at the centre of our solar system. I give light and warmth.'}},
  {id:'moon',answerId:'moon',clue:{nl:'Ik ben de natuurlijke satelliet van onze thuisplaneet. Astronauten hebben op mij gelopen.',en:'I am the natural satellite of our home planet. Astronauts have walked on me.'}},
  {id:'pluto',answerId:'pluto',clue:{nl:'Ik werd vroeger de negende planeet genoemd. Sinds 2006 ben ik een dwergplaneet.',en:'I used to be called the ninth planet. Since 2006 I have been a dwarf planet.'}},
];
