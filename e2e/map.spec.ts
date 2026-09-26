import { test, expect, type Page } from '@playwright/test';
import { COUNTRIES } from '../src/games/flags/data/countries';

/** Code of the country the Dutch prompt asks about ("Waar ligt Duitsland?", "Waar liggen de Filipijnen?"). */
async function askedCode(page: Page): Promise<string> {
  const prompt = await page.locator('.prompt').innerText();
  const name = prompt.replace(/^Waar (ligt|liggen) (de |het )?/, '').replace(/\?$/, '');
  const country = COUNTRIES.find((c) => c.nl === name);
  if (!country) throw new Error(`No country in prompt: ${prompt}`);
  return country.code;
}

test('plays a full round on the starter map', async ({ page }) => {
  await page.goto('./');
  await page.locator('a.tile-map').click();
  await page.locator('a.level[href="#/map/1"]').click();
  for (let i = 1; i <= 10; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 10`);
    const code = await askedCode(page);
    await page.locator(`[data-choice-id="${code}"]`).dispatchEvent('click');
    await expect(page.locator(`.country.correct[data-choice-id="${code}"]`)).toBeVisible();
  }
  await expect(page.locator('.end h1')).toHaveText('10 van 10!');
});

test('a real tap on a wrong country shows the right one', async ({ page }) => {
  await page.goto('./#/map/1');
  const code = await askedCode(page);
  const wrong = code === 'DE' ? 'PL' : 'DE';
  await page.locator(`[data-choice-id="${wrong}"]`).click();
  await expect(page.locator(`.country.wrong[data-choice-id="${wrong}"]`)).toBeVisible();
  await expect(page.locator(`.country.correct[data-choice-id="${code}"]`)).toBeVisible();
  await expect(page.locator('button.continue')).toBeVisible();
});

test('the map leaves pinch-zoom to the browser', async ({ page }) => {
  await page.goto('./#/map/2');
  const map = page.locator('svg.map');
  await expect(map).toBeVisible();
  expect(await map.evaluate((el) => getComputedStyle(el).touchAction)).not.toBe('none');
});

test('dragging the name onto the right box answers', async ({ page }) => {
  await page.goto('./#/map/3');
  await expect(page.locator('.box')).toHaveCount(4);
  const code = await askedCode(page);
  const card = page.locator('.name-card');
  await card.scrollIntoViewIfNeeded();
  const from = (await card.boundingBox())!;
  const to = (await page.locator(`.box[data-choice-id="${code}"]`).boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator(`.box.correct[data-choice-id="${code}"]`)).toBeVisible();
});

test('a small-countries round has 5 questions answered by tapping boxes', async ({ page }) => {
  await page.goto('./#/map/3');
  for (let i = 1; i <= 5; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 5`);
    const code = await askedCode(page);
    await page.locator(`.box[data-choice-id="${code}"]`).click();
    await expect(page.locator(`.box.correct[data-choice-id="${code}"]`)).toBeVisible();
  }
  await expect(page.locator('.end h1')).toHaveText('5 van 5!');
});

test('the map keeps its own aspect ratio instead of letterboxing', async ({ page }) => {
  for (const route of ['#/map/2', '#/map/3']) {
    await page.goto(`./${route}`);
    const svg = page.locator('svg.map').first();
    await expect(svg).toBeVisible();
    const [, , w, h] = (await svg.getAttribute('viewBox'))!.split(' ').map(Number);
    const box = (await svg.boundingBox())!;
    const expectedRatio = w / h;
    const actualRatio = box.width / box.height;
    expect(Math.abs(actualRatio - expectedRatio) / expectedRatio).toBeLessThan(0.02);
  }
});

test('the prompt stays above the fold on small-countries levels', async ({ page }) => {
  for (const route of ['#/map/3', '#/map/5']) {
    await page.goto(`./${route}`);
    const prompt = page.locator('.prompt');
    await expect(prompt).toBeVisible();
    const box = (await prompt.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  }
});

test('map data loads only when a map level opens', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  const europeChunk = (u: string) => /\/europe-[\w-]+\.js$/.test(u);
  await page.goto('./');
  await expect(page.locator('.tiles')).toBeVisible();
  expect(requests.some(europeChunk)).toBe(false);
  await page.goto('./#/map/2');
  await expect(page.locator('.country.target').first()).toBeVisible();
  expect(requests.some(europeChunk)).toBe(true);
});
