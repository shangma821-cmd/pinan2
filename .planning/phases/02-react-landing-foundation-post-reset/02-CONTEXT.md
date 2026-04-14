# Phase 2: React Landing Foundation (Post-Reset) - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

在不切换当前对外 landing 运行时归属的前提下，为 landing 建立 React 侧的五目的地路由骨架和共享页面框架，使 `/entry-station` 路由族具备可直达、可刷新、可继续扩展为完整恢复版页面的基础。此阶段不负责恢复完整 baseline 内容，也不负责完成最终 cutover。

</domain>

<decisions>
## Implementation Decisions

### 路由基础方案
- **D-01:** Phase 2 必须为 landing 引入正式的 React 路由层，不采用手写 `pathname` 分发，也不继续把 landing 基础结构停留在纯静态页路由上。
- **D-02:** React 侧要先建立五个 landing 目的地的 scoped route family：`/entry-station`、`/entry-station/about`、`/entry-station/products`、`/entry-station/franchise`、`/entry-station/news`。
- **D-03:** Phase 2 的路由方案必须从一开始就支持共享外层 shell + 内部目的地切换 + direct-load/refresh，以便后续 Phase 3/4 继续在同一骨架上恢复内容和交互。

### 与过渡运行时并存
- **D-04:** 对外公共入口 `/` 在 React cutover 前继续通过现有 shell iframe 指向 `/entry-station/index.html`，不在 Phase 2 改变这一用户可见行为。
- **D-05:** Phase 2 的 React landing foundation 与当前过渡运行时并存存在，作用是承接 `/entry-station` 路由族的 React 骨架能力，而不是立即替换公共流量。
- **D-06:** 不新增新的公开预览前缀或第二套 landing 公共路径；React foundation 直接围绕既有 `/entry-station` 路由族建设。

### 五页面脚手架深度
- **D-07:** 五个目的地都要有各自独立的 React 页面骨架，不能只做一个通用占位页复用到全部目的地。
- **D-08:** 每个页面骨架应体现各自页面身份、页级标题和后续 baseline 内容分区占位，让后续阶段可以按页面逐步填充原版信息结构。
- **D-09:** Phase 2 不提前搬运大量 baseline 正文内容，也不提前吞并完整页面恢复工作；内容恢复仍按 roadmap 留给 Phase 3/4。

### 共享 landing shell 完成度
- **D-10:** Phase 2 先把共享 React landing shell 的结构做实：统一导航框架、路由切换、当前目的地 active state、共享 footer、以及桌面/移动端基础响应式布局。
- **D-11:** 主题持久化、滚动感知导航、返回顶部、完整移动端导航交互等高保真跨页行为暂不要求在 Phase 2 完成，按 roadmap 留到后续交互阶段实现。
- **D-12:** 如果共享 shell 需要为后续交互预留结构或控件位置，可以做明显的 preparatory stub，但不能让这些 stub 被误认为已完成的 parity 交互。

### the agent's Discretion
- 具体采用哪一个正式 React 路由库，以及为 direct-load/refresh 配套的开发与构建路由处理细节。
- 页面骨架占位的具体文案、是否采用 section skeleton 还是更显式的 section placeholder 卡片。
- 对于后续才完成的主题切换或移动端高级交互，Phase 2 是先保留结构占位还是暂时省略，只要不违背本阶段边界即可。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone Scope And Requirements
- `.planning/PROJECT.md` — 里程碑目标、`/entry-station` 稳定公开路由约束、以及“先保留过渡运行时、后做 React cutover”的总体原则。
- `.planning/REQUIREMENTS.md` — Phase 2 对应的 `SHELL-02` 和五目的地落地范围；同时明确内容恢复与交互增强分布在后续阶段。
- `.planning/ROADMAP.md` — Phase 2 目标、依赖关系与成功标准，尤其是“五目的地可导航、可刷新、共享 React shell”这一边界。
- `.planning/STATE.md` — 当前 milestone 仍处于 planning 状态，Phase 1 已锁定 runtime truth 与 shell contract，需要 Phase 2 在此基础上继续推进。

