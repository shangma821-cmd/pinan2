# Roadmap: 频安AI智能商学院

## Overview

This milestone restores the pre-`7be7097^` Kimi landing as the only approved content baseline, rebuilds it as maintainable React/Vite source inside the existing app, preserves `/entry-station` as the stable public landing URL, and ends only when the React-owned landing matches baseline behavior under both direct loads and the existing `/` shell iframe path.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Baseline Lock & Shell Contract** - Freeze the `7be7097^` baseline and lock the host-to-landing contract before reconstruction.
- [ ] **Phase 2: Multi-Entry Landing Foundation** - Stand up the React-owned `/entry-station` shell and scoped five-destination runtime.
- [ ] **Phase 3: Core Page Reconstruction** - Restore Home, About, Products, and Franchise to the baseline information architecture.
- [ ] **Phase 4: News & Interaction Equivalence** - Restore the news experience and original cross-page interactions.
- [ ] **Phase 5: Cutover & Parity QA** - Retire the static landing dependency and prove parity in the shipped build.

## Phase Details

### Phase 1: Baseline Lock & Shell Contract
**Goal**: Users keep the current public landing entry and academy handoff behavior while all later work is anchored to one approved pre-`7be7097^` baseline.
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-01, SHELL-03
**Success Criteria** (what must be TRUE):
  1. User can visit `/` and still reach the landing through the existing shell without a public URL change.
  2. User can trigger the academy entry from the landing and reach the academy with the same shell-compatible behavior as the current experience.
  3. The milestone has one approved pre-`7be7097^` baseline pack and shell contract checklist that any reviewer can use to judge parity before reconstruction continues.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Multi-Entry Landing Foundation
**Goal**: Users can navigate the five landing destinations inside a React-owned `/entry-station` shell that stays scoped to the landing runtime.
**Depends on**: Phase 1
**Requirements**: SHELL-02
**Success Criteria** (what must be TRUE):
  1. User can navigate to five distinct landing destinations under `/entry-station`: Home, About, Products, Franchise, and News.
  2. User can refresh or direct-load each landing destination and remain inside the scoped landing experience instead of escaping to host-level root routes.
  3. User sees a shared landing shell and navigation frame across all five destination states, ready for restored page content.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Core Page Reconstruction
**Goal**: Users can experience the restored core marketing destinations with the original information architecture, CTA flow, and content groupings.
**Depends on**: Phase 2
**Requirements**: HOME-01, HOME-02, ABOUT-01, ABOUT-02, PROD-01, PROD-02, PROD-03, FRAN-01, FRAN-02, FRAN-03
**Success Criteria** (what must be TRUE):
  1. User can see the restored Home page with baseline-equivalent hero, credentials, pain points, core advantages, service flow, case/proof sections, news preview, and closing CTA.
  2. User can use Home CTAs to reach the Products and Franchise destinations.
  3. User can open an independent About page with baseline-equivalent brand introduction, qualifications/certifications, development history, team/equipment, and service-experience groupings.
  4. User can open the Products page and switch between core products and membership packages while viewing equivalent descriptions, applicable scenarios, specifications or benefits, and related cases.
  5. User can open the Franchise page and view baseline-equivalent cooperation models, return estimates, support and guarantee sections, consultation form UI, and contact details.
**Plans**: TBD
**UI hint**: yes

### Phase 4: News & Interaction Equivalence
**Goal**: Users can use the restored news experience and cross-page interaction behaviors that made the original landing feel alive.
**Depends on**: Phase 3
**Requirements**: HOME-03, NEWS-01, NEWS-02, NEWS-03, XPG-01, XPG-02
**Success Criteria** (what must be TRUE):
  1. User can use Home interactions equivalent to the baseline, including expandable advantages, service-process step switching or auto-advance, and results number presentation.
  2. User can open the News page, search or filter the article list, browse articles, and open detail views via `?id=` before returning to the list.
  3. User's theme choice persists across landing visits with baseline-equivalent behavior.
  4. User can use baseline-equivalent mobile navigation, scroll-reactive navigation, and back-to-top interaction across landing pages.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Cutover & Parity QA
**Goal**: Users reach the reconstructed landing through the production build with no remaining static-bundle dependency, and parity is proven under both shell and direct loads.
**Depends on**: Phase 4
**Requirements**: XPG-03
**Success Criteria** (what must be TRUE):
  1. User opening built `/entry-station` sees the landing generated from the React/Vite source tree rather than the copied static bundle.
  2. User sees the same restored landing experience whether it loads directly at `/entry-station` or through the `/` shell iframe.
  3. Release verification confirms no duplicate static-copy delivery path remains active for the landing runtime on desktop or mobile.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Baseline Lock & Shell Contract | 0/TBD | Not started | - |
| 2. Multi-Entry Landing Foundation | 0/TBD | Not started | - |
| 3. Core Page Reconstruction | 0/TBD | Not started | - |
| 4. News & Interaction Equivalence | 0/TBD | Not started | - |
| 5. Cutover & Parity QA | 0/TBD | Not started | - |
