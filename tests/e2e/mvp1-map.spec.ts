import { expect, test } from '@playwright/test';

test('desktop separates MVP bus stop seed from static route overlay', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await page.goto('/');

  await expect(page.getByText('Phase 3 venue intelligence', { exact: false })).toBeVisible();
  await expect(page.getByText('13 visible footprints')).toBeVisible();
  await expect(page.getByText('10 OSM markers')).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Missing server key' })).toBeVisible();
  await expect(page.getByText('Heng Mui Keng Terrace')).toBeVisible();
  await expect(page.getByText('Stop 16069')).toBeVisible();
  await expect(page.getByText('No live NUS shuttle API')).toBeVisible();

  await page.getByRole('button', { name: 'Change map layers' }).click();
  await expect(page.getByRole('button', { name: /Bus stop seed/ })).toContainText('On');
  await expect(page.getByRole('button', { name: /Static route/ })).toContainText('Off');
  await page.getByRole('button', { name: 'Close map layers' }).click();
  await expect(page.getByRole('button', { name: /Static route/ })).toBeHidden();

  await page.getByRole('button', { name: 'Change map layers' }).click();
  await page.getByRole('button', { name: /Static route/ }).click();
  await expect(page.getByRole('button', { name: /Static route/ })).toContainText('On');

  await page.getByRole('button', { name: 'View shuttle routes' }).click();
  await page.getByRole('button', { name: /Show D1 static route/ }).click();
  await expect(page.getByRole('heading', { name: 'D1 static route' })).toBeVisible();
  await expect(page.getByText('Live arrivals unavailable')).toBeVisible();
  await expect(page.getByText('not official NUS shuttle route geometry')).toBeVisible();
});

test('desktop renders public bus arrivals when the project endpoint returns live rows', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'desktop-only smoke test');

  await page.route('**/api/transit/public-bus-arrivals?busStopCode=16069', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        sourceId: 'lta-datamall-dynamic-apis',
        sourceLabel: 'LTA DataMall public bus data',
        busStopCode: '16069',
        fetchedAt: '2026-09-18T08:00:00.000Z',
        cache: {
          hit: false,
          ttlSeconds: 20,
        },
        arrivals: [
          {
            serviceNo: '96',
            operator: 'SBST',
            nextBuses: [
              {
                sequence: 1,
                estimatedArrival: '2026-09-18T08:04:00.000Z',
                estimatedArrivalMinutes: 4,
                load: 'SEA',
                type: 'SD',
                feature: 'WAB',
                latitude: 1.29,
                longitude: 103.77,
                isStale: false,
              },
              {
                sequence: 2,
                estimatedArrival: '2026-09-18T08:11:00.000Z',
                estimatedArrivalMinutes: 11,
                load: 'SDA',
                type: 'SD',
                feature: 'WAB',
                latitude: 1.29,
                longitude: 103.77,
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

  await page.goto('/');

  await expect(page.getByRole('definition').filter({ hasText: '1 services' })).toBeVisible();
  await expect(page.getByLabel('Live public bus arrivals from LTA DataMall')).toContainText('96');
  await expect(page.getByLabel('Live public bus arrivals from LTA DataMall')).toContainText('4 min');
  await expect(page.getByLabel('Live public bus arrivals from LTA DataMall')).toContainText('11 min');
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

test('mobile keeps map-first overview readable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'mobile-only smoke test');

  await page.goto('/');

  await expect(page.getByPlaceholder('Search NUS')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use current location' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View shuttle routes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change map layers' })).toBeVisible();
  await expect(page.getByText('26 searchable')).toBeVisible();
  await expect(page.getByText('Phase 3 venue intelligence')).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Missing server key' })).toBeVisible();
  await expect(page.getByText('Stop 16069')).toBeVisible();

  await page.getByRole('button', { name: 'Change map layers' }).click();
  await expect(page.getByRole('button', { name: 'Close map layers' })).toBeVisible();
  await page.getByRole('button', { name: 'Close map layers' }).click();
  await expect(page.getByRole('button', { name: 'Close map layers' })).toBeHidden();
});
