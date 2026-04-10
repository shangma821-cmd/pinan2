# 频安AI智能商学院

## What This Is

这是一个基于 React + Vite 的品牌入口与 AI 商学院一体化项目。用户先通过入口首页进入品牌/落地页体验，再跳转到 AI 商学院主应用；项目同时支持 Web 构建和 Electron 打包交付。

## Current Milestone: v1.0 Kimi Landing 原版恢复与 React 工程化

**Goal:** 在保持现有对外入口行为不变的前提下，先完成运行时事实重置（`public/entry-station/**` 继续作为过渡期运行时），再把 `7be7097^` 之前的 baseline 行为重建为可维护 React 工程并完成后续切换。

**Target features:**
- 以 `.planning/baselines/.../Kimi_Agent_Deployment_v14/**` 作为唯一不可变评审基线，恢复 `7be7097^` 前的内容表达与信息结构
- 明确 `public/entry-station/**` 是 React cutover 前的 active transitional runtime（对外生效）
- 将 baseline 行为重建为项目内可维护 React 源码、样式和资源结构，并在后续阶段替换过渡运行时

## Core Value

让品牌入口页和 AI 商学院主应用都能以可维护、可扩展、可持续交付的工程形态稳定演进。

## Requirements

### Validated

- [x] 用户可以通过入口首页进入品牌落地页，再切换到 AI 商学院主应用
- [x] 项目可以通过 Vite 构建 Web 产物，并支持 Electron 打包交付

### Active

- [ ] 完成 runtime reset：将 `public/entry-station/**` 明确为当前过渡期运行时真相，并完成 shell contract 重新校验
- [ ] 恢复 `7be7097^` 改动前的 Kimi landing baseline 行为作为重建标准（基于 immutable baseline pack）
- [ ] 将 baseline 行为还原为项目内可维护的 React 源码与资源组织，并在后续阶段完成对过渡运行时替换

### Out of Scope

- 重新设计或继续弱医疗化改写 landing 页面内容表达 — 本里程碑以 `7be7097^` 之前版本为准
- 重构 AI 商学院主应用功能模块 — 本里程碑聚焦入口 landing 的恢复、工程化和集成
- 引入 CMS、可视化搭建后台或运营发布系统 — 先完成 React 工程化与稳定接入

## Context

- 当前项目主入口由 `EntryShell.tsx` 管理，首页通过 iframe 加载 `/entry-station/index.html`
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**` 是唯一不可变 baseline 审核真相
- `public/entry-station/**` 当前再次作为 active transitional runtime，直到 React cutover 完成
- 工作树下的 `Kimi_Agent_Deployment_v14/**` 仅作可变参考资料，不再视为当前运行时 canonical truth
- academy 触发当前由过渡 wrapper 提供，但对外合同仍是 landing -> `/academy` -> `/`

## Constraints

- **Tech stack**: 保持 React 19 + Vite 6 + TypeScript 现有项目栈 — 避免为 landing 单独引入第二套前端框架
- **Compatibility**: 保持 `/entry-station` 入口地址和首页 iframe 跳转链路稳定 — 避免影响现有入口接入
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
*Last updated: 2026-04-11 after runtime-reset planning correction*
