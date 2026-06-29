import { expect, test, type Page } from '@playwright/test';

const landingRoutes = [
  { path: '/entry-station', marker: 'landing-page-home', urlPattern: /\/entry-station$/ },
  { path: '/entry-station/about', marker: 'landing-page-about', urlPattern: /\/entry-station\/about$/ },
  { path: '/entry-station/products', marker: 'landing-page-products', urlPattern: /\/entry-station\/products$/ },
  { path: '/entry-station/franchise', marker: 'landing-page-franchise', urlPattern: /\/entry-station\/franchise$/ },
  { path: '/entry-station/news', marker: 'landing-page-news', urlPattern: /\/entry-station\/news$/ },
];

async function expectLandingShell(page: Page) {
  await expect(page.getByTestId('landing-shell')).toBeVisible();
  await expect(page.getByTestId('landing-nav')).toBeVisible();
  await expect(page.getByTestId('landing-footer')).toBeVisible();
  await expect(page.getByTestId('landing-nav').getByText('频安科技', { exact: true })).toBeVisible();
  await expect(page.getByTestId('landing-nav').getByRole('button', { name: '联系我们' })).toBeVisible();
  await expect(page.getByTestId('landing-theme-toggle').first()).toBeVisible();
  await expect(page.getByTestId('landing-back-to-top')).toBeVisible();
}

test('entry-station shell ownership', async ({ page }) => {
  await page.goto('/entry-station');
  await expectLandingShell(page);
  await expect(page.getByTestId('landing-page-home')).toBeVisible();
  await expect(page).toHaveURL(/\/entry-station$/);

  await page.goto('/entry-station/');
  await expectLandingShell(page);
  await expect(page.getByTestId('landing-page-home')).toBeVisible();
  await expect(page).toHaveURL(/\/entry-station$/);

  await page.goto('/entry-station/about');
  await expectLandingShell(page);
  await expect(page.getByTestId('landing-page-about')).toBeVisible();
  await expect(page).toHaveURL(/\/entry-station\/about$/);
  await expect(
    page.getByTestId('landing-nav').getByRole('link', { name: '关于我们' })
  ).toHaveClass(/is-active/);
});

test('five landing routes', async ({ page }) => {
  for (const route of landingRoutes) {
    await page.goto(route.path);
    await expectLandingShell(page);
    await expect(page.getByTestId(route.marker)).toBeVisible();
    await expect(page).toHaveURL(route.urlPattern);
  }
});

test('manuals hub route (elastic, cold load)', async ({ page }) => {
  // The manual list is built from the PDFs in public/entry-station/manuals/.
  // The hub route resolves regardless of count: it shows cards when PDFs exist,
  // otherwise an empty state. Both keep the page shell + URL intact.
  await page.goto('/entry-station/manuals');
  await expectLandingShell(page);
  await expect(page.getByTestId('landing-page-manuals')).toBeVisible();
  await expect(page).toHaveURL(/\/entry-station\/manuals$/);

  const grid = page.getByTestId('manuals-grid');
  const empty = page.getByTestId('manuals-empty');
  await expect(grid.or(empty)).toBeVisible();
});

test('manual detail route: unknown slug redirects to hub', async ({ page }) => {
  // A mistyped or stale NFC slug bounces to the hub rather than dead-ending.
  await page.goto('/entry-station/manuals/does-not-exist');
  await expect(page.getByTestId('landing-page-manuals')).toBeVisible();
  await expect(page).toHaveURL(/\/entry-station\/manuals$/);
});

test('footer exposes product manual link', async ({ page }) => {
  await page.goto('/entry-station');
  const footerLink = page.getByTestId('landing-footer').getByRole('link', { name: '产品使用说明' });
  await expect(footerLink).toBeVisible();
  await footerLink.click();
  await expect(page.getByTestId('landing-page-manuals')).toBeVisible();
  await expect(page).toHaveURL(/\/entry-station\/manuals$/);
});
