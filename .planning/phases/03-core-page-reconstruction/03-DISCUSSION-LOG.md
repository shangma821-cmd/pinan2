# Phase 3: Core Page Reconstruction - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16T18:05:33Z
**Phase:** 03-Core Page Reconstruction
**Areas discussed:** 恢复保真度、交互范围切分、内容与资源来源、组件组织方式

---

## 恢复保真度

| Option | Description | Selected |
|--------|-------------|----------|
| 高保真 React 重建 | 以 approved baseline 为准，恢复页面顺序、主要图文层级、CTA 语义和核心视觉风格 | ✓ |
| 结构优先低保真恢复 | 只补齐结构和占位，视觉与内容细节留到后面 | |
| 静态块嵌入式恢复 | 直接拼接静态 HTML / bundle 片段，优先求快 | |

**User's choice:** 自动默认选择：高保真 React 重建（推荐）
**Notes:** 当前会话按 `$gsd-next` 零摩擦推进，未进入交互式问答，因此采用推荐默认值；原因是 Phase 3 roadmap 已明确要求“restored core marketing destinations”，不是低保真补洞。

---

## 交互范围切分

| Option | Description | Selected |
|--------|-------------|----------|
| 恢复页面内核心交互，跨页增强后置 | 恢复 Home CTA、优势展开、流程切换/自动推进、数字展示、Products 双视图等；主题/移动导航/scroll 感知等留到后续 phase | ✓ |
| 仅恢复静态内容 | 本阶段不做任何页面内交互，只放静态版块 | |
| 把跨页增强也一起并入 | 主题持久化、滚动导航、移动菜单等一起做 | |

**User's choice:** 自动默认选择：恢复页面内核心交互，跨页增强后置（推荐）
**Notes:** 这与 ROADMAP Phase 3 / Phase 4 的边界一致，也延续了 Phase 2 已明确的 deferred 范围。

---

## 内容与资源来源

| Option | Description | Selected |
|--------|-------------|----------|
| 仅以 immutable baseline pack 为内容/视觉真相，转写成项目内 React 源码与资源 | 保持 approved baseline 为唯一评审真相，不把 transitional runtime 或 mutable working tree 当作决策来源 | ✓ |
| 以 `public/entry-station/**` 为主恢复 | 优先参考当前过渡运行时内容 | |
| 直接依赖 mutable `Kimi_Agent_Deployment_v14/**` | 以当前工作树可变目录为主恢复 | |

**User's choice:** 自动默认选择：仅以 immutable baseline pack 为内容/视觉真相，转写成项目内 React 源码与资源（推荐）
**Notes:** 这直接沿用了 Phase 1 锁定的 source-of-truth 边界，避免 Phase 3 被当前运行时漂移带偏。

---

## 组件组织方式

| Option | Description | Selected |
|--------|-------------|----------|
| page-level sections 优先 | 在现有 page 文件里按 section 拆分，真正重复时再抽共享组件，继续复用现有 landing shell/nav/footer | ✓ |
| 每页单大组件快速拼装 | 先把每页做成一个大文件，后续再拆 | |
| 先建通用 design system 再恢复页面 | 提前抽象出大量通用组件和设计系统 | |

**User's choice:** 自动默认选择：page-level sections 优先（推荐）
**Notes:** 这样既符合“可维护 React 源码”目标，也避免在 Phase 3 提前做过度抽象，影响基线保真恢复速度。

---

## the agent's Discretion

- 具体 section 组件拆分粒度
- baseline 图片与静态资源的组织方式
- 页面内动画和切换行为的具体实现细节

## Deferred Ideas

- 完整 News parity（列表 / 搜索 / 分类 / 详情） — Phase 4
- 主题持久化、滚动导航、移动端完整导航和返回顶部 — Phase 4
- 最终 React runtime cutover — Phase 5
- Franchise 表单真实后端集成 — 后续集成阶段
