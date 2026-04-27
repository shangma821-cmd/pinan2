import { expect, test } from '@playwright/test';

test('news list search and category filters', async ({ page }) => {
  await page.goto('/entry-station/news');

  await expect(page.getByTestId('news-search-input')).toBeVisible();
  await page.getByTestId('news-filter-科研成果').click();
  await expect(page.getByText('细胞修复技术突破性研究')).toBeVisible();

  await page.getByTestId('news-search-input').fill('不存在的关键词');
  await expect(page.getByText('没有找到相关资讯')).toBeVisible();
});

test('news detail opens from query string and returns to list', async ({ page }) => {
  await page.goto('/entry-station/news?id=2');

  await expect(page.getByTestId('news-detail-view')).toBeVisible();
  await expect(page.getByText('细胞修复技术突破性研究')).toBeVisible();

  await page.getByTestId('news-return-button').click();
  await expect(page).toHaveURL(/\/entry-station\/news$/);
});

test('theme persists across landing navigation and reload', async ({ page }) => {
  await page.goto('/entry-station');

  const themeToggle = page.getByTestId('landing-theme-toggle').first();
  await expect(themeToggle).toBeVisible();
  await expect(themeToggle).toHaveAttribute('aria-label', /日间模式|夜间模式/);

  const initialLabel = await themeToggle.getAttribute('aria-label');
  await themeToggle.click();
  await expect(themeToggle).toHaveAttribute('aria-label', /日间模式|夜间模式/);
  const toggledLabel = await themeToggle.getAttribute('aria-label');
  expect(initialLabel).not.toBe(toggledLabel);

  await page.goto('/entry-station/news');
  await page.reload();

  const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const themeStorage = await page.evaluate(() => window.localStorage.getItem('theme'));

  expect(themeAttr).toBeTruthy();
  expect(themeAttr).toBe(themeStorage);
});

test('mobile navigation overlay and back-to-top work across landing routes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/entry-station');

  await page.getByTestId('landing-mobile-menu-toggle').click();
  await expect(page.getByTestId('landing-mobile-menu')).toBeVisible();

  await page.getByTestId('landing-mobile-menu').getByRole('link', { name: '新闻动态' }).click();
  await expect(page).toHaveURL(/\/entry-station\/news$/);

  await page.goto('/entry-station');
  await page.evaluate(() => window.scrollTo({ top: 1800, behavior: 'auto' }));
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect(page.getByTestId('landing-nav')).toHaveAttribute('data-scrolled', 'true');

  await page.getByTestId('landing-back-to-top').click();
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(60);
});
