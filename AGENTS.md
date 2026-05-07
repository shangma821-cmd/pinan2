# Pinan Website Design System Rules

These rules apply to the React/Vite landing website under `landing/**`.

## Brand Source

- The governing reference is `/Users/aura/Desktop/（已压缩）频安科技视觉规范手册.pdf`.
- The Pinan brand direction is professional health technology: protection, frequency, life care, full-cycle health management, and reliable intelligent service.
- Avoid generic iOS green, consumer wellness, neon sci-fi, and over-decorative glassmorphism.

## Visual Tokens

- Use CSS variables in `landing/landing.css` as the source of truth.
- Primary brand color is Life Blue: `#00B4C3`.
- Core neutral is Technology Gray: `#B5B5B5`.
- Preferred backgrounds are white and restrained cool-gray surfaces.
- Gold, silver, and black are special-use accents, never dominant page palettes.
- Use restrained shadows, 8-12px card radii, and crisp borders for enterprise credibility.

## Typography

- Chinese typography should prefer Source Han Sans / Noto Sans SC / MiSans style sans-serif families.
- English and numerals should prefer DIN-style condensed sans fallbacks.
- Do not use Orbitron or overly futuristic display fonts for the landing site.
- Headings should be confident and compact; body copy should be readable, stable, and calm.

## Brand Graphics

- Brand motifs: shield, initial P, heart/life care, frequency arcs, wings, and layered protection rings.
- Use ring/frequency graphics as subtle section or hero accents.
- Do not create unrelated decorative blobs or random gradient orbs.
- Do not distort the logo, apply drop shadows to it, or place it on low-contrast imagery.

## Component Conventions

- Reuse existing `landing/components`, `landing/pages`, and `landing/sections` structure.
- New shared landing components should live in `landing/components`.
- Styling remains centralized in `landing/landing.css` with `landing-*` class names.
- Preserve current routes, tests, and user-facing navigation behavior unless requested otherwise.

## Implementation Priorities

- Establish global tokens first, then update navigation, footer, CTAs, and cards.
- Replace the temporary text-only brand mark with an official vector asset when available.
- Validate desktop and mobile rendering after significant visual changes.
