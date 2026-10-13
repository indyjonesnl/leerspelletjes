import type { Level, Question, Rng } from '../../core/types';
import { el } from '../../core/ui';
import { addDays, daysInMonth, weekdayForDate } from './calendar';
import { formatCalendarDate, MONTHS, WEEKDAY_HEADINGS, WEEKDAYS } from './data';
import { createMonthBoard } from './monthBoard';

export const MONTH_IDS = MONTHS.map((month) => month.id);
const weekdayByIndex = (index: number) => WEEKDAYS[(index + 7) % 7];
const monthIndex = (id: string) => MONTHS.findIndex((month) => month.id === id);
const weekdayIndex = (id: string) => WEEKDAYS.findIndex((weekday) => weekday.id === id);

function choicesFor(ids: readonly string[], labels: (id: string, lang: 'nl' | 'en') => string, rng: Rng) {
  return rng.shuffle(ids).map((id) => ({ id, label: { nl: labels(id, 'nl'), en: labels(id, 'en') } }));
}

function makeWeekdayQuestion(rng: Rng): Question {
  const year = rng.pick([2024, 2025]);
  const month = rng.int(1, 12);
  const day = rng.int(1, daysInMonth(year, month));
  const base = weekdayByIndex(weekdayForDate(year, month, day));
  const relation = rng.pick(['before', 'after'] as const);
  const answer = weekdayByIndex(weekdayIndex(base.id) + (relation === 'before' ? -1 : 1));
  const distractors = rng.shuffle(WEEKDAYS.filter((weekday) => weekday.id !== answer.id)).slice(0, 3);
  const ids = rng.shuffle([answer, ...distractors]).map((weekday) => weekday.id);
  return {
    key: `weekdays:${year}-${month}-${day}:${relation}`,
    prompt: {
      nl: `Welke weekdag is de dag ${relation === 'before' ? 'vóór' : 'na'} ${base.name.nl}?`,
      en: `Which weekday is the day ${relation} ${base.name.en}?`,
    },
    speech: {
      nl: `Welke weekdag is de dag ${relation === 'before' ? 'vóór' : 'na'} ${base.name.nl}?`,
      en: `Which weekday is the day ${relation} ${base.name.en}?`,
    },
    answerId: answer.id,
    choices: choicesFor(ids, (id, lang) => WEEKDAYS[weekdayIndex(id)].name[lang], rng),
  };
}

function makeMonthQuestion(rng: Rng): Question {
  const selected = rng.shuffle(MONTHS).slice(0, 4);
  const canonical = selected.slice().sort((a, b) => monthIndex(a.id) - monthIndex(b.id)).map((month) => month.id);
  const answerId = canonical.join(',');
  const permutations = new Map<string, string[]>();
  permutations.set(answerId, canonical);
  while (permutations.size < 4) {
    const sequence = rng.shuffle(canonical);
    permutations.set(sequence.join(','), sequence);
  }
  const labels = (sequence: string[], lang: 'nl' | 'en') => sequence.map((id) => MONTHS[monthIndex(id)].name[lang]).join(' → ');
  const choices = rng.shuffle([...permutations].map(([id, sequence]) => ({ id, label: { nl: labels(sequence, 'nl'), en: labels(sequence, 'en') } })));
  const initialOrder = rng.shuffle(canonical);
  if (initialOrder.join(',') === answerId) initialOrder.push(initialOrder.shift()!);
  return {
    key: `months:${canonical.join(',')}`,
    prompt: { nl: 'Zet de maanden op volgorde.', en: 'Put the months in order.' },
    speech: { nl: 'Kies de volgorde van januari naar december.', en: 'Choose the order from January to December.' },
    answerId,
    choices,
    answerOn: 'interactive',
    autoAdvance: false,
    visual: ({ lang, picked, submitAnswer }) => createMonthBoard(canonical, initialOrder, lang, picked !== null, submitAnswer ?? (() => {})),
  };
}

