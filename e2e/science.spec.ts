import { test, expect } from '@playwright/test';

const levels = { solar: ['planets', 'order', 'riddles'], body: ['organs', 'functions', 'bones'] };

for (const game of ['solar', 'body'] as const) {
  test(`${game} offers bilingual study screens for every level`, async ({ page }, info) => {
    await page.goto('./');
    const tile = page.locator(`.tile-${game}`);
    await expect(tile).toBeVisible();
    await expect.poll(() => tile.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await tile.click();
    await expect(page.locator('.learn-link')).toHaveCount(3);
    for (const level of levels[game]) {
      await page.goto(`./#/${game}/${level}/learn`);
      expect(await page.locator('.study-card').count()).toBeGreaterThanOrEqual(8);
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page.locator('.study-card').first()).toContainText(game === 'solar' ? 'Mercury' : level === 'bones' ? 'Skull' : 'Brain');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole('link', { name: 'Practise now' }).click();
      await expect(page.locator('.progress')).toHaveText(`Question 1 of ${game === 'solar' && level === 'planets' ? 8 : 10}`);
    }
    await page.screenshot({ path: info.outputPath(`${game}.png`), fullPage: true });
  });

  test(`${game} completes a round using numbered answers`, async ({ page }, info) => {
    const count = game === 'solar' ? 8 : 10;
    await page.goto(`./#/${game}/${game === 'solar' ? 'planets' : 'organs'}`);
    for (let i = 1; i <= count; i++) {
      await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van ${count}`);
      let id: string;
      if (game === 'solar') {
        const picture = page.locator('.visual .solar-picture');
        await expect.poll(() => picture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        id = (await picture.getAttribute('src'))!.split('/').pop()!.replace('.jpg', '');
        await expect(page.getByRole('link', { name: 'Bron', exact: true })).toBeVisible();
      } else {
        id = (await page.locator('.visual .highlighted').getAttribute('data-part-id'))!;
        await expect(page.locator('.visual svg text')).toHaveCount(1);
      }
      if (i === 1) await page.screenshot({ path: info.outputPath(`${game}-round.png`), fullPage: true });
      const ids = await page.locator('.choice').evaluateAll(buttons => buttons.map(b => b.getAttribute('data-id')));
      expect(ids).toContain(id);
      await page.keyboard.press(String(ids.indexOf(id) + 1));
      await expect(page.locator('.feedback')).toHaveText('Goed zo!');
    }
    await expect(page.locator('.end h1')).toHaveText(`${count} van ${count}!`);
    await page.getByRole('button', { name: 'Nog een keer' }).click();
    await expect(page.locator('.progress')).toHaveText(`Vraag 1 van ${count}`);
  });
}

test('science levels preserve the question and keyboard controls when changing language', async ({ page }) => {
  for (const [game, ids] of Object.entries(levels)) {
    for (const level of ids) {
      await page.goto(`./#/${game}/${level}`);
      await page.getByRole('button', { name: 'NL', exact: true }).click();
      const choices = await page.locator('.choice').evaluateAll(buttons => buttons.map(b => b.getAttribute('data-id')));
      const prompt = await page.locator('.prompt').textContent();
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      expect(await page.locator('.prompt').textContent()).not.toBe(prompt);
      expect(await page.locator('.choice').evaluateAll(buttons => buttons.map(b => b.getAttribute('data-id')))).toEqual(choices);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('.choice').evaluateAll(buttons => buttons.every(b => b.scrollWidth <= b.clientWidth + 1))).toBe(true);
      await page.keyboard.press('1');
      await expect(page.locator('.choice.correct')).toBeVisible();
    }
  }
});

test('missing planets use placeholders and reveal the sequence after answering', async ({ page }, info) => {
  await page.goto('./#/solar/order');
  await expect(page.locator('.solar-slot')).toHaveCount(8);
  expect(await page.locator('.solar-gap').count()).toBeGreaterThan(0);
  await expect(page.locator('.solar-gap img')).toHaveCount(0);
  await expect(page.locator('.solar-gap .solar-name')).toHaveCount(0);
  await expect(page.locator('.solar-scale')).toContainText('Niet op schaal');
  await page.screenshot({ path: info.outputPath('planet-order.png'), fullPage: true });
  await page.locator('.choice').first().click();
  await expect(page.locator('.solar-gap')).toHaveCount(0);
  await expect(page.locator('.solar-slot .solar-name')).toHaveCount(8);
});
