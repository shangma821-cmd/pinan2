# Phase 4: News & Interaction Equivalence - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

在保留 Phase 3 已完成的 React 页面结构与共享 landing shell 前提下，补齐 News 列表/筛选/搜索/详情以及跨页主题、导航、滚动、返回顶部等 baseline 交互，使 `/entry-station` 五个目的地在交互层达到接近 approved baseline 的等价体验；本阶段不负责 runtime cutover、CMS/后端集成或新增营销能力。

</domain>

<decisions>
## Implementation Decisions

### 恢复边界与真相
- **D-01:** Phase 4 继续以 immutable baseline pack 与 Phase 1 `01-UI-SPEC.md` 作为唯一交互与视觉真相，React 只做工程化重建，不借机改写交互模型。
- **D-02:** Phase 4 只覆盖 `HOME-03`、`NEWS-01`、`NEWS-02`、`NEWS-03`、`XPG-01`、`XPG-02`；runtime cutover 留到 Phase 5，CMS、真实分享能力与表单后台仍然出 scope。

### News 体验合同
- **D-03:** News 继续保持独立 `/entry-station/news` 路由家族，列表与详情共用同一路由页面组件，详情通过 `?id=` 驱动，并提供显式“返回列表” affordance。
- **D-04:** News 列表继续使用基线的客户端搜索 + 分类筛选 + 卡片浏览模式；分类沿用基线 taxonomy：`全部`、`行业动态`、`科研成果`、`公司新闻`。
- **D-05:** News 数据在本阶段继续使用项目内本地内容/静态配置完成 parity，不引入远端接口、CMS 或真实分享集成。

### 跨页主题与导航交互
- **D-06:** 主题切换必须在 landing 全路由内持久化，继续以 `localStorage("theme")` + 根节点 `data-theme` 为合同，默认主题保持 light，并保留日/夜切换文案与 sun/moon affordance。
- **D-07:** 共享导航在 Phase 4 内恢复 desktop scroll-reactive 状态、mobile hamburger/overlay 导航与 active pill parity；不新增第二套导航体系。
- **D-08:** Footer 继续出现在五个 landing 目的地，并恢复 scroll-to-top 控件与平滑滚动体验；交互文案或 `aria-label` 需要可读。

### 首页剩余交互补齐
- **D-09:** Home 在 Phase 3 已落地的优势展开与流程切换基础上，Phase 4 只补齐“等价交互保真”，尤其是成果数字动画与 preview-to-detail news navigation，不重做首页信息架构。

### the agent's Discretion
- 动效触发实现细节（例如 `IntersectionObserver`、滚动阈值、节流/防抖）。
- News 本地数据的模块拆分方式、类型定义组织与是否拆成独立 content/data 文件。
- Mobile overlay/menu 的动画形式和 desktop nav 从透明到毛玻璃的过渡数值，只要行为与 baseline 合同一致。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 里程碑与需求边界
- `.planning/PROJECT.md` — 里程碑目标、`/entry-station` 稳定公开路由约束，以及 runtime cutover 仍未开始的边界。
- `.planning/REQUIREMENTS.md` — Phase 4 对应的 `HOME-03`、`NEWS-01`、`NEWS-02`、`NEWS-03`、`XPG-01`、`XPG-02` 范围定义。
- `.planning/ROADMAP.md` — Phase 4 目标、依赖关系与 success criteria。
- `.planning/STATE.md` — 当前已完成到 Phase 3，并进入 Phase 4 discuss / plan 前状态。

### 前置阶段约束
- `.planning/phases/01-baseline-lock-shell-contract/01-CONTEXT.md` — baseline truth、shell contract 与 source-of-truth 边界。
- `.planning/phases/01-baseline-lock-shell-contract/01-UI-SPEC.md` — News route contract、theme toggle、mobile nav、scroll-reactive nav、scroll-to-top 与交互保真要求。
- `.planning/phases/02-react-landing-foundation-post-reset/02-CONTEXT.md` — `/entry-station` React 路由骨架和共享 shell 基础。
- `.planning/phases/02-react-landing-foundation-post-reset/02-VERIFICATION.md` — 已验证的 React-owned landing route family 与共享 shell 事实。
- `.planning/phases/03-core-page-reconstruction/03-CONTEXT.md` — 已明确 defer 到 Phase 4 的 News / theme / mobile nav / scroll / back-to-top 边界。
- `.planning/phases/03-core-page-reconstruction/03-VERIFICATION.md` — Phase 3 已完成页面重建与现有 Playwright 覆盖事实。

