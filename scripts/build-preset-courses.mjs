import fs from 'fs/promises';
import path from 'path';
import net from 'net';
import { spawn } from 'child_process';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'preset-source-pdfs');
const PRESET_ROOT = path.join(ROOT, 'public', 'preset-courses');
const PRESET_INDEX_FILE = path.join(PRESET_ROOT, 'index.json');
const APP_URL = 'http://127.0.0.1:5173/';
const DEV_PORT = 5173;

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

const COURSE_INDEX_PREFIX = 'lesson';
const ONLY_RANKS_ENV = String(process.env.PRESET_ONLY_RANKS || '').trim();

const parseOnlyRanks = (raw) => {
  const values = String(raw || '')
    .split(/[,\s]+/)
    .map((part) => Number(part.trim()))
    .filter((num) => Number.isInteger(num) && num > 0);
  return new Set(values);
};

const ONLY_RANKS = parseOnlyRanks(ONLY_RANKS_ENV);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isPortOpen = async (port, host = '127.0.0.1') =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    const onDone = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(1200);
    socket.once('connect', () => onDone(true));
    socket.once('timeout', () => onDone(false));
    socket.once('error', () => onDone(false));
    socket.connect(port, host);
  });

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const cnNumberMap = new Map([
  ['一', 1],
  ['二', 2],
  ['三', 3],
  ['四', 4],
  ['五', 5],
  ['六', 6],
  ['七', 7],
  ['八', 8],
  ['九', 9],
  ['十', 10],
]);

const parseCnNumber = (raw) => {
  const text = String(raw || '').trim();
  if (!text) return Number.POSITIVE_INFINITY;
  if (cnNumberMap.has(text)) return cnNumberMap.get(text);
  if (text.startsWith('十')) {
    if (text.length === 1) return 10;
    const unit = cnNumberMap.get(text.slice(1));
    return typeof unit === 'number' ? 10 + unit : Number.POSITIVE_INFINITY;
  }
  if (text.endsWith('十')) {
    const ten = cnNumberMap.get(text.slice(0, -1));
    return typeof ten === 'number' ? ten * 10 : Number.POSITIVE_INFINITY;
  }
  if (text.includes('十')) {
    const [tenRaw, unitRaw] = text.split('十');
    const ten = cnNumberMap.get(tenRaw);
    const unit = cnNumberMap.get(unitRaw);
    if (typeof ten === 'number' && typeof unit === 'number') return ten * 10 + unit;
  }
  return Number.POSITIVE_INFINITY;
};

const parseLessonRank = (name) => {
  const title = String(name || '').replace(/\.[^.]+$/, '');
  const normalized = title.replace(/\s+/g, '');
  const arabic = normalized.match(/第?(\d+)[课节]/u);
  if (arabic) return Number(arabic[1]);
  const chinese = normalized.match(/第?([一二三四五六七八九十]+)[课节]/u);
  if (chinese) return parseCnNumber(chinese[1]);
  return Number.POSITIVE_INFINITY;
};

const rankToCourseId = (rank, fallbackSerial) => {
  const serial = Number.isFinite(rank) ? rank : fallbackSerial;
  return `${COURSE_INDEX_PREFIX}-${String(serial).padStart(3, '0')}`;
};

const getPdfFiles = async () => {
  const items = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  const files = items
    .filter((item) => item.isFile() && /\.pdf$/i.test(item.name))
    .map((item) => ({
      name: item.name,
      rank: parseLessonRank(item.name),
    }));

  const selected = ONLY_RANKS.size
    ? files.filter((entry) => Number.isFinite(entry.rank) && ONLY_RANKS.has(entry.rank))
    : files;

  selected.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.name.localeCompare(b.name, 'zh-CN');
  });
  return selected;
};

const titleFromFileName = (name) =>
  name
    .replace(/\.[^.]+$/, '')
    .replace(/^[（(]\s*已压缩\s*[）)]\s*/u, '')
    .trim();

const decodeDataUrl = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const base64 = match[2];
  return { mime, buffer: Buffer.from(base64, 'base64') };
};

const extFromMime = (mime) => {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  return 'jpg';
};

const findBrowserPath = async () => {
  for (const candidate of EDGE_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }
  throw new Error('No supported browser found (Edge/Chrome).');
};

const startDevServerIfNeeded = async () => {
  if (await isPortOpen(DEV_PORT)) return null;

  const proc = spawn('npm.cmd', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(DEV_PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'pipe',
    windowsHide: true,
  });

  const timeoutAt = Date.now() + 90_000;
  while (Date.now() < timeoutAt) {
    if (await isPortOpen(DEV_PORT)) {
      await delay(1200);
      return proc;
    }
    await delay(500);
  }

  proc.kill();
  throw new Error('Failed to start dev server on 127.0.0.1:5173');
};

const waitAppReady = async (page) => {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForFunction(() => typeof window.__presetAutomation !== 'undefined', null, { timeout: 120_000 });
};

