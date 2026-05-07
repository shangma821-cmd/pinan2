# Phase 2: React Landing Foundation (Post-Reset) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-14T16:50:12+0800
**Phase:** 2-React Landing Foundation (Post-Reset)
**Areas discussed:** 路由实现方式、与过渡 runtime 的并存方式、五个页面脚手架深度、共享 landing shell 完成度

---

## 路由实现方式

| Option | Description | Selected |
|--------|-------------|----------|
| 正式路由库 | 为 `/entry-station` 路由族建立真正的 React 路由层，支持共享 shell、目的地切换、direct-load 和 refresh。 | ✓ |
| 手写 pathname 分发 | 继续用手动读取路径和条件渲染方式搭 landing 五目的地。 | |
| 继续依赖静态页路由 | React 先不接管 landing 路由骨架，继续以静态页为主。 | |

**User's choice:** 正式路由库
**Notes:** 建议理由是这会直接决定 Phase 2 到 Phase 5 的骨架稳定性。用户回复“all 我觉得都按你推荐的挺好”，接受推荐方案。

## 与过渡 runtime 的并存方式

| Option | Description | Selected |
|--------|-------------|----------|
| iframe 保持过渡页，React 接管 `/entry-station` 路由族 | `/` 里的 iframe 继续指向 `/entry-station/index.html`，React foundation 同时建设 `/entry-station` 及其子路由的直达能力。 | ✓ |
| iframe 内加运行时切换开关 | 在 iframe 内切换 React 版与静态版 landing。 | |
| 先放到其他预览前缀 | 先在新的预览路径搭 React landing，后面再迁回 `/entry-station`。 | |

**User's choice:** iframe 保持过渡页，React 接管 `/entry-station` 路由族
**Notes:** 推荐理由是最符合 roadmap 中“公共流量不切换，但 React foundation 先站起来”的要求。用户直接接受推荐方案。

## 五个页面脚手架深度

| Option | Description | Selected |
|--------|-------------|----------|
| 各页面独立骨架 + 内容占位 | Home/About/Products/Franchise/News 都有自己的页面骨架、标题和后续分区占位，但不提前恢复完整正文。 | ✓ |
| 五页共用一个通用占位模板 | 先用同一模板撑起五个目的地，只改标题。 | |
| 现在就提前搬入大量 baseline 内容 | 在 foundation 阶段直接开始恢复大段原版内容。 | |

**User's choice:** 各页面独立骨架 + 内容占位
**Notes:** 推荐理由是这样最利于 Phase 3/4 接着填内容，也避免 foundation 阶段 scope creep。用户确认采用推荐方案。

## 共享 landing shell 完成度

| Option | Description | Selected |
|--------|-------------|----------|
| 结构壳层先做实，互动增强后置 | 先完成共享导航框架、footer、route active state、基础响应式；主题持久化、滚动感知、返回顶部等留到后续阶段。 | ✓ |
| 共享壳层一次做到接近最终态 | 在 Phase 2 就把多数高保真交互一起做完。 | |
| 只做最薄的 header + outlet | 先只做最小壳层，不建立完整共享 frame。 | |

**User's choice:** 结构壳层先做实，互动增强后置
**Notes:** 推荐理由是既满足 Phase 2 成功标准，又不把 Phase 4 的交互阶段提前吞掉。用户确认采用推荐方案。

## the agent's Discretion

- 正式 React 路由库的具体选择与 direct-load/refresh 的配套路由处理细节。
- 页面骨架占位的表现形式和占位文案风格。
- 延后完成的 shell 控件是先保留结构占位还是暂时不渲染。

## Deferred Ideas

- Home/About/Products/Franchise 的完整 baseline 内容恢复留到 Phase 3。
- News 高保真恢复以及首页重点互动恢复留到 Phase 4。
- 主题持久化、滚动导航、返回顶部和最终 cutover 留到后续阶段。
