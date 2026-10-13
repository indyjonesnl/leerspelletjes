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

for (const [game, level] of [['clock', '1'], ['tables', '7'], ['flags', '1'], ['money', 'euros'], ['words', 'short'], ['patterns', 'shapes']] as const) {
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

for (const [game, level] of [['money', 'change'], ['words', 'long'], ['patterns', 'growing']] as const) {
  test(`${game} switches language with stable choices and fits on screen`, async ({ page }, testInfo) => {
    await page.goto('./');
    const icon = page.locator(`.tile-${game} img`);
    await expect(icon).toBeVisible();
    expect(await icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.goto(`./#/${game}/${level}`);
    const choices = await page.locator('.choice').evaluateAll((buttons) => buttons.map((b) => b.getAttribute('data-id')));
    await expect(page.locator('.visual')).toBeVisible();
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.locator('.progress')).toHaveText('Question 1 of 10');
    expect(await page.locator('.choice').evaluateAll((buttons) => buttons.map((b) => b.getAttribute('data-id')))).toEqual(choices);
    if (game === 'words') {
      const options = await page.locator('.choice .label').allTextContents();
      const letters = (await page.locator('.word-letter').allTextContents()).join('').toLowerCase().split('').sort().join('');
      expect(options.filter((word) => [...word].sort().join('') === letters).length).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const overflowing = await page.locator('.visual, .choice').evaluateAll((elements) => elements.filter((e) => e.scrollWidth > e.clientWidth + 1).length);
    expect(overflowing).toBe(0);
    await page.screenshot({ path: testInfo.outputPath('game.png'), fullPage: true });
    await page.keyboard.press('1');
    await expect(page.locator('.choice.correct')).toBeVisible();
  });
}

test('word builder exposes the scrambled letters to screen readers', async ({ page }) => {
  await page.goto('./#/words/short');
  const letters = await page.locator('.word-letter').allTextContents();
  const spelling = letters.map((letter) => letter.toLowerCase()).join(', ');
  await expect(page.locator('.word-letters')).toMatchAriaSnapshot(`- group "${spelling}"`);
});

test('money coins show local images with accessible values', async ({ page }, testInfo) => {
  await page.goto('./#/money/cents');
  const coins = page.locator('img.money-piece');
  await expect(coins.first()).toBeVisible();
  expect(await coins.count()).toBeGreaterThan(1);
  for (const coin of await coins.all()) {
    await expect(coin).toHaveAttribute('alt', /^€ \d+,\d{2}$/);
    expect(await coin.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator('.coin-credit')).toContainText('European Central Bank');
  for (const filename of ['1-cent.jpg', '2-cent.jpg', '5-cent.jpg', '10-cent.png', '20-cent.jpg', '50-cent.jpg', '1-euro.jpg', '2-euro.jpg']) {
    const response = await page.request.get(`./coins/${filename}`);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toMatch(/^image\//);
  }
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(coins.first()).toHaveAttribute('alt', /^€\d+\.\d{2}$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('coins.png'), fullPage: true });
});

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

test('long answers stay inside their buttons', async ({ page }) => {
  // The longest single words among country and capital names: they cannot wrap at a space.
  const long = ['Democratische Republiek Congo', 'Marshalleilanden', 'Salomonseilanden', 'Yamoussoukro', 'Sri Jayewardenepura Kotte', 'Saint Vincent en de Grenadines'];
  await page.goto('./#/flags/6');
  const choice = page.locator('.choice').first();
  await expect(choice).toBeVisible();
  const overflowing = await choice.evaluate((btn, names) => {
    const label = btn.querySelector('.label')!;
    return names.filter((name) => {
      label.textContent = name;
      return btn.scrollWidth > btn.clientWidth + 1;
    });
  }, long);
  expect(overflowing).toEqual([]);
});