const getSnapshot = async (page) =>
  page.evaluate(() => {
    const bridge = window.__presetAutomation;
    if (!bridge || typeof bridge.getSnapshot !== 'function') return null;
    return bridge.getSnapshot();
  });

const waitForReadyMode = async (page, timeoutMs = 30 * 60_000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const snapshot = await getSnapshot(page);
    if (snapshot?.mode === 'READY') return snapshot;
    if (snapshot?.mode === 'UPLOAD' && String(snapshot?.feedbackMessage || '').includes('澶辫触')) {
      throw new Error(`PDF processing failed: ${snapshot.feedbackMessage}`);
    }
    await delay(1200);
  }
  throw new Error('Timed out waiting for READY mode.');
};

const runGenerateAllAudio = async (page) => {
  return page.evaluate(async () => {
    const bridge = window.__presetAutomation;
    if (!bridge || typeof bridge.generateAllAudio !== 'function') {
      throw new Error('window.__presetAutomation.generateAllAudio is unavailable');
    }
    return bridge.generateAllAudio();
  });
};

const getAudioCoverage = (slides) => {
  const list = Array.isArray(slides) ? slides : [];
  let total = 0;
  let ready = 0;
  for (const slide of list) {
    const script = String(slide?.script || '').trim();
    if (!script) continue;
    total += 1;
    const audio = String(slide?.audioData || '').trim();
    if (audio) ready += 1;
  }
  return { total, ready, missing: Math.max(0, total - ready) };
};

const getTextFallbackCount = (slides) => {
  const list = Array.isArray(slides) ? slides : [];
  let count = 0;
  for (const slide of list) {
    const audio = String(slide?.audioData || '').trim();
    if (audio.startsWith('TEXT:')) {
      count += 1;
    }
  }
  return count;
};

const waitForAudioFlush = async (page, timeoutMs = 12_000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const snapshot = await getSnapshot(page);
    const slides = Array.isArray(snapshot?.slides) ? snapshot.slides : [];
    const hasGenerating = slides.some((slide) => !!slide?.isGeneratingAudio);
    if (!hasGenerating) {
      await delay(600);
      return getSnapshot(page);
    }
    await delay(400);
  }
  return getSnapshot(page);
};

const sanitizeCourseSlides = (slides) => {
  return (slides || []).map((slide, idx) => ({
    id: Number(slide?.id || idx + 1),
    imageData: String(slide?.imageData || '').trim(),
    script: String(slide?.script || '').trim(),
    audioData: String(slide?.audioData || '').trim(),
    textRegions: Array.isArray(slide?.textRegions) ? slide.textRegions : [],
  }));
};

const writeCourseArtifacts = async ({ courseId, title, sourcePdfName, slides }) => {
  const courseDir = path.join(PRESET_ROOT, courseId);
  const slideDir = path.join(courseDir, 'slides');
  const audioDir = path.join(courseDir, 'audio');
  await fs.rm(courseDir, { recursive: true, force: true });
  await ensureDir(slideDir);
  await ensureDir(audioDir);

  let coverImageRelative = '';
  const courseSlides = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const pad = String(i + 1).padStart(3, '0');

    let imageRelativePath = '';
    const decodedImage = decodeDataUrl(slide.imageData);
    if (decodedImage) {
      const imageExt = extFromMime(decodedImage.mime);
      imageRelativePath = `slides/${pad}.${imageExt}`;
      const imageAbsPath = path.join(courseDir, imageRelativePath);
      await fs.writeFile(imageAbsPath, decodedImage.buffer);
      if (!coverImageRelative) {
        coverImageRelative = `cover.${imageExt}`;
        await fs.writeFile(path.join(courseDir, coverImageRelative), decodedImage.buffer);
      }
    }

    let audioFile = '';
    let audioData = '';
    const cleanAudio = String(slide.audioData || '').trim();
    if (cleanAudio) {
      if (cleanAudio.startsWith('TEXT:')) {
        audioData = cleanAudio;
      } else {
        audioFile = `audio/${pad}.txt`;
        await fs.writeFile(path.join(courseDir, audioFile), cleanAudio, 'utf8');
      }
    }

    courseSlides.push({
      id: slide.id,
      image: imageRelativePath,
      script: slide.script,
      audioFile,
      audioData,
      textRegions: slide.textRegions || [],
    });
  }

  const payload = {
    id: courseId,
    title,
    description: '',
    sourcePdf: sourcePdfName,
    updatedAt: new Date().toISOString().slice(0, 10),
    slides: courseSlides,
  };

  await fs.writeFile(path.join(courseDir, 'course.json'), JSON.stringify(payload, null, 2), 'utf8');

  return {
    id: courseId,
    title,
    description: '',
    slideCount: courseSlides.length,
    coverImage: coverImageRelative ? `/preset-courses/${courseId}/${coverImageRelative}` : '',
    updatedAt: new Date().toISOString().slice(0, 10),
    dataFile: `/preset-courses/${courseId}/course.json`,
  };
};

