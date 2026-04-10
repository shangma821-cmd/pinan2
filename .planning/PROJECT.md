# 频安AI智能商学院

## What This Is

这是一个基于 React + Vite 的品牌入口与 AI 商学院一体化项目。用户先通过入口首页进入品牌/落地页体验，再跳转到 AI 商学院主应用；项目同时支持 Web 构建和 Electron 打包交付。

## Current Milestone: v1.0 Kimi Landing 原版恢复与 React 工程化

**Goal:** 恢复 `7be7097^` 改动前的 Kimi landing 原版页面，并将其还原为项目内可维护、可扩展的 React 工程后接入现有入口链路。

**Target features:**
- 恢复 `Kimi_Agent_Deployment_v14` 在 `7be7097^` 之前的原版内容表达、信息结构和视觉基线
- 将恢复后的静态 HTML/CSS/JS 还原为项目内可维护的 React 源码、样式和资源结构
- 用该 React 工程替换当前静态 `entry-station` 集成方式，同时保持现有入口 URL 与首页跳转行为

## Core Value

让品牌入口页和 AI 商学院主应用都能以可维护、可扩展、可持续交付的工程形态稳定演进。

## Requirements

### Validated

- [x] 用户可以通过入口首页进入品牌落地页，再切换到 AI 商学院主应用
- [x] 项目可以通过 Vite 构建 Web 产物，并支持 Electron 打包交付

### Active

- [ ] 恢复 `7be7097^` 改动前的 Kimi landing 原版页面作为本里程碑唯一内容基线
- [ ] 将原版 landing 静态产物还原为项目内可维护的 React 源码与资源组织
- [ ] 用 React 工程替换当前静态 landing 集成方式，同时保持现有 `/entry-station` 入口稳定

### Out of Scope

- 重新设计或继续弱医疗化改写 landing 页面内容表达 — 本里程碑以 `7be7097^` 之前版本为准
- 重构 AI 商学院主应用功能模块 — 本里程碑聚焦入口 landing 的恢复、工程化和集成
- 引入 CMS、可视化搭建后台或运营发布系统 — 先完成 React 工程化与稳定接入

## Context

- 当前项目主入口由 `EntryShell.tsx` 管理，首页通过 iframe 加载 `/entry-station/index.html`
- `Kimi_Agent_Deployment_v14` 当前保存的是打包后的静态站点，但现有树中内容已被弱医疗化改写
- 本里程碑明确以 `7be7097^` 作为“未弱化原版”恢复基线，再基于该版本做 React 工程化
- 近期已通过 Vite 接入层让 `/entry-station` 可从 `Kimi_Agent_Deployment_v14` 提供内容，但这仍然不是可维护源码形态

## Constraints

- **Tech stack**: 保持 React 19 + Vite 6 + TypeScript 现有项目栈 — 避免为 landing 单独引入第二套前端框架
- **Compatibility**: 保持 `/entry-station` 入口地址和首页 iframe 跳转链路稳定 — 避免影响现有入口接入
- **Source baseline**: landing 原版恢复必须以 `7be7097^` 为准 — 避免基线混乱
- **Maintainability**: 最终交付必须是项目内可维护源码，不接受继续以纯打包产物作为长期维护对象 — 满足后续拓展目标

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `7be7097^` 作为 landing 原版恢复基线 | 用户已明确“没弱化之前”就是该版本之前状态 | — Pending |
| 保持 `/entry-station` 作为稳定入口 URL | 现有首页与入口集成已依赖该路径，改 URL 会扩大影响面 | — Pending |
| landing React 化后并入现有项目栈 | 目标是可维护与可扩展，不再长期维护静态打包产物 | — Pending |

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
*Last updated: 2026-04-09 after milestone v1.0 initialization*
