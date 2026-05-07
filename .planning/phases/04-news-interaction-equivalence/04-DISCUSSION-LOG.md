# Phase 4: News & Interaction Equivalence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 04-news-interaction-equivalence
**Areas discussed:** News 路由状态、News 列表交互、主题持久化、跨页导航交互、首页剩余交互保真

---

## News 路由状态

| Option | Description | Selected |
|--------|-------------|----------|
| 同一路由 `/news` + `?id=` 详情态 | 保持 baseline contract，并天然支持返回列表 | ✓ |
| 独立 `/news/:id` 详情页 | Router 结构更直观，但偏离 baseline route contract | |
| 列表页内 modal 详情 | 保持列表挂载，但不符合 baseline 的深链模式 | |

**User's choice:** 自动选择 `同一路由 /news + ?id= 详情态`
**Notes:** `$gsd-next` 零摩擦推进下，按 Phase 1 UI contract 与 baseline bundle 已锁定的 route 语义直接收束。

---

## News 列表交互

| Option | Description | Selected |
|--------|-------------|----------|
| 客户端搜索 + 分类筛选 + 卡片列表 | 与 baseline 行为一致，适合本阶段无后端约束 | ✓ |
| 只保留资讯列表，不做搜索筛选 | 实现更轻，但不满足 `NEWS-02` | |
| 引入远端接口 / CMS 搜索 | 可扩展性更强，但超出本阶段 scope | |

**User's choice:** 自动选择 `客户端搜索 + 分类筛选 + 卡片列表`
**Notes:** 分类沿用 `全部 / 行业动态 / 科研成果 / 公司新闻`；数据源继续使用本地内容配置。

---

## 主题持久化

| Option | Description | Selected |
|--------|-------------|----------|
| `localStorage("theme")` + 根节点 `data-theme` | 与 baseline contract 一致，跨页可持久化 | ✓ |
| 仅会话内内存状态 | 实现简单，但不满足持久化要求 | |
| 跟随系统主题，不提供显式切换 | 现代化，但违背 baseline 的手动 toggle 合同 | |

**User's choice:** 自动选择 ``localStorage("theme")` + 根节点 `data-theme``
**Notes:** 默认保持 light，并保留日/夜切换文案与图标 affordance。

---

## 跨页导航交互

| Option | Description | Selected |
|--------|-------------|----------|
| Desktop scroll-reactive nav + mobile overlay menu + footer scroll-to-top | 完整恢复 baseline 跨页交互 | ✓ |
| 仅保留固定桌面 nav，不做移动 overlay / 返回顶部 | 实现更少，但不满足 `XPG-02` | |
| 重新设计成抽屉式或底部 tab 导航 | 可能更现代，但不符合 baseline 设计语言 | |

**User's choice:** 自动选择 `Desktop scroll-reactive nav + mobile overlay menu + footer scroll-to-top`
**Notes:** 现有 shared shell 已存在，Phase 4 只在其上增量恢复交互行为。

---

## 首页剩余交互保真

| Option | Description | Selected |
|--------|-------------|----------|
| 保持 Phase 3 页面结构，只补动画与交互保真 | 对齐 `HOME-03`，避免重做首页结构 | ✓ |
| 重新梳理首页 section 和交互节奏 | 变动更大，但超出本阶段边界 | |
| 只补 News 页面，不补首页交互 | 范围更小，但无法满足 `HOME-03` | |

**User's choice:** 自动选择 `保持 Phase 3 页面结构，只补动画与交互保真`
**Notes:** 重点是成果数字动画、优势/流程细节保真，以及 preview-to-detail news navigation 一致性。

---

## the agent's Discretion

- 动效触发实现方式与滚动监听技术细节
- News 数据模块与类型定义拆分方式
- Mobile overlay 与 nav 过渡动画的实现细节

## Deferred Ideas

- React runtime cutover — Phase 5
- 真实新闻分享 / CMS / 后端新闻源 — 后续版本
- 壳层 academy 合同改动 — 非本阶段
