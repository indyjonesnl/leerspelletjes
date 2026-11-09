import { test, expect, type Page } from '@playwright/test';
import { COUNTRIES } from '../src/games/flags/data/countries';
import { LANGUAGES } from '../src/games/languages/data/languages';
import { SPOKEN } from '../src/games/languages/data/spoken';
import { countryWithArticle } from '../src/games/map/names';

/** The country asked about in "Welke talen worden gesproken in (de |het )?X? Kies alles wat past." */
async function askedCode(page: Page): Promise<string> {
  const prompt = await page.locator('.prompt').innerText();
  const match = prompt.match(/^Welke talen worden gesproken in (.+)\? Kies alles wat past\.$/);
  if (!match) throw new Error(`Unexpected prompt: ${prompt}`);
  const country = COUNTRIES.find((c) => countryWithArticle(c.code).nl === match[1]);
  if (!country) throw new Error(`No country in prompt: ${prompt}`);
  return country.code;
}

const chip = (page: Page, name: string) => page.locator('button.chip', { hasText: new RegExp(`^${name}$`) });

test('plays a full round of well-known countries', async ({ page }) => {
  await page.goto('./');
  await page.locator('a.tile-languages').click();
  await page.locator('a.level[href="#/languages/1"]').click();
  for (let i = 1; i <= 10; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 10`);
    await expect(page.locator('.visual img.flag')).toBeVisible();
    const code = await askedCode(page);
    for (const id of SPOKEN[code].main) await chip(page, LANGUAGES[id].nl).click();
    await page.locator('button.check').click();
    await expect(page.locator('button.chip.correct').first()).toBeVisible();
    await expect(page.locator('.language-detail')).toHaveCount(0);
    await page.locator('button.continue').click();
  }
  await expect(page.locator('.end h1')).toHaveText('10 van 10!');
});

test('a wrong selection names what was missed and what does not belong', async ({ page }) => {
  await page.goto('./#/languages/1');
  const code = await askedCode(page);
  const main = SPOKEN[code].main;
  const chips = await page.locator('button.chip').allInnerTexts();
  const extraName = chips.find((n) => !main.some((id) => LANGUAGES[id].nl === n))!;
  await chip(page, extraName).click();
  await page.locator('button.check').click();
  const detail = page.locator('.language-detail');
  await expect(detail).toContainText(`Dit hoort er niet bij: ${extraName}`);
  await expect(detail).toContainText('Gemist: ');
  for (const id of main) await expect(detail).toContainText(LANGUAGES[id].nl);
  await expect(page.locator('button.continue')).toBeVisible();
});

test('the study screen shows a card per country with its languages', async ({ page }) => {
  await page.goto('./#/languages/1/learn');
  const cards = page.locator('.study-card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
  const texts = await cards.allInnerTexts();
  const nl = LANGUAGES[SPOKEN.NL.main[0]].nl;
  expect(texts.some((t) => t.includes('Nederland') && t.includes(nl))).toBe(true);
});
