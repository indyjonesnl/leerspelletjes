import { test, expect, type Page } from '@playwright/test';
import { COUNTRIES } from '../src/games/flags/data/countries';
import { CAPITALS } from '../src/games/capitals/data/capitals';

/** Dutch capital asked about in "Wat is de hoofdstad van (de |het )?X?". */
async function askedCapital(page: Page): Promise<string> {
  const prompt = await page.locator('.prompt').innerText();
  const name = prompt.replace(/^Wat is de hoofdstad van (de |het )?/, '').replace(/\?$/, '');
  const country = COUNTRIES.find((c) => c.nl === name);
  if (!country) throw new Error(`No country in prompt: ${prompt}`);
  return CAPITALS[country.code].nl;
}

test('plays a full round of well-known capitals', async ({ page }) => {
  await page.goto('./');
  await page.locator('a.tile-capitals').click();
  await page.locator('a.level[href="#/capitals/1"]').click();
  for (let i = 1; i <= 10; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 10`);
    await expect(page.locator('.visual img.flag')).toBeVisible();
    const capital = await askedCapital(page);
    await page.locator('.choice .label', { hasText: new RegExp(`^${capital}$`) }).click();
    await expect(page.locator('.choice.correct')).toBeVisible();
  }
  await expect(page.locator('.end h1')).toHaveText('10 van 10!');
});

test('a wrong capital shows the right one', async ({ page }) => {
  await page.goto('./#/capitals/2');
  const capital = await askedCapital(page);
  const wrong = page.locator('.choice').filter({ hasNot: page.locator('.label', { hasText: new RegExp(`^${capital}$`) }) }).first();
  await wrong.click();
  await expect(page.locator('.choice.correct .label')).toHaveText(capital);
  await expect(page.locator('button.continue')).toBeVisible();
});
