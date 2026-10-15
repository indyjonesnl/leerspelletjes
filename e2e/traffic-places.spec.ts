import { test, expect } from '@playwright/test';

test('photo recognition keeps feedback and keyboard answers through language changes', async ({ page }, testInfo) => {
  const externalImages: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'image' && new URL(request.url()).origin !== 'http://localhost:4173') externalImages.push(request.url());
  });
  await page.goto('./#/traffic/places');
  let lastPhoto = '';
  for (let i = 1; i <= 10; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 10`);
    const image = page.locator('.traffic-photo');
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const src = (await image.getAttribute('src'))!;
    expect(src).not.toBe(lastPhoto);
    lastPhoto = src;
    const prompt = (await page.locator('.prompt').textContent())!;
    const ids = await page.locator('.choice').evaluateAll(buttons => buttons.map(button => button.getAttribute('data-id')));
    if (i === 1) {
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(image).toHaveAttribute('src', src);
      expect(await page.locator('.choice').evaluateAll(buttons => buttons.map(button => button.getAttribute('data-id')))).toEqual(ids);
      await page.getByRole('button', { name: 'NL', exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('traffic-photo-phone-or-tablet.png'), fullPage: true });
    }
    const correct = prompt.includes('betekenen') ? 'give-way' : prompt.includes('vorm') ? 'triangle'
      : prompt.includes('Waar loopt') ? 'island' : prompt.includes('Waarvoor') ? 'cross'
      : src.includes('teeth-') ? 'teeth' : src.includes('roundabout-') ? 'roundabout' : 'zebra';
    expect(ids).toContain(correct);
    const picked = i === 1 ? ids.find(id => id !== correct)! : correct;
    await page.keyboard.press(String(ids.indexOf(picked) + 1));
    await expect(page.locator('.traffic-place-explanation')).toBeVisible();
    await expect(page.locator('.continue')).toBeFocused();
    if (i === 1) {
      await page.waitForTimeout(1300);
      await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page.locator('.traffic-place-explanation')).toBeVisible();
      await expect(image).toHaveAttribute('src', src);
      await page.getByRole('button', { name: 'NL', exact: true }).click();
    }
    await page.locator('.continue').click();
  }
  await expect(page.locator('.end h1')).toHaveText('9 van 10!');
  expect(externalImages).toEqual([]);
});

test('photo lessons show all six credited images in Dutch and English', async ({ page }, testInfo) => {
  await page.goto('./#/traffic/places/learn');
  await expect(page.locator('.study-card')).toHaveCount(6);
  await expect.poll(() => page.locator('.traffic-photo').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.locator('.traffic-photo-credit')).toHaveCount(6);
  await expect(page.locator('.study h2')).toHaveText('Herken de verkeersplek');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.study h2')).toHaveText('Recognise the traffic scene');
  await expect(page.getByRole('link', { name: 'Practise now' })).toHaveAttribute('href', '#/traffic/places');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('traffic-photo-lessons.png'), fullPage: true });
});
