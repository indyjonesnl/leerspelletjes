import { test, expect, type Page } from '@playwright/test';

const picture = (page: Page) => page.locator('.initial-picture');
async function firstLetter(page: Page) {
  return (await picture(page).getAttribute('aria-label'))![0].toUpperCase();
}

test('plays a full First Letters round with typed letters and can play again', async ({ page }, testInfo) => {
  await page.goto('./');
  const tile = page.locator('a.tile-initials');
  await expect(tile).toBeVisible();
  await expect.poll(() => tile.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await tile.click();
  await page.locator('a.level[href="#/initials/pictures"]').click();
  for (let i = 1; i <= 10; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 10`);
    const letter = await firstLetter(page);
    await expect(page.locator('.initial-word')).toHaveCount(0);
    if (i === 1) {
      await expect(page.locator('.answer-help')).toContainText('1–4');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('first-letters.png'), fullPage: true });
    }
    await page.keyboard.press(letter.toLowerCase());
    await expect(page.locator('.choice.correct .label')).toHaveText(letter);
    await expect(page.locator('.choice.wrong')).toHaveCount(0);
  }
  await expect(page.locator('.end h1')).toHaveText('10 van 10!');
  await page.getByRole('button', { name: 'Nog een keer' }).click();
  await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
});

test('clicking a letter answers and reveals the picture name', async ({ page }) => {
  await page.goto('./#/initials/pictures');
  const word = (await picture(page).getAttribute('aria-label'))!;
  const letter = word[0].toUpperCase();
  await page.locator('.choice', { has: page.locator('.label', { hasText: new RegExp(`^${letter}$`) }) }).click();
  await expect(page.locator('.feedback')).toHaveText('Goed zo!');
  await expect(page.locator('.initial-word')).toHaveText(`${word} → ${letter}`);
});

test('number keys choose positions and an unlisted letter still counts as a wrong answer', async ({ page }) => {
  for (const n of [1, 2, 3, 4]) {
    await page.goto('./');
    await page.goto('./#/initials/pictures');
    const chosen = page.locator('.choice').nth(n - 1);
    await expect(chosen).toBeEnabled();
    await page.keyboard.press(String(n));
    await expect(chosen).toHaveClass(/correct|wrong/);
  }
  await page.goto('./');
  await page.goto('./#/initials/pictures');
  const options = await page.locator('.choice .label').allTextContents();
  const letter = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find((c) => !options.includes(c))!;
  const answer = await firstLetter(page);
  await page.keyboard.press(letter);
  await expect(page.locator('.feedback')).toContainText('Bijna!');
  await expect(page.locator('.choice.correct .label')).toHaveText(answer);
  await page.getByRole('button', { name: 'Verder', exact: true }).click();
  await expect(page.locator('.progress')).toHaveText('Vraag 2 van 10');
});

test('language switches show fresh pictures and accept the new language’s letters', async ({ page }) => {
  await page.goto('./#/initials/pictures');
  let previous = await picture(page).textContent();
  for (let i = 0; i < 8; i++) {
    const lang = i % 2 === 0 ? 'EN' : 'NL';
    await page.getByRole('button', { name: lang, exact: true }).click();
    await expect(page.locator('.progress')).toHaveText(lang === 'EN' ? 'Question 1 of 10' : 'Vraag 1 van 10');
    expect(await picture(page).textContent()).not.toBe(previous);
    previous = await picture(page).textContent();
    await expect(page.locator('.feedback')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  const letter = await firstLetter(page);
  await page.keyboard.press(letter);
  await expect(page.locator('.feedback')).toHaveText('Well done!');
  await page.getByRole('button', { name: 'NL', exact: true }).click();
  await expect(page.locator('.progress')).toHaveText('Vraag 2 van 10');
  await expect(page.locator('.feedback')).toHaveCount(0);
  await page.waitForTimeout(1500);
  await expect(page.locator('.progress')).toHaveText('Vraag 2 van 10');
});

test('typing works after selecting a language again', async ({ page }) => {
  await page.goto('./#/initials/pictures');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.progress')).toHaveText('Question 1 of 10');
  const before = await picture(page).textContent();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(picture(page)).toHaveText(before!);
  const letter = await firstLetter(page);
  await page.keyboard.press(letter);
  await expect(page.locator('.feedback')).toHaveText('Well done!');
});
