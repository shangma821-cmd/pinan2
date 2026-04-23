# Requirements: 频安AI智能商学院

**Defined:** 2026-04-20
**Core Value:** 让品牌入口页和 AI 商学院主应用都能以可维护、可扩展、可持续交付的工程形态稳定演进

## v1.0 Requirements (Completed)

All v1.0 structural reconstruction requirements have been validated and completed.

- [x] **SHELL-01**: 用户在访问 `/` 时可以通过现有首页壳稳定进入 `/entry-station` 的落地页体验
- [x] **SHELL-02**: 用户可以在 landing 内访问与原版基线等价的五个目的地状态
- [x] **SHELL-03**: 用户在 landing 内触发商学院入口时，academy 打开链路可用
- [x] **HOME-01**: 首页信息结构与原版等价
- [x] **HOME-02**: 首页 CTA 链接到产品和加盟
- [x] **HOME-03**: 首页关键互动（优势展开、流程切换、成果数字）
- [x] **ABOUT-01**: 独立关于我们页面
- [x] **ABOUT-02**: 关于我们内容分组与原版等价
- [x] **PROD-01**: 独立产品服务页面
- [x] **PROD-02**: 核心产品与会员套餐切换
- [x] **PROD-03**: 产品说明与案例内容
- [x] **FRAN-01**: 独立加盟合作页面
- [x] **FRAN-02**: 合作模式、收益、支持信息
- [x] **FRAN-03**: 咨询表单界面与联系信息
- [x] **NEWS-01**: 新闻列表视图
- [x] **NEWS-02**: 客户端搜索与分类筛选
- [x] **NEWS-03**: `?id=` 详情视图
- [x] **XPG-01**: 主题持久化
- [x] **XPG-02**: 移动端导航、滚动态导航、返回顶部
- [x] **XPG-03**: React 源码产出替代静态拷贝

## v1.1 Requirements

Requirements for pixel-perfect visual compliance. Each maps to roadmap phases.

### CSS Variable System

- [ ] **CSSVAR-01**: 用户看到的 landing 默认主题为暗色（dark-first），`:root` 包含完整暗色 token 值
- [ ] **CSSVAR-02**: 用户切换到浅色主题时，`[data-theme=light]` 覆盖层提供完整的 15 个语义 token
- [ ] **CSSVAR-03**: 品牌绿色在暗色主题为 `#7a9e7a`、浅色主题为 `#34C759`，与 baseline 一致
- [x] **CSSVAR-04**: landing CSS 变量与 academy `index.css` 无命名冲突，scope 隔离已验证
- [ ] **CSSVAR-05**: 首次加载无白色闪烁（synchronous theme script in `index.html`）

### Typography

- [ ] **TYPO-01**: 用户看到的正文字体为 Inter（通过 @fontsource 自托管），Noto Sans SC 已移除
- [ ] **TYPO-02**: 用户看到的标题字体为 Montserrat（通过 @fontsource 自托管），与 baseline 一致
- [ ] **TYPO-03**: 字体渲染启用 antialiased smoothing，与 baseline 视觉一致

### Animations & Effects

- [ ] **ANIM-01**: 用户看到暗色背景上的浮动光球动画（float 系列 5 个变体）
- [ ] **ANIM-02**: 用户看到资质横幅的水平滚动 marquee 动画（30s linear infinite）
- [ ] **ANIM-03**: 用户看到 CTA 和卡片上的 pulse-glow 呼吸发光效果
- [ ] **ANIM-04**: 导航栏和卡片呈现 `.glass-effect` 毛玻璃质感（backdrop-filter），含 Safari 兼容
- [ ] **ANIM-05**: Hero 标题呈现 `.text-gradient` 渐变文字效果
- [ ] **ANIM-06**: CTA 按钮呈现 `.shadow-glow` 发光阴影效果
- [ ] **ANIM-07**: 动画支持 `prefers-reduced-motion` 无障碍降级

### Assets & Spacing

- [ ] **ASSET-01**: 全部 baseline 图片资源已注册到 `assets.ts` 并在对应页面区块正确引用
- [ ] **ASSET-02**: 圆角 token `--radius` 按主题响应（dark `0.625rem` / light `1rem`），与 baseline 一致
- [ ] **ASSET-03**: 间距 token 与 baseline Tailwind 精确值对齐（4px grid），消除 off-by-4px 偏差

### Visual QA

- [ ] **VQA-01**: 用户在桌面端逐页看到与 baseline 像素级一致的视觉表现（Home、About、Products、Franchise、News）
- [ ] **VQA-02**: 用户在移动端逐页看到与 baseline 像素级一致的视觉表现
- [ ] **VQA-03**: Playwright `toHaveScreenshot()` 视觉回归测试套件建立，golden 来自 baseline 构建产物

## v2 Requirements

### Integrations

- **INTG-01**: 用户提交加盟表单后可以进入真实的后端线索流转
- **INTG-02**: 用户可以使用真实的新闻分享能力而不只是静态按钮

### Operations

- **OPER-01**: 运营可以通过 CMS 或内容配置系统维护 landing 内容
- **OPER-02**: 团队可以对 landing 文案进行单独的合规改写或多版本管理

## Out of Scope

| Feature | Reason |
|---------|--------|
| 引入 Tailwind CSS 框架 | baseline 虽使用 Tailwind 构建，但 React 端通过手写 CSS 变量精确匹配即可 |
| 改变页面结构或功能逻辑 | v1.1 仅调整视觉表现，不改变 v1.0 已验证的结构与交互 |
| 重构 AI 商学院主应用功能 | 本里程碑只聚焦 landing 视觉合规 |
| 新增 CMS、运营后台或内容发布系统 | 视觉合规优先 |
| 为加盟表单或新闻分享补后台服务 | 当前目标是视觉复刻，不扩展后台链路 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CSSVAR-04 | Phase 6 | Complete |
| TYPO-01 | Phase 7 | Pending |
| TYPO-02 | Phase 7 | Pending |
| TYPO-03 | Phase 7 | Pending |
| CSSVAR-01 | Phase 8 | Pending |
| CSSVAR-02 | Phase 8 | Pending |
| CSSVAR-03 | Phase 8 | Pending |
| CSSVAR-05 | Phase 8 | Pending |
| ANIM-01 | Phase 9 | Pending |
| ANIM-02 | Phase 9 | Pending |
| ANIM-03 | Phase 9 | Pending |
| ANIM-04 | Phase 9 | Pending |
| ANIM-05 | Phase 9 | Pending |
| ANIM-06 | Phase 9 | Pending |
| ANIM-07 | Phase 9 | Pending |
| ASSET-01 | Phase 10 | Pending |
| ASSET-02 | Phase 10 | Pending |
| ASSET-03 | Phase 10 | Pending |
| VQA-01 | Phase 11 | Pending |
| VQA-02 | Phase 11 | Pending |
| VQA-03 | Phase 11 | Pending |

**Coverage:**
- v1.1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-20*
*Last updated: 2026-04-20 after v1.1 roadmap creation*
