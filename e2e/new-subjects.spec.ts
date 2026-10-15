import { test, expect, type Page } from '@playwright/test';
import { ANIMALS } from '../src/games/animals/data';

function rational(label: string): [number, number] {
  if (label.includes('/')) return label.split('/').map(Number) as [number, number];
  if (label.endsWith('%')) return [Number(label.slice(0, -1)), 100];
  const parts = label.replace(',', '.').split('.');
  return [Number(parts.join('')), 10 ** (parts[1]?.length ?? 0)];
}

async function correctPosition(page: Page, game: string): Promise<number> {
  const labels = await page.locator('.choice .label').allTextContents();
  if (game === 'fractions') {
    const n = await page.locator('.fraction-shaded').count();
    const d = await page.locator('.fraction-piece').count();
    const correct = labels.map((label, i) => ({ value: rational(label), i }))
      .filter(({ value: [a, b] }) => a * d === n * b);
    expect(correct).toHaveLength(1);
    return correct[0].i + 1;
  }
  let id: string;
  if (game === 'traffic') {
    id = (await page.locator('.traffic-sign').getAttribute('data-sign-code'))!;
  } else {
    const src = await page.locator('.animal-picture').getAttribute('src');
    id = ANIMALS.find((a) => src === `animals/${a.codepoint}.svg`)!.id;
  }
  const ids = await page.locator('.choice').evaluateAll((buttons) => buttons.map((b) => b.getAttribute('data-id')));
  expect(ids).toContain(id);
  return ids.indexOf(id) + 1;
}

for (const [game, level] of [['fractions', 'shapes'], ['traffic', 'common'], ['animals', 'pictures']] as const) {
  test(`plays a complete ${game} round from its new home tile`, async ({ page }, testInfo) => {
    await page.goto('./');
    const tile = page.locator(`a.tile-${game}`);
    await expect(tile).toBeVisible();
    await expect.poll(() => tile.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await tile.click();
    await page.locator(`a.level[href="#/${game}/${level}"]`).click();
    for (let i = 1; i <= 10; i++) {
      await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 10`);
      if (game === 'animals') await expect.poll(() => page.locator('.animal-picture').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      if (i === 1) {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`${game}.png`), fullPage: true });
      }
      await page.keyboard.press(String(await correctPosition(page, game)));
      await expect(page.locator('.feedback')).toHaveText('Goed zo!');
    }
    await expect(page.locator('.end h1')).toHaveText('10 van 10!');
    await page.getByRole('button', { name: 'Nog een keer' }).click();
    await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
  });
}

test('every new level keeps its question and choices when switching language', async ({ page }) => {
  const games = {
    fractions: ['shapes', 'equivalent', 'decimals', 'percentages'],
    traffic: ['common', 'cycling', 'situations', 'places'],
    animals: ['pictures', 'silhouettes', 'clues'],
  };
  for (const [game, levels] of Object.entries(games)) {
    for (const level of levels) {
      await page.goto(`./#/${game}/${level}`);
      await page.getByRole('button', { name: 'NL', exact: true }).click();
      const ids = await page.locator('.choice').evaluateAll((buttons) => buttons.map((b) => b.getAttribute('data-id')));
      const prompt = await page.locator('.prompt').textContent();
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page.locator('.progress')).toHaveText('Question 1 of 10');
      expect(await page.locator('.prompt').textContent()).not.toBe(prompt);
      expect(await page.locator('.choice').evaluateAll((buttons) => buttons.map((b) => b.getAttribute('data-id')))).toEqual(ids);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.locator('.choice').evaluateAll((buttons) => buttons.every((b) => b.scrollWidth <= b.clientWidth + 1))).toBe(true);
      await page.locator('.choice').first().click();
      await expect(page.locator('.choice.correct')).toBeVisible();
    }
  }
});

test('traffic has readable Dutch-sign study cards at every level', async ({ page }, testInfo) => {
  await page.goto('./#/traffic');
  await expect(page.locator('.learn-link')).toHaveCount(4);
  for (const level of ['common', 'cycling', 'situations']) {
    await page.goto(`./#/traffic/${level}/learn`);
    expect(await page.locator('.study-card').count()).toBeGreaterThanOrEqual(10);
    const signs = page.locator('.study-card img.traffic-sign');
    await expect(signs.first()).toBeVisible();
    await expect.poll(() => signs.evaluateAll(images => images.every(image =>
      (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
    ))).toBe(true);
    expect((await page.locator('.study-card').first().boundingBox())!.width).toBeGreaterThanOrEqual(230);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  const optional = page.locator('.study-card', { has: page.locator('[data-sign-code="G13"]') });
  await expect(optional).toContainText('Optional cycle path');
  await expect(optional).toContainText('you do not have to');
  await page.screenshot({ path: testInfo.outputPath('traffic-study.png'), fullPage: true });
  await page.getByRole('link', { name: 'Practise now' }).click();
  await expect(page.locator('.progress')).toHaveText('Question 1 of 10');
});

test('animal silhouettes and riddles reveal the local illustration after answering', async ({ page }, testInfo) => {
  await page.goto('./#/animals/silhouettes');
  await expect(page.locator('.animal-silhouette')).toBeVisible();
  await expect(page.locator('.animal-clue')).toBeVisible();
  expect(await page.locator('.animal-silhouette').evaluate((img) => getComputedStyle(img).filter)).toContain('brightness(0)');
  await page.screenshot({ path: testInfo.outputPath('animal-silhouette.png'), fullPage: true });
  await page.locator('.choice').first().click();
  await expect(page.locator('.animal-silhouette')).toHaveCount(0);
  await expect(page.locator('.animal-name')).toBeVisible();
  await page.goto('./#/animals/clues');
  await expect(page.locator('.animal-picture')).toHaveCount(0);
  await expect(page.locator('.animal-clue')).toBeVisible();
  await expect(page.getByRole('link', { name: 'OpenMoji', exact: true })).toBeVisible();
  await page.locator('.choice').first().click();
  await expect.poll(() => page.locator('.animal-picture').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.animal-name')).toBeVisible();
});
