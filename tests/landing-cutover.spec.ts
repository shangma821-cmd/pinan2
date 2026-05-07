import { expect, test } from '@playwright/test';

test('direct entry-station renders React-owned landing hero', async ({ page }) => {
  await page.goto('/entry-station');

  const hero = page.getByTestId('home-hero');
  await expect(hero).toBeVisible();
  await expect(hero.getByText('AI健康评估 · 频谱节律调理系统')).toBeVisible();
  await expect(hero.getByText('守护生命节律')).toBeVisible();
});

test('shell iframe loads the React landing route instead of static index.html', async ({ page }) => {
  await page.goto('/');

  const frame = page.getByTestId('entry-shell-landing-frame');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute('src', /\/entry-station$/);
  await expect(frame).not.toHaveAttribute('src', /index\.html/);

  const landingFrame = page.frameLocator('[data-testid="entry-shell-landing-frame"]');
  await expect(landingFrame.getByTestId('landing-shell')).toBeVisible();

  const frameHero = landingFrame.getByTestId('home-hero');
  await expect(frameHero.getByText('AI健康评估 · 频谱节律调理系统')).toBeVisible();
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