const readExistingIndexCourses = async () => {
  try {
    const raw = await fs.readFile(PRESET_INDEX_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.courses) ? parsed.courses : [];
  } catch {
    return [];
  }
};

const parseCourseSerial = (courseId) => {
  const match = String(courseId || '').match(/(\d+)$/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
};

const mergeCourseMetas = (existing, updates) => {
  const map = new Map();
  for (const item of existing || []) {
    if (!item?.id) continue;
    map.set(item.id, item);
  }
  for (const item of updates || []) {
    if (!item?.id) continue;
    map.set(item.id, item);
  }
  return [...map.values()].sort((a, b) => {
    const sa = parseCourseSerial(a?.id);
    const sb = parseCourseSerial(b?.id);
    if (sa !== sb) return sa - sb;
    return String(a?.id || '').localeCompare(String(b?.id || ''), 'en');
  });
};

const main = async () => {
  await ensureDir(PRESET_ROOT);
  const pdfEntries = await getPdfFiles();
  if (!pdfEntries.length) {
    console.log('No PDF files found in preset-source-pdfs.');
    return;
  }

  if (ONLY_RANKS.size) {
    console.log(`Incremental preset build mode: ranks ${[...ONLY_RANKS].sort((a, b) => a - b).join(', ')}`);
  }

  console.log(`Found ${pdfEntries.length} PDFs to process:`);
  for (const entry of pdfEntries) {
    const rankLabel = Number.isFinite(entry.rank) ? entry.rank : 'N/A';
    console.log(`- [${rankLabel}] ${entry.name}`);
  }

  const devServerProc = await startDevServerIfNeeded();
  const browserPath = await findBrowserPath();
  const browser = await chromium.launch({
    headless: true,
    executablePath: browserPath,
    args: ['--disable-gpu'],
  });

  const metas = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 920 },
    });

    for (let i = 0; i < pdfEntries.length; i++) {
      const { name: fileName, rank } = pdfEntries[i];
      const filePath = path.join(SOURCE_DIR, fileName);
      const title = titleFromFileName(fileName);
      const courseId = rankToCourseId(rank, i + 1);

      console.log(`\n[${i + 1}/${pdfEntries.length}] Processing: ${fileName}`);

      const page = await context.newPage();
      await waitAppReady(page);

      const input = page.locator('input[type=\"file\"]').first();
      await input.setInputFiles(filePath);

      await waitForReadyMode(page);
      console.log(`- script generation completed`);

      let snapshot = await getSnapshot(page);
      let coverage = getAudioCoverage(snapshot?.slides || []);
      let attempts = 0;
      while (attempts < 3 && coverage.missing > 0) {
        attempts += 1;
        const audioStats = await runGenerateAllAudio(page);
        snapshot = await waitForAudioFlush(page);
        coverage = getAudioCoverage(snapshot?.slides || []);
        console.log(
          `- audio pass ${attempts}: newly generated ${audioStats?.generated ?? 0}/${audioStats?.total ?? 0}, coverage ${coverage.ready}/${coverage.total}`,
        );
        if (coverage.missing <= 0) break;
      }

      if (coverage.missing > 0) {
        console.log(`- warning: ${coverage.missing} slide(s) still missing audio; runtime fallback TTS will be used`);
      }

      const rawSlides = sanitizeCourseSlides(snapshot?.slides || []);
      if (!rawSlides.length) {
        throw new Error(`No slides exported for ${fileName}`);
      }
      const textFallbackCount = getTextFallbackCount(rawSlides);
      if (textFallbackCount > 0) {
        console.log(`- warning: ${textFallbackCount}/${rawSlides.length} slide(s) used browser TEXT fallback`);
      }
      if (textFallbackCount === rawSlides.length) {
        throw new Error(
          `All slides for ${fileName} are TEXT fallback (API voice unavailable). ` +
            `Please verify VITE_VOLC_TTS_RESOURCE_ID / VITE_VOLC_DIALOG_RESOURCE_ID authorization.`
        );
      }

      const meta = await writeCourseArtifacts({
        courseId,
        title,
        sourcePdfName: fileName,
        slides: rawSlides,
      });
      metas.push(meta);
      console.log(`- preset course saved: ${courseId} (${meta.slideCount} slides)`);

      await page.close();
    }
  } finally {
    await browser.close();
    if (devServerProc) {
      devServerProc.kill();
    }
  }

  const finalMetas = ONLY_RANKS.size ? mergeCourseMetas(await readExistingIndexCourses(), metas) : metas;
  await fs.writeFile(PRESET_INDEX_FILE, JSON.stringify({ courses: finalMetas }, null, 2), 'utf8');
  console.log(`\nPreset index updated: ${PRESET_INDEX_FILE}`);
};

main().catch((error) => {
  console.error('\nPreset build failed:', error);
  process.exitCode = 1;
});

