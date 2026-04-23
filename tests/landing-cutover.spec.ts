import { expect, test } from '@playwright/test';

test('direct entry-station uses bundled React-owned landing assets', async ({ page }) => {
  await page.goto('/entry-station');

  const heroImage = page.getByTestId('home-hero').getByRole('img', { name: '频安健康体验站' });
  await expect(heroImage).toBeVisible();
  await expect(heroImage).toHaveAttribute('src', /\/assets\//);
  await expect(heroImage).not.toHaveAttribute('src', /\/entry-station\//);
});

test('shell iframe loads the React landing route instead of static index.html', async ({ page }) => {
  await page.goto('/');

  const frame = page.getByTestId('entry-shell-landing-frame');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute('src', /\/entry-station$/);
  await expect(frame).not.toHaveAttribute('src', /index\.html/);

  const landingFrame = page.frameLocator('[data-testid="entry-shell-landing-frame"]');
  await expect(landingFrame.getByTestId('landing-shell')).toBeVisible();

  const frameHeroImage = landingFrame.getByTestId('home-hero').getByRole('img', { name: '频安健康体验站' });
  await expect(frameHeroImage).toHaveAttribute('src', /\/assets\//);
});

test('direct landing still opens academy after cutover', async ({ page }) => {
  await page.goto('/entry-station');

  await page.getByRole('button', { name: '频安AI商学院' }).click();
  await expect(page).toHaveURL(/\/academy$/);
  await expect(page.getByRole('button', { name: '返回入口首页' })).toBeVisible();
});

test('shell iframe landing still opens academy after cutover', async ({ page }) => {
  await page.goto('/');

  const landingFrame = page.frameLocator('[data-testid="entry-shell-landing-frame"]');
  await landingFrame.getByRole('button', { name: '频安AI商学院' }).click();

  await expect(page).toHaveURL(/\/academy$/);
  await expect(page.getByRole('button', { name: '返回入口首页' })).toBeVisible();
});
