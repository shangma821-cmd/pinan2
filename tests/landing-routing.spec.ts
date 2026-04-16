import { expect, test } from '@playwright/test';

test.fixme(
  'entry-station shell ownership',
  async ({ page }) => {
    // Enable assertions after shell arbitration and page scaffold work land in later Phase 2 plans.
    await page.goto('/entry-station');
    await expect(page).toHaveURL(/\/entry-station$/);
  },
);

test.fixme(
  'five landing routes',
  async ({ page }) => {
    // Enable assertions after shell arbitration and page scaffold work land in later Phase 2 plans.
    await page.goto('/entry-station/about');
    await page.goto('/entry-station/products');
    await page.goto('/entry-station/franchise');
    await page.goto('/entry-station/news');
    await page.goto('/entry-station');
    await expect(page).toHaveURL(/\/entry-station$/);
  },
);
