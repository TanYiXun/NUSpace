import { expect, test, type Page } from '@playwright/test';

async function mockPublicBusArrivals(page: Page, busStopCode: string) {
  await page.route(`**/api/transit/public-bus-arrivals?busStopCode=${busStopCode}`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        sourceId: 'lta-datamall-dynamic-apis',
        sourceLabel: 'LTA DataMall public bus data',
        busStopCode,
        fetchedAt: '2026-10-04T03:00:00.000Z',
        cache: {
          hit: false,
          ttlSeconds: 20,
        },
        arrivals: [
          {
            serviceNo: '95',
            operator: 'SBST',
            nextBuses: [
              {
                sequence: 1,
                estimatedArrival: '2026-10-04T03:06:00.000Z',
                estimatedArrivalMinutes: 6,
                load: 'SEA',
                type: 'SD',
                feature: 'WAB',
                latitude: 1.29,
                longitude: 103.77,
                isStale: false,
              },
              {
                sequence: 2,
                estimatedArrival: null,
                estimatedArrivalMinutes: null,
                load: null,
                type: null,
                feature: null,
                latitude: null,
                longitude: null,
                isStale: false,
              },
              {
                sequence: 3,
                estimatedArrival: null,
                estimatedArrivalMinutes: null,
                load: null,
                type: null,
                feature: null,
                latitude: null,
                longitude: null,
                isStale: false,
              },
            ],
          },
        ],
      }),
    });
  });
}

test('desktop blocks NUS shuttle routes until source data exists', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await page.goto('/');

  await expect(page.getByText('Phase 4 3D campus detail', { exact: false })).toBeVisible();
  await expect(page.getByText('13 visible footprints')).toBeVisible();
  await expect(page.getByText('33 NUS ISB research stops')).toBeVisible();
  await expect(page.getByText('33 bus stop markers')).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Select a bus stop' })).toBeVisible();
  await expect(page.getByText('Heng Mui Keng Terrace')).toBeHidden();
  await expect(page.getByText('No live NUS shuttle API')).toBeVisible();

  await page.getByRole('button', { name: 'Change map layers' }).click();
  await expect(page.getByRole('button', { name: /NUS ISB stops/ })).toContainText('On');
  await expect(page.getByRole('button', { name: /Prototype route/ })).toBeHidden();
  await expect(page.getByText('Terrain unavailable')).toBeVisible();
  await expect(page.getByText('Needs elevation source, license, alignment, mobile performance, and boundary treatment')).toBeVisible();
  await page.getByRole('button', { name: 'Close map layers' }).click();

  await page.getByRole('button', { name: 'View shuttle routes' }).click();
  await expect(page.getByText('NUS shuttle routes unavailable')).toBeVisible();
  await expect(page.getByText('Needs permitted route geometry and verified stop positions before display')).toBeVisible();
  await expect(page.getByText('Blocked')).toBeVisible();
});

test('desktop renders combined bus services after selecting a linked stop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await mockPublicBusArrivals(page, '16189');
  await page.goto('/');
  await expect(page.getByText('33 NUS ISB research stops')).toBeVisible();
  await page.waitForTimeout(2_000);
  await page.mouse.click(478, 419);

  await expect(page.getByLabel('Combined bus services for selected stop')).toContainText('NUS internal shuttle');
  await expect(page.getByLabel('Combined bus services for selected stop')).toContainText('LTA public buses');
  await expect(page.getByLabel('Live public bus arrivals from LTA DataMall')).toContainText('95');
  await expect(page.getByLabel('6 minutes, wheelchair-accessible bus, Single')).toBeVisible();
  await expect(page.getByText('Live public bus arrivals from LTA DataMall public bus data')).toBeVisible();
});

test('desktop maps NUSMods module venues with confidence metadata', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await page.route('https://api.nusmods.com/v2/2026-2027/modules/CS1010S.json', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        moduleCode: 'CS1010S',
        title: 'Programming Methodology',
        semesterData: [
          {
            semester: 1,
            timetable: [
              { lessonType: 'Tutorial', venue: 'BIZ2-0224' },
              { lessonType: 'Tutorial', venue: 'BIZ2-0224' },
              { lessonType: 'Lecture', venue: 'COM3-01-23' },
              { lessonType: 'Lecture', venue: 'LT27' },
            ],
          },
        ],
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByText('Selected module')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'CS1010S' })).toBeVisible();
  await expect(page.getByLabel('NUSMods selected module venue mappings')).toContainText('BIZ2-0224');
  await expect(page.getByLabel('NUSMods selected module venue mappings')).toContainText('BIZ2');
  await expect(page.getByLabel('NUSMods selected module venue mappings')).toContainText('medium');
  await expect(page.getByLabel('NUSMods selected module venue mappings')).toContainText('LT27');
  await expect(page.getByLabel('NUSMods selected module venue mappings')).toContainText('unknown');
  await expect(page.getByText('room-level geometry')).toBeVisible();
});

