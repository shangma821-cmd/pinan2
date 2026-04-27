import { expect, test } from '@playwright/test';

test('home page reconstruction', async ({ page }) => {
  await page.goto('/entry-station');

  await expect(page.getByTestId('landing-page-home')).toBeVisible();
  await expect(page.getByTestId('home-hero').getByText('AI细胞修复')).toBeVisible();
  await expect(page.getByTestId('home-hero').getByText('告别亚健康')).toBeVisible();
  await expect(page.getByText('传统模式3大痛点')).toBeVisible();
  await expect(page.getByText('4大核心壁垒，同行难复制')).toBeVisible();
  await expect(page.getByText('服务闭环，无断点体验')).toBeVisible();
  await expect(page.getByText('成果与声誉')).toBeVisible();
  await expect(page.getByTestId('home-news-preview').getByRole('heading', { name: /洞察与.*动态/ })).toBeVisible();
});

test('home CTA routes', async ({ page }) => {
  await page.goto('/entry-station');
  await page.getByTestId('home-hero').getByRole('link', { name: '了解产品服务' }).click();
  await expect(page).toHaveURL(/\/entry-station\/products$/);

  await page.goto('/entry-station');
  await page.getByTestId('home-hero').getByRole('link', { name: '加盟合作' }).click();
  await expect(page).toHaveURL(/\/entry-station\/franchise$/);
});

test('about page reconstruction', async ({ page }) => {
  await page.goto('/entry-station/about');

  await expect(page.getByTestId('landing-page-about')).toBeVisible();
  await expect(page.getByTestId('about-qualifications').getByRole('heading', { name: /权威.*资质认证/ })).toBeVisible();
  await expect(page.getByTestId('about-timeline').getByRole('heading', { name: /发展.*历程/ })).toBeVisible();
  await expect(page.getByTestId('about-team-equipment').getByRole('heading', { name: /专业.*团队.*设备/ })).toBeVisible();
  await expect(page.getByTestId('about-service-experience').getByRole('heading', { name: /贴心.*服务.*体验/ })).toBeVisible();
  await expect(page.getByTestId('about-timeline').getByText('2018')).toBeVisible();
  await expect(page.getByTestId('about-timeline').getByText('2024')).toBeVisible();
});

test('products dual view', async ({ page }) => {
  await page.goto('/entry-station/products');

  await expect(page.getByTestId('landing-page-products')).toBeVisible();
  await expect(page.getByRole('button', { name: '核心产品' })).toBeVisible();
  await page.getByRole('button', { name: '会员套餐' }).click();
  await expect(page.getByRole('heading', { name: '周卡' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '年卡' })).toBeVisible();
  await expect(page.getByText('推荐', { exact: true })).toBeVisible();
});

test('franchise page reconstruction', async ({ page }) => {
  await page.goto('/entry-station/franchise');

  await expect(page.getByTestId('landing-page-franchise')).toBeVisible();
  await expect(page.getByRole('heading', { name: '合作方案' })).toBeVisible();
  await expect(page.getByText('店中店收益测算（示例）')).toBeVisible();
  await expect(page.getByText('全程扶上马，帮你赚到钱')).toBeVisible();
  await expect(page.getByText('3大承诺，零风险加盟')).toBeVisible();
  await expect(page.getByText('立即申请加盟')).toBeVisible();
  await expect(page.getByTestId('landing-page-franchise').getByText('18948301116')).toBeVisible();
});

test('home interaction parity', async ({ page }) => {
  await page.goto('/entry-station');

  const advantage = page.getByRole('button', { name: /模式壁垒：公平返利，用户自动裂变/ });
  await advantage.click();
  await expect(page.getByTestId('home-advantages-item-2')).toHaveAttribute('data-active', 'true');

  const processStep = page.getByTestId('home-process-step-2');
  await processStep.click();
  await expect(processStep).toHaveAttribute('data-active', 'true');

  await page.getByTestId('home-results').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('home-results-stat-users')).toHaveText('2750+');
  await expect(page.getByTestId('home-results-stat-satisfaction')).toHaveText('50%');
});

test('brand identity matches legacy', async ({ page }) => {
  await page.goto('/entry-station');
  await expect(page.getByTestId('landing-nav')).toContainText('频安科技');
  await expect(page.getByTestId('landing-nav')).toContainText('频安健康');
  await expect(page.getByTestId('landing-footer')).toContainText('频安健康事业部');
});

test('contact email matches legacy', async ({ page }) => {
  await page.goto('/entry-station');
  await expect(page.getByTestId('landing-footer')).toContainText('contact@puyuan-health.com');

  // The 联系我们 modal uses Pinancs@163.com per legacy contact panel
  await page.getByTestId('landing-nav').getByRole('button', { name: '联系我们' }).click();
  await expect(page.getByTestId('landing-contact-modal')).toContainText('Pinancs@163.com');

  await page.goto('/entry-station/franchise');
  await expect(page.getByText('商务邮箱').locator('..')).toContainText('franchise@puyuan-health.com');
});
