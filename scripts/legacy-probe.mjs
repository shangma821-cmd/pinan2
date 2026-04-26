#!/usr/bin/env node
/**
 * Legacy/React side-by-side probe for pixel-level restoration.
 *
 * Usage:
 *   node scripts/legacy-probe.mjs --section theme --out tmp/legacy-probe/theme
 *   node scripts/legacy-probe.mjs --section hero --selector "section, main > :first-child" --out tmp/legacy-probe/hero
 *
 * Produces under <out>/ for both legacy and react:
 *   <side>-screenshot-desktop.png   1440x900 viewport, above-the-fold
 *   <side>-screenshot-mobile.png    375x812 viewport, above-the-fold
 *   <side>-section.html             outerHTML of matched selector (or full body)
 *   <side>-computed.json            computed styles of section + children (focused props)
 *   <side>-tokens.json              :root CSS custom properties + body/html computed
 *   <side>-palette.json             unique colors/fonts/shadows/radii observed in section
 *
 * Assumes preview server on http://127.0.0.1:4173.
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// `/entry-station` (no trailing slash) → outer EntryShell → React landing.
// `/entry-station/` (trailing slash) → public/entry-station/index.html → legacy SPA.
const REACT_URL = 'http://127.0.0.1:4173/entry-station';
const LEGACY_URL = 'http://127.0.0.1:4173/entry-station/';

const FOCUS_PROPS = [
  'display', 'position', 'width', 'height', 'max-width', 'min-height',
  'margin', 'padding', 'gap',
  'grid-template-columns', 'grid-template-rows', 'flex-direction', 'align-items', 'justify-content',
  'color', 'background', 'background-color', 'background-image',
  'border', 'border-radius', 'box-shadow', 'backdrop-filter',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform',
  'transform', 'opacity',
];

function args() {
  const out = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key.startsWith('--')) {
      const name = key.slice(2);
      const next = argv[i + 1];
      const hasValue = next !== undefined && !next.startsWith('--');
      const value = hasValue ? argv[++i] : 'true';
      out[name] = value;
    }
  }
  return out;
}

function pickProps(style, props) {
  const picked = {};
  for (const p of props) picked[p] = style.getPropertyValue(p).trim();
  return picked;
}

async function probe(page, { selector, focusProps }) {
  // :root custom props
  const tokens = await page.evaluate(() => {
    const result = {};
    const s = getComputedStyle(document.documentElement);
    for (const name of s) {
      if (name.startsWith('--')) result[name] = s.getPropertyValue(name).trim();
    }
    return {
      rootVars: result,
      htmlFontFamily: getComputedStyle(document.documentElement).fontFamily,
      bodyFontFamily: getComputedStyle(document.body).fontFamily,
      bodyBackground: getComputedStyle(document.body).background,
      htmlDataTheme: document.documentElement.getAttribute('data-theme'),
    };
  });

  // Target node
  const handle = selector
    ? await page.$(selector)
    : await page.$('body');
  if (!handle) return { tokens, html: null, computed: null, palette: null };

  const html = await handle.evaluate((el) => el.outerHTML);

  const computed = await handle.evaluate((root, props) => {
    function describe(el, depth) {
      const s = getComputedStyle(el);
      const picked = {};
      for (const p of props) picked[p] = s.getPropertyValue(p).trim();
      const summary = {
        tag: el.tagName.toLowerCase(),
        classes: Array.from(el.classList),
        id: el.id || undefined,
        text: depth <= 2 ? (el.innerText || '').trim().slice(0, 120) : undefined,
        style: picked,
      };
      if (depth < 3) {
        summary.children = Array.from(el.children).slice(0, 10).map((c) => describe(c, depth + 1));
      }
      return summary;
    }
    return describe(root, 0);
  }, focusProps);

  // Palette probe — walk subtree, collect unique colors/fonts/shadows/radii
  const palette = await handle.evaluate((root) => {
    const fonts = new Set();
    const colors = new Set();
    const backgrounds = new Set();
    const shadows = new Set();
    const radii = new Set();
    const fontSizes = new Set();
    const fontWeights = new Set();
    const letterSpacings = new Set();

    function walk(el) {
      const s = getComputedStyle(el);
      fonts.add(s.fontFamily);
      colors.add(s.color);
      fontSizes.add(s.fontSize);
      fontWeights.add(s.fontWeight);
      letterSpacings.add(s.letterSpacing);
      if (s.backgroundImage && s.backgroundImage !== 'none') backgrounds.add(s.backgroundImage);
      if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') backgrounds.add(s.backgroundColor);
      if (s.boxShadow && s.boxShadow !== 'none') shadows.add(s.boxShadow);
      if (s.borderRadius && s.borderRadius !== '0px') radii.add(s.borderRadius);
      for (const c of el.children) walk(c);
    }
    walk(root);

    return {
      fonts: [...fonts].slice(0, 10),
      colors: [...colors].slice(0, 60),
      backgrounds: [...backgrounds].slice(0, 30),
      shadows: [...shadows].slice(0, 30),
      radii: [...radii].slice(0, 20),
      fontSizes: [...fontSizes].slice(0, 30),
      fontWeights: [...fontWeights].slice(0, 10),
      letterSpacings: [...letterSpacings].slice(0, 10),
    };
  });

  return { tokens, html, computed, palette };
}

async function side({ side, url, selector, outDir }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  // Give React/Legacy SPA a moment to hydrate
  await page.waitForFunction(() => {
    const r = document.querySelector('#root') || document.body;
    return r && r.innerText && r.innerText.length > 50;
  }, { timeout: 10000 }).catch(() => {});

  // Desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  const result = await probe(page, { selector, focusProps: FOCUS_PROPS });
  if (selector) {
    const handle = await page.$(selector);
    if (handle) {
      // Scroll element into view and wait for scroll-triggered animations (IntersectionObserver) to settle
      await handle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await handle.screenshot({ path: path.join(outDir, `${side}-screenshot-desktop.png`) });
    } else {
      await page.screenshot({ path: path.join(outDir, `${side}-screenshot-desktop.png`), fullPage: false });
    }
  } else {
    await page.screenshot({ path: path.join(outDir, `${side}-screenshot-desktop.png`), fullPage: false });
  }

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  if (selector) {
    const handle = await page.$(selector);
    if (handle) {
      await handle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await handle.screenshot({ path: path.join(outDir, `${side}-screenshot-mobile.png`) });
    } else {
      await page.screenshot({ path: path.join(outDir, `${side}-screenshot-mobile.png`), fullPage: false });
    }
  } else {
    await page.screenshot({ path: path.join(outDir, `${side}-screenshot-mobile.png`), fullPage: false });
  }

  await writeFile(path.join(outDir, `${side}-section.html`), result.html ?? '(no match)');
  await writeFile(path.join(outDir, `${side}-computed.json`), JSON.stringify(result.computed, null, 2));
  await writeFile(path.join(outDir, `${side}-tokens.json`), JSON.stringify(result.tokens, null, 2));
  await writeFile(path.join(outDir, `${side}-palette.json`), JSON.stringify(result.palette, null, 2));

  await browser.close();
}

async function main() {
  const a = args();
  const section = a.section || 'unnamed';
  const selector = a.selector || '';
  const legacySelector = a['legacy-selector'] || selector;
  const reactSelector = a['react-selector'] || selector;
  const legacyPath = a['legacy-path'] || ''; // e.g. "#/about"
  const reactPath = a['react-path'] || '';   // e.g. "/about"
  const outDir = a.out || `tmp/legacy-probe/${section}`;
  await mkdir(outDir, { recursive: true });
  console.log(`[probe] section=${section} selector="${selector}" out=${outDir}`);

  for (const s of [
    { side: 'legacy', url: LEGACY_URL + legacyPath, selector: legacySelector },
    { side: 'react', url: REACT_URL + reactPath, selector: reactSelector },
  ]) {
    console.log(`[probe] ${s.side} ${s.url} sel="${s.selector}"`);
    await side({ side: s.side, url: s.url, selector: s.selector, outDir });
  }

  console.log(`[probe] done → ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
