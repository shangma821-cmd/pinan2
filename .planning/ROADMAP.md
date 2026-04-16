# Roadmap: 频安AI智能商学院

## Overview

This milestone first performs a runtime reset so `public/entry-station/**` is explicitly treated as the active transitional runtime again, revalidates the shell contract (`/` -> landing -> `/academy` -> `/`), and then rebuilds baseline-equivalent landing behavior as maintainable React/Vite source for later cutover.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Runtime Reset & Shell Revalidation** - Lock baseline truth, reset transitional runtime ownership, and revalidate the public shell contract before React reconstruction.
- [x] **Phase 2: React Landing Foundation (Post-Reset)** - Establish React landing route scaffolding and shared shell targets while transitional runtime remains active.
- [ ] **Phase 3: Core Page Reconstruction** - Rebuild Home, About, Products, and Franchise in React against the approved baseline pack.
- [ ] **Phase 4: News & Interaction Equivalence** - Rebuild news and cross-page interactions in React with baseline-equivalent behavior.
- [ ] **Phase 5: React Runtime Cutover & Parity QA** - Switch public landing runtime ownership from transitional assets to React output and prove parity under shell and direct loads.

## Phase Details

### Phase 1: Runtime Reset & Shell Revalidation
**Goal**: Users keep the current public landing entry and academy handoff behavior while planning truth is reset so `public/entry-station/**` is the active transitional runtime and the baseline pack remains immutable review truth.
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-01, SHELL-03
**Success Criteria** (what must be TRUE):
  1. User can visit `/` and still reach the landing through the existing shell without a public URL change, while the stable public landing route remains `/entry-station`.
  2. User can trigger the academy entry from the landing and reach `/academy`, then return to `/`, preserving the public contract even if trigger internals live in a transitional wrapper.
  3. The milestone has one approved pre-`7be7097^` baseline pack, an updated source-of-truth inventory, and a shell checklist that may remain `PENDING` before the shell smoke task runs; Phase 1 is complete only after that smoke verification runs and is recorded in the checklist.
**Plans**: 3 (completed 2026-04-16)
**UI hint**: yes

### Phase 2: React Landing Foundation (Post-Reset)
**Goal**: Users can navigate five landing destinations in React route structure prepared for reconstruction while the active transitional runtime continues to serve public traffic.
**Depends on**: Phase 1
**Requirements**: SHELL-02
**Success Criteria** (what must be TRUE):
  1. User can navigate to five distinct landing destinations under React-owned `/entry-station` routes: Home, About, Products, Franchise, and News.
  2. User can refresh or direct-load each React destination and remain in the scoped landing route experience.
  3. User sees a shared React landing shell and navigation frame across all five destinations, ready for baseline content restoration.
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

### Phase 5: React Runtime Cutover & Parity QA
**Goal**: Users reach the reconstructed landing through React-owned production output after cutover from transitional runtime assets, with parity proven under shell and direct loads.
**Depends on**: Phase 4
**Requirements**: XPG-03
**Success Criteria** (what must be TRUE):
  1. User opening built `/entry-station` sees the landing generated from the React/Vite source tree rather than `public/entry-station/**` transitional assets.
  2. User sees the same restored landing experience whether it loads directly at `/entry-station` or through the `/` shell iframe.
  3. Release verification confirms transitional wrapper/runtime delivery is retired for public landing traffic on desktop and mobile.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Runtime Reset & Shell Revalidation | 0/TBD | Not started | - |
| 2. React Landing Foundation (Post-Reset) | 3/3 | Complete | 2026-04-16 |
| 3. Core Page Reconstruction | 0/TBD | Not started | - |
| 4. News & Interaction Equivalence | 0/TBD | Not started | - |
| 5. React Runtime Cutover & Parity QA | 0/TBD | Not started | - |
