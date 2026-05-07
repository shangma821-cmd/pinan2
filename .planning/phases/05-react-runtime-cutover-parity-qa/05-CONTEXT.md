# Phase 5: React Runtime Cutover & Parity QA - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

将 `/` 壳层中的 landing iframe 从过渡期 `/entry-station/index.html` 切换到 React-owned `/entry-station` 路由，并让 landing 资源由 React/Vite 构建产物拥有；同时通过 direct load 与 shell iframe 两条路径证明 cutover 后体验一致。本阶段不新增页面内容、不改 academy 业务逻辑，也不引入后端服务。

</domain>

<decisions>
## Implementation Decisions

### Runtime Cutover
- **D-01:** `/entry-station` 继续是稳定公开 landing 路由；cutover 只改变运行时所有权，不改变公开入口语义。
- **D-02:** `/` 下的壳层 iframe 目标改为 `/entry-station`，不再把 `/entry-station/index.html` 当作当前公开 landing 运行时。
- **D-03:** landing 运行时资源改由 React/Vite 构建产物拥有；`landing/assets.ts` 不再导出 `/entry-station/*.jpg` 这种 public-path 直链。

### Verification Contract
- **D-04:** Phase 5 必须同时验证 direct `/entry-station` 与 shell iframe `/` 两条链路，不能只验证其中一条。
- **D-05:** Phase 5 的主要 requirement 只有 `XPG-03`，但验证应继续回归 Phase 4 已完成的 landing 行为，避免 cutover 破坏现有 parity。

### the agent's Discretion
- 静态过渡文件 `public/entry-station/index.html` 在仓库中是否继续保留，只要它不再承担当前公开 landing runtime 责任即可。
- Phase 5 验证文件与测试文件如何拆分，只要 direct + iframe parity 证据完整即可。

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EntryShell.tsx` 已经明确区分 `home / landing / academy` 三种模式，是 cutover 的直接落点。
- `landing/assets.ts` 已经集中管理 landing 图片引用，适合一次性切换到 bundler-owned asset URLs。
- `tests/landing-routing.spec.ts`、`tests/landing-core-pages.spec.ts`、`tests/landing-news-interactions.spec.ts` 已经覆盖了 Phase 2-4 的 landing 行为，可作为 Phase 5 回归基线。

### Established Patterns
- landing 体验当前完全由 `landing/**` 驱动，说明 cutover 不需要再回到 `public/entry-station/**` 做内容修改。
- preview-backed Playwright 已经是该项目 landing 验证的既有方式。

### Integration Points
- `EntryShell.tsx` 中 `<iframe src=\"...\">` 是 shell cutover 的关键接入点。
- `landing/assets.ts` 是资源所有权切换的关键接入点。
- 新增 Phase 5 测试应与现有 landing browser suite 保持同一套 preview-backed 验证方式。

</code_context>

<specifics>
## Specific Ideas

- `[auto]` 让 iframe 直接指向 `/entry-station`，这样 `/` 与 direct load 会使用同一套 React landing runtime。
- `[auto]` 通过 bundler-owned asset imports 验证 landing 已脱离 `public/entry-station/*.jpg` 这种公开路径依赖。
- `[auto]` 用新的 cutover spec 证明 direct `/entry-station` 和 iframe `/` 都能看到 React landing shell。

</specifics>

<deferred>
## Deferred Ideas

- 进一步清理仓库中的 legacy public landing 文件
- academy 链路体验增强或 landing 内新增 academy 入口 UI
- CMS、分享、表单后端等后续版本能力

</deferred>

---

*Phase: 05-react-runtime-cutover-parity-qa*
*Context gathered: 2026-04-20*
