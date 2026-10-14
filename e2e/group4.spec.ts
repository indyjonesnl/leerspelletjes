import { test, expect, type Page } from '@playwright/test';

const levels = {
  arithmetic: ['addition', 'subtraction', 'bridging', 'missing'],
  spelling: ['ng-nk', 'eer-oor-eur', 'diminutives', 'vowels'],
  reading: ['information', 'main-idea', 'cause-effect', 'vocabulary'],
  measure: ['units', 'ruler', 'weight', 'volume'],
} as const;
type Subject = keyof typeof levels;
const explanation = '.arithmetic-explanation, .spelling-feedback, .reading-explanation, .measure-explanation';

async function answerId(page: Page, game: Subject, level: string): Promise<string> {
  if (game === 'spelling') return 'correct';
  if (game === 'reading') return `${await page.locator('.reading-story').getAttribute('data-story-id')}:0`;
  if (game === 'arithmetic') {
    const equation = (await page.locator('.arithmetic-equation').textContent())!;
    const [, aText, operation, bText, endText] = equation.match(/(\d+)\s*([+−])\s*(\d+|\?)\s*=\s*(\d+|\?)/)!;
    const a = Number(aText);
    return String(bText === '?' ? Number(endText) - a : operation === '+' ? a + Number(bText) : a - Number(bText));
  }
  if (level === 'units') {
    const object = (await page.locator('.measure-object').textContent())!;
    if (/gewicht|weight/.test(object)) return 'kg';
    if (/hoeveelheid|amount/.test(object)) return 'l';
    return /potlood|pencil|gum|eraser|sleutel|key|boek|book/.test(object) ? 'cm' : 'm';
  }
  const label = (await page.locator('.measure-svg').getAttribute('aria-label'))!;
  if (level === 'ruler') {
    const [, start, end] = label.match(/(?:begint bij|starts at) (\d+) cm.*(?:eindigt bij|ends at) (\d+) cm/)!;
    return String(Number(end) - Number(start));
  }
  if (level === 'weight') return label.match(/\d+/g)!.at(-1)!;
  const values = [...label.matchAll(/([A-D]): (\d+) l/g)].map((match) => ({ id: match[1], value: Number(match[2]) }));
  const least = /minste|least/.test((await page.locator('.prompt').textContent())!);
  return values.sort((a, b) => least ? a.value - b.value : b.value - a.value)[0].id;
}

for (const game of Object.keys(levels) as Subject[]) {
  for (const level of levels[game]) {
    test(`${game}/${level}: plays ten questions and keeps worked feedback until Continue`, async ({ page }, testInfo) => {
      await page.goto('./');
      await page.locator(`.tile-${game}`).click();
      await expect(page.locator('.learn-link')).toHaveCount(4);
      await page.locator(`a.level[href="#/${game}/${level}"]`).click();
      for (let number = 1; number <= 10; number++) {
        await expect(page.locator('.progress')).toHaveText(`Vraag ${number} van 10`);
        await expect(page.locator('.choice')).toHaveCount(4);
        await expect(page.locator(explanation)).toHaveCount(0);
        if (number === 1) {
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          await page.screenshot({ path: testInfo.outputPath(`${game}-${level}.png`), fullPage: true });
          if (game === 'arithmetic') {
            await page.locator('.hint-button').click();
            await expect(page.locator('.hint .arithmetic-line')).toBeVisible();
          }
          if (game === 'reading') await expect(page.locator('.reading-evidence')).toHaveCount(0);
        }
        const correct = await answerId(page, game, level);
        const ids = await page.locator('.choice').evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.id));
        expect(ids).toContain(correct);
        await page.keyboard.press(String(ids.indexOf(correct) + 1));
        await expect(page.locator('.feedback')).toHaveText('Goed zo!');
        await expect(page.locator(explanation)).toBeVisible();
        await expect(page.locator('.continue')).toBeFocused();
        if (number === 1) {
          await page.waitForTimeout(1200);
          await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
          if (game === 'reading') await expect(page.locator('.reading-evidence').first()).toBeVisible();
        }
        await page.keyboard.press('Enter');
      }
      await expect(page.locator('.end h1')).toHaveText('10 van 10!');
    });
  }

  test(`${game}: language switches preserve the exercise and wrong-answer feedback`, async ({ page }) => {
    const level = levels[game].at(-1)!;
    await page.goto(`./#/${game}/${level}`);
    const ids = await page.locator('.choice').evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.id));
    const correct = await answerId(page, game, level);
    const spellingClue = game === 'spelling' ? await page.locator('.spelling-clue').textContent() : null;
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.locator('.progress')).toHaveText('Question 1 of 10');
    expect(await page.locator('.choice').evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.id))).toEqual(ids);
    expect(await answerId(page, game, level)).toBe(correct);
    if (game === 'spelling') {
      await expect(page.locator('.spelling-clue')).toHaveText(spellingClue!);
      await expect(page.locator('.spelling-clue')).toHaveAttribute('lang', 'nl');
      expect(await page.locator('.choice .label').evaluateAll((labels) => labels.every((label) => label.getAttribute('lang') === 'nl'))).toBe(true);
    }
    await page.locator(`.choice[data-id="${ids.find((id) => id !== correct)}"]`).click();
    await expect(page.locator(explanation)).toBeVisible();
    await expect(page.locator('.continue')).toBeVisible();
    await page.getByRole('button', { name: 'NL', exact: true }).click();
    await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
    await expect(page.locator(explanation)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.continue').click();
    await expect(page.locator('.progress')).toHaveText('Vraag 2 van 10');
  });

  test(`${game}: every lesson is available in Dutch and English`, async ({ page }) => {
    for (const level of levels[game]) {
      await page.goto(`./#/${game}/${level}/learn`);
      await page.getByRole('button', { name: 'NL', exact: true }).click();
      await expect(page.locator('.study h2')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Nu oefenen' })).toBeVisible();
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Practise now' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
