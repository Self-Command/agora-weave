import { expect, test } from '@playwright/test';

// Run against the configured real management server; no mock route or synthetic login success.
const base = process.env.AGORAWEAVE_ADMIN_E2E_URL ?? 'http://127.0.0.1:3000';
const origin = new URL(base).origin;
const writes = { Origin: origin, 'Content-Type': 'application/json', 'X-AgoraWeave-CSRF': '1' };

test('AMW01: an unauthenticated management page opens the real login form without template data', async ({ page }) => {
  await page.goto(base + '/dashboard/identity');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: '管理员登录', exact: true })).toBeVisible();
  await expect(page.getByTestId('template-preview-notice')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '获取验证码', exact: true })).toBeVisible();
});

test('AMW02: invalid phone input is retained and does not dispatch an SMS request', async ({ page }) => {
  let sends = 0;
  page.on('request', request => { if (request.url().endsWith('/api/management/auth/challenges')) sends++; });
  await page.goto(base + '/admin/login');
  const phone = page.getByLabel('管理员手机号', { exact: true });
  await phone.fill('123');
  expect(await phone.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
  await page.getByRole('button', { name: '获取验证码', exact: true }).click();
  await expect(phone).toHaveValue('123');
  expect(sends).toBe(0);
  await page.getByLabel('国家或地区区号', { exact: true }).click();
  await page.getByRole('option', { name: '美国 / 加拿大 +1', exact: true }).click();
  await phone.fill('5555550123');
  expect(await phone.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(true);
  expect(sends).toBe(0);
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('AMW03: the BFF rejects forged identity, client tokens, registration and cross-site writes', async ({ request }) => {
  const identity = await request.get(base + '/api/management/admin/session', { headers: { 'X-Role': 'super_admin', 'X-Account-Id': 'synthetic' } });
  expect(identity.status()).toBe(401);
  const crossSite = await request.post(base + '/api/management/auth/logout', { headers: { ...writes, Origin: 'https://external.invalid' }, data: { operation_id: crypto.randomUUID() } });
  expect(crossSite.status()).toBe(403);
  const token = await request.post(base + '/api/management/auth/refresh', { headers: writes, data: { refresh_token: 'client-chosen-secret' } });
  expect(token.status()).toBe(422);
  const registration = await request.post(base + '/api/management/auth/challenges', { headers: writes,
    data: { phone: '+15555550123', purpose: 'register', operation_id: crypto.randomUUID() } });
  expect(registration.status()).toBe(422);
  for (const result of [identity, crossSite, token, registration]) {
    expect(result.headers()['cache-control']).toContain('no-store');
    const body = await result.json(); expect(body.data?.session).toBeUndefined();
  }
});

test('AMW04: logout clears a tampered local cookie and preserves the original operation in its failure receipt', async ({ request }) => {
  const operation = crypto.randomUUID();
  const result = await request.post(base + '/api/management/auth/logout', { headers: { ...writes, Cookie: 'agora-admin=tampered' }, data: { operation_id: operation } });
  expect(result.status()).toBe(401);
  expect(result.headers()['set-cookie']).toMatch(/agora-admin=;.*Max-Age=0/i);
  expect((await result.json()).operation_id).toBe(operation);
});
