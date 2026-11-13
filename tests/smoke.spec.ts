import { test, expect } from '@playwright/test';

const asIf = (date: string) => `localStorage.setItem('sl-settings', JSON.stringify({ devDate: '${date}' }))`;

test('главный экран до поездки: отсчёт и 12 дверок', async ({ page }) => {
  await page.addInitScript(asIf('2027-03-01'));
  await page.goto('./');
  await expect(page.getByText('До Шри-Ланки')).toBeVisible();
  await expect(page.getByRole('button', { name: /марта: закрыто/ })).toHaveCount(12);
  await page.getByRole('button', { name: /16 марта: закрыто/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Тропический лес');
  await page.getByRole('button', { name: 'Всё равно открыть' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Синхараджа');
});

test('день: таймлайн, отметка «были» сохраняется', async ({ page }) => {
  await page.addInitScript(asIf('2027-03-15'));
  await page.goto('./#/day/2027-03-15');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Черепахи и лагуна');
  await expect(page.getByText('08:00')).toBeVisible();
  const visit = page.getByRole('button', { name: 'Были' }).first();
  await visit.click();
  await expect(page.getByRole('button', { name: 'Были!' }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Были!' }).first()).toBeVisible();
});

test('вкладка «Сегодня» в день поездки показывает день', async ({ page }) => {
  await page.addInitScript(asIf('2027-03-18'));
  await page.goto('./#/today');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Удавалаве');
});

test('карточка места и каталог', async ({ page }) => {
  await page.goto('./#/places');
  await page.getByRole('textbox', { name: 'Поиск мест' }).fill('Синхараджа');
  await page.getByRole('link', { name: /Синхараджа/ }).first().click();
  await expect(page.getByText('Подводные камни')).toBeVisible();
  await expect(page.getByRole('link', { name: /В WhatsApp/ })).toHaveAttribute('href', /wa\.me\/94767908897\?text=/);
});
