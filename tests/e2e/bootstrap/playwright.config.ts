import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  testDir: '.',
  testMatch: 'web-shell.spec.ts',
  forbidOnly: true,
  retries: 0,
  workers: 2,
  outputDir: '../../../web-output/results',
  reporter: [['list'], ['json', { outputFile: fileURLToPath(new URL('../../../web-output/playwright-report.json', import.meta.url)) }]],
  use: { browserName: 'chromium', trace: 'on', screenshot: 'on', video: 'on' },
  webServer: [
    { command: 'npm run start --workspace apps/admin -- --port 3100 --hostname 127.0.0.1',
      cwd: workspaceRoot, url: 'http://127.0.0.1:3100', reuseExistingServer: false },
    { command: 'npm run start --workspace apps/share -- --port 3101 --hostname 127.0.0.1',
      cwd: workspaceRoot, url: 'http://127.0.0.1:3101', reuseExistingServer: false },
  ],
});
