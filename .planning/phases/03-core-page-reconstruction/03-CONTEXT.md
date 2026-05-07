# Phase 3: Core Page Reconstruction - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

在已完成的 `/entry-station` React 路由骨架与共享 shell 基础上，把 Home、About、Products、Franchise 四个核心营销目的地恢复为接近 approved baseline 的 React 页面，实现原版信息架构、关键 CTA 流向、页面内必要交互与内容分组；本阶段不负责完整 News 体验、跨页主题/导航高级交互，也不负责最终 runtime cutover。

</domain>

<decisions>
## Implementation Decisions

### 恢复保真度与边界
- **D-01:** Phase 3 采用“高保真 React 重建”而不是低保真结构占位：Home、About、Products、Franchise 必须恢复 approved baseline 的核心 section 顺序、主要文案/CTA 语义、图文层级与页面身份，而不是只做 wireframe 化补齐。
- **D-02:** Phase 3 只恢复四个核心页面与首页内的 news preview，不把完整 News 列表/详情/筛选搜索、主题持久化、滚动感知导航、完整移动端导航、返回顶部和最终 cutover 提前并入本阶段。

### 内容与资源来源
- **D-03:** Core page reconstruction 的唯一内容与视觉真相仍然是 `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**` 与 Phase 1 `01-UI-SPEC.md`；`public/entry-station/**` 和 mutable `Kimi_Agent_Deployment_v14/**` 只能作为运行时/参考线索，不能反向覆盖基线决策。
- **D-04:** 页面恢复必须落成项目内可维护的 React/Vite 源码与项目自有资源组织；不允许通过嵌入整块静态 HTML、继续依赖 iframe 内页内容、或直接把 baseline bundle 当长期运行时代码拼接进来。

### 页面与交互恢复策略
- **D-05:** Home 必须恢复锁定的 section 顺序，并纳入 Phase 3 范围内的关键行为：Hero CTA 分别导向 Products/Franchise、核心优势单选展开、服务流程步骤切换/自动推进、成果数字展示，以及通向 News 页的 preview 卡片/CTA。
- **D-06:** Products 页面必须在本阶段恢复“核心产品 / 会员套餐”双视图切换与推荐套餐强调；Franchise 页面恢复合作方案、收益测算、支持与保障区块以及表单 UI，但不扩展为真实后端提交流程。
- **D-07:** About、Products、Franchise 的恢复优先级是先把 approved baseline 的页面结构、内容分组和关键信息块恢复完整，再做局部优化；不得为了“工程简单”压扁成少量通用营销块。

### 组件组织与壳层演进
- **D-08:** 延续 Phase 2 已落地的共享 landing shell、`routeMetadata`、独立 page 文件与 `/entry-station` 路由归属，不再引入第二套 landing 壳层或新的公开路由命名。
- **D-09:** 以“页面内 section 组件”作为默认重建单位：每个页面可以拆出自己的 hero/section 组件，只有当多个页面确实共享同一种 baseline 模式时才抽离为跨页组件，避免过早做成抽象 design system。

### the agent's Discretion
- 具体 section/component 的文件拆分粒度，以及哪些 section 值得单独建文件。
- baseline 图片与资源导入的落位方式、命名方式与目录组织。
- 数字动画、流程自动推进等页面内交互的具体实现方式，只要行为与本阶段范围一致且可验证。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 里程碑与需求边界
- `.planning/PROJECT.md` — 里程碑目标、`/entry-station` 稳定公开路由约束，以及“React 工程化替换过渡运行时”的总体方向。
- `.planning/REQUIREMENTS.md` — Phase 3 对应的 `HOME-01`、`HOME-02`、`ABOUT-01`、`ABOUT-02`、`PROD-01`、`PROD-02`、`PROD-03`、`FRAN-01`、`FRAN-02`、`FRAN-03` 范围定义。
- `.planning/ROADMAP.md` — Phase 3 目标、依赖关系与 success criteria。
- `.planning/STATE.md` — 当前 Phase 2 已完成、Phase 3 尚未计划，且保留一个非阻塞的手工 shell spot-check 待跟进。