test('desktop exposes 3D building detail source metadata', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await page.goto('/');
  await page.getByPlaceholder('Search NUS').fill('Central Library');
  await page.getByRole('button', { name: 'Central Library Library' }).click();

  await expect(page.getByRole('heading', { name: 'Central Library' })).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'estimated-from-levels' })).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Landmark tint' })).toBeVisible();
  await expect(page.getByText('OSM-sourced building point derived from way geometry')).toBeVisible();
});

test('desktop exposes COM3 shell-only xray floor selector', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await page.goto('/');
  await page.getByPlaceholder('Search NUS').fill('COM3');
  await page.getByRole('button', { name: 'COM3 Computing 3, 11 Research Link' }).click();

  await expect(page.getByRole('heading', { name: 'COM3' })).toBeVisible();
  await expect(page.getByLabel('COM3 shell-only floor selector')).toContainText('Floor selector');
  await expect(page.getByLabel('COM3 shell-only floor selector')).toContainText('L6');
  await expect(page.getByText('building shell only')).toBeVisible();
  await expect(page.getByText('No rooms, corridors, entrances, or indoor POIs are shown.')).toBeVisible();

  await page.getByRole('button', { name: 'L5' }).click();
  await expect(page.getByRole('button', { name: 'L5' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Close details' }).click();
  await expect(page.getByRole('heading', { name: 'NUSpace' })).toBeVisible();
  await page.waitForTimeout(1_000);

  for (const [x, y] of [[410, 330], [390, 360], [430, 340], [350, 335]]) {
    await page.mouse.click(x, y);
    await page.waitForTimeout(350);

    if (await page.getByRole('heading', { name: 'COM3' }).isVisible()) {
      break;
    }

    await page.getByRole('button', { name: 'Close details' }).click().catch(() => {});
  }

  await expect(page.getByRole('heading', { name: 'COM3' })).toBeVisible();
  await expect(page.getByLabel('COM3 shell-only floor selector')).toBeVisible();
});

test('desktop labels planted D1 stops without verifying coordinates', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await mockPublicBusArrivals(page, '16189');
  await page.goto('/');
  await expect(page.getByText('33 NUS ISB research stops')).toBeVisible();
  await page.waitForTimeout(2_000);
  await page.mouse.click(478, 419);

  await expect(page.getByRole('heading', { name: 'Information Technology' })).toBeVisible();
  await expect(page.getByText('Permission required · NUS A2, D1, R2 · D1 5. IT')).toBeVisible();
  await expect(page.getByLabel('Combined bus services for selected stop')).toContainText('NUS internal shuttle');
  await expect(page.getByLabel('Combined bus services for selected stop')).toContainText('LTA public buses');
  await expect(page.getByLabel('Combined bus services for selected stop')).toContainText('Stop 16189');
  await expect(page.getByLabel('Combined bus services for selected stop')).toContainText('Snapshot route membership');
  await expect(page.getByLabel('Live public bus arrivals from LTA DataMall')).toContainText('95');
  await expect(page.getByText('Data status')).toBeVisible();
});

test('desktop exposes full NUS ISB research stops without live claims', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await page.goto('/');
  await page.getByPlaceholder('Search NUS').fill('Botanic Gardens MRT');
  await page.getByRole('button', { name: 'Botanic Gardens MRT (PUDO) NUS ISB stop research snapshot' }).click();

  await expect(page.getByRole('heading', { name: 'Botanic Gardens MRT (PUDO)' })).toBeVisible();
  await expect(page.getByText('Permission required · NUS P')).toBeVisible();
  await expect(page.getByLabel('Combined bus services for selected stop')).toContainText('Snapshot route membership');
  await expect(page.getByText('Data status')).toBeVisible();
});

test('mobile keeps map-first overview readable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'mobile-only smoke test');

  await page.goto('/');

  await expect(page.getByPlaceholder('Search NUS')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use current location' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View shuttle routes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change map layers' })).toBeVisible();
  await expect(page.getByText('49 searchable')).toBeVisible();
  await expect(page.getByText('Phase 4 3D campus detail')).toBeVisible();
  await expect(page.getByText('33 NUS ISB research stops')).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Select a bus stop' })).toBeVisible();
  await expect(page.getByText('Heng Mui Keng Terrace')).toBeHidden();

  await page.getByRole('button', { name: 'Change map layers' }).click();
  await expect(page.getByRole('button', { name: 'Close map layers' })).toBeVisible();
  await page.getByRole('button', { name: 'Close map layers' }).click();
  await expect(page.getByRole('button', { name: 'Close map layers' })).toBeHidden();
});
