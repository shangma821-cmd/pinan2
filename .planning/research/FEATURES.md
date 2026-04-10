# Feature Landscape

**Domain:** Kimi landing restoration from pre-`7be7097` baseline  
**Researched:** 2026-04-09

## Executive Take

The original baseline was not the current single-page compliance-safe `entry-station` site. It was a packaged React marketing SPA with five user-facing routes: `/`, `/about`, `/products`, `/franchise`, and `/news`, plus shared navigation, theme toggle, and footer. React reconstruction should preserve that information architecture first; collapsing it into one long page would be a baseline regression.

For roadmap scoping, treat this milestone as **equivalence restoration + maintainable source reconstruction**, not copy redesign. The goal is to keep route structure, content groupings, CTA destinations, and meaningful interactions equivalent while moving the implementation into the existing app stack and `/entry-station` integration.

## Table Stakes

| Feature Area | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Shared landing shell | The original site had a persistent brand shell across all routes | Med | Fixed top nav, active route state, mobile menu, theme toggle, footer |
| Multi-route IA | The baseline exposed 5 distinct pages, not one scroll page | High | `/`, `/about`, `/products`, `/franchise`, `/news` must remain discoverable |
| Home page section stack | This is the main landing narrative and conversion path | Med | Preserve section order and section purpose |
| About page | Original baseline had a separate credibility/company page | Low/Med | Intro, certifications, timeline, team/equipment, service experience |
| Products page | Original baseline separated products/packages from home | Med | Tabbed view for core products vs membership packages |
| Franchise page | Original baseline had a full招商/加盟 conversion page | Med | Models,收益测算, support, guarantees, contact form |
| News page | Original baseline had a real news list/detail experience | Med | Search, category filters, `?id=` detail mode |
| Contact CTAs | Phone/contact actions are part of the user journey | Low | Keep page-level phone CTA targets and contact blocks equivalent |

## Differentiators Worth Preserving

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Theme toggle with persistence | Distinct user-visible behavior across the whole site | Low | Uses `localStorage` theme persistence in baseline |
| Scroll-reactive nav + mobile overlay menu | Makes the site feel like a polished app shell, not static HTML | Low/Med | Nav changes after scroll; mobile menu is a true overlay |
| Home “Why Choose Us” expandable detail cards | Adds interactive exploration of the core value props | Low/Med | Preserve click-to-expand behavior; exact animation can vary |
| Home “How It Works” auto-advancing process stepper | Key behavior in explaining the service loop | Med | Auto-rotates every ~5s and responds to hover |
| Animated stats/count-up + case cards | Reinforces proof/social proof sections | Low/Med | Equivalent visibility-triggered animation is enough |
| News list/detail in one route | Preserves deep-linkable article detail without extra route sprawl | Med | `?id=` behavior matters more than exact styling |

## Required Equivalence Categories

### 1. Shared Shell And Route Model

- Preserve five landing pages as distinct user-visible destinations: home, about, products, franchise, news.
- Preserve shared top navigation labels and route links.
- Preserve active-route highlighting, mobile open/close menu behavior, and persistent theme toggle.
- Preserve footer contact/info architecture and scroll-to-top action.
- For integration, the internal router can be reimplemented differently, but the landing experience must still behave like a multi-page site inside the stable `/entry-station` entry.

### 2. Home Route `/`

Preserve this section order and purpose:

1. Hero: trust badge, medical/health positioning headline, supporting value statements, primary CTAs to `/products` and `/franchise`, summary KPI cards.
2. Credential marquee: horizontally scrolling certification/authority items.
3. Market pain points: market-size stats, three traditional-industry pain points, policy opportunity callout.
4. Why choose us: four core barriers/advantages with expandable details and supporting image/KPI tiles.
5. How it works: four-step service loop with active step state and auto progression.
6. Results and case studies: count-up stats plus multiple case cards.
7. News preview: three articles plus “view all” CTA into `/news`.
8. Final CTA: franchise-oriented close with route CTA plus phone CTA.

### 3. About Route `/about`

