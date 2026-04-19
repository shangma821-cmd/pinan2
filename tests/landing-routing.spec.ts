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
  await expect(page.getByTestId('landing-nav').getByText('频安AI智能商学院')).toBeVisible();
  await expect(page.getByTestId('landing-nav').getByRole('link', { name: '了解加盟政策' })).toBeVisible();
}

test('entry-station shell ownership', async ({ page }) => {
  await page.goto('/entry-station');
  await expectLandingShell(page);
  await expect(page.getByTestId('landing-page-home')).toBeVisible();
  await expect(page).toHaveURL(/\/entry-station$/);

  await page.goto('/entry-station/about');
  await expectLandingShell(page);
  await expect(page.getByTestId('landing-page-about')).toBeVisible();
  await expect(page).toHaveURL(/\/entry-station\/about$/);
  await expect(page.getByRole('link', { name: '关于我们' })).toHaveClass(/is-active/);
});

test('five landing routes', async ({ page }) => {
  for (const route of landingRoutes) {
    await page.goto(route.path);
    await expectLandingShell(page);
    await expect(page.getByTestId(route.marker)).toBeVisible();
    await expect(page).toHaveURL(route.urlPattern);
  }
});
