# 频安AI智能商学院

## What This Is

这是一个基于 React + Vite 的品牌入口与 AI 商学院一体化项目。用户先通过入口首页进入品牌/落地页体验，再跳转到 AI 商学院主应用；项目同时支持 Web 构建和 Electron 打包交付。

## Current Milestone: v1.1 像素级视觉合规复刻

**Goal:** 将 React landing 的视觉表现调整到与 baseline (`7be7097^`) 像素级一致，覆盖色彩体系、字体、动画、玻璃态效果、暗色主题默认、间距 token 和缺失资源。

**Target features:**
- 将主题默认切换为 dark-first，修正完整的 light/dark 色彩变量体系以匹配 baseline
- 替换字体系统为 Inter + Montserrat（移除 Noto Sans SC），对齐 baseline 排版
- 补齐全部 keyframe 动画（floating、marquee、pulse-glow 等）及 glass-effect 等视觉工具类
- 补齐缺失的 baseline 图片资源，修正间距/圆角 token 体系
- 逐页逐区块对照 baseline 完成桌面端与移动端的像素级视觉验收

## Core Value

让品牌入口页和 AI 商学院主应用都能以可维护、可扩展、可持续交付的工程形态稳定演进。

## Requirements

### Validated

- [x] 用户可以通过入口首页进入品牌落地页，再切换到 AI 商学院主应用
- [x] 项目可以通过 Vite 构建 Web 产物，并支持 Electron 打包交付
- [x] 用户可以在 `/entry-station` 下访问五个 React-owned landing 目的地，并共享同一套 landing shell
- [x] v1.0 已完成结构性 React 重建：Home、About、Products、Franchise、News 均由 React 路由接管，Runtime cutover 已完成

### Active

- [ ] React landing 的色彩体系（dark-first 默认、light/dark 变量）与 baseline 像素级一致
- [ ] 字体系统替换为 Inter + Montserrat 并移除 Noto Sans SC，排版与 baseline 一致
- [ ] 全部 baseline keyframe 动画与视觉工具类（glass-effect、text-gradient、shadow-glow）已补齐
- [ ] 缺失的 baseline 图片资源已补齐，间距/圆角 token 体系与 baseline 对齐
- [ ] 桌面端与移动端逐页逐区块通过像素级视觉验收

### Out of Scope

- 重新设计或继续弱医疗化改写 landing 页面内容表达 — 本里程碑以 `7be7097^` 之前版本为准
- 重构 AI 商学院主应用功能模块 — 本里程碑聚焦入口 landing 的视觉合规
- 引入 CMS、可视化搭建后台或运营发布系统 — 先完成视觉合规
- 引入 Tailwind CSS 框架 — baseline 虽使用 Tailwind 构建，但 React 端通过手写 CSS 变量精确匹配视觉输出即可
- 改变页面结构或功能逻辑 — v1.1 仅调整视觉表现，不改变 v1.0 已验证的结构与交互

## Context

- v1.0 已完成 React cutover：`/entry-station` 及所有子路由均由 React/Vite 源码驱动
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**` 是唯一不可变 baseline 审核真相
- baseline CSS (`index-DuxCbJQB.css`) 使用 Tailwind + 自定义语义 token 层，105KB 编译产物
- React 端当前使用手写 `landing/landing.css`（~1258 行），色彩、字体、动画与 baseline 存在显著差异
- v1.0 遗留的 desktop/mobile visual parity spot-check 将在本里程碑中系统性完成
- academy 触发合同不变：landing -> `/academy` -> `/`

## Constraints

- **Tech stack**: 保持 React 19 + Vite 6 + TypeScript 现有项目栈 — 避免为 landing 单独引入第二套前端框架
- **Compatibility**: 保持 `/entry-station` 作为稳定公开入口；`/entry-station/index.html` 仅作为当前 iframe 文件目标实现细节 — 避免合同语义混淆
- **Runtime truth (transitional)**: React cutover 前，`public/entry-station/**` 视为对外生效运行时；相关文档必须一致
- **Source baseline**: landing 恢复与评审必须以 immutable baseline pack（`7be7097^` parent）为准 — 避免基线混乱
- **Reference-only mutable tree**: `Kimi_Agent_Deployment_v14/**` 仅作参考，不得当作 active runtime truth
- **Maintainability**: 最终交付必须是项目内可维护 React 源码，不接受长期依赖过渡 wrapper/静态产物

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `7be7097^` parent baseline pack 作为唯一恢复评审基线 | 用户已明确“没弱化之前”就是该版本之前状态，且 baseline 包必须 immutable | Active |
| `public/entry-station/**` 作为过渡期 active runtime truth | 当前线上/对外行为需要先稳定，React cutover 之前不能再混淆运行时归属 | Active |
| mutable `Kimi_Agent_Deployment_v14/**` 降级为 reference-only | 该目录可变且可能漂移，不满足 runtime/source canonical 要求 | Active |
| academy 触发可暂由 wrapper 承担，但公开合同不变 | 允许内部实现过渡，同时锁定用户可见 outcome（landing -> `/academy` -> `/`） | Active |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-20 after v1.1 milestone start*