- Company/brand intro hero.
- Certification/qualification grid.
- Development timeline.
- Team and equipment credibility section.
- Service experience section with concrete user-facing points.
- Preserve this page as a dedicated credibility page, not folded into the home route.

### 4. Products Route `/products`

- Hero explaining products/services value.
- Tab switch between `核心产品` and `会员套餐`.
- Core products view: multiple product blocks with image, description, features, and specs.
- Membership packages view: multiple carded packages with pricing, benefits, target users, and收益.
- User case section below the tabs.

### 5. Franchise Route `/franchise`

- Hero with招商/加盟 framing.
- Three cooperation/franchise model cards.
- Revenue calculation table and incentive summary.
- Support grid and guarantee/risk-control blocks.
- Contact/application form with visible fields.
- Contact info panel alongside the form.

Important scoping note: the bundle shows the form UI, but not evidence of a real backend submission flow. Reconstruct the form presence and fields; do not automatically scope backend lead processing unless requested elsewhere.

### 6. News Route `/news`

- List mode with category filters and keyword search.
- Detail mode selected by `?id=`.
- Detail view includes hero image, metadata, full article body, and a return-to-list action.
- Share buttons are visible in baseline, but no evidence suggests real share integration; treat them as presentation-equivalence unless asked to wire them up.

## Preserved User-Visible Behaviors

- Theme selection persists across reloads.
- Navigation becomes visually solid after scrolling.
- Mobile navigation opens as an overlay and closes on selection/backdrop click.
- Home process section auto-advances and can be manually focused by hover.
- Home/about/news sections animate into view when scrolled into viewport.
- Stats count up when visible.
- Product tab switching is client-side.
- News search/filtering is client-side.
- News detail is deep-linkable through `?id=`.
- Footer back-to-top button scrolls to page top.

## Requirement Buckets For Planning

1. `REQ-1 Shell and routing equivalence`
2. `REQ-2 Home information architecture restoration`
3. `REQ-3 About page restoration`
4. `REQ-4 Products/packages page restoration`
5. `REQ-5 Franchise conversion page restoration`
6. `REQ-6 News list/detail restoration`
7. `REQ-7 Cross-page behavior equivalence`

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Reusing the current compliance-safe single-page copy as the target | It is explicitly not the requested baseline | Restore from `7be7097^` structure and content domains |
| Collapsing the multi-route site into one page | Regresses original IA and route-level behavior | Keep route boundaries, even if internal implementation changes |
| Inventing new product flows, CMS, or运营 tooling | Not evidenced in the baseline and expands scope fast | Limit this milestone to restoration + React maintainability |
| Treating visible forms/share buttons as necessarily backend-integrated | The bundle shows UI, not proven integrations | Rebuild the UI first; add backend only by separate requirement |
| Normalizing or rewriting medical/health claims during migration | This changes content baseline | Preserve baseline first, then schedule content revision separately if needed |

## Feature Dependencies

```text
Shared shell -> all routes
Home news preview -> News page detail/list
Home CTA -> Franchise page
Shared theme toggle -> all route styling
Stable /entry-station integration -> landing router availability inside EntryShell iframe
```

## MVP Recommendation

Prioritize:

1. Rebuild the shared shell and route skeleton with preserved page boundaries.
2. Rebuild all five routes with baseline section ordering and content groupings.
3. Restore only the interactions that materially change user experience: theme persistence, mobile nav, tabs, `?id=` news detail, process stepper, count-up stats.

Defer:

- Exact motion tuning and micro-animation parity.
- Backend submission/share integrations not evidenced in the packaged baseline.
- Copy normalization, compliance softening, or content strategy improvements.

## Sources

- `/Users/jizhongzhou/_workspace/PinanHome/proj/pinan2/.worktrees/compliance-copy-ui/.planning/PROJECT.md`
- `/Users/jizhongzhou/_workspace/PinanHome/proj/pinan2/.worktrees/compliance-copy-ui/EntryShell.tsx`
- `git show 7be7097^:Kimi_Agent_Deployment_v14/index.html`
- `git show 7be7097^:Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js`