### Phase 1 Carry-Forward Contracts
- `.planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md` — 当前 active transitional runtime、immutable baseline review truth、以及 reference-only 目录之间的归属边界。
- `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md` — `/`、`/academy`、`/entry-station`、iframe 行为和 academy return flow 的已锁定 public contract。
- `.planning/phases/01-baseline-lock-shell-contract/01-UI-SPEC.md` — 五目的地语义路由、共享 landing shell 方向、以及后续各页面信息架构恢复时必须承接的设计合同。

### Approved Baseline Review Truth
- `.planning/baselines/kimi-landing-7be7097-parent/README.md` — baseline pack 的来源说明与“非运行时”警告。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/index.html` — 审批基线入口结构参考，用于理解原版五目的地 IA 与资源组织。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js` — 原版前端行为和页面组织的静态产物参考。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css` — 原版视觉系统、布局与设计 token 参考。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EntryShell.tsx`：当前 `/` 与 `/academy` 的 host shell 边界实现，已经封装了 iframe 入口与 academy return 行为，Phase 2 必须复用其外层合同而不是绕过它。
- `index.tsx`：项目当前唯一公开 React 挂载入口，说明 landing foundation 仍需接在现有单入口应用框架下，而不是另起一个独立 React 应用。
- `public/entry-station/**`：当前 active transitional runtime，可用于对照现有公开 landing 行为与资源路径，但不是 immutable baseline review truth。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**`：原版 baseline 的不可变审查真相，用于确定后续各页面骨架最终要承接的 IA 和视觉方向。

### Established Patterns
- 当前项目尚未引入正式前端路由库；路径切换主要由 `EntryShell.tsx` 通过本地 state 和 `history.pushState` 手动处理，这正是 Phase 2 需要建立正式 landing route layer 的原因。
- 当前代码库几乎没有可复用的 landing React 组件体系；除宿主 shell 外，landing foundation 基本需要从 route shell、page scaffold、nav/footer 结构开始建立。
- 已锁定的用户可见合同把 host shell 行为和 landing runtime/内容恢复分开，因此 Phase 2 需要优先搭建“React 路由骨架 + 共享 shell”，而不是改写 `/` 的现有壳层。

### Integration Points
- `index.tsx` -> `EntryShell.tsx`：所有 public entry 行为仍从这里进入，Phase 2 的 landing foundation 必须和这一入口兼容。
- `EntryShell.tsx` 内 iframe `src="/entry-station/index.html?...`：这是当前公共流量承接点，Phase 2 不应直接破坏它，但要为后续替换内部落地能力铺路。
- `/entry-station` 路由族：Phase 2 的核心接入面，后续 Phase 3/4/5 都将在这一路由族继续恢复内容、交互与 cutover。
- `package.json`：当前依赖中没有现成路由库，说明正式路由方案会是一个明确的新增基础设施决策，而不是简单启用已有能力。

</code_context>

<specifics>
## Specific Ideas

- 用户确认“全部按推荐方案走”，因此本阶段以先搭 React 路由骨架和共享 shell 为主，不把内容恢复和高保真交互提前到当前阶段。
- 五个目的地要从一开始就是五个独立页面骨架，而不是一个通用模板页换标题。
- 共享 shell 这一步以结构可用、导航清晰、后续可扩展为主；交互增强留到对应后续阶段完成。

</specifics>

<deferred>
## Deferred Ideas

- Home、About、Products、Franchise 四个核心页面的完整 baseline 内容恢复与分区细化 — defer to Phase 3.
- News 列表/详情体验、搜索筛选、以及首页重点交互等高保真恢复 — defer to Phase 4.
- 主题持久化、滚动感知导航、返回顶部、完整移动端导航交互和最终 runtime cutover — defer to later phases per roadmap.

</deferred>

---

*Phase: 02-react-landing-foundation-post-reset*
*Context gathered: 2026-04-14*