### 前置阶段约束
- `.planning/phases/01-baseline-lock-shell-contract/01-CONTEXT.md` — baseline truth、shell contract 和 runtime/source-of-truth 边界。
- `.planning/phases/01-baseline-lock-shell-contract/01-UI-SPEC.md` — Home / About / Products / Franchise / News 的页面合同、共享壳层、视觉方向与“禁止重设计”边界。
- `.planning/phases/02-react-landing-foundation-post-reset/02-CONTEXT.md` — `/entry-station` React 路由骨架、共享 shell、五目的地脚手架与 defer 边界。
- `.planning/phases/02-react-landing-foundation-post-reset/02-VERIFICATION.md` — 已验证的 `/entry-station` 路由归属、direct-load/refresh 行为和共享 shell 事实。

### Approved Baseline Review Truth
- `.planning/baselines/kimi-landing-7be7097-parent/README.md` — baseline pack 来源与“非运行时”使用规则。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/index.html` — approved baseline 入口结构与资源组织参考。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js` — approved baseline 的页面组织、交互标记与 section 结构静态产物参考。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css` — approved baseline 的视觉系统、布局、token 与动效样式参考。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EntryShell.tsx`：已经锁定 `/`、`/entry-station*`、`/academy` 三态归属，Phase 3 不需要重新讨论公开入口合同。
- `landing/routeMetadata.ts`：五目的地的 path / key / label 已集中定义，可作为页面重建与 nav active 状态的单一来源。
- `landing/components/LandingShell.tsx`、`landing/components/LandingNav.tsx`、`landing/components/LandingFooter.tsx`：已存在共享壳层骨架，Phase 3 应在其上恢复 baseline 风格与信息，而不是另起壳层。
- `landing/pages/*.tsx`：Home / About / Products / Franchise / News 已有独立 page 文件，适合直接替换 scaffold 内容为真实 section 结构。
- `tests/landing-routing.spec.ts`：已有 route smoke，可继续保护 `/entry-station*` 路由归属与静态 `/entry-station/index.html` 共存事实。

### Established Patterns
- landing 已采用 React Router 并由 `LandingApp.tsx` 通过 `basename="/entry-station"` 接管 scoped route family。
- 当前代码已把“共享 shell”与“页面内容”分开，说明 Phase 3 应主要演进 page-level 内容与 shell fidelity，而不是回退到静态 bundle 思路。
- 当前仓库已接受“每个目的地一个独立页面组件”的模式，因此 Phase 3 适合继续 page-by-page 恢复，而不是合并为单长页。

### Integration Points
- `landing/pages/LandingHomePage.tsx`、`landing/pages/LandingAboutPage.tsx`、`landing/pages/LandingProductsPage.tsx`、`landing/pages/LandingFranchisePage.tsx` 是本阶段的直接重建入口。
- `landing/routes.tsx` 负责把页面组件挂回共享 shell，Products 的双视图和 Home CTA 跳转最终都会从这里暴露到路由层。
- `landing/components/LandingNav.tsx` 和 `landing/components/LandingFooter.tsx` 需要从结构 stub 演进到 baseline 风格与信息内容，以支撑核心页面的整体视觉恢复。

</code_context>

<specifics>
## Specific Ideas

- 执行模式下未进入交互问答，本阶段灰区按推荐默认值自动收束，并将在 `03-DISCUSSION-LOG.md` 里记录为自动选择。
- Home 页面要保留 approved baseline 的首页新闻预览，而不是因为完整 News 体验在 Phase 4 就把首页 news preview 一并删除。
- 核心视觉锚点继续遵守 `01-UI-SPEC.md`：Home hero 的 `AI细胞修复 / 告别亚健康` 组合、摄影主导的版式、绿色强调色与玻璃感 UI，不做 compliance-safe 扁平化替代。
- 页面内需要恢复的交互以 baseline 已锁定的页面内能力为主，尤其是 Home 的 CTA/优势展开/流程切换/数字展示，以及 Products 的双视图切换。

</specifics>

<deferred>
## Deferred Ideas

- News 列表/详情、搜索、分类筛选和 `?id=` detail parity — defer to Phase 4.
- 主题持久化、滚动感知导航、完整移动端导航、返回顶部以及跨页 dark/light parity 完整闭环 — defer to Phase 4.
- 最终 React runtime cutover、让 built `/entry-station` 完全摆脱 transitional runtime — defer to Phase 5.
- Franchise 表单真实后端线索流转与集成能力 — 超出本里程碑当前阶段，属于后续集成工作。

</deferred>

---

*Phase: 03-core-page-reconstruction*
*Context gathered: 2026-04-16*
