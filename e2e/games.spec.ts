import { test, expect, type Page } from '@playwright/test';

async function answerFirstChoice(page: Page) {
  await page.locator('.choice').first().click();
  await expect(page.locator('.choice.correct')).toBeVisible();
  const next = page.locator('button.continue');
  if (await next.isVisible()) await next.click();
}

async function playRound(page: Page) {
  for (let i = 1; i <= 10; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 10`);
    await answerFirstChoice(page);
  }
  await expect(page.locator('.end h1')).toContainText('van 10!');
}

for (const [game, level] of [['clock', '1'], ['tables', '7'], ['flags', '1']] as const) {
  test(`plays a full ${game} round`, async ({ page }) => {
    await page.goto('./');
    await page.locator(`a.tile-${game}`).click();
    await page.locator(`a.level[href="#/${game}/${level}"]`).click();
    await playRound(page);
    await page.getByRole('button', { name: 'Nog een keer' }).click();
    await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
    await page.getByRole('link', { name: 'Naar start' }).first().click();
    await expect(page.locator('.tiles')).toBeVisible();
  });
}

test('flag images load', async ({ page }) => {
  await page.goto('./#/flags/2');
  const img = page.locator('.visual img');
  await expect(img).toBeVisible();
  expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
});

test('switching language mid-round keeps progress', async ({ page }) => {
  await page.goto('./#/tables/7');
  await answerFirstChoice(page);
  await expect(page.locator('.progress')).toHaveText('Vraag 2 van 10');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.progress')).toHaveText('Question 2 of 10');
});

test('leaving mid-round cancels the auto-advance', async ({ page }) => {
  await page.goto('./#/tables/7');
  const promptText = await page.locator('.prompt').innerText();
  const a = Number(promptText.match(/\d+/)?.[0]);
  const product = a * 7;
  await page.locator('.choice .label', { hasText: new RegExp(`^${product}$`) }).click();
  await expect(page.locator('.choice.correct')).toBeVisible();
  await expect(page.locator('button.continue')).toHaveCount(0);
  await page.getByRole('link', { name: 'Naar start' }).first().click();
  await page.waitForTimeout(1500);
  await expect(page.locator('.tiles')).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);
});

test('unknown routes go home', async ({ page }) => {
  await page.goto('./#/nope/9');
  await expect(page.locator('.tiles')).toBeVisible();
});

for (const lang of ['nl', 'en'] as const) {
  test(`header does not overflow the viewport in ${lang.toUpperCase()}`, async ({ page }) => {
    await page.goto('./#/tables/7');
    if (lang === 'en') await page.getByRole('button', { name: 'EN', exact: true }).click();
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(fits).toBe(true);
  });
}

test('language choice is remembered', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.reload();
  await expect(page.locator('.brand')).toHaveText('Learning Games');
});
