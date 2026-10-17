import { expect, test } from '@playwright/test';

const clients = [
  { name: 'admin', url: 'http://127.0.0.1:3100', heading: 'AgoraWeave 管理' },
  { name: 'share', url: 'http://127.0.0.1:3101', heading: 'AgoraWeave' },
] as const;

test('retired share route retains framework metadata without claiming a product page', async ({ page }) => {
  const response = await page.goto('http://127.0.0.1:3101');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('AgoraWeave');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);
  await page.reload();
  await expect(page).toHaveTitle('AgoraWeave');
});

test('production admin refuses access before real administrator identity and authorization exist', async ({ request }) => {
  for (const path of ['/', '/dashboard/overview', '/api/products']) {
    const response = await request.get('http://127.0.0.1:3100' + path, { maxRedirects: 0 });
    expect(response.status()).toBe(403);
  }
});

// Keep the original visual/a11y assertions for restoration against approved product pages.
// The old heading-only surfaces were explicitly retired; these cases are not product passes.
test.describe.skip('old presentation retired by user; visual coverage awaits approved product pages @local-visual', () => {
for (const client of clients) {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
      for (const fontScale of [1, 2]) {
      test(`${client.name} ${colorScheme} ${viewport.width} font${fontScale}: navigation and reload`, async ({ page }, testInfo) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.setViewportSize(viewport);
        await page.emulateMedia({ colorScheme });
        const response = await page.goto(client.url);
        expect(response?.status()).toBe(200);
        await expect(page).toHaveTitle(client.heading);
        await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
        const heading = page.getByRole('heading', { level: 1, name: client.heading, exact: true });
        await expect(heading).toBeVisible();
        await page.reload();
        await expect(heading).toBeVisible();
        await page.goto('about:blank');
        await page.goBack();
        await expect(heading).toBeVisible();
        await page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, fontScale);
        const geometry = await heading.boundingBox();
        expect(geometry).not.toBeNull();
        expect(geometry!.x).toBeGreaterThanOrEqual(0);
        expect(geometry!.x + geometry!.width).toBeLessThanOrEqual(viewport.width);
        expect(geometry!.y).toBeGreaterThanOrEqual(0);
        expect(geometry!.y + geometry!.height).toBeLessThanOrEqual(viewport.height);
        const metrics = await page.evaluate(() => {
          const heading = document.querySelector('h1')!;
          const foreground = getComputedStyle(heading).color;
          const background = getComputedStyle(document.body).backgroundColor;
          return { foreground, background, fontSize: getComputedStyle(heading).fontSize,
            viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth };
        });
        const luminance = (color: string) => {
          const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(value => Number(value) / 255)
            .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
          return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const colors = [luminance(metrics.foreground), luminance(metrics.background)].sort((a, b) => b - a);
        expect((colors[0] + 0.05) / (colors[1] + 0.05)).toBeGreaterThanOrEqual(4.5);
        expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
        expect(Number.parseFloat(metrics.fontSize)).toBeGreaterThanOrEqual(23 * fontScale);
        expect(errors).toEqual([]);
        await testInfo.attach('shell-fullscreen', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
        await testInfo.attach('actual-environment', { body: JSON.stringify({
          client: client.name, colorScheme, viewport, fontScale, metrics, browser: page.context().browser()?.version(),
          checkout_sha: process.env.CHECKOUT_SHA, scope: 'no-business-shell', baseline: 'not_created',
        }), contentType: 'application/json' });
      });
      }
    }
  }
}
});
