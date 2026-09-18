import { expect, test } from '@playwright/test';

test('desktop separates MVP bus stop seed from prototype route overlay', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await page.goto('/');

  await expect(page.getByText('Phase 2 transit boundary', { exact: false })).toBeVisible();
  await expect(page.getByText('13 visible footprints')).toBeVisible();
  await expect(page.getByText('10 OSM markers')).toBeVisible();
  await expect(page.getByText('Requires server key')).toBeVisible();
  await expect(page.getByText('No live NUS shuttle API')).toBeVisible();

  await page.getByRole('button', { name: 'Change map layers' }).click();
  await expect(page.getByRole('button', { name: /Bus stop seed/ })).toContainText('On');
  await expect(page.getByRole('button', { name: /Prototype route/ })).toContainText('Off');
  await page.getByRole('button', { name: 'Close map layers' }).click();
  await expect(page.getByRole('button', { name: /Prototype route/ })).toBeHidden();

  await page.getByRole('button', { name: 'Change map layers' }).click();
  await page.getByRole('button', { name: /Prototype route/ }).click();
  await expect(page.getByRole('button', { name: /Prototype route/ })).toContainText('On');

  await page.getByRole('button', { name: 'View shuttle routes' }).click();
  await page.getByRole('button', { name: /Show D1 prototype corridor/ }).click();
  await expect(page.getByText('Prototype route')).toBeVisible();
  await expect(page.getByText('not MVP-quality official route geometry')).toBeVisible();
  await expect(page.getByText('not source-confirmed MVP geometry')).toBeVisible();
});

test('mobile keeps map-first overview readable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'mobile-only smoke test');

  await page.goto('/');

  await expect(page.getByPlaceholder('Search NUS')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use current location' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View shuttle routes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change map layers' })).toBeVisible();
  await expect(page.getByText('26 searchable')).toBeVisible();
  await expect(page.getByText('Phase 2 transit boundary')).toBeVisible();
  await expect(page.getByText('Requires server key')).toBeVisible();

  await page.getByRole('button', { name: 'Change map layers' }).click();
  await expect(page.getByRole('button', { name: 'Close map layers' })).toBeVisible();
  await page.getByRole('button', { name: 'Close map layers' }).click();
  await expect(page.getByRole('button', { name: 'Close map layers' })).toBeHidden();
});
