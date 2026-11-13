/** Рендерит PNG-иконки PWA из public/icons/icon.svg через Playwright (chromium). */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(import.meta.dirname, '../public/icons');
const svg = readFileSync(resolve(dir, 'icon.svg'), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
const jobs: [string, number, boolean][] = [
  ['icon-192.png', 192, false], ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true], ['apple-touch-icon.png', 180, true],
];
for (const [name, size, full] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  const inner = full ? svg.replace('rx="112"', 'rx="0"') : svg;
  await page.setContent(`<html><body style="margin:0;background:transparent">${inner.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: resolve(dir, name), omitBackground: !full });
}
await browser.close();
console.log('icons ok');