### Approved Baseline Review Truth
- `.planning/baselines/kimi-landing-7be7097-parent/README.md` — baseline pack 来源与使用规则。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/index.html` — approved baseline 入口与资源结构参考。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js` — approved baseline 中 News 数据、`?id=` 详情态、theme/nav/footer 交互与页面组织参考。
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css` — approved baseline 的 light/dark token、导航/卡片/动效与 reduced-motion 规则参考。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `landing/pages/LandingNewsPage.tsx`：已经是独立路由入口，适合直接承接 News 列表 / 详情双态。
- `landing/components/LandingNav.tsx`：当前已有共享 nav 与 active pill 基础，Phase 4 应在此基础上加入 theme toggle、mobile overlay 与 scroll-reactive 状态，而不是重建导航。
- `landing/components/LandingShell.tsx`：已统一包裹五个目的地，适合挂载跨页主题状态、滚动监听或共享 UI 控件。
- `landing/components/LandingFooter.tsx`：当前已有共享 footer 与联系信息，可在此补上 scroll-to-top 控件。
- `landing/sections/home/HomeAdvantages.tsx`：已具备单选展开基础，Phase 4 不需要重做结构。
- `landing/sections/home/HomeProcess.tsx`：已具备 5 秒自动推进 + 手动切换基础，可继续对齐 baseline 触发与节奏。
- `landing/sections/home/HomeResults.tsx`：当前成果数字仍是静态文本，适合在 Phase 4 补上进入视口后的数字动画。
- `landing/sections/home/HomeNewsPreview.tsx`：已深链到 `/news?id=1/2/3`，说明 preview-to-detail 导航合同已建立。
- `landing/landing.css` 与 `landing/assets.ts`：已提供 landing 级 token、组件样式与资源路径注册表。
- `tests/landing-routing.spec.ts` 与 `tests/landing-core-pages.spec.ts`：现有测试基础可继续扩展到 Phase 4 的 News 与 cross-page 交互覆盖。

### Established Patterns
- landing 已采用 React Router + `basename="/entry-station"` 接管 route family，说明 News 详情应优先使用 query-string / route state，而不是退回静态页面跳转。
- 当前 landing 使用 namespaced CSS（`landing/**`）而非 utility-first 方案，Phase 4 应延续相同组织方式。
- 页面交互目前主要由 `useState` / `useEffect` 在页面或 section 组件内部完成，说明 Phase 4 可以继续采用 page-local / shell-local 交互状态，而不必提前引入全局状态库。

### Integration Points
- `landing/pages/LandingNewsPage.tsx` 是 News 列表、搜索、筛选、详情与返回逻辑的直接落点。
- `landing/components/LandingNav.tsx`、`landing/components/LandingShell.tsx`、`landing/components/LandingFooter.tsx` 是 theme toggle、mobile nav、scroll-reactive nav、scroll-to-top 的主要接入点。
- `tests/landing-routing.spec.ts` 适合继续保护 shared shell 与五路由可达性；Phase 4 预计需要新增 News / interaction 维度的 Playwright 覆盖。

</code_context>

<specifics>
## Specific Ideas

- 由于 `$gsd-next` 采用零摩擦推进，而本阶段关键交互大多已被前置 UI 合同锁定，因此本次 discuss 按推荐默认值自动收束。
- `[auto]` News 详情继续沿用同路由 `?id=` 模式，而不是拆成 `/news/:id` 或 modal 详情。
- `[auto]` 主题持久化、mobile overlay 导航、scroll-reactive nav、scroll-to-top 都按 Phase 1 UI 合同恢复，不再重新讨论“要不要做”。
- `[auto]` News 列表分类继续沿用基线中的 `全部 / 行业动态 / 科研成果 / 公司新闻`，搜索与筛选保持纯客户端实现。
- 首页新闻预览仍然以 `/news?id={id}` 深链驱动详情页，避免出现两套 News 详情入口合同。

</specifics>

<deferred>
## Deferred Ideas

- 最终 React runtime cutover，让 built `/entry-station` 完全替换 `public/entry-station/**` — defer to Phase 5。
- 真实新闻分享能力、后端新闻源、CMS/运营发布系统 — 超出当前里程碑本阶段范围。
- Academy 打开链路或 `/` 壳层 contract 的进一步改动 — 不属于 Phase 4，仍受 Phase 1 / Phase 5 边界约束。

</deferred>

---

*Phase: 04-news-interaction-equivalence*
*Context gathered: 2026-04-20*