function makeDateQuestion(rng: Rng): Question {
  const year = rng.pick([2024, 2025]);
  const month = rng.int(1, 12);
  const totalDays = daysInMonth(year, month);
  const day = rng.int(1, totalDays);
  const monthName = MONTHS[month - 1].name;
  const startOffset = weekdayForDate(year, month, 1);
  const grid = el('section', { class: 'calendar-grid-wrap', 'aria-label': `${monthName.en} ${year}` },
    el('h3', { class: 'calendar-grid-title' }, `${monthName.en} ${year}`),
    el('div', { class: 'calendar-grid', role: 'grid', 'aria-label': `${monthName.en} ${year}` },
      ...WEEKDAY_HEADINGS.map((heading) => el('span', { class: 'calendar-weekday-heading', role: 'columnheader', 'aria-label': heading.name.en }, heading.name.en.slice(0, 2))),
      ...Array.from({ length: startOffset }, () => el('span', { class: 'calendar-grid-empty', 'aria-hidden': 'true' })),
      ...Array.from({ length: totalDays }, (_, index) => {
        const date = index + 1;
        const selected = date === day;
        return el('span', {
          class: `calendar-day${selected ? ' calendar-day-marked' : ''}`,
          role: 'gridcell',
          'data-day': String(date),
          ...(selected ? { 'aria-current': 'date', 'aria-label': `${formatCalendarDate(year, month, date, 'en')}, marked` } : { 'aria-label': formatCalendarDate(year, month, date, 'en') }),
        }, String(date));
      }),
    ),
  );
  const distractors = rng.shuffle(Array.from({ length: totalDays }, (_, i) => i + 1).filter((n) => n !== day)).slice(0, 3);
  const choices = rng.shuffle([day, ...distractors].map((date) => ({
    id: String(date),
    label: { nl: String(date), en: String(date) },
  })));
  return {
    key: `dates:${year}-${month}-${day}`,
    prompt: { nl: `Welke datum is omcirkeld in ${monthName.nl} ${year}?`, en: `Which date is marked in ${monthName.en} ${year}?` },
    speech: { nl: `Welke dag van de maand is omcirkeld?`, en: 'Which day of the month is marked?' },
    answerId: String(day),
    choices,
    visual: ({ lang }) => {
      const visual = grid.cloneNode(true) as HTMLElement;
      const heading = visual.querySelector<HTMLElement>('.calendar-grid-title');
      if (heading) heading.textContent = `${monthName[lang]} ${year}`;
      visual.setAttribute('aria-label', `${monthName[lang]} ${year}`);
      const labels = visual.querySelectorAll<HTMLElement>('.calendar-weekday-heading');
      labels.forEach((item, index) => {
        const heading = WEEKDAY_HEADINGS[index];
        item.setAttribute('aria-label', WEEKDAYS[index].name[lang]);
        item.textContent = lang === 'nl' ? heading.name.nl : heading.name.en.slice(0, 2);
      });
      visual.querySelectorAll<HTMLElement>('[data-day]').forEach((item) => {
        const date = Number(item.dataset.day);
        if (date === day) item.setAttribute('aria-label', `${formatCalendarDate(year, month, date, lang)}${lang === 'nl' ? ', omcirkeld' : ', marked'}`);
        else item.setAttribute('aria-label', formatCalendarDate(year, month, date, lang));
      });
      return visual;
    },
  };
}

function makeElapsedQuestion(rng: Rng): Question {
  const year = rng.pick([2024, 2025]);
  const month = rng.int(1, 12);
  const crossing = rng.int(0, 3) === 0;
  const monthDays = daysInMonth(year, month);
  const day = crossing ? rng.int(Math.max(1, monthDays - 3), monthDays) : rng.int(1, monthDays);
  const direction = rng.pick([-1, 1] as const);
  const delta = rng.int(1, crossing ? 5 : 12);
  const result = addDays(year, month, day, direction * delta);
  const crossed = result.month !== month;
  const id = `${result.year}-${result.month}-${result.day}`;
  const distractors = rng.shuffle(Array.from({ length: 4 }, (_, index) => addDays(result.year, result.month, result.day, index % 2 === 0 ? index + 1 : -(index + 1))))
    .map((date) => `${date.year}-${date.month}-${date.day}`);
  const optionIds = rng.shuffle([id, ...distractors.filter((candidate, index) => distractors.indexOf(candidate) === index).slice(0, 3)]);
  const parse = (value: string) => value.split('-').map(Number);
  return {
    key: `elapsed:${crossed ? 'cross-month:' : ''}${year}-${month}-${day}:${direction}:${delta}`,
    prompt: {
      nl: `Welke datum is ${delta} dagen ${direction > 0 ? 'na' : 'vóór'} ${formatCalendarDate(year, month, day, 'nl')}?`,
      en: `What date is ${delta} days ${direction > 0 ? 'after' : 'before'} ${formatCalendarDate(year, month, day, 'en')}?`,
    },
    speech: {
      nl: `Welke datum is ${delta} dagen ${direction > 0 ? 'na' : 'vóór'} ${formatCalendarDate(year, month, day, 'nl')}?`,
      en: `What date is ${delta} days ${direction > 0 ? 'after' : 'before'} ${formatCalendarDate(year, month, day, 'en')}?`,
    },
    answerId: id,
    choices: choicesFor(optionIds, (value, lang) => {
      const [optionYear, optionMonth, optionDay] = parse(value);
      return formatCalendarDate(optionYear, optionMonth, optionDay, lang);
    }, rng),
    visual: ({ lang }) => el('div', { class: 'calendar-elapsed-card' },
      el('span', {}, formatCalendarDate(year, month, day, lang)),
      el('span', { 'aria-hidden': 'true' }, direction > 0 ? '→' : '←'),
      el('strong', {}, `${delta} ${lang === 'nl' ? 'dagen' : 'days'}`),
    ),
  };
}

export function makeCalendarQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const previousKeys = new Set(previous.map((question) => question.key));
  const generate = () => {
    switch (level.id) {
      case 'weekdays': return makeWeekdayQuestion(rng);
      case 'months': return makeMonthQuestion(rng);
      case 'dates': return makeDateQuestion(rng);
      case 'elapsed': return makeElapsedQuestion(rng);
      default: throw new Error(`Unknown Calendar Quest level: ${level.id}`);
    }
  };
  for (let attempt = 0; attempt < 100; attempt++) {
    const question = generate();
    if (!previousKeys.has(question.key)) return question;
  }
  throw new Error(`Could not create a fresh Calendar Quest question for ${level.id}`);
}
