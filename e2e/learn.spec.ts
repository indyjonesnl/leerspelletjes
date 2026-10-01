import { test, expect, type Page } from '@playwright/test';
import { PROVINCES } from '../src/games/nederland/provinces';

/** A real tap on a map target, at its centre point (data-cx/cy in viewBox units). */
async function tapTarget(page: Page, selector: string) {
  const svg = page.locator('svg.map').first();
  const [, , w] = (await svg.getAttribute('viewBox'))!.split(' ').map(Number);
  const box = (await svg.boundingBox())!;
  const target = page.locator(selector);
  const cx = Number(await target.getAttribute('data-cx'));
  const cy = Number(await target.getAttribute('data-cy'));
  const scale = box.width / w;
  await page.mouse.click(box.x + cx * scale, box.y + cy * scale);
}

async function expectImageLoaded(page: Page, selector: string) {
  const img = page.locator(selector).first();
  await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
}

async function expectCardInView(page: Page) {
  const card = (await page.locator('.info-card').boundingBox())!;
  expect(card.y + card.height).toBeLessThanOrEqual(page.viewportSize()!.height);
}

test('only the games with study screens offer "Leer eerst"', async ({ page }) => {
  for (const [game, levels] of [['flags', 6], ['capitals', 6], ['map', 9], ['nederland', 4]] as const) {
    await page.goto(`./#/${game}`);
    await expect(page.locator('a.learn-link')).toHaveCount(levels);
  }
  for (const game of ['clock', 'tables']) {
    await page.goto(`./#/${game}`);
    await expect(page.locator('a.level').first()).toBeVisible();
    await expect(page.locator('a.learn-link')).toHaveCount(0);
  }
});

test('a learn link for a game without study screens goes home', async ({ page }) => {
  await page.goto('./#/clock/1/learn');
  await expect(page.locator('.tiles')).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);
});

test('flags: study a level, then practise it', async ({ page }) => {
  await page.goto('./#/flags');
  await page.locator('a.learn-link[href="#/flags/2/learn"]').click();
  await expect(page.locator('h1')).toHaveText('Vlaggen');
  await expect(page.locator('.study-card')).toHaveCount(44);
  await expectImageLoaded(page, '.study-card img');
  await page.getByRole('link', { name: 'Nu oefenen' }).click();
  await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
});

test('the whole-world capitals study fits the screen and keeps "Nu oefenen" within reach', async ({ page }) => {
  await page.goto('./#/capitals/6/learn');
  await expect(page.locator('.study-card')).toHaveCount(193);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByRole('link', { name: 'Nu oefenen' })).toBeInViewport();
});

test('switching the language rewrites the study screen', async ({ page }) => {
  await page.goto('./#/capitals/1/learn');
  await expect(page.locator('.study-card', { hasText: 'Frankrijk' })).toContainText('Parijs');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.study-card', { hasText: 'France' })).toContainText('Paris');
  await expect(page.getByRole('link', { name: 'Practise now' })).toBeVisible();
});

test('map: tapping a country shows its card, with the map still in view', async ({ page }) => {
  await page.goto('./#/map/2/learn');
  await expect(page.locator('.info-hint')).toHaveText('Tik op een land');
  await tapTarget(page, '.country.target[data-choice-id="FR"]');
  await expect(page.locator('.info-name')).toHaveText('Frankrijk');
  await expect(page.locator('.info-capital')).toHaveText('Hoofdstad: Parijs');
  await expectImageLoaded(page, '.info-card img');
  await expectCardInView(page);
  expect((await page.locator('svg.map').boundingBox())!.y).toBeGreaterThanOrEqual(0);
});

test('map: small countries are chips with a zoomed-in map', async ({ page }) => {
  await page.goto('./#/map/3/learn');
  await page.getByRole('button', { name: 'Malta', exact: true }).click();
  await expect(page.locator('svg.study-inset')).toBeVisible();
  await expect(page.locator('.info-name')).toHaveText('Malta');
  await expect(page.locator('.info-capital')).toHaveText('Hoofdstad: Valletta');
});

test('map: a map that fails to load shows the retry message', async ({ page }) => {
  await page.route(/\/europe-[\w-]+\.js$/, (route) => route.abort());
  await page.goto('./#/map/2/learn');
  await expect(page.getByText('Het spel kon niet laden.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Probeer opnieuw' })).toBeVisible();
});

test('Nederland: one labelled map for the three map levels', async ({ page }) => {
  await page.goto('./#/nederland/3/learn');
  await expect(page.locator('h2')).toHaveText('Provincies en hoofdsteden');
  await expect(page.locator('.study-label.name')).toHaveCount(12);
  await expect(page.locator('.study-label.city')).toHaveCount(12);
  await tapTarget(page, '.country.target[data-choice-id="OV"]');
  await expect(page.locator('.info-name')).toHaveText('Overijssel');
  await expect(page.locator('.info-capital')).toHaveText('Hoofdstad: Zwolle');
  await expectImageLoaded(page, '.info-card img');
  await expectCardInView(page);
});

test('Nederland: the flags level has a study grid and a full quiz round', async ({ page }) => {
  await page.goto('./#/nederland/4/learn');
  await expect(page.locator('.study-card')).toHaveCount(12);
  await expectImageLoaded(page, '.study-card img');
  await page.getByRole('link', { name: 'Nu oefenen' }).click();
  await expectImageLoaded(page, '.visual img.flag-province');
  for (let i = 1; i <= 12; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 12`);
    const src = (await page.locator('.visual img.flag-province').getAttribute('src'))!;
    const code = /flags-nl\/(\w+)\.svg/.exec(src)![1].toUpperCase();
    const name = PROVINCES.find((p) => p.code === code)!.name.nl;
    await page.locator('.choice .label', { hasText: new RegExp(`^${name}$`) }).click();
    await expect(page.locator('.choice.correct')).toBeVisible();
  }
  await expect(page.locator('.end h1')).toHaveText('12 van 12!');
});
