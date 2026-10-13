import type { Localized } from '../../core/types';

export interface TrafficSign {
  code: string;
  name: Localized;
  description: Localized;
  action: Localized;
}
const pair = (nl: string, en: string): Localized => ({ nl, en });
const sign = (code: string, names: [string, string], descriptions: [string, string], actions: [string, string]): TrafficSign => ({
  code, name: pair(...names), description: pair(...descriptions), action: pair(...actions),
});

/** Dutch RVV signs, with child-friendly walking/cycling meanings. Sources: sources.md. */
export const TRAFFIC_SIGNS: TrafficSign[] = [
  sign('B1', ['Voorrangsweg', 'Priority road'], ['Gele ruit met een witte rand', 'Yellow diamond with a white border'],
    ['Op deze weg heb je voorrang op bestuurders uit zijwegen. Blijf goed uitkijken.', 'On this road you have priority over drivers from side roads. Keep looking carefully.']),
  sign('B6', ['Voorrang geven', 'Give way'], ['Omgekeerde witte driehoek met een rode rand', 'Upside-down white triangle with a red border'],
    ['Geef voorrang aan bestuurders op de kruisende weg.', 'Give way to drivers on the road you are joining or crossing.']),
  sign('B7', ['Stoppen en voorrang geven', 'Stop and give way'], ['Rode achthoek met STOP', 'Red octagon with STOP'],
    ['Altijd stoppen, ook zonder ander verkeer, en voorrang geven aan bestuurders op de kruisende weg.', 'Always stop, even without other traffic, and give way to drivers on the crossing road.']),
  sign('C2', ['Niet inrijden vanaf deze kant', 'No entry for vehicles from this side'], ['Rode cirkel met een witte horizontale balk', 'Red circle with a white horizontal bar'],
    ['Je mag deze straat vanaf deze kant niet infietsen.', 'You must not cycle into this street from this side.']),
  sign('C14', ['Niet fietsen', 'No cycling'], ['Witte cirkel met rode rand en een zwarte fiets', 'White circle with a red border and a black bicycle'],
    ['Hier mag je niet verder fietsen.', 'You must not continue cycling here.']),
  sign('C16', ['Niet lopen', 'No pedestrians'], ['Witte cirkel met rode rand en een zwarte voetganger', 'White circle with a red border and a black pedestrian'],
    ['Hier mag je niet verder lopen.', 'You must not continue walking here.']),
  sign('G7', ['Voetpad', 'Footpath'], ['Blauwe cirkel met een witte voetganger', 'Blue circle with a white pedestrian'],
    ['Dit pad is voor voetgangers; hier mag je niet fietsen.', 'This path is for pedestrians; you must not cycle on it.']),
  sign('G11', ['Verplicht fietspad', 'Mandatory cycle path'], ['Blauwe cirkel met een witte fiets', 'Blue circle with a white bicycle'],
    ['Als je fietst, moet je dit fietspad gebruiken.', 'When cycling, you must use this cycle path.']),
  sign('G13', ['Onverplicht fietspad', 'Optional cycle path'], ['Blauw rechthoekig bord met het woord fietspad', 'Blue rectangular sign with the word fietspad'],
    ['Je mag dit fietspad gebruiken, maar het hoeft niet.', 'You may use this cycle path, but you do not have to.']),
  sign('D2', ['Rechts voorbijrijden', 'Pass on the right'], ['Blauwe cirkel met een witte pijl schuin naar rechtsonder', 'Blue circle with a white arrow pointing down and right'],
    ['Fiets rechts voorbij dit bord.', 'Cycle past this sign on its right-hand side.']),
  sign('D4', ['Verplicht rechtdoor', 'Straight ahead only'], ['Blauwe cirkel met een witte pijl omhoog', 'Blue circle with a white upward arrow'],
    ['Je moet hier rechtdoor fietsen, niet links of rechts afslaan.', 'You must cycle straight ahead here, without turning left or right.']),
  sign('D5', ['Verplicht rechtsaf', 'Turn right only'], ['Blauwe cirkel met een witte pijl die rechtsaf buigt', 'Blue circle with a white arrow bending right'],
    ['Je moet hier rechtsaf fietsen.', 'You must turn right here when cycling.']),
  sign('J16', ['Waarschuwing: wegwerkzaamheden', 'Warning: roadworks'], ['Witte driehoek met een rode rand en een werkende persoon', 'White triangle with a red border and a person working'],
    ['Let op: er wordt aan de weg gewerkt. Rijd voorzichtig.', 'Look out: work is being done on the road. Ride carefully.']),
  sign('J21', ['Waarschuwing: kinderen', 'Warning: children'], ['Witte driehoek met een rode rand en twee kinderen', 'White triangle with a red border and two children'],
    ['Let op: er kunnen kinderen oversteken.', 'Look out: children may cross the road.']),
  sign('J22', ['Waarschuwing: zebrapad', 'Warning: pedestrian crossing ahead'], ['Witte driehoek met een rode rand en een voetganger op strepen', 'White triangle with a red border and a pedestrian on stripes'],
    ['Let op: je nadert een zebrapad.', 'Look out: you are approaching a pedestrian crossing.']),
  sign('J24', ['Waarschuwing: fietsers en bromfietsers', 'Warning: cyclists and moped riders'], ['Witte driehoek met een rode rand en een zwarte fiets', 'White triangle with a red border and a black bicycle'],
    ['Let op: er kunnen fietsers en bromfietsers oversteken.', 'Look out: cyclists and moped riders may cross the road.']),
  sign('J37', ['Waarschuwing: gevaar', 'Warning: danger'], ['Witte driehoek met een rode rand en een uitroepteken', 'White triangle with a red border and an exclamation mark'],
    ['Let op: er is gevaar. Een onderbord kan uitleggen welk gevaar.', 'Look out: there is danger. A supplementary plate can explain the danger.']),
  sign('L2', ['Zebrapad', 'Pedestrian crossing'], ['Blauw vierkant met een witte driehoek en een voetganger op strepen', 'Blue square with a white triangle and a pedestrian on stripes'],
    ['Laat voetgangers die oversteken of willen oversteken bij dit zebrapad voorgaan.', 'Give way to pedestrians crossing or about to cross at this pedestrian crossing.']),
];
