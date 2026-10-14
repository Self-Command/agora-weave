import { expect, test } from '@playwright/test';

const clients = [
  { name: 'admin', url: 'http://127.0.0.1:3100', heading: 'AgoraWeave 管理' },
  { name: 'share', url: 'http://127.0.0.1:3101', heading: 'AgoraWeave' },
] as const;

for (const client of clients) {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
      test(`${client.name} ${colorScheme} ${viewport.width}: navigation and reload`, async ({ page }, testInfo) => {
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
        const geometry = await heading.boundingBox();
        expect(geometry).not.toBeNull();
        expect(geometry!.x).toBeGreaterThanOrEqual(0);
        expect(geometry!.x + geometry!.width).toBeLessThanOrEqual(viewport.width);
        expect(errors).toEqual([]);
        await testInfo.attach('shell-fullscreen', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
        await testInfo.attach('actual-environment', { body: JSON.stringify({
          client: client.name, colorScheme, viewport, browser: page.context().browser()?.version(),
          checkout_sha: process.env.CHECKOUT_SHA, scope: 'no-business-shell', baseline: 'not_created',
        }), contentType: 'application/json' });
      });
    }
  }
}
