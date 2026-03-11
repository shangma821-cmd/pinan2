import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Mic,
  Play,
  Pause,
  Loader2,
  Volume2,
  StopCircle,
  CheckCircle2,
  CloudUpload,
  RefreshCw,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Library,
  Brain,
  Settings2,
  Lock,
  ClipboardCheck,
  Square,
  X,
} from 'lucide-react';
import { AppMode, Slide, SlideTextRegion } from './types';
import { convertPdfToImages } from './services/pdfService';
import {
  generateGlobalPresentationScript,
  generateSpeech,
  createRealtimeVoiceSession,
  ScriptGenerationProgress,
  GeminiApiKeyError,
  RealtimeKnowledgeBaseEntry,
  TrialLectureEvaluation,
  TrialLecturePlan,
  evaluateTrialLecture,
  generateTrialLecturePlan,
  transcribeTrialLectureAudio,
} from './services/geminiService';
import {
  appendLocalRealtimeKnowledgeEntries,
  clearLocalRealtimeKnowledgeBase,
  listLocalRealtimeKnowledgeBase,
  loadRealtimeKnowledgeBase,
} from './services/knowledgeBaseService';
import { ingestKnowledgeFiles, KnowledgeIngestFileReport } from './services/knowledgeBaseIngestService';
import {
  AudioPlayer,
  MicrophonePcmStreamer,
  StreamingAudioPlayer,
  getMicrophoneStream,
  blobToBase64,
} from './services/audioService';
import { Visualizer } from './components/Visualizer';
import { SAMPLE_RATE } from './constants';
import {
  PresetCourseMeta,
  listPresetCourseMetas,
  loadPresetCourseById,
} from './services/presetCourseService';

interface AnalysisProgressState extends ScriptGenerationProgress {
  startedAt: number | null;
  lastUpdatedAt: number | null;
}

interface ScannerTarget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

interface PresentationBreakpoint {
  slideIndex: number;
  charOffset: number;
}

type TrialLecturePlanWithAudio = TrialLecturePlan & {
  audioData?: string;
};

const initialAnalysisProgress: AnalysisProgressState = {
  totalSlides: 0,
  completedSlides: 0,
  successSlides: 0,
  failedSlides: 0,
  currentSlideId: 0,
  currentSlideIndex: 0,
  startedAt: null,
  lastUpdatedAt: null,
};

const hashText = (input: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const normalizeCaptionText = (text: string): string => {
  return String(text || '').replace(/\s+/g, ' ').trim();
};

const getCaptionWindowSize = (): number => {
  if (typeof window === 'undefined') return 46;
  const width = window.innerWidth;
  if (width <= 420) return 24;
  if (width <= 640) return 34;
  if (width <= 980) return 52;
  if (width <= 1400) return 88;
  return 126;
};

const toStreamingCaptionLine = (text: string): string => {
  const clean = normalizeCaptionText(text);
  if (!clean) return '';
  const windowSize = getCaptionWindowSize();
  if (clean.length <= windowSize) return clean;
  return `…${clean.slice(-windowSize)}`;
};

const estimateAudioDurationSeconds = (audioBase64: string): number => {
  const payload = String(audioBase64 || '').trim();
  if (!payload) return 0;

  if (payload.startsWith('TEXT:')) {
    try {
      const decoded = decodeURIComponent(payload.slice(5));
      return clamp(decoded.length / 4.2, 1.6, 120);
    } catch {
      return 6;
    }
  }

  const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
  const byteLength = Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
  const sampleCount = Math.max(0, Math.floor(byteLength / 2));
  if (sampleCount <= 0) return 0;

  return clamp(sampleCount / SAMPLE_RATE, 1.6, 120);
};

const decodeBase64Bytes = (base64: string): Uint8Array => {
  const normalized = String(base64 || '').trim().replace(/-/g, '+').replace(/_/g, '/');
  if (!normalized) return new Uint8Array(0);

  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = `${normalized}${'='.repeat(padding)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const encodeBytesBase64 = (bytes: Uint8Array): string => {
  if (!bytes.length) return '';
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const slicePcmBase64ByRatio = (audioBase64: string, ratio: number): string | null => {
  const input = String(audioBase64 || '').trim();
  if (!input || input.startsWith('TEXT:')) return null;

  try {
    const bytes = decodeBase64Bytes(input);
    if (bytes.length < 8) return null;

    const clampedRatio = clamp(Number.isFinite(ratio) ? ratio : 0, 0, 0.985);
    const totalSamples = Math.floor(bytes.length / 2);
    if (totalSamples <= 4) return null;

    let startSample = Math.floor(totalSamples * clampedRatio);
    startSample = clamp(startSample, 0, Math.max(0, totalSamples - 2));
    const startByte = startSample * 2;
    const sliced = bytes.subarray(startByte);
    if (sliced.length < 4) return null;
    return encodeBytesBase64(sliced);
  } catch {
    return null;
  }
};

const AUDIO_FILE_PREFIX = 'FILE:';

const isAudioFileMarker = (audioData?: string): boolean => {
  return String(audioData || '').trim().startsWith(AUDIO_FILE_PREFIX);
};

const extractAudioFilePath = (audioData?: string): string => {
  const value = String(audioData || '').trim();
  if (!value.startsWith(AUDIO_FILE_PREFIX)) return '';
  return value.slice(AUDIO_FILE_PREFIX.length).trim();
};

const normalizeForMatch = (text: string): string => {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。、“”‘’：:；;,.!?！？（）()【】\[\]<>《》\-—_、/\\|'"`~%^&*+=]+/g, '');
};

const extractScriptTerms = (script: string): string[] => {
  const source = String(script || '');
  const terms = new Set<string>();

  const chineseMatches = source.match(/[\u4e00-\u9fff]{2,}/g) || [];
  for (const chunk of chineseMatches) {
    const text = chunk.trim();
    if (!text) continue;

    if (text.length <= 8) {
      terms.add(text);
      continue;
    }

    terms.add(text.slice(0, 4));
    terms.add(text.slice(-4));

    const middleStart = Math.max(0, Math.floor(text.length / 2) - 2);
    terms.add(text.slice(middleStart, middleStart + 4));
  }

  const alphaMatches = source.match(/[A-Za-z0-9][A-Za-z0-9%._-]{1,}/g) || [];
  for (const chunk of alphaMatches) {
    terms.add(chunk.trim());
  }

  return [...terms]
    .map((term) => term.trim())
    .filter((term) => normalizeForMatch(term).length >= 2)
    .sort((a, b) => b.length - a.length);
};

const intersectionArea = (a: ScannerTarget, b: ScannerTarget): number => {
  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  if (right <= left || bottom <= top) return 0;
  return (right - left) * (bottom - top);
};

const calcIoU = (a: ScannerTarget, b: ScannerTarget): number => {
  const inter = intersectionArea(a, b);
  if (inter <= 0) return 0;
  const areaA = a.w * a.h;
  const areaB = b.w * b.h;
  const union = areaA + areaB - inter;
  if (union <= 0) return 0;
  return inter / union;
};

const buildFallbackScannerTargets = (slideId: number, script: string): ScannerTarget[] => {
  const text = script || '';
  const targets: ScannerTarget[] = [];

  const pushRegion = (x: number, y: number, w: number, h: number, label: string) => {
    targets.push({
      id: `${slideId}-${label}-${targets.length}`,
      x: clamp(x, 4, 82),
      y: clamp(y, 8, 80),
      w: clamp(w, 12, 30),
      h: clamp(h, 10, 28),
      label,
    });
  };

  if (text.includes('左')) pushRegion(8, 22, 24, 24, '左侧重点');
  if (text.includes('右')) pushRegion(67, 24, 24, 24, '右侧重点');
  if (text.includes('上')) pushRegion(34, 10, 30, 20, '上方信息');
  if (text.includes('下')) pushRegion(32, 62, 30, 20, '下方信息');
  if (text.includes('中') || text.includes('核心') || text.includes('关键')) pushRegion(36, 35, 28, 22, '核心区域');

  const baseHash = hashText(`${slideId}:${text}`);
  while (targets.length < 3) {
    const idx = targets.length + 1;
    const h = hashText(`${baseHash}-${idx}`);
    const x = 8 + (h % 58);
    const y = 12 + ((h >>> 6) % 56);
    const w = 18 + ((h >>> 12) % 10);
    const height = 14 + ((h >>> 18) % 10);
    pushRegion(x, y, w, height, `讲解焦点 ${idx}`);
  }

  return targets.slice(0, 4);
};

const buildTextScannerTargets = (
  slideId: number,
  script: string,
  textRegions: SlideTextRegion[] | undefined
): ScannerTarget[] => {
  if (!textRegions?.length) return [];

  const terms = extractScriptTerms(script);
  const normalizedTerms = terms.map((term) => ({
    raw: term,
    normalized: normalizeForMatch(term),
  }));

  const ranked = textRegions
    .map((region, index) => {
      const regionText = String(region.text || '').trim();
      const normalizedRegionText = normalizeForMatch(regionText);
      if (!normalizedRegionText) return null;

      let score = 0;
      let matchedTerm = '';
      for (const term of normalizedTerms) {
        if (!term.normalized || term.normalized.length < 2) continue;
        if (!normalizedRegionText.includes(term.normalized)) continue;

        const termScore = Math.min(term.normalized.length, 10) * (term.normalized.length >= 4 ? 2 : 1.2);
        score += termScore;
        if (!matchedTerm || term.normalized.length > normalizeForMatch(matchedTerm).length) {
          matchedTerm = term.raw;
        }
      }

      score += Math.min(normalizedRegionText.length, 24) * 0.06;

      const paddedX = clamp(region.x - 1.2, 1, 95);
      const paddedY = clamp(region.y - 1.1, 2, 94);
      const paddedW = clamp(region.w + 2.4, 8, 98 - paddedX);
      const paddedH = clamp(region.h + 2.2, 6, 98 - paddedY);

      return {
        id: `${slideId}-scan-text-${index + 1}`,
        x: paddedX,
        y: paddedY,
        w: paddedW,
        h: paddedH,
        label: matchedTerm ? `讲解焦点：${matchedTerm.slice(0, 8)}` : '文本重点',
        score,
        textLength: regionText.length,
      };
    })
    .filter((x): x is ScannerTarget & { score: number; textLength: number } => !!x);

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.textLength !== a.textLength) return b.textLength - a.textLength;
    return b.w * b.h - a.w * a.h;
  });

  const selected: ScannerTarget[] = [];
  for (const candidate of ranked) {
    if (selected.length >= 4) break;
    const overlapsTooMuch = selected.some((picked) => calcIoU(candidate, picked) > 0.55);
    if (overlapsTooMuch) continue;
    if (candidate.score < 1.2 && selected.length >= 2) continue;

    selected.push({
      id: candidate.id,
      x: candidate.x,
      y: candidate.y,
      w: candidate.w,
      h: candidate.h,
      label: candidate.label,
    });
  }

  if (selected.length >= 2) {
    return selected;
  }

  const denseText = [...ranked]
    .sort((a, b) => b.textLength - a.textLength)
    .filter((candidate) => !selected.some((picked) => calcIoU(candidate, picked) > 0.52));

  for (const candidate of denseText) {
    if (selected.length >= 3) break;
    selected.push({
      id: candidate.id,
      x: candidate.x,
      y: candidate.y,
      w: candidate.w,
      h: candidate.h,
      label: candidate.label || `文本重点 ${selected.length + 1}`,
    });
  }

  return selected;
};

const deriveScannerTargets = (slide: Slide | undefined, slideIndex: number): ScannerTarget[] => {
  if (!slide) return [];

  const matchedByText = buildTextScannerTargets(slide.id, slide.script || '', slide.textRegions);
  if (matchedByText.length >= 3) {
    return matchedByText.slice(0, 4);
  }

  const fallback = buildFallbackScannerTargets(slide.id, slide.script || '');
  if (matchedByText.length === 0) return fallback;

  const combined: ScannerTarget[] = [...matchedByText];
  for (const candidate of fallback) {
    if (combined.length >= 4) break;
    const overlapsTooMuch = combined.some((picked) => calcIoU(candidate, picked) > 0.5);
    if (overlapsTooMuch) continue;
    combined.push(candidate);
  }

  if (combined.length > 0) return combined;
  return buildFallbackScannerTargets(slide.id || slideIndex + 1, slide.script || '');
};

const MAX_REALTIME_QA_CONTEXT_CHARS = 16000;
const MAX_REALTIME_QA_SCRIPT_SNIPPET = 300;

const buildRealtimeQaCourseContext = (slides: Slide[]): string => {
  if (!Array.isArray(slides) || slides.length === 0) return '';

  const lines: string[] = [];
  let usedChars = 0;
  let hiddenCount = 0;

  for (let i = 0; i < slides.length; i++) {
    const script = normalizeCaptionText(slides[i]?.script || '');
    if (!script) continue;

    const snippet =
      script.length > MAX_REALTIME_QA_SCRIPT_SNIPPET
        ? `${script.slice(0, MAX_REALTIME_QA_SCRIPT_SNIPPET)}...`
        : script;
    const line = `第${i + 1}页：${snippet}`;
    const nextSize = usedChars + line.length + 1;
    if (nextSize > MAX_REALTIME_QA_CONTEXT_CHARS) {
      hiddenCount += 1;
      continue;
    }

    lines.push(line);
    usedChars = nextSize;
  }

  if (hiddenCount > 0) {
    lines.push(`（其余 ${hiddenCount} 页讲稿因长度限制省略）`);
  }

  return lines.join('\n');
};

const hasResumeNegativeIntent = (text: string): boolean => {
  const normalized = String(text || '').replace(/\s+/g, '').toLowerCase();
  if (!normalized) return false;
  return (
    normalized.includes('不继续') ||
    normalized.includes('先不继续') ||
    normalized.includes('暂不继续') ||
    normalized.includes('不用继续') ||
    normalized.includes('不要继续') ||
    normalized.includes('先不用') ||
    normalized.includes('先暂停') ||
    normalized.includes('不用了') ||
    normalized.includes('不用讲了')
  );
};

const hasResumeAffirmativeIntent = (text: string): boolean => {
  const normalized = String(text || '').replace(/\s+/g, '').toLowerCase();
  if (!normalized || hasResumeNegativeIntent(normalized)) return false;
  return (
    normalized.includes('继续讲') ||
    normalized.includes('继续课程') ||
    normalized.includes('继续演讲') ||
    normalized.includes('继续播放') ||
    normalized.includes('接着讲') ||
    normalized.includes('往下讲') ||
    normalized.includes('继续吧') ||
    normalized.includes('恢复讲解')
  );
};

type HomeCourseLevel = 'junior' | 'intermediate' | 'advanced';
type HomeJuniorCategory = 'basic_science' | 'health_common' | 'tcm_intro';
type HomeIntermediateCategory = 'nutrition_advanced' | 'cell_biology';

interface HomeCourseProfile {
  title: string;
  level: HomeCourseLevel;
  levelLabel: string;
  summary: string;
  juniorCategory: HomeJuniorCategory;
  intermediateCategory?: HomeIntermediateCategory;
}

type HomeSection = 'library' | 'exam';
type HomeCourseView = 'grid' | 'list';
type ExamCenterView = 'catalog' | 'playing' | 'result';
type ExamJudgeState = 'idle' | 'wrong';

interface ExamQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface LessonExamPaper {
  courseId: string;
  title: string;
  level: HomeCourseLevel;
  durationMinutes: number;
  totalScore: number;
  intro: string;
  questions: ExamQuestion[];
}

const HOME_COURSE_PROFILE_BY_ID: Record<string, HomeCourseProfile> = {
  'lesson-001': {
    title: '第一课：古老智慧与未来科技的握手',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '从神农本草经到现代细胞管理，建立健康认知底座。',
    juniorCategory: 'basic_science',
  },
  'lesson-002': {
    title: '第二课：人体微观建筑学与能量全景',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '拆解人体微观系统，理解能量代谢与营养协同逻辑。',
    juniorCategory: 'basic_science',
  },
  'lesson-003': {
    title: '第三课：生命的第一要素：蛋白质',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '聚焦蛋白质与免疫修复，建立生命科学高阶视角。',
    juniorCategory: 'basic_science',
  },
  'lesson-004': {
    title: '第四课：微观世界的觉醒：细胞生物学绪论',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '建立细胞生物学基础认知，理解生命活动的微观起点。',
    juniorCategory: 'basic_science',
  },
  'lesson-005': {
    title: '第五课：细胞的生命活动与功能特性',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '梳理细胞核心功能与代谢特性，夯实后续学习基础。',
    juniorCategory: 'basic_science',
  },
  'lesson-006': {
    title: '第六课：微观紫禁城：细胞结构深度解析',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '深入细胞结构分工，构建系统化微观结构图谱。',
    juniorCategory: 'basic_science',
  },
  'lesson-007': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '中医入门课程：从基础体系切入，建立系统认知框架。',
    juniorCategory: 'tcm_intro',
  },
  'lesson-008': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '中医入门课程：理解中医文化脉络与核心实践路径。',
    juniorCategory: 'tcm_intro',
  },
  'lesson-009': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '中医入门课程：聚焦学派框架与临床思维启蒙。',
    juniorCategory: 'tcm_intro',
  },
  'lesson-010': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '中医入门课程：围绕顺时养生建立日常实践方法。',
    juniorCategory: 'tcm_intro',
  },
  'lesson-011': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '中医入门课程：理解药食同源与四气五味应用。',
    juniorCategory: 'tcm_intro',
  },
  'lesson-012': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '健康常识课程：理解高血压机制与日常管理策略。',
    juniorCategory: 'health_common',
  },
  'lesson-013': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '健康常识课程：识别糖代谢风险与胰岛素抵抗干预方向。',
    juniorCategory: 'health_common',
  },
  'lesson-014': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '健康常识课程：掌握常见疾病的食疗思路与应用边界。',
    juniorCategory: 'health_common',
  },
  'lesson-015': {
    title: '',
    level: 'junior',
    levelLabel: '初阶 JUNIOR',
    summary: '健康常识课程：梳理核心沟通话术与落地表达框架。',
    juniorCategory: 'health_common',
  },
  'lesson-016': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：系统理解消化与营养吸收机制。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-017': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：构建食品营养价值分析框架。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-018': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：掌握产能营养素与能量代谢逻辑。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-019': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：深入水溶性维生素代谢功能。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-020': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：理解脂溶性维生素与储备机制。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-021': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：矿物质营养与生理功能进阶。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-022': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：膳食纤维作用机制与应用。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-023': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：水的营养角色与系统功能。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-024': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：多人群营养需求与配餐策略。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-025': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '营养学进阶课程：营养流行病学与长寿证据。',
    juniorCategory: 'health_common',
    intermediateCategory: 'nutrition_advanced',
  },
  'lesson-026': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '细胞生物学课程：理解细胞质基质、结构水与生物波传播。',
    juniorCategory: 'basic_science',
    intermediateCategory: 'cell_biology',
  },
  'lesson-027': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '细胞生物学课程：掌握内膜系统、基因表达与病毒灭活机制。',
    juniorCategory: 'basic_science',
    intermediateCategory: 'cell_biology',
  },
  'lesson-028': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '细胞生物学课程：拆解膜泡系统与细胞内物流网络。',
    juniorCategory: 'basic_science',
    intermediateCategory: 'cell_biology',
  },
  'lesson-029': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '细胞生物学课程：理解细胞表面结构、识别与通讯功能。',
    juniorCategory: 'basic_science',
    intermediateCategory: 'cell_biology',
  },
  'lesson-030': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '细胞生物学课程：建立细胞通讯网络的系统认知。',
    juniorCategory: 'basic_science',
    intermediateCategory: 'cell_biology',
  },
  'lesson-031': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '细胞生物学课程：理解人体内在光纤网络与信号传导。',
    juniorCategory: 'basic_science',
    intermediateCategory: 'cell_biology',
  },
  'lesson-032': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '细胞生物学课程：深入线粒体结构、产能与生命活动。',
    juniorCategory: 'basic_science',
    intermediateCategory: 'cell_biology',
  },
  'lesson-033': {
    title: '',
    level: 'intermediate',
    levelLabel: '中阶 INTERMEDIATE',
    summary: '细胞生物学课程：聚焦核糖体功能、病毒劫持与频率干预。',
    juniorCategory: 'basic_science',
    intermediateCategory: 'cell_biology',
  },
};

const HOME_COURSE_PROFILE_FALLBACK: HomeCourseProfile[] = [
  HOME_COURSE_PROFILE_BY_ID['lesson-001'],
  HOME_COURSE_PROFILE_BY_ID['lesson-002'],
  HOME_COURSE_PROFILE_BY_ID['lesson-003'],
];

const pickHomeCourseProfile = (course: PresetCourseMeta, index: number): HomeCourseProfile => {
  return HOME_COURSE_PROFILE_BY_ID[course.id] || HOME_COURSE_PROFILE_FALLBACK[index % HOME_COURSE_PROFILE_FALLBACK.length];
};

const getDisplayCourseTitle = (courseId: string, title: string): string => {
  const mapped = HOME_COURSE_PROFILE_BY_ID[courseId]?.title;
  return mapped || String(title || '').trim() || courseId;
};

const LEVEL_TAB_ITEMS: { key: HomeCourseLevel; label: string }[] = [
  { key: 'junior', label: '初阶' },
  { key: 'intermediate', label: '中阶' },
  { key: 'advanced', label: '高阶' },
];

const JUNIOR_SUBTAB_ITEMS: { key: HomeJuniorCategory; label: string }[] = [
  { key: 'basic_science', label: '基础学科' },
  { key: 'health_common', label: '健康常识' },
  { key: 'tcm_intro', label: '中医入门' },
];

const INTERMEDIATE_SUBTAB_ITEMS: { key: HomeIntermediateCategory; label: string }[] = [
  { key: 'nutrition_advanced', label: '营养学进阶' },
  { key: 'cell_biology', label: '细胞生物学' },
];

const IMPORT_PANEL_PASSWORD = 'a3811485';

const LESSON_EXAM_BANK: Record<string, LessonExamPaper> = {
  'lesson-001': {
    courseId: 'lesson-001',
    title: '第一课：古老智慧与未来科技的握手',
    level: 'junior',
    durationMinutes: 20,
    totalScore: 100,
    intro: '覆盖课程核心概念、方法论来源与健康管理应用场景。',
    questions: [
      {
        id: 'l1-q1',
        prompt: '本课中“古老智慧与未来科技握手”的核心含义是什么？',
        options: ['仅保留传统经验', '只依赖现代仪器', '用现代方法验证传统经验并转化应用', '完全替代中医理论'],
        answerIndex: 2,
        explanation: '课程强调传统知识与现代科学证据链的融合。',
      },
      {
        id: 'l1-q2',
        prompt: '“细胞精准管理”最直接对应的实践目标是？',
        options: ['统一补充所有营养', '针对个体状态做差异化干预', '减少饮水摄入', '只关注体重变化'],
        answerIndex: 1,
        explanation: '精准管理强调个体差异与针对性策略。',
      },
      {
        id: 'l1-q3',
        prompt: '课程中提到建立健康认知底座，第一步更应当是？',
        options: ['先买补剂', '先建立系统认知框架', '先进行高强度训练', '先完全禁食'],
        answerIndex: 1,
        explanation: '先理解机制，再选择行动方案，是课程主线。',
      },
      {
        id: 'l1-q4',
        prompt: '以下哪项最符合课程倡导的健康管理方式？',
        options: ['短期突击', '情绪驱动决策', '长期、可追踪、可迭代', '单一指标判断全部健康状态'],
        answerIndex: 2,
        explanation: '课程强调持续追踪和动态优化。',
      },
      {
        id: 'l1-q5',
        prompt: '将传统经验转化为可执行方案时，最关键的是？',
        options: ['忽略证据', '依赖口碑传播', '构建可验证的评估标准', '只看价格高低'],
        answerIndex: 2,
        explanation: '可验证标准是从经验走向科学实践的关键。',
      },
    ],
  },
  'lesson-002': {
    courseId: 'lesson-002',
    title: '第二课：人体微观建筑学与能量全景',
    level: 'junior',
    durationMinutes: 20,
    totalScore: 100,
    intro: '聚焦微观结构、能量代谢与营养协同三条主线能力。',
    questions: [
      {
        id: 'l2-q1',
        prompt: '“人体微观建筑学”主要帮助我们理解什么？',
        options: ['器官名称记忆', '细胞与组织层级如何协同', '只看外观体型', '只看短期心率'],
        answerIndex: 1,
        explanation: '核心在于微观结构与功能协同关系。',
      },
      {
        id: 'l2-q2',
        prompt: '能量代谢链路中，课程强调的关键特征是？',
        options: ['单点决定论', '多环节联动与相互制约', '越快越好', '与营养无关'],
        answerIndex: 1,
        explanation: '代谢是系统工程，不是单点现象。',
      },
      {
        id: 'l2-q3',
        prompt: '“营养协同”意味着以下哪种策略更合理？',
        options: ['只补一种成分', '根据目标做组合干预', '随机搭配', '完全不关注剂量'],
        answerIndex: 1,
        explanation: '协同强调组合与目标导向，不是单成分孤立补充。',
      },
      {
        id: 'l2-q4',
        prompt: '若出现能量不足与恢复慢，课程建议优先做什么？',
        options: ['仅增加训练', '评估睡眠-营养-代谢链路', '完全停用饮食记录', '忽略恢复周期'],
        answerIndex: 1,
        explanation: '需要先排查系统链路，再定向优化。',
      },
      {
        id: 'l2-q5',
        prompt: '课程中“全景”视角的价值是？',
        options: ['减少信息量', '只关注某一器官', '把分散指标放入同一决策框架', '只用主观感受'],
        answerIndex: 2,
        explanation: '全景视角用于统一认知与决策。',
      },
    ],
  },
  'lesson-003': {
    courseId: 'lesson-003',
    title: '第三课：生命的第一要素：蛋白质',
    level: 'junior',
    durationMinutes: 20,
    totalScore: 100,
    intro: '围绕蛋白质在结构、免疫与修复中的作用设置综合题。',
    questions: [
      {
        id: 'l3-q1',
        prompt: '课程中为何称蛋白质为“生命第一要素”？',
        options: ['仅提供口感', '参与结构、功能与调控等多维任务', '只能提供热量', '与免疫无关'],
        answerIndex: 1,
        explanation: '蛋白质覆盖结构、酶、信号等关键生命过程。',
      },
      {
        id: 'l3-q2',
        prompt: '在免疫修复场景下，蛋白质最重要的意义是？',
        options: ['替代睡眠', '提供组织修复与免疫物质合成原料', '减少饮水', '完全不需要其他营养'],
        answerIndex: 1,
        explanation: '蛋白质是免疫因子与修复过程的重要原料。',
      },
      {
        id: 'l3-q3',
        prompt: '课程提到“代谢平衡”，以下哪项理解更准确？',
        options: ['摄入越多越好', '摄入与利用效率都要纳入评估', '只看总热量', '与活动量无关'],
        answerIndex: 1,
        explanation: '平衡强调摄入、吸收、利用和负荷匹配。',
      },
      {
        id: 'l3-q4',
        prompt: '出现恢复慢时，课程建议的优先排查项不包括？',
        options: ['蛋白质结构与总量', '进食分配节奏', '睡眠与炎症状态', '完全忽略个体差异'],
        answerIndex: 3,
        explanation: '个体差异是课程反复强调的前提。',
      },
      {
        id: 'l3-q5',
        prompt: '将蛋白质策略落地时，最符合课程观点的是？',
        options: ['一次性方案长期不变', '基于阶段目标动态调整', '只听单次体检结论', '只看网络热门做法'],
        answerIndex: 1,
        explanation: '课程强调目标导向与周期化调整。',
      },
    ],
  },
};

const isRealtimeQaMode = (m: AppMode): boolean =>
  m === AppMode.QNA_LISTENING || m === AppMode.QNA_PROCESSING || m === AppMode.QNA_ANSWERING;

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.UPLOAD);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressState>(initialAnalysisProgress);
  const [progressClock, setProgressClock] = useState<number>(Date.now());
  const [presentationCaption, setPresentationCaption] = useState<string>('');
  const [presetCourses, setPresetCourses] = useState<PresetCourseMeta[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState<boolean>(false);
  const [activePresetCourseId, setActivePresetCourseId] = useState<string>('');
  const [homeSection, setHomeSection] = useState<HomeSection>('library');
  const [homeCourseView, setHomeCourseView] = useState<HomeCourseView>('grid');
  const [homeLevelTab, setHomeLevelTab] = useState<HomeCourseLevel>('junior');
  const [homeJuniorSubTab, setHomeJuniorSubTab] = useState<HomeJuniorCategory>('basic_science');
  const [homeIntermediateSubTab, setHomeIntermediateSubTab] = useState<HomeIntermediateCategory>('nutrition_advanced');
  const [isImportPanelUnlocked, setIsImportPanelUnlocked] = useState<boolean>(false);
  const [importUnlockInput, setImportUnlockInput] = useState<string>('');
  const [importUnlockError, setImportUnlockError] = useState<string>('');
  const [examCatalogView, setExamCatalogView] = useState<HomeCourseView>('grid');
  const [examCenterView, setExamCenterView] = useState<ExamCenterView>('catalog');
  const [selectedExamCourseId, setSelectedExamCourseId] = useState<string>('lesson-001');
  const [activeExamSessionCourseId, setActiveExamSessionCourseId] = useState<string>('');
  const [examQuestionIndex, setExamQuestionIndex] = useState<number>(0);
  const [examSelectedOptionIndex, setExamSelectedOptionIndex] = useState<number | null>(null);
  const [examJudgeState, setExamJudgeState] = useState<ExamJudgeState>('idle');
  const [examWrongAttempts, setExamWrongAttempts] = useState<number>(0);
  const [examCorrectCount, setExamCorrectCount] = useState<number>(0);
  const [isTrialPanelOpen, setIsTrialPanelOpen] = useState<boolean>(false);
  const [trialSpeechText, setTrialSpeechText] = useState<string>('');
  const [trialScoringResult, setTrialScoringResult] = useState<TrialLectureEvaluation | null>(null);
  const [isTrialResultModalOpen, setIsTrialResultModalOpen] = useState<boolean>(false);
  const [trialPlanResult, setTrialPlanResult] = useState<TrialLecturePlanWithAudio | null>(null);
  const [isTrialPlanGenerating, setIsTrialPlanGenerating] = useState<boolean>(false);
  const [isTrialPlanAudioPlaying, setIsTrialPlanAudioPlaying] = useState<boolean>(false);
  const [trialPlanErrorMessage, setTrialPlanErrorMessage] = useState<string>('');
  const [trialErrorMessage, setTrialErrorMessage] = useState<string>('');
  const [isTrialRecording, setIsTrialRecording] = useState<boolean>(false);
  const [isTrialTranscribing, setIsTrialTranscribing] = useState<boolean>(false);
  const [isTrialScoring, setIsTrialScoring] = useState<boolean>(false);
  const [knowledgeBaseEntries, setKnowledgeBaseEntries] = useState<RealtimeKnowledgeBaseEntry[]>([]);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState<boolean>(false);
  const [isKnowledgeIngesting, setIsKnowledgeIngesting] = useState<boolean>(false);
  const [knowledgeIngestMessage, setKnowledgeIngestMessage] = useState<string>('');
  const [knowledgeIngestReports, setKnowledgeIngestReports] = useState<KnowledgeIngestFileReport[]>([]);
  const [localKnowledgeEntryCount, setLocalKnowledgeEntryCount] = useState<number>(0);

  const audioPlayerRef = useRef<AudioPlayer>(new AudioPlayer());
  const realtimeAudioPlayerRef = useRef<StreamingAudioPlayer>(new StreamingAudioPlayer());
  const micStreamerRef = useRef<MicrophonePcmStreamer | null>(null);
  const realtimeSessionRef = useRef<ReturnType<typeof createRealtimeVoiceSession> | null>(null);
  const trialRecorderRef = useRef<MediaRecorder | null>(null);
  const trialRecordStreamRef = useRef<MediaStream | null>(null);
  const trialRecordChunksRef = useRef<Blob[]>([]);
  const realtimeAwaitingResumeIntentRef = useRef<boolean>(false);
  const realtimeResumeRequestInFlightRef = useRef<boolean>(false);
  const presentationCaptionRef = useRef<string>('');
  const presentationBreakpointRef = useRef<PresentationBreakpoint | null>(null);
  const realtimeActiveRef = useRef<boolean>(false);
  const realtimeStartingRef = useRef<boolean>(false);
  const realtimeStartAtRef = useRef<number>(0);
  const voiceFrameHitRef = useRef<number>(0);
  const lastInterruptAtRef = useRef<number>(0);
  const micChunkCountRef = useRef<number>(0);
  const transcriptEventCountRef = useRef<number>(0);
  const assistantAudioChunkCountRef = useRef<number>(0);
  const realtimeHealthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeStartTokenRef = useRef<number>(0);
  const isUnmountedRef = useRef<boolean>(false);
  const slidesRef = useRef<Slide[]>([]);
  const feedbackMessageRef = useRef<string>('');
  const playbackSessionRef = useRef<number>(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionStreamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentSlideIndexRef = useRef<number>(0);
  const modeRef = useRef<AppMode>(AppMode.UPLOAD);

  const clearAdvanceTimer = () => {
    if (!advanceTimerRef.current) return;
    clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
  };

  const clearRealtimeHealthTimer = () => {
    if (!realtimeHealthTimerRef.current) return;
    clearTimeout(realtimeHealthTimerRef.current);
    realtimeHealthTimerRef.current = null;
  };

  const clearCaptionStream = () => {
    if (!captionStreamTimerRef.current) return;
    clearInterval(captionStreamTimerRef.current);
    captionStreamTimerRef.current = null;
  };

  const resolveSlideAudioData = useCallback(async (audioData?: string): Promise<string | undefined> => {
    const input = String(audioData || '').trim();
    if (!input) return undefined;
    if (!isAudioFileMarker(input)) return input;

    const url = extractAudioFilePath(input);
    if (!url) return undefined;

    const resp = await fetch(url, { cache: 'force-cache' });
    if (!resp.ok) {
      throw new Error(`Preset audio fetch failed (${resp.status})`);
    }
    const text = String(await resp.text()).trim();
    return text || undefined;
  }, []);

  const generateAllAudioForCurrentSlides = useCallback(async () => {
    const list = slidesRef.current || [];
    if (!list.length) return { total: 0, generated: 0 };

    let generated = 0;
    setIsProcessing(true);
    for (let i = 0; i < list.length; i++) {
      const current = slidesRef.current[i] || list[i];
      if (!current) continue;

      const scriptText = normalizeCaptionText(current.script || '');
      if (!scriptText) continue;

      if (current.audioData && !isAudioFileMarker(current.audioData)) continue;

      setFeedbackMessage(`正在批量生成预设课程音频：${i + 1}/${list.length}`);
      let resolvedAudio: string | undefined;
      try {
        resolvedAudio = await resolveSlideAudioData(current.audioData);
      } catch {
        resolvedAudio = undefined;
      }

      if (!resolvedAudio) {
        try {
          const generatedAudio = await generateSpeech(scriptText);
          resolvedAudio = generatedAudio || undefined;
        } catch (error) {
          console.warn(`Preset audio generation failed on slide ${current.id}`, error);
        }
      }

      if (!resolvedAudio) continue;
      generated += 1;

      setSlides((prev) => {
        if (!prev[i]) return prev;
        const next = [...prev];
        next[i] = {
          ...next[i],
          audioData: resolvedAudio,
          isGeneratingAudio: false,
        };
        return next;
      });
    }

    setIsProcessing(false);
    setFeedbackMessage(generated > 0 ? '预设课程音频生成完成。' : '当前课程无需生成新音频。');
    return { total: list.length, generated };
  }, [resolveSlideAudioData]);

  const startCaptionStream = (script: string, audioBase64: string, sessionToken: number) => {
    clearCaptionStream();

    const fullText = normalizeCaptionText(script);
    if (!fullText) {
      setPresentationCaption('');
      return;
    }

    const estimatedDuration = estimateAudioDurationSeconds(audioBase64);
    if (estimatedDuration <= 0.2) {
      setPresentationCaption(fullText);
      return;
    }

    setPresentationCaption('');
    const tickMs = 80;
    const totalTicks = Math.max(1, Math.floor((estimatedDuration * 1000) / tickMs));
    const charsPerTick = Math.max(1, Math.ceil(fullText.length / totalTicks));
    let revealed = 0;

    captionStreamTimerRef.current = setInterval(() => {
      if (sessionToken !== playbackSessionRef.current || isUnmountedRef.current || modeRef.current !== AppMode.PRESENTING) {
        clearCaptionStream();
        return;
      }

      revealed = Math.min(fullText.length, revealed + charsPerTick);
      setPresentationCaption(fullText.slice(0, revealed));
      if (revealed >= fullText.length) {
        clearCaptionStream();
      }
    }, tickMs);
  };

  useEffect(() => {
    // React StrictMode in development mounts -> unmounts -> mounts once.
    // Always reset this flag on mount so startup guards don't get false positives.
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      playbackSessionRef.current += 1;
      realtimeActiveRef.current = false;
      realtimeAwaitingResumeIntentRef.current = false;
      realtimeResumeRequestInFlightRef.current = false;
      clearAdvanceTimer();
      clearRealtimeHealthTimer();
      clearCaptionStream();
      audioPlayerRef.current.stop();
      realtimeAudioPlayerRef.current.stop();
      micStreamerRef.current?.stop();
      micStreamerRef.current = null;
      const trialRecorder = trialRecorderRef.current;
      if (trialRecorder && trialRecorder.state !== 'inactive') {
        trialRecorder.onstop = null;
        try {
          trialRecorder.stop();
        } catch {
          // Ignore stop race.
        }
      }
      trialRecorderRef.current = null;
      trialRecordChunksRef.current = [];
      const trialStream = trialRecordStreamRef.current;
      if (trialStream) {
        trialStream.getTracks().forEach((track) => track.stop());
        trialRecordStreamRef.current = null;
      }
      const session = realtimeSessionRef.current;
      realtimeSessionRef.current = null;
      if (session) {
        void session.close();
      }
    };
  }, []);

  useEffect(() => {
    currentSlideIndexRef.current = currentSlideIndex;
  }, [currentSlideIndex]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    feedbackMessageRef.current = feedbackMessage;
  }, [feedbackMessage]);

  useEffect(() => {
    presentationCaptionRef.current = presentationCaption;
  }, [presentationCaption]);

  useEffect(() => {
    const host = String(window.location.hostname || '');
    const allowExpose = host === 'localhost' || host === '127.0.0.1';
    if (!allowExpose) return;

    const bridge = {
      getSnapshot: () => ({
        mode: modeRef.current,
        feedbackMessage: feedbackMessageRef.current,
        slides: slidesRef.current,
      }),
      generateAllAudio: async () => generateAllAudioForCurrentSlides(),
    };
    (window as any).__presetAutomation = bridge;
    return () => {
      if ((window as any).__presetAutomation === bridge) {
        delete (window as any).__presetAutomation;
      }
    };
  }, [generateAllAudioForCurrentSlides]);

  useEffect(() => {
    if (mode === AppMode.PRESENTING) return;
    clearCaptionStream();
    const nextCaption = normalizeCaptionText(slides[currentSlideIndex]?.script || '');
    setPresentationCaption(nextCaption);
  }, [slides, currentSlideIndex, mode]);

  useEffect(() => {
    realtimeAudioPlayerRef.current.setOnIdle(() => {
      if (isUnmountedRef.current) return;
      if (!realtimeActiveRef.current) return;
      if (modeRef.current === AppMode.QNA_ANSWERING) {
        setMode(AppMode.QNA_LISTENING);
      }
    });
    return () => {
      realtimeAudioPlayerRef.current.setOnIdle(null);
    };
  }, []);

  useEffect(() => {
    if (mode !== AppMode.ANALYZING_FLOW) return;
    const timer = setInterval(() => setProgressClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchNextAudio = async () => {
      const BUFFER_WINDOW = 2;

      const indexToFetch = slides.findIndex((s, index) => {
        if (index < currentSlideIndex) return false;
        if (index > currentSlideIndex + BUFFER_WINDOW) return false;
        const hasScript = !!s.script;
        const needsAudio = !s.audioData || isAudioFileMarker(s.audioData);
        return hasScript && needsAudio && !s.isGeneratingAudio;
      });

      if (indexToFetch === -1) return;

      let scriptToFetch: string | undefined;
      let existingAudioData: string | undefined;
      setSlides((prev) => {
        const next = [...prev];
        const target = next[indexToFetch];
        if (!target || !target.script || target.isGeneratingAudio) return prev;
        if (target.audioData && !isAudioFileMarker(target.audioData)) return prev;
        scriptToFetch = target.script;
        existingAudioData = target.audioData;
        next[indexToFetch] = { ...target, isGeneratingAudio: true };
        return next;
      });

      if (!scriptToFetch) return;

      await new Promise((r) => setTimeout(r, 600));
      if (isUnmountedRef.current) return;

      let audioBase64: string | null | undefined = undefined;
      try {
        audioBase64 = await resolveSlideAudioData(existingAudioData);
      } catch {
        audioBase64 = undefined;
      }
      if (!audioBase64) {
        audioBase64 = await generateSpeech(scriptToFetch);
      }

      if (isUnmountedRef.current) return;
      setSlides((prev) => {
        const next = [...prev];
        const target = next[indexToFetch];
        if (!target) return prev;
        next[indexToFetch] = {
          ...target,
          audioData: audioBase64 || undefined,
          isGeneratingAudio: false,
        };
        return next;
      });
    };

    if (mode !== AppMode.UPLOAD && mode !== AppMode.PROCESSING_PDF && mode !== AppMode.ANALYZING_FLOW) {
      timeoutId = setTimeout(fetchNextAudio, 400);
    }

    return () => clearTimeout(timeoutId);
  }, [slides, mode, currentSlideIndex, resolveSlideAudioData]);

  const refreshPresetCourses = async () => {
    setIsLibraryLoading(true);
    try {
      const list = await listPresetCourseMetas();
      if (isUnmountedRef.current) return;
      setPresetCourses(list);
    } catch (error) {
      console.error('Failed to load preset courses', error);
      if (!isUnmountedRef.current) {
        setFeedbackMessage('预设课程索引读取失败，请检查 preset-courses 目录配置。');
      }
    } finally {
      if (!isUnmountedRef.current) {
        setIsLibraryLoading(false);
      }
    }
  };

  useEffect(() => {
    void refreshPresetCourses();
  }, []);

  const refreshKnowledgeBaseEntries = useCallback(async () => {
    const entries = await loadRealtimeKnowledgeBase();
    if (isUnmountedRef.current) return;
    setKnowledgeBaseEntries(entries);
    setLocalKnowledgeEntryCount(listLocalRealtimeKnowledgeBase().length);
    if (entries.length > 0) {
      console.info('[QNA] knowledge base loaded', { count: entries.length });
    }
  }, []);

  useEffect(() => {
    void refreshKnowledgeBaseEntries();
  }, [refreshKnowledgeBaseEntries]);

  const processPdfFile = async (file: File) => {
    const isPdfType = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdfType) {
      alert('请上传 PDF 文件。');
      return;
    }

    setMode(AppMode.PROCESSING_PDF);
    setFeedbackMessage('正在解析 PDF...');
    setIsProcessing(true);
    setActivePresetCourseId('');

    try {
      const extractedSlides = await convertPdfToImages(file);
      if (isUnmountedRef.current) return;
      setSlides(extractedSlides);
      setCurrentSlideIndex(0);

      setMode(AppMode.ANALYZING_FLOW);
      setFeedbackMessage('正在分析页面并生成讲解稿...');
      setAnalysisProgress({
        totalSlides: extractedSlides.length,
        completedSlides: 0,
        successSlides: 0,
        failedSlides: 0,
        currentSlideId: extractedSlides[0]?.id ?? 0,
        currentSlideIndex: 0,
        startedAt: Date.now(),
        lastUpdatedAt: Date.now(),
      });

      const scripts = await generateGlobalPresentationScript(extractedSlides, (progress) => {
        const now = Date.now();
        setAnalysisProgress((prev) => ({
          ...progress,
          startedAt: prev.startedAt ?? now,
          lastUpdatedAt: now,
        }));
        setFeedbackMessage(
          `正在生成讲稿：${progress.completedSlides}/${progress.totalSlides}（成功 ${progress.successSlides}，失败 ${progress.failedSlides}）`
        );
      });

      let mergedSlides: Slide[] = extractedSlides.map((slide) => {
        const matched = scripts.find((s) => s.slideId === slide.id);
        return {
          ...slide,
          script: matched?.script || '（该页未提取到内容）',
        };
      });

      if (isUnmountedRef.current) return;
      setSlides(mergedSlides);
      setMode(AppMode.READY);
      setFeedbackMessage('准备就绪，点击下方播放开始讲解。');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      const isApiKeyError = error instanceof GeminiApiKeyError || message.includes('API key');

      setFeedbackMessage(
        isApiKeyError
          ? 'ARK 接口 Key 无效或缺失，请检查 .env.local 后重启。'
          : 'PDF 处理失败，请重试。'
      );
      setMode(AppMode.UPLOAD);
    } finally {
      if (!isUnmountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await processPdfFile(file);
  };

  const loadPresetCourse = async (courseId: string) => {
    const id = String(courseId || '').trim();
    if (!id) return;

    setMode(AppMode.PROCESSING_PDF);
    setFeedbackMessage('正在从预设课程书柜加载...');
    setActivePresetCourseId(id);
    setIsProcessing(true);
    try {
      const stored = await loadPresetCourseById(presetCourses, id);
      if (!stored || !stored.slides?.length) {
        setFeedbackMessage('课程不存在，可能已被清理。');
        setMode(AppMode.UPLOAD);
        return;
      }

      if (isUnmountedRef.current) return;
      setSlides(stored.slides || []);
      setCurrentSlideIndex(0);
      setMode(AppMode.READY);
      setFeedbackMessage(`已加载预设课程《${getDisplayCourseTitle(id, stored.title || '')}》，点击下方播放开始讲解。`);
    } catch (error) {
      console.error('Load preset course failed', error);
      const message = error instanceof Error ? error.message : String(error);
      setFeedbackMessage(`加载预设课程失败：${message}`);
      setMode(AppMode.UPLOAD);
    } finally {
      if (!isUnmountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const capturePresentationBreakpoint = (): PresentationBreakpoint | null => {
    if (modeRef.current !== AppMode.PRESENTING) return null;

    const slideIndex = currentSlideIndexRef.current;
    const slide = slidesRef.current[slideIndex];
    if (!slide) return null;

    const fullScript = normalizeCaptionText(slide.script || '');
    if (!fullScript) return null;

    const captionProgress = normalizeCaptionText(presentationCaptionRef.current || '');
    if (!captionProgress) {
      return { slideIndex, charOffset: 0 };
    }

    const offset = clamp(captionProgress.length, 0, Math.max(0, fullScript.length - 1));
    return { slideIndex, charOffset: offset };
  };

  const startPresentation = () => {
    presentationBreakpointRef.current = null;
    playbackSessionRef.current += 1;
    const sessionToken = playbackSessionRef.current;
    clearAdvanceTimer();
    clearCaptionStream();
    setPresentationCaption('');
    modeRef.current = AppMode.PRESENTING;
    audioPlayerRef.current.stop();
    setMode(AppMode.PRESENTING);
    setCurrentSlideIndex(0);
    void playSlide(0, sessionToken);
  };

  const playSlide = async (
    index: number,
    sessionToken: number = playbackSessionRef.current,
    options?: { resumeCharOffset?: number }
  ) => {
    if (sessionToken !== playbackSessionRef.current) return;

    if (index >= slides.length) {
      clearCaptionStream();
      setMode(AppMode.COMPLETED);
      return;
    }

    const slide = slides[index];
    const fullScriptText = normalizeCaptionText(slide.script || '');
    const requestedResumeOffset = Math.max(0, Math.floor(options?.resumeCharOffset ?? 0));
    const resumeCharOffset =
      fullScriptText.length > 0 ? clamp(requestedResumeOffset, 0, Math.max(0, fullScriptText.length - 1)) : 0;
    const isResumePlayback = resumeCharOffset > 0 && fullScriptText.length > 0;
    const scriptText = isResumePlayback
      ? normalizeCaptionText(fullScriptText.slice(resumeCharOffset))
      : fullScriptText;
    if (!scriptText) {
      if (sessionToken !== playbackSessionRef.current) return;
      if (index + 1 < slides.length) {
        setCurrentSlideIndex(index + 1);
        clearCaptionStream();
        setPresentationCaption('');
        setFeedbackMessage('当前页已讲完，继续下一页...');
        clearAdvanceTimer();
        advanceTimerRef.current = setTimeout(() => {
          void playSlide(index + 1, sessionToken);
        }, 160);
        return;
      }
      clearCaptionStream();
      setMode(AppMode.COMPLETED);
      return;
    }

    let audioToPlay = slide.audioData;

    if (isAudioFileMarker(audioToPlay)) {
      setIsProcessing(true);
      setFeedbackMessage('正在加载预设语音...');
      try {
        const resolved = await resolveSlideAudioData(audioToPlay);
        if (sessionToken !== playbackSessionRef.current) return;
        audioToPlay = resolved;
        if (resolved) {
          setSlides((prev) => {
            const next = [...prev];
            const target = next[index];
            if (!target) return prev;
            next[index] = {
              ...target,
              audioData: resolved,
            };
            return next;
          });
        }
      } catch (error) {
        console.warn('Preset audio load failed, fallback to TTS generation', error);
      } finally {
        if (sessionToken === playbackSessionRef.current) {
          setIsProcessing(false);
        }
      }
    }

    if (isResumePlayback && audioToPlay) {
      const resumeRatio = resumeCharOffset / Math.max(1, fullScriptText.length);
      if (audioToPlay.startsWith('TEXT:')) {
        audioToPlay = `TEXT:${encodeURIComponent(scriptText)}`;
      } else {
        const sliced = slicePcmBase64ByRatio(audioToPlay, resumeRatio);
        audioToPlay = sliced || undefined;
      }
    }

    if (!audioToPlay && scriptText) {
      setIsProcessing(true);
      setFeedbackMessage('正在合成语音...');

      if (!isResumePlayback) {
        setSlides((prev) => {
          const next = [...prev];
          const target = next[index];
          if (!target) return prev;
          next[index] = { ...target, isGeneratingAudio: true };
          return next;
        });
      }

      const generated = await generateSpeech(scriptText);
      if (sessionToken !== playbackSessionRef.current) return;
      audioToPlay = generated || undefined;

      if (!isResumePlayback) {
        setSlides((prev) => {
          const next = [...prev];
          const target = next[index];
          if (!target) return prev;
          next[index] = {
            ...target,
            audioData: generated || target.audioData,
            isGeneratingAudio: false,
          };
          return next;
        });
      }
    }

    if (!audioToPlay) {
      if (sessionToken !== playbackSessionRef.current) return;
      setIsProcessing(false);
      clearCaptionStream();
      setPresentationCaption(scriptText);
      setFeedbackMessage('语音生成失败，请检查 TTS 配置与网络后重试。');
      setMode(AppMode.PAUSED);
      return;
    }

    if (sessionToken !== playbackSessionRef.current) return;
    setIsProcessing(false);
    setFeedbackMessage(isResumePlayback ? '已从断点继续讲解...' : '正在讲解中...');
    startCaptionStream(scriptText, audioToPlay, sessionToken);
    audioPlayerRef.current.playPCM(audioToPlay, () => {
      clearCaptionStream();
      setPresentationCaption(scriptText);
      handleSlideEnded(index, sessionToken);
    });
  };

  const handleSlideEnded = (index: number, sessionToken: number) => {
    if (sessionToken !== playbackSessionRef.current) return;
    if (modeRef.current !== AppMode.PRESENTING) return;
    if (index !== currentSlideIndexRef.current) return;

    if (index + 1 < slides.length) {
      presentationBreakpointRef.current = null;
      setCurrentSlideIndex(index + 1);
      clearCaptionStream();
      setPresentationCaption('');
      clearAdvanceTimer();
      advanceTimerRef.current = setTimeout(() => {
        void playSlide(index + 1, sessionToken);
      }, 250);
      return;
    }

    clearCaptionStream();
    presentationBreakpointRef.current = null;
    setMode(AppMode.COMPLETED);
  };

  const pausePresentation = () => {
    presentationBreakpointRef.current = capturePresentationBreakpoint();
    playbackSessionRef.current += 1;
    clearAdvanceTimer();
    clearCaptionStream();
    modeRef.current = AppMode.PAUSED;
    audioPlayerRef.current.stop();
    setMode(AppMode.PAUSED);
  };

  const resumePresentation = () => {
    playbackSessionRef.current += 1;
    const sessionToken = playbackSessionRef.current;
    clearAdvanceTimer();
    clearCaptionStream();
    modeRef.current = AppMode.PRESENTING;
    setMode(AppMode.PRESENTING);

    const breakpoint = presentationBreakpointRef.current;
    if (
      breakpoint &&
      breakpoint.slideIndex >= 0 &&
      breakpoint.slideIndex < slidesRef.current.length &&
      breakpoint.charOffset > 0
    ) {
      const targetIndex = breakpoint.slideIndex;
      setCurrentSlideIndex(targetIndex);
      presentationBreakpointRef.current = null;
      void playSlide(targetIndex, sessionToken, { resumeCharOffset: breakpoint.charOffset });
      return;
    }

    presentationBreakpointRef.current = null;
    void playSlide(currentSlideIndexRef.current, sessionToken);
  };

  const jumpToSlide = useCallback(
    (targetIndex: number) => {
      const total = slidesRef.current.length;
      if (!total) return;

      if (isRealtimeQaMode(modeRef.current)) {
        setFeedbackMessage('实时答疑中暂不支持翻页，请先停止答疑。');
        return;
      }

      const nextIndex = clamp(targetIndex, 0, total - 1);
      const shouldContinuePlaying = modeRef.current === AppMode.PRESENTING;

      playbackSessionRef.current += 1;
      const sessionToken = playbackSessionRef.current;
      clearAdvanceTimer();
      clearCaptionStream();
      audioPlayerRef.current.stop();
      presentationBreakpointRef.current = null;
      setPresentationCaption('');
      setCurrentSlideIndex(nextIndex);

      if (!shouldContinuePlaying) {
        setFeedbackMessage(`已切换到第 ${nextIndex + 1} 页。`);
        return;
      }

      setFeedbackMessage(`正在切换到第 ${nextIndex + 1} 页...`);
      void playSlide(nextIndex, sessionToken);
    },
    [playSlide]
  );

  const goToPrevSlide = useCallback(() => {
    jumpToSlide(currentSlideIndexRef.current - 1);
  }, [jumpToSlide]);

  const goToNextSlide = useCallback(() => {
    jumpToSlide(currentSlideIndexRef.current + 1);
  }, [jumpToSlide]);

  useEffect(() => {
    const allowKeyboardPaging =
      mode === AppMode.READY || mode === AppMode.PRESENTING || mode === AppMode.PAUSED;
    if (!allowKeyboardPaging) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName || '';
      if (target?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (event.key === 'ArrowLeft' && currentSlideIndexRef.current > 0) {
        event.preventDefault();
        goToPrevSlide();
        return;
      }

      if (event.key === 'ArrowRight' && currentSlideIndexRef.current + 1 < slidesRef.current.length) {
        event.preventDefault();
        goToNextSlide();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, goToPrevSlide, goToNextSlide]);

  const stopRealtimeQa = async (
    targetMode: AppMode = AppMode.PAUSED,
    message: string = '实时答疑已停止。',
    reason: string = 'unknown'
  ) => {
    console.info('[QNA] stop requested', {
      targetMode,
      message,
      reason,
      startToken: realtimeStartTokenRef.current,
      active: realtimeActiveRef.current,
      starting: realtimeStartingRef.current,
    });
    realtimeStartTokenRef.current += 1;
    realtimeActiveRef.current = false;
    realtimeStartingRef.current = false;
    realtimeAwaitingResumeIntentRef.current = false;
    realtimeResumeRequestInFlightRef.current = false;
    realtimeStartAtRef.current = 0;
    voiceFrameHitRef.current = 0;
    lastInterruptAtRef.current = 0;
    micChunkCountRef.current = 0;
    transcriptEventCountRef.current = 0;
    assistantAudioChunkCountRef.current = 0;
    clearRealtimeHealthTimer();
    clearCaptionStream();

    realtimeAudioPlayerRef.current.stop();
    micStreamerRef.current?.stop();
    micStreamerRef.current = null;
    if (targetMode !== AppMode.PAUSED) {
      presentationBreakpointRef.current = null;
    }

    if (!isUnmountedRef.current) {
      setMode(targetMode);
      setFeedbackMessage(message);
    }

    const session = realtimeSessionRef.current;
    realtimeSessionRef.current = null;
    if (session) {
      try {
        await Promise.race([
          session.close(),
          new Promise<void>((resolve) => setTimeout(resolve, 1200)),
        ]);
      } catch (error) {
        console.error('Failed to close realtime session', error);
      }
    }
  };

  const startRealtimeQa = async () => {
    if (realtimeActiveRef.current || realtimeStartingRef.current) return;
    realtimeStartingRef.current = true;
    realtimeStartAtRef.current = Date.now();
    realtimeAwaitingResumeIntentRef.current = false;
    realtimeResumeRequestInFlightRef.current = false;
    console.info('[QNA] start requested', {
      mode: modeRef.current,
      slideIndex: currentSlideIndexRef.current,
      startToken: realtimeStartTokenRef.current,
    });

    const currentSlide = slides[currentSlideIndexRef.current];
    if (!currentSlide) {
      setFeedbackMessage('当前没有可讲解页面。');
      setMode(AppMode.PAUSED);
      return;
    }
    if (modeRef.current === AppMode.PRESENTING) {
      presentationBreakpointRef.current = capturePresentationBreakpoint();
    }
    const realtimeCourseContext = buildRealtimeQaCourseContext(slidesRef.current);
    const realtimeCurrentSlideNumber = currentSlideIndexRef.current + 1;

    playbackSessionRef.current += 1;
    clearAdvanceTimer();
    clearCaptionStream();
    audioPlayerRef.current.stop();
    realtimeAudioPlayerRef.current.stop();
    setMode(AppMode.QNA_PROCESSING);
    setFeedbackMessage('正在连接实时语音答疑...');
    transcriptEventCountRef.current = 0;
    assistantAudioChunkCountRef.current = 0;
    const startToken = realtimeStartTokenRef.current + 1;
    realtimeStartTokenRef.current = startToken;

    try {
      const realtimeSession = createRealtimeVoiceSession(currentSlide.script || '', {
        onStateChange: (state) => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          console.info('[QNA] state', state);
          switch (state) {
            case 'connecting':
              setMode(AppMode.QNA_PROCESSING);
              setFeedbackMessage('实时会话握手中...');
              break;
            case 'listening':
              setMode(AppMode.QNA_LISTENING);
              setFeedbackMessage('实时答疑已连接，请直接提问。');
              break;
            case 'thinking':
              setMode(AppMode.QNA_PROCESSING);
              setFeedbackMessage('正在思考回答...');
              break;
            case 'answering':
              setMode(AppMode.QNA_ANSWERING);
              break;
            case 'closed':
              setMode(AppMode.PAUSED);
              break;
            default:
              break;
          }
        },
        onUserSpeechStart: () => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          realtimeAudioPlayerRef.current.interrupt();
          setMode(AppMode.QNA_LISTENING);
          setFeedbackMessage('正在听你提问...');
        },
        onUserSpeechEnd: () => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          setMode(AppMode.QNA_PROCESSING);
          setFeedbackMessage('正在思考回答...');
        },
        onTranscriptUpdate: (transcript, isFinal) => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          transcriptEventCountRef.current += 1;
          if (transcriptEventCountRef.current === 1 || isFinal) {
            console.info('[QNA] transcript', { isFinal, text: transcript });
          }

          if (
            isFinal &&
            realtimeAwaitingResumeIntentRef.current &&
            !realtimeResumeRequestInFlightRef.current
          ) {
            if (hasResumeAffirmativeIntent(transcript)) {
              realtimeResumeRequestInFlightRef.current = true;
              realtimeAwaitingResumeIntentRef.current = false;
              setFeedbackMessage(`你：${transcript}（收到，正在恢复讲解...）`);
              void (async () => {
                await stopRealtimeQa(
                  AppMode.PAUSED,
                  '收到继续讲课指令，正在恢复演讲...',
                  'resume-lecture-confirmed'
                );
                if (isUnmountedRef.current) return;
                resumePresentation();
              })();
              return;
            }
            if (hasResumeNegativeIntent(transcript)) {
              realtimeAwaitingResumeIntentRef.current = false;
            }
          }

          setMode(AppMode.QNA_LISTENING);
          setFeedbackMessage(isFinal ? `你：${transcript}` : `识别中：${transcript}`);
        },
        onAssistantTextDelta: (_delta, fullText) => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          setMode(AppMode.QNA_ANSWERING);
          setFeedbackMessage(fullText);
        },
        onAssistantTextFinal: (fullText) => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          const text = normalizeCaptionText(fullText);
          if (!text) return;
          // Every finished answer enters a short "continue lecture?" intent window.
          realtimeAwaitingResumeIntentRef.current = true;
        },
        onAssistantAudioChunk: (pcmChunk) => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          assistantAudioChunkCountRef.current += 1;
          if (assistantAudioChunkCountRef.current === 1) {
            console.info('[QNA] first assistant audio chunk', { bytes: pcmChunk.length });
          }
          setMode(AppMode.QNA_ANSWERING);
          realtimeAudioPlayerRef.current.enqueuePCM(pcmChunk, 24000, 1);
        },
        onAssistantSpeechEnd: () => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          setMode(AppMode.QNA_LISTENING);
        },
        onError: (error) => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          void stopRealtimeQa(
            AppMode.PAUSED,
            `实时答疑中断：${error.message}`,
            'session-onError-callback'
          );
        },
      }, realtimeCourseContext, realtimeCurrentSlideNumber, knowledgeBaseEntries);

      realtimeSessionRef.current = realtimeSession;
      realtimeActiveRef.current = true;
      setFeedbackMessage('实时会话握手中...');

      await realtimeSession.start();
      console.info('[QNA] session.start resolved', {
        isUnmounted: isUnmountedRef.current,
        active: realtimeActiveRef.current,
        startToken,
        currentToken: realtimeStartTokenRef.current,
      });

      if (
        isUnmountedRef.current ||
        !realtimeActiveRef.current ||
        startToken !== realtimeStartTokenRef.current
      ) {
        await stopRealtimeQa(
          AppMode.PAUSED,
          '实时答疑已停止。',
          'start-invalidated-after-session-start'
        );
        return;
      }

      setFeedbackMessage('实时会话已连接，正在申请麦克风权限...');

      const micStreamer = new MicrophonePcmStreamer(16000, 20);
      micStreamerRef.current = micStreamer;
      micChunkCountRef.current = 0;

      await micStreamer.start(
        ({ bytes, rms }) => {
          if (isUnmountedRef.current || !realtimeActiveRef.current) return;
          if (startToken !== realtimeStartTokenRef.current) return;
          const session = realtimeSessionRef.current;
          if (!session) return;
          micChunkCountRef.current += 1;
          if (micChunkCountRef.current === 1) {
            console.info('[QNA] first mic chunk sent', { bytes: bytes.length, rms });
            clearRealtimeHealthTimer();
          }

          if (rms >= 0.02) {
            voiceFrameHitRef.current += 1;
          } else {
            voiceFrameHitRef.current = 0;
          }

          const now = Date.now();
          const isAssistantSpeaking =
            modeRef.current === AppMode.QNA_ANSWERING || realtimeAudioPlayerRef.current.isPlaying();
          if (isAssistantSpeaking && voiceFrameHitRef.current >= 3 && now - lastInterruptAtRef.current > 450) {
            realtimeAudioPlayerRef.current.interrupt();
            lastInterruptAtRef.current = now;
          }

          session.sendAudioChunk(bytes);
        },
        { permissionTimeoutMs: 12000 }
      );

      if (
        isUnmountedRef.current ||
        !realtimeActiveRef.current ||
        startToken !== realtimeStartTokenRef.current
      ) {
        await stopRealtimeQa(
          AppMode.PAUSED,
          '实时答疑已停止。',
          'start-invalidated-after-mic-start'
        );
        return;
      }

      clearRealtimeHealthTimer();
      realtimeHealthTimerRef.current = setTimeout(() => {
        if (!realtimeActiveRef.current || isUnmountedRef.current) return;
        if (startToken !== realtimeStartTokenRef.current) return;
        if (micChunkCountRef.current > 0) return;
        void stopRealtimeQa(
          AppMode.PAUSED,
          '麦克风未采集到音频，请检查浏览器麦克风权限、输入设备和系统音量。',
          'health-timeout-no-mic-audio'
        );
      }, 6000);

      setMode(AppMode.QNA_LISTENING);
      setFeedbackMessage('实时答疑已连接，可连续提问并支持打断。');
      realtimeStartingRef.current = false;
    } catch (error) {
      console.error('Failed to start realtime Q&A', error);
      const reason = error instanceof Error ? error.message : String(error);
      await stopRealtimeQa(
        AppMode.PAUSED,
        `实时答疑启动失败：${reason}`,
        'start-exception'
      );
    } finally {
      if (!realtimeActiveRef.current) {
        realtimeStartingRef.current = false;
        realtimeStartAtRef.current = 0;
      }
    }
  };

  const toggleRealtimeQa = () => {
    if (isTrialRecording || isTrialTranscribing) {
      setFeedbackMessage('试讲评分正在使用麦克风，请先结束并等待转写完成。');
      return;
    }
    const active = realtimeActiveRef.current || isRealtimeQaMode(mode);
    const now = Date.now();
    console.info('[QNA] toggle clicked', {
      active,
      mode,
      realtimeActive: realtimeActiveRef.current,
      starting: realtimeStartingRef.current,
      startAgeMs: realtimeStartAtRef.current ? now - realtimeStartAtRef.current : null,
    });

    if (realtimeStartingRef.current && now - realtimeStartAtRef.current < 900) {
      setFeedbackMessage('实时答疑连接中，请稍候...');
      return;
    }

    if (active) {
      void stopRealtimeQa(AppMode.PAUSED, '实时答疑已停止。', 'user-toggle');
      return;
    }

    void startRealtimeQa();
  };

  const backToLibrary = () => {
    if (isRealtimeQaMode(modeRef.current)) {
      void stopRealtimeQa(AppMode.UPLOAD, '已返回课程书柜。', 'user-back-to-library');
      return;
    }

    playbackSessionRef.current += 1;
    clearAdvanceTimer();
    clearCaptionStream();
    audioPlayerRef.current.stop();
    realtimeAudioPlayerRef.current.stop();
    presentationBreakpointRef.current = null;
    setPresentationCaption('');
    setIsProcessing(false);
    setMode(AppMode.UPLOAD);
    setFeedbackMessage('已返回课程书柜，可重新选择课程或上传 PDF。');
  };

  const getModeLabel = (m: AppMode) => {
    switch (m) {
      case AppMode.UPLOAD:
        return '待上传';
      case AppMode.PROCESSING_PDF:
        return '解析中';
      case AppMode.ANALYZING_FLOW:
        return '讲稿生成';
      case AppMode.READY:
        return '可开始';
      case AppMode.PRESENTING:
        return '讲解中';
      case AppMode.PAUSED:
        return '已暂停';
      case AppMode.QNA_LISTENING:
        return '正在聆听';
      case AppMode.QNA_PROCESSING:
        return '思考中';
      case AppMode.QNA_ANSWERING:
        return '答疑中';
      case AppMode.COMPLETED:
        return '已完成';
      default:
        return m;
    }
  };

  const analysisPercent =
    analysisProgress.totalSlides > 0
      ? Math.round((analysisProgress.completedSlides / analysisProgress.totalSlides) * 100)
      : 0;
  const analysisElapsedSeconds = analysisProgress.startedAt
    ? Math.floor((progressClock - analysisProgress.startedAt) / 1000)
    : 0;
  const analysisLastUpdateLag = analysisProgress.lastUpdatedAt
    ? Math.floor((progressClock - analysisProgress.lastUpdatedAt) / 1000)
    : 0;
  const currentSlide = slides[currentSlideIndex];
  const isRealtimeMode = isRealtimeQaMode(mode);
  const shouldShowRealtimeFeedbackWhenPaused =
    mode === AppMode.PAUSED && /(实时|麦克风|语音答疑|会话)/.test(feedbackMessage || '');
  const shouldShowFeedbackAsMainCaption = isRealtimeMode || shouldShowRealtimeFeedbackWhenPaused;
  const nonRealtimeCaption =
    mode === AppMode.PRESENTING
      ? presentationCaption
      : presentationCaption || normalizeCaptionText(currentSlide?.script || '');
  const captionText = normalizeCaptionText(
    shouldShowFeedbackAsMainCaption
      ? feedbackMessage
      : nonRealtimeCaption || (isProcessing ? feedbackMessage : '')
  );
  const captionDisplayText =
    !shouldShowFeedbackAsMainCaption && mode === AppMode.PRESENTING
      ? toStreamingCaptionLine(captionText)
      : captionText;
  const captionPlaceholder = shouldShowFeedbackAsMainCaption
    ? '实时会话进行中...'
    : '当前页暂无讲解字幕';
  const activePresetMeta = useMemo(
    () => presetCourses.find((item) => item.id === activePresetCourseId) || null,
    [presetCourses, activePresetCourseId]
  );
  const activeCourseDisplayName = useMemo(() => {
    if (activePresetCourseId) {
      return getDisplayCourseTitle(activePresetCourseId, activePresetMeta?.title || '');
    }
    if (slides.length > 0) return '临时上传课件';
    return '';
  }, [activePresetCourseId, activePresetMeta, slides.length]);
  const homeCourseItems = useMemo(
    () =>
      presetCourses.map((course, idx) => ({
        course,
        profile: pickHomeCourseProfile(course, idx),
      })),
    [presetCourses]
  );
  const homeLevelCounts = useMemo(() => {
    return homeCourseItems.reduce(
      (acc, item) => {
        acc[item.profile.level] += 1;
        return acc;
      },
      { junior: 0, intermediate: 0, advanced: 0 } as Record<HomeCourseLevel, number>
    );
  }, [homeCourseItems]);
  const homeJuniorSubCounts = useMemo(() => {
    return homeCourseItems.reduce(
      (acc, item) => {
        if (item.profile.level !== 'junior') return acc;
        acc[item.profile.juniorCategory] += 1;
        return acc;
      },
      { basic_science: 0, health_common: 0, tcm_intro: 0 } as Record<HomeJuniorCategory, number>
    );
  }, [homeCourseItems]);
  const homeIntermediateSubCounts = useMemo(() => {
    return homeCourseItems.reduce(
      (acc, item) => {
        if (item.profile.level !== 'intermediate') return acc;
        const key = item.profile.intermediateCategory || 'nutrition_advanced';
        acc[key] += 1;
        return acc;
      },
      { nutrition_advanced: 0, cell_biology: 0 } as Record<HomeIntermediateCategory, number>
    );
  }, [homeCourseItems]);
  const filteredHomeCourseItems = useMemo(
    () =>
      homeCourseItems.filter((item) => {
        if (item.profile.level !== homeLevelTab) return false;
        if (homeLevelTab === 'junior') return item.profile.juniorCategory === homeJuniorSubTab;
        if (homeLevelTab === 'intermediate') {
          return (item.profile.intermediateCategory || 'nutrition_advanced') === homeIntermediateSubTab;
        }
        return true;
      }),
    [homeCourseItems, homeLevelTab, homeJuniorSubTab, homeIntermediateSubTab]
  );
  const availableExamCourseIds = useMemo(() => {
    const idsFromLibrary = homeCourseItems
      .map((item) => item.course.id)
      .filter((id) => !!LESSON_EXAM_BANK[id]);
    if (idsFromLibrary.length > 0) return idsFromLibrary;
    return Object.keys(LESSON_EXAM_BANK);
  }, [homeCourseItems]);
  const activeExamCourseId = useMemo(() => {
    if (availableExamCourseIds.includes(selectedExamCourseId)) return selectedExamCourseId;
    return availableExamCourseIds[0] || '';
  }, [availableExamCourseIds, selectedExamCourseId]);
  const activeExamPaper = activeExamCourseId ? LESSON_EXAM_BANK[activeExamCourseId] : undefined;
  const examCatalogItems = useMemo(() => {
    return availableExamCourseIds
      .map((courseId, idx) => {
        const paper = LESSON_EXAM_BANK[courseId];
        if (!paper) return null;
        const matched = homeCourseItems.find((item) => item.course.id === courseId);
        const profile =
          matched?.profile ||
          HOME_COURSE_PROFILE_BY_ID[courseId] ||
          HOME_COURSE_PROFILE_FALLBACK[idx % HOME_COURSE_PROFILE_FALLBACK.length];
        const displayTitle = getDisplayCourseTitle(courseId, matched?.course.title || paper.title || courseId);
        return {
          courseId,
          paper,
          profile,
          displayTitle,
          description: paper.intro || matched?.course.description || profile.summary,
          coverImage: matched?.course.coverImage || '',
          slideCount: matched?.course.slideCount || 0,
        };
      })
      .filter(Boolean) as Array<{
      courseId: string;
      paper: LessonExamPaper;
      profile: HomeCourseProfile;
      displayTitle: string;
      description: string;
      coverImage: string;
      slideCount: number;
    }>;
  }, [availableExamCourseIds, homeCourseItems]);
  const activeExamSessionId = activeExamSessionCourseId || activeExamCourseId;
  const activeExamSessionPaper = activeExamSessionId ? LESSON_EXAM_BANK[activeExamSessionId] : undefined;
  const currentExamQuestion = activeExamSessionPaper?.questions?.[examQuestionIndex];
  const examProgressPercent = activeExamSessionPaper?.questions?.length
    ? Math.round(((examQuestionIndex + 1) / activeExamSessionPaper.questions.length) * 100)
    : 0;
  const examAttemptCount = examCorrectCount + examWrongAttempts;
  const examAccuracyPercent = examAttemptCount > 0 ? Math.round((examCorrectCount / examAttemptCount) * 100) : 100;
  const examResultScore = activeExamSessionPaper
    ? Math.round((activeExamSessionPaper.totalScore * examAccuracyPercent) / 100)
    : 0;
  const isImportPanelLocked = !isImportPanelUnlocked;
  const isImportActionDisabled = isProcessing || isImportPanelLocked;
  const isImportRefreshDisabled = isLibraryLoading || isImportPanelLocked;
  const isKnowledgeActionDisabled = isImportPanelLocked || isKnowledgeIngesting;
  const totalKnowledgeEntryCount = knowledgeBaseEntries.length;
  const canManualPaging = mode === AppMode.READY || mode === AppMode.PRESENTING || mode === AppMode.PAUSED;
  const hasPrevSlide = currentSlideIndex > 0;
  const hasNextSlide = currentSlideIndex + 1 < slides.length;
  const canUseTrialScoring =
    mode !== AppMode.UPLOAD &&
    mode !== AppMode.PROCESSING_PDF &&
    mode !== AppMode.ANALYZING_FLOW &&
    mode !== AppMode.COMPLETED;
  const isTrialBusy = isTrialRecording || isTrialTranscribing || isTrialScoring;
  const trialSpeechLength = normalizeCaptionText(trialSpeechText).length;
  const trialStatusText = isTrialRecording
    ? '录音进行中...'
    : isTrialTranscribing
      ? '正在语音转写...'
      : isTrialScoring
        ? 'AI 正在评分...'
        : isRealtimeMode
          ? '实时答疑中，需先结束答疑再录音评分。'
          : '围绕当前页试讲，支持录音转写或手动输入。';

  useEffect(() => {
    if (!availableExamCourseIds.length) return;
    if (availableExamCourseIds.includes(selectedExamCourseId)) return;
    setSelectedExamCourseId(availableExamCourseIds[0]);
  }, [availableExamCourseIds, selectedExamCourseId]);

  useEffect(() => {
    if (!activeExamSessionCourseId) return;
    if (availableExamCourseIds.includes(activeExamSessionCourseId)) return;
    setActiveExamSessionCourseId('');
    setExamCenterView('catalog');
  }, [availableExamCourseIds, activeExamSessionCourseId]);

  const startExamSession = (courseId: string) => {
    const nextPaper = LESSON_EXAM_BANK[courseId];
    if (!nextPaper) return;
    setSelectedExamCourseId(courseId);
    setActiveExamSessionCourseId(courseId);
    setExamCenterView('playing');
    setExamQuestionIndex(0);
    setExamSelectedOptionIndex(null);
    setExamJudgeState('idle');
    setExamWrongAttempts(0);
    setExamCorrectCount(0);
    setFeedbackMessage(`已进入《${nextPaper.title}》考试模式。`);
  };

  const restartExamSession = () => {
    if (!activeExamSessionId || !LESSON_EXAM_BANK[activeExamSessionId]) return;
    startExamSession(activeExamSessionId);
  };

  const backToExamCatalog = () => {
    setExamCenterView('catalog');
    setExamQuestionIndex(0);
    setExamSelectedOptionIndex(null);
    setExamJudgeState('idle');
    setExamWrongAttempts(0);
    setExamCorrectCount(0);
    setActiveExamSessionCourseId('');
  };

  const pickExamOption = (optionIndex: number) => {
    setExamSelectedOptionIndex(optionIndex);
    if (examJudgeState !== 'idle') {
      setExamJudgeState('idle');
    }
  };

  const submitExamAnswer = () => {
    if (!activeExamSessionPaper || !currentExamQuestion) return;
    if (examSelectedOptionIndex === null) {
      setFeedbackMessage('请先选择一个答案。');
      return;
    }

    if (examSelectedOptionIndex !== currentExamQuestion.answerIndex) {
      setExamWrongAttempts((prev) => prev + 1);
      setExamJudgeState('wrong');
      setFeedbackMessage('回答错误，请重新选择本题答案。');
      return;
    }

    setExamCorrectCount((prev) => prev + 1);
    setExamJudgeState('idle');

    if (examQuestionIndex + 1 >= activeExamSessionPaper.questions.length) {
      setExamCenterView('result');
      setFeedbackMessage('闯关完成，已生成考试结果。');
      return;
    }

    setExamQuestionIndex((prev) => prev + 1);
    setExamSelectedOptionIndex(null);
    setFeedbackMessage('回答正确，进入下一题。');
  };

  const unlockImportPanel = () => {
    const password = importUnlockInput.trim();
    if (password !== IMPORT_PANEL_PASSWORD) {
      setImportUnlockError('密码错误，请重新输入。');
      return;
    }

    setIsImportPanelUnlocked(true);
    setImportUnlockInput('');
    setImportUnlockError('');
    setFeedbackMessage('导入课件数据源面板已解锁，可开始上传。');
  };

  const stopTrialCaptureStream = () => {
    const stream = trialRecordStreamRef.current;
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    trialRecordStreamRef.current = null;
  };

  const cancelTrialRecordingImmediately = () => {
    const recorder = trialRecorderRef.current;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onerror = null;
      recorder.onstop = null;
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          // Ignore stop race.
        }
      }
      trialRecorderRef.current = null;
    }
    trialRecordChunksRef.current = [];
    stopTrialCaptureStream();
  };

  const startTrialRecording = async () => {
    if (isRealtimeMode) {
      setTrialErrorMessage('实时答疑进行中，请先结束答疑再开始试讲评分。');
      return;
    }
    if (isTrialRecording || isTrialTranscribing || isTrialScoring) return;
    if (typeof MediaRecorder === 'undefined') {
      setTrialErrorMessage('当前浏览器不支持录音，请手动输入试讲文本。');
      return;
    }

    setTrialErrorMessage('');
    setTrialScoringResult(null);
    trialRecordChunksRef.current = [];
    cancelTrialRecordingImmediately();

    try {
      const stream = await getMicrophoneStream();
      if (isUnmountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      trialRecordStreamRef.current = stream;
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const selectedMimeType = candidates.find(
        (mimeType) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(mimeType)
      );
      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (!event.data || event.data.size <= 0) return;
        trialRecordChunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        if (isUnmountedRef.current) return;
        setIsTrialRecording(false);
        setTrialErrorMessage('录音失败，请检查麦克风权限后重试。');
        trialRecorderRef.current = null;
        stopTrialCaptureStream();
      };

      recorder.onstop = () => {
        const chunks = [...trialRecordChunksRef.current];
        const recorderMimeType = recorder.mimeType || selectedMimeType || 'audio/webm';
        trialRecordChunksRef.current = [];
        trialRecorderRef.current = null;
        stopTrialCaptureStream();

        if (isUnmountedRef.current) return;
        setIsTrialRecording(false);

        if (chunks.length === 0) {
          setTrialErrorMessage('未采集到音频，请重新录音。');
          return;
        }

        void (async () => {
          setIsTrialTranscribing(true);
          try {
            const blob = new Blob(chunks, { type: recorderMimeType });
            const audioBase64 = await blobToBase64(blob);
            const transcript = await transcribeTrialLectureAudio(audioBase64);
            if (isUnmountedRef.current) return;
            setTrialSpeechText(transcript);
            setTrialErrorMessage('');
            setFeedbackMessage('试讲转写完成，可点击 AI 评分。');
          } catch (error) {
            if (isUnmountedRef.current) return;
            const message = error instanceof Error ? error.message : String(error);
            const isApiKeyError = error instanceof GeminiApiKeyError || /api key/i.test(message);
            setTrialErrorMessage(
              isApiKeyError
                ? 'ARK 接口 Key 无效或缺失，请检查 .env.local 后重启。'
                : `试讲转写失败：${message}`
            );
          } finally {
            if (!isUnmountedRef.current) {
              setIsTrialTranscribing(false);
            }
          }
        })();
      };

      trialRecorderRef.current = recorder;
      recorder.start(240);
      setIsTrialRecording(true);
      setTrialSpeechText('');
      setFeedbackMessage('试讲录音中，结束录音后将自动转写。');
    } catch (error) {
      stopTrialCaptureStream();
      trialRecorderRef.current = null;
      setIsTrialRecording(false);
      setIsTrialTranscribing(false);
      const message = error instanceof Error ? error.message : String(error);
      setTrialErrorMessage(`无法开始录音：${message}`);
    }
  };

  const stopTrialRecording = () => {
    const recorder = trialRecorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'inactive') return;
    try {
      recorder.stop();
      setFeedbackMessage('录音已结束，正在转写...');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setTrialErrorMessage(`结束录音失败：${message}`);
    }
  };

  const submitTrialScoring = async () => {
    if (isRealtimeMode) {
      setTrialErrorMessage('实时答疑进行中，请先结束答疑再评分。');
      return;
    }
    if (isTrialRecording || isTrialTranscribing || isTrialScoring) return;

    const activeSlide = slides[currentSlideIndex];
    if (!activeSlide) {
      setTrialErrorMessage('当前没有可评分页面。');
      return;
    }

    const speechText = normalizeCaptionText(trialSpeechText);
    if (!speechText) {
      setTrialErrorMessage('请先录音转写，或手动输入你的试讲内容。');
      return;
    }
    if (speechText.length < 12) {
      setTrialErrorMessage('试讲内容过短，请补充后再评分。');
      return;
    }

    setIsTrialScoring(true);
    setTrialErrorMessage('');
    try {
      const result = await evaluateTrialLecture(speechText, activeSlide.imageData, activeSlide.script || '');
      if (isUnmountedRef.current) return;
      setTrialScoringResult(result);
      setIsTrialResultModalOpen(true);
      setTrialPlanResult(null);
      setTrialPlanErrorMessage('');
      setFeedbackMessage(`试讲评分完成：${result.overallScore} 分。`);
    } catch (error) {
      if (isUnmountedRef.current) return;
      const message = error instanceof Error ? error.message : String(error);
      const isApiKeyError = error instanceof GeminiApiKeyError || /api key/i.test(message);
      setTrialErrorMessage(
        isApiKeyError
          ? 'ARK 接口 Key 无效或缺失，请检查 .env.local 后重启。'
          : `试讲评分失败：${message}`
      );
    } finally {
      if (!isUnmountedRef.current) {
        setIsTrialScoring(false);
      }
    }
  };

  const clearTrialScoringDraft = () => {
    if (isTrialRecording) {
      stopTrialRecording();
    }
    setTrialSpeechText('');
    setTrialScoringResult(null);
    setIsTrialResultModalOpen(false);
    setTrialPlanResult(null);
    setTrialPlanErrorMessage('');
    setIsTrialPlanGenerating(false);
    if (isTrialPlanAudioPlaying) {
      audioPlayerRef.current.stop();
      setIsTrialPlanAudioPlaying(false);
    }
    setTrialErrorMessage('');
  };

  const closeTrialResultModal = useCallback(() => {
    if (isTrialPlanAudioPlaying) {
      audioPlayerRef.current.stop();
      setIsTrialPlanAudioPlaying(false);
    }
    setIsTrialResultModalOpen(false);
  }, [isTrialPlanAudioPlaying]);

  const generateTrialPlan = useCallback(async () => {
    const result = trialScoringResult;
    const activeSlide = slidesRef.current[currentSlideIndexRef.current];
    const speechText = normalizeCaptionText(trialSpeechText);
    if (!result || !activeSlide || !speechText) {
      setTrialPlanErrorMessage('缺少评分结果或试讲文本，无法生成参考演讲方案。');
      return;
    }

    setIsTrialPlanGenerating(true);
    setTrialPlanErrorMessage('');
    setFeedbackMessage('AI 正在生成参考演讲方案...');

    try {
      const plan = await generateTrialLecturePlan(speechText, activeSlide.imageData, activeSlide.script || '', result);
      if (isUnmountedRef.current) return;

      let planAudio = '';
      try {
        planAudio = await generateSpeech(plan.script);
      } catch (audioError) {
        console.warn('Generate trial plan audio failed:', audioError);
      }

      if (isUnmountedRef.current) return;
      setTrialPlanResult({
        ...plan,
        audioData: planAudio || undefined,
      });
      if (!planAudio) {
        setTrialPlanErrorMessage('参考文稿已生成，但语音生成失败，可先按文稿练习。');
      }
      setFeedbackMessage('参考演讲方案已生成。');
    } catch (error) {
      if (isUnmountedRef.current) return;
      const message = error instanceof Error ? error.message : String(error);
      setTrialPlanErrorMessage(`参考演讲方案生成失败：${message}`);
    } finally {
      if (!isUnmountedRef.current) {
        setIsTrialPlanGenerating(false);
      }
    }
  }, [trialScoringResult, trialSpeechText]);

  const toggleTrialPlanAudio = useCallback(() => {
    if (!trialPlanResult?.audioData) return;
    if (isTrialPlanAudioPlaying) {
      audioPlayerRef.current.stop();
      setIsTrialPlanAudioPlaying(false);
      return;
    }

    if (modeRef.current === AppMode.PRESENTING) {
      setTrialPlanErrorMessage('当前正在自动讲解，请先暂停再播放方案语音。');
      return;
    }

    audioPlayerRef.current.stop();
    realtimeAudioPlayerRef.current.stop();
    setIsTrialPlanAudioPlaying(true);
    audioPlayerRef.current.playPCM(trialPlanResult.audioData, () => {
      if (!isUnmountedRef.current) {
        setIsTrialPlanAudioPlaying(false);
      }
    });
  }, [trialPlanResult, isTrialPlanAudioPlaying]);

  const openKnowledgeModal = useCallback(() => {
    setKnowledgeIngestMessage('');
    setKnowledgeIngestReports([]);
    setIsKnowledgeModalOpen(true);
  }, []);

  const closeKnowledgeModal = useCallback(() => {
    if (isKnowledgeIngesting) return;
    setIsKnowledgeModalOpen(false);
  }, [isKnowledgeIngesting]);

  const handleKnowledgeFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      if (files.length === 0 || isKnowledgeIngesting) return;

      setIsKnowledgeIngesting(true);
      setKnowledgeIngestReports([]);
      setKnowledgeIngestMessage(`正在解析 ${files.length} 个文档...`);

      try {
        const result = await ingestKnowledgeFiles(files);
        if (isUnmountedRef.current) return;

        setKnowledgeIngestReports(result.reports);
        if (result.entries.length === 0) {
          setKnowledgeIngestMessage('没有导入到可用知识条目，请检查文档格式或内容是否可提取文本。');
          return;
        }

        const saveResult = appendLocalRealtimeKnowledgeEntries(result.entries);
        await refreshKnowledgeBaseEntries();
        const message = `导入完成：新增 ${saveResult.added} 条，重复跳过 ${saveResult.duplicated} 条，本地共 ${saveResult.total} 条。`;
        setKnowledgeIngestMessage(message);
        setFeedbackMessage(message);
      } catch (error) {
        if (isUnmountedRef.current) return;
        const message = error instanceof Error ? error.message : String(error);
        setKnowledgeIngestMessage(`知识库导入失败：${message}`);
      } finally {
        if (!isUnmountedRef.current) {
          setIsKnowledgeIngesting(false);
        }
      }
    },
    [isKnowledgeIngesting, refreshKnowledgeBaseEntries]
  );

  const exportLocalKnowledgeBase = useCallback(() => {
    const localEntries = listLocalRealtimeKnowledgeBase();
    if (localEntries.length === 0) {
      setKnowledgeIngestMessage('当前没有本地知识条目可导出。');
      return;
    }

    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        entries: localEntries,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    anchor.href = url;
    anchor.download = `knowledge-base-export-${stamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setKnowledgeIngestMessage(`已导出 ${localEntries.length} 条本地知识。`);
  }, []);

  const clearLocalKnowledgeEntries = useCallback(() => {
    if (isKnowledgeIngesting) return;
    clearLocalRealtimeKnowledgeBase();
    setKnowledgeIngestReports([]);
    setKnowledgeIngestMessage('已清空本地导入知识库。');
    void refreshKnowledgeBaseEntries();
  }, [isKnowledgeIngesting, refreshKnowledgeBaseEntries]);

  const toggleTrialPanel = () => {
    if (isTrialPanelOpen && isTrialRecording) {
      stopTrialRecording();
    }
    setIsTrialPanelOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isTrialResultModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeTrialResultModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTrialResultModalOpen, closeTrialResultModal]);

  useEffect(() => {
    if (!isKnowledgeModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeKnowledgeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isKnowledgeModalOpen, closeKnowledgeModal]);

  useEffect(() => {
    const canUseTrialPanel =
      mode === AppMode.READY ||
      mode === AppMode.PRESENTING ||
      mode === AppMode.PAUSED ||
      mode === AppMode.QNA_LISTENING ||
      mode === AppMode.QNA_PROCESSING ||
      mode === AppMode.QNA_ANSWERING;
    if (canUseTrialPanel) return;

    setIsTrialPanelOpen(false);
    setIsTrialRecording(false);
    setIsTrialTranscribing(false);
    setIsTrialScoring(false);
    cancelTrialRecordingImmediately();
  }, [mode]);

  useEffect(() => {
    if (mode === AppMode.UPLOAD) return;
    if (!isKnowledgeModalOpen) return;
    setIsKnowledgeModalOpen(false);
  }, [mode, isKnowledgeModalOpen]);

  const renderContent = () => {
    if (mode === AppMode.UPLOAD) {
      return (
        <section className="sci-panel aura-home">
          <div className="aura-home-bg">
            <div className="aura-ambient aura-ambient-1" />
            <div className="aura-ambient aura-ambient-2" />
            <div className="aura-ambient aura-ambient-3" />
          </div>

          <div className="aura-home-layout">
            <aside className="aura-side-panel">
              <div className="aura-side-heading">
                <p className="aura-side-kicker">
                  <Brain size={14} /> 神经元上传
                </p>
                <h3>导入课件数据源</h3>
                <p>上传临时 PDF 做快速试播，或从右侧预设课程书柜直接加载。</p>
              </div>

              <label className={`aura-upload-drop ${isImportActionDisabled ? 'aura-disabled' : ''}`}>
                <div className="aura-upload-core">
                  <span className="aura-upload-icon-wrap">
                    <CloudUpload size={34} />
                  </span>
                  <strong>拖拽文件到这里，或点击选择 PDF</strong>
                  <small>支持中文 PDF，自动生成讲稿与语音</small>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isImportActionDisabled}
                />
              </label>

              <div className="aura-side-actions">
                <label className={`aura-btn aura-btn-primary ${isImportActionDisabled ? 'aura-disabled' : ''}`}>
                  <CloudUpload size={16} />
                  <span>上传 PDF 试播</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isImportActionDisabled}
                  />
                </label>
                <button
                  type="button"
                  className="aura-btn aura-btn-ghost"
                  onClick={() => void refreshPresetCourses()}
                  disabled={isImportRefreshDisabled}
                >
                  <RefreshCw size={16} className={isLibraryLoading ? 'aura-spin' : ''} />
                  <span>{isLibraryLoading ? '刷新中' : '刷新书柜'}</span>
                </button>
                <button
                  type="button"
                  className="aura-btn aura-btn-ghost"
                  onClick={openKnowledgeModal}
                  disabled={isKnowledgeActionDisabled}
                >
                  <Library size={16} />
                  <span>{isKnowledgeIngesting ? '知识库处理中' : '知识库插件'}</span>
                </button>
              </div>

              <div className="aura-side-status">
                <div>
                  <span>状态</span>
                  <strong>{isImportPanelLocked ? 'LOCKED' : isProcessing ? 'PROCESSING' : 'SYSTEM ONLINE'}</strong>
                </div>
                <div>
                  <span>课程</span>
                  <strong>{presetCourses.length} 门</strong>
                </div>
                <div>
                  <span>知识条目</span>
                  <strong>{totalKnowledgeEntryCount} 条</strong>
                </div>
              </div>

              {isImportPanelLocked && (
                <div className="aura-side-lock-mask">
                  <div className="aura-side-lock-card">
                    <p className="aura-side-lock-kicker">
                      <Lock size={14} /> 导入区已加锁
                    </p>
                    <h4>输入访问密码</h4>
                    <p>仅授权用户可使用上传与刷新功能。</p>
                    <div className="aura-side-lock-form">
                      <input
                        type="password"
                        value={importUnlockInput}
                        onChange={(event) => {
                          setImportUnlockInput(event.target.value);
                          if (importUnlockError) setImportUnlockError('');
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            unlockImportPanel();
                          }
                        }}
                        placeholder="请输入密码"
                        className="aura-side-lock-input"
                      />
                      <button
                        type="button"
                        className="aura-side-lock-btn"
                        onClick={unlockImportPanel}
                        disabled={!importUnlockInput.trim()}
                      >
                        解锁
                      </button>
                    </div>
                    {importUnlockError && <p className="aura-side-lock-error">{importUnlockError}</p>}
                  </div>
                </div>
              )}
            </aside>

            <section className="aura-main-panel">
              {homeSection === 'library' ? (
                <>
                  <div className="aura-main-head">
                    <div>
                      <h2>预设课程书柜</h2>
                      <p>循序渐进，解锁课程</p>
                    </div>
                    <div className="aura-view-switch">
                      <button
                        type="button"
                        className={`aura-view-btn ${homeCourseView === 'grid' ? 'aura-view-btn-active' : ''}`}
                        onClick={() => setHomeCourseView('grid')}
                      >
                        <LayoutGrid size={14} />
                        网格
                      </button>
                      <button
                        type="button"
                        className={`aura-view-btn ${homeCourseView === 'list' ? 'aura-view-btn-active' : ''}`}
                        onClick={() => setHomeCourseView('list')}
                      >
                        <List size={14} />
                        列表
                      </button>
                    </div>
                  </div>

                  <div className="aura-tabs-stack">
                    <div className="aura-tabs">
                      {LEVEL_TAB_ITEMS.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          className={`aura-tab ${homeLevelTab === tab.key ? 'aura-tab-active' : ''}`}
                          onClick={() => setHomeLevelTab(tab.key)}
                        >
                          {tab.label} ({homeLevelCounts[tab.key]})
                        </button>
                      ))}
                    </div>

                    {homeLevelTab === 'junior' && (
                      <div className="aura-subtabs">
                        {JUNIOR_SUBTAB_ITEMS.map((tab) => (
                          <button
                            key={tab.key}
                            type="button"
                            className={`aura-subtab ${homeJuniorSubTab === tab.key ? 'aura-subtab-active' : ''}`}
                            onClick={() => setHomeJuniorSubTab(tab.key)}
                          >
                            {tab.label} ({homeJuniorSubCounts[tab.key]})
                          </button>
                        ))}
                      </div>
                    )}
                    {homeLevelTab === 'intermediate' && (
                      <div className="aura-subtabs">
                        {INTERMEDIATE_SUBTAB_ITEMS.map((tab) => (
                          <button
                            key={tab.key}
                            type="button"
                            className={`aura-subtab ${homeIntermediateSubTab === tab.key ? 'aura-subtab-active' : ''}`}
                            onClick={() => setHomeIntermediateSubTab(tab.key)}
                          >
                            {tab.label} ({homeIntermediateSubCounts[tab.key]})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`aura-course-grid ${homeCourseView === 'list' ? 'aura-course-list' : ''}`}>
                    {isLibraryLoading ? (
                      <div className="aura-empty-card">书柜加载中...</div>
                    ) : presetCourses.length === 0 ? (
                      <div className="aura-empty-card">暂无预设课程。请先上传 PDF 或检查 preset-courses 目录。</div>
                    ) : filteredHomeCourseItems.length === 0 ? (
                      <div className="aura-empty-card">当前分页暂无课程内容。</div>
                    ) : (
                      filteredHomeCourseItems.map(({ course, profile }) => {
                        const dateLabel = course.updatedAt
                          ? new Date(course.updatedAt).toLocaleDateString('zh-CN')
                          : '未知日期';
                        const displayTitle = getDisplayCourseTitle(course.id, course.title);
                        return (
                          <button
                            key={course.id}
                            className={[
                              'aura-course-card',
                              `aura-level-${profile.level}`,
                              homeCourseView === 'list' ? 'aura-course-card-list' : '',
                              activePresetCourseId === course.id ? 'aura-course-card-active' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => void loadPresetCourse(course.id)}
                            disabled={isProcessing}
                          >
                            <span
                              className="aura-course-cover"
                              style={course.coverImage ? { backgroundImage: `url(${course.coverImage})` } : undefined}
                            >
                              <span className="aura-level-badge">{profile.levelLabel}</span>
                            </span>
                            <span className="aura-course-body">
                              <strong className="aura-course-title">{displayTitle}</strong>
                              <span className="aura-course-desc">{course.description || profile.summary}</span>
                              <span className="aura-course-meta">
                                <span>
                                  <BookOpen size={13} /> {course.slideCount || 0} 页
                                </span>
                                <span>{dateLabel}</span>
                              </span>
                              <span className="aura-course-cta">
                                {activePresetCourseId === course.id ? '已选中，可重新加载' : '加载课程'}
                                <ArrowRight size={14} />
                              </span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <>
                  {examCenterView === 'catalog' ? (
                    <>
                      <div className="aura-main-head">
                        <div>
                          <h2>考试中心</h2>
                          <p>先选择题库卡片，再进入单题闯关模式（答对才进入下一题）。</p>
                        </div>
                        <div className="aura-view-switch">
                          <button
                            type="button"
                            className={`aura-view-btn ${examCatalogView === 'grid' ? 'aura-view-btn-active' : ''}`}
                            onClick={() => setExamCatalogView('grid')}
                          >
                            <LayoutGrid size={14} />
                            网格
                          </button>
                          <button
                            type="button"
                            className={`aura-view-btn ${examCatalogView === 'list' ? 'aura-view-btn-active' : ''}`}
                            onClick={() => setExamCatalogView('list')}
                          >
                            <List size={14} />
                            列表
                          </button>
                        </div>
                      </div>

                      <div className={`aura-course-grid ${examCatalogView === 'list' ? 'aura-course-list' : ''}`}>
                        {examCatalogItems.length === 0 ? (
                          <div className="aura-empty-card">暂无考试题库，请先导入课程。</div>
                        ) : (
                          examCatalogItems.map((item) => (
                            <button
                              key={item.courseId}
                              className={[
                                'aura-course-card',
                                'aura-exam-course-card',
                                `aura-level-${item.profile.level}`,
                                examCatalogView === 'list' ? 'aura-course-card-list' : '',
                                activeExamCourseId === item.courseId ? 'aura-course-card-active' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => startExamSession(item.courseId)}
                            >
                              <span
                                className="aura-course-cover"
                                style={item.coverImage ? { backgroundImage: `url(${item.coverImage})` } : undefined}
                              >
                                <span className="aura-level-badge">{item.profile.levelLabel}</span>
                              </span>
                              <span className="aura-course-body">
                                <strong className="aura-course-title">{item.displayTitle} · 模拟考</strong>
                                <span className="aura-course-desc">{item.description}</span>
                                <span className="aura-course-meta">
                                  <span>题目 {item.paper.questions.length} 道</span>
                                  <span>{item.paper.durationMinutes} 分钟</span>
                                </span>
                                <span className="aura-course-cta">
                                  开始闯关
                                  <ArrowRight size={14} />
                                </span>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  ) : examCenterView === 'playing' && activeExamSessionPaper && currentExamQuestion ? (
                    <div className="aura-exam-player">
                      <div className="aura-exam-player-main">
                        <div className="aura-exam-progress-head">
                          <span>
                            问题 {examQuestionIndex + 1}/{activeExamSessionPaper.questions.length}
                          </span>
                          <span>{examProgressPercent}%</span>
                        </div>
                        <div className="aura-exam-progress-track">
                          <div className="aura-exam-progress-bar" style={{ width: `${examProgressPercent}%` }} />
                        </div>

                        <div className="aura-exam-question-stage">
                          <span className="aura-exam-chip">{activeExamSessionPaper.title}</span>
                          <h3>{currentExamQuestion.prompt}</h3>
                          <p>本模式类似驾考：答对才会进入下一题。</p>
                        </div>
                      </div>

                      <aside className="aura-exam-answer-panel">
                        <h4>选择答案</h4>
                        <div className="aura-exam-choice-list">
                          {currentExamQuestion.options.map((option, optionIndex) => (
                            <button
                              key={`${currentExamQuestion.id}-${optionIndex}`}
                              type="button"
                              className={[
                                'aura-exam-choice-btn',
                                examSelectedOptionIndex === optionIndex ? 'aura-exam-choice-btn-active' : '',
                                examJudgeState === 'wrong' &&
                                examSelectedOptionIndex === optionIndex &&
                                optionIndex !== currentExamQuestion.answerIndex
                                  ? 'aura-exam-choice-btn-wrong'
                                  : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => pickExamOption(optionIndex)}
                            >
                              <span className="aura-exam-choice-label">{String.fromCharCode(65 + optionIndex)}</span>
                              <span>{option}</span>
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="aura-exam-submit-btn"
                          onClick={submitExamAnswer}
                          disabled={examSelectedOptionIndex === null}
                        >
                          提交答案
                        </button>

                        {examJudgeState === 'wrong' && (
                          <p className="aura-exam-error-msg">
                            答错了，请重选。提示：{currentExamQuestion.explanation}
                          </p>
                        )}

                        <button type="button" className="aura-exam-back-btn" onClick={backToExamCatalog}>
                          返回题库
                        </button>
                      </aside>
                    </div>
                  ) : (
                    <div className="aura-exam-result">
                      <h3>闯关完成</h3>
                      <p>你已完成《{activeExamSessionPaper?.title || activeExamPaper?.title || '考试'}》的全部题目。</p>
                      <div className="aura-exam-meta">
                        <span>正确题数：{examCorrectCount}</span>
                        <span>错误次数：{examWrongAttempts}</span>
                        <span>准确率：{examAccuracyPercent}%</span>
                        <span>得分：{examResultScore}</span>
                      </div>
                      <div className="aura-exam-result-actions">
                        <button type="button" className="aura-btn aura-btn-primary" onClick={restartExamSession}>
                          再考一次
                        </button>
                        <button type="button" className="aura-btn aura-btn-ghost" onClick={backToExamCatalog}>
                          返回题库
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="aura-home-feedback">
                <Sparkles size={14} />
                <span>{feedbackMessage || '请选择预设课程，或上传 PDF 试播。'}</span>
              </div>
            </section>
          </div>
        </section>
      );
    }

    if (mode === AppMode.PROCESSING_PDF || mode === AppMode.ANALYZING_FLOW) {
      return (
        <section className="sci-panel sci-upload">
          <div className="sci-upload-card">
            <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mx-auto mb-4" />
            <h3 className="text-2xl font-black tracking-wide mb-2">
              {mode === AppMode.ANALYZING_FLOW ? '正在生成中文讲稿' : '正在处理文件'}
            </h3>
            <p className="sci-upload-desc">{feedbackMessage}</p>
            {mode === AppMode.ANALYZING_FLOW && (
              <div className="sci-analysis">
                <div className="sci-analysis-header">
                  <span>
                    {analysisProgress.completedSlides}/{analysisProgress.totalSlides}
                  </span>
                  <span>{analysisPercent}%</span>
                </div>
                <div className="sci-analysis-track">
                  <div className="sci-analysis-bar transition-all duration-500" style={{ width: `${analysisPercent}%` }} />
                </div>
                <div className="sci-analysis-meta">
                  <p>
                    页面进度：{analysisProgress.currentSlideIndex}/{analysisProgress.totalSlides}
                  </p>
                  <p>
                    成功：{analysisProgress.successSlides} | 失败：{analysisProgress.failedSlides}
                  </p>
                  <p>
                    已耗时：{analysisElapsedSeconds}s | 最近更新：{analysisLastUpdateLag}s 前
                  </p>
                  {analysisLastUpdateLag >= 15 && (
                    <p className="sci-warning">15 秒未更新，可能正在重试或接口限流。</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      );
    }

    if (mode === AppMode.COMPLETED) {
      return (
        <div className="sci-layout">
          <section className="sci-panel sci-complete">
            <div className="sci-complete-card">
              <CheckCircle2 className="w-20 h-20 text-emerald-300 mx-auto" />
              <h2 className="sci-complete-title">演示完成</h2>
              <p className="sci-complete-desc">本次课件讲解已结束，你可以重新上传课件或再次播放。</p>
              <button onClick={() => window.location.reload()} className="sci-btn sci-btn-ghost mt-8">
                重新开始
              </button>
            </div>
          </section>
          <section className="sci-panel sci-caption-strip-panel">
            <div className="sci-caption-strip" title={captionText || captionPlaceholder}>
              <span className="sci-caption-strip-text">{captionText || captionPlaceholder}</span>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="sci-layout">
        <section className="sci-panel sci-presentation">
          <div className="sci-slide-stage">
          {currentSlide && (
              <img src={currentSlide.imageData} alt={`第 ${currentSlideIndex + 1} 页`} className="sci-slide-image" />
          )}
            <div className="sci-slide-mask" />

            <div className="sci-topbar">
              <div className="sci-badge-group">
                <span className="sci-badge">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              {currentSlide?.audioData ? (
                  <span className="sci-badge sci-badge-ok">
                    <Volume2 className="w-3 h-3" /> 语音已就绪
                </span>
              ) : (
                  <span className="sci-badge sci-badge-warn">
                    <Loader2 className="w-3 h-3 animate-spin" /> 语音加载中
                </span>
              )}
              </div>

              <span
                className={`sci-badge sci-mode ${
                mode === AppMode.PRESENTING || mode === AppMode.QNA_ANSWERING
                    ? 'sci-mode-active'
                  : mode === AppMode.QNA_LISTENING
                    ? 'sci-mode-listen'
                    : ''
                  }`}
                >
                {getModeLabel(mode)}
              </span>
            </div>

          </div>
        </section>

        <section className="sci-panel sci-caption-strip-panel">
          <div
            className={`sci-caption-strip ${mode === AppMode.PRESENTING ? 'sci-caption-strip-streaming' : ''}`}
            title={captionText || captionPlaceholder}
          >
            <span className="sci-caption-strip-text">{captionDisplayText || captionPlaceholder}</span>
          </div>
        </section>

        <section className="sci-panel sci-control">
          <div>
            <Visualizer
              isActive={
                mode === AppMode.PRESENTING ||
                mode === AppMode.QNA_LISTENING ||
                mode === AppMode.QNA_PROCESSING ||
                mode === AppMode.QNA_ANSWERING
              }
              color="bg-cyan-300"
            />
          </div>

          <div className="sci-control-center">
            {canManualPaging && (
              <div className="sci-control-btn-with-label">
                <button
                  type="button"
                  onClick={goToPrevSlide}
                  className="sci-round-btn sci-round-btn-nav"
                  aria-label="上一页"
                  title="上一页 (←)"
                  disabled={!hasPrevSlide}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="sci-control-btn-label">向前翻页</span>
              </div>
            )}

            {mode === AppMode.READY ? (
              <div className="sci-control-btn-with-label sci-control-btn-with-label-main">
                <button
                  onClick={startPresentation}
                  className="sci-round-btn sci-round-btn-play sci-round-btn-main"
                  aria-label="开始讲解"
                >
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </button>
                <span className="sci-control-btn-label sci-control-btn-label-main">开始讲解</span>
              </div>
            ) : mode === AppMode.PRESENTING ? (
              <div className="sci-control-btn-with-label sci-control-btn-with-label-main">
                <button
                  onClick={pausePresentation}
                  className="sci-round-btn sci-round-btn-main"
                  aria-label="暂停讲解"
                >
                  <Pause className="w-5 h-5 text-white" />
                </button>
                <span className="sci-control-btn-label sci-control-btn-label-main">暂停讲解</span>
              </div>
            ) : mode === AppMode.PAUSED ? (
              <div className="sci-control-btn-with-label sci-control-btn-with-label-main">
                <button
                  onClick={resumePresentation}
                  className="sci-round-btn sci-round-btn-play sci-round-btn-main"
                  aria-label="继续讲解"
                >
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </button>
                <span className="sci-control-btn-label sci-control-btn-label-main">继续讲解</span>
              </div>
            ) : null}

            {canManualPaging && (
              <div className="sci-control-btn-with-label">
                <button
                  type="button"
                  onClick={goToNextSlide}
                  className="sci-round-btn sci-round-btn-nav"
                  aria-label="下一页"
                  title="下一页 (→)"
                  disabled={!hasNextSlide}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="sci-control-btn-label">向后翻页</span>
              </div>
            )}
          </div>

          <div className="sci-control-right">
            {canUseTrialScoring && (
              <div className="sci-control-right-stack">
                <div className="sci-control-btn-with-label sci-control-btn-with-label-right">
                  <button
                    type="button"
                    onClick={toggleTrialPanel}
                    className={`sci-round-btn ${isTrialPanelOpen ? 'sci-round-btn-trial-active' : ''}`}
                    aria-label="试讲评分"
                  >
                    <ClipboardCheck className="w-5 h-5" />
                  </button>
                  <span className="sci-control-btn-label">{isTrialPanelOpen ? '关闭评分' : '试讲评分'}</span>
                </div>

                <div className="sci-control-btn-with-label sci-control-btn-with-label-right">
                  <button
                    onClick={toggleRealtimeQa}
                    className={`sci-round-btn ${
                      mode === AppMode.QNA_LISTENING ||
                      mode === AppMode.QNA_PROCESSING ||
                      mode === AppMode.QNA_ANSWERING
                        ? 'sci-round-btn-qna-active'
                        : ''
                    }`}
                    aria-label="实时语音答疑"
                  >
                    {mode === AppMode.QNA_LISTENING ||
                    mode === AppMode.QNA_PROCESSING ||
                    mode === AppMode.QNA_ANSWERING ? (
                      <StopCircle className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                  <span className="sci-control-btn-label">
                    {mode === AppMode.QNA_LISTENING ||
                    mode === AppMode.QNA_PROCESSING ||
                    mode === AppMode.QNA_ANSWERING
                      ? '结束答疑'
                      : '语音答疑'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {canUseTrialScoring && isTrialPanelOpen && (
          <section className="sci-panel sci-trial-panel" role="dialog" aria-label="试讲评分面板">
            <div className="sci-trial-head">
              <div>
                <h3>试讲评分</h3>
                <p>让 AI 按当前页内容点评你的讲解质量并给出改进建议。</p>
              </div>
              <button type="button" className="sci-trial-close" onClick={toggleTrialPanel} aria-label="关闭试讲评分">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="sci-trial-action-row">
              <button
                type="button"
                className={`sci-trial-action-btn ${isTrialRecording ? 'sci-trial-action-btn-recording' : ''}`}
                onClick={isTrialRecording ? stopTrialRecording : () => void startTrialRecording()}
                disabled={isTrialTranscribing || isTrialScoring || (isRealtimeMode && !isTrialRecording)}
              >
                {isTrialRecording ? <Square size={14} /> : <Mic size={14} />}
                {isTrialRecording ? '结束录音' : '开始录音'}
              </button>

              <button
                type="button"
                className="sci-trial-action-btn sci-trial-action-btn-score"
                onClick={() => void submitTrialScoring()}
                disabled={trialSpeechLength === 0 || isTrialBusy || isRealtimeMode}
              >
                {isTrialScoring ? <Loader2 size={14} className="aura-spin" /> : <ClipboardCheck size={14} />}
                {isTrialScoring ? '评分中' : 'AI评分'}
              </button>

              <button
                type="button"
                className="sci-trial-action-btn"
                onClick={clearTrialScoringDraft}
                disabled={isTrialTranscribing || isTrialScoring}
              >
                清空
              </button>
            </div>

            <p className="sci-trial-status">{trialStatusText}</p>
            {trialScoringResult && (
              <button
                type="button"
                className="sci-trial-action-btn sci-trial-action-btn-view-result"
                onClick={() => setIsTrialResultModalOpen(true)}
                disabled={isTrialScoring}
              >
                查看评分结果
              </button>
            )}

            <label className="sci-trial-input-wrap">
              <span>试讲文本（可编辑）</span>
              <textarea
                value={trialSpeechText}
                onChange={(event) => setTrialSpeechText(event.target.value)}
                placeholder="点击“开始录音”试讲，或直接手动输入讲解内容..."
                disabled={isTrialTranscribing}
              />
              <small>当前长度：{trialSpeechLength} 字</small>
            </label>

            {trialErrorMessage && <p className="sci-trial-error">{trialErrorMessage}</p>}
          </section>
        )}

        {canUseTrialScoring && trialScoringResult && isTrialResultModalOpen && (
          <div
            className="sci-trial-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="AI评分结果弹窗"
            onClick={(event) => {
              if (event.target !== event.currentTarget) return;
              closeTrialResultModal();
            }}
          >
            <section className="sci-panel sci-trial-modal">
              <div className="sci-trial-modal-head">
                <div>
                  <h3>AI评分结果</h3>
                  <p>基于当前页内容，对本次试讲的结构、重点和表达做出的评估。</p>
                </div>
                <button
                  type="button"
                  className="sci-trial-close"
                  onClick={closeTrialResultModal}
                  aria-label="关闭评分结果弹窗"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="sci-trial-result">
                <div className="sci-trial-overall">
                  <strong>{trialScoringResult.overallScore}</strong>
                  <span>综合评分 / 100</span>
                </div>

                <div className="sci-trial-dimensions">
                  {trialScoringResult.dimensionScores.map((item, idx) => (
                    <article key={`${item.name}-${idx}`} className="sci-trial-dimension-item">
                      <header>
                        <span>{item.name}</span>
                        <em>{item.score}</em>
                      </header>
                      <p>{item.comment || '可继续优化该维度表达。'}</p>
                    </article>
                  ))}
                </div>

                {trialScoringResult.strengths.length > 0 && (
                  <div className="sci-trial-tags-block">
                    <h4>讲得好的地方</h4>
                    <div className="sci-trial-tags">
                      {trialScoringResult.strengths.map((item, idx) => (
                        <span key={`strength-${idx}`} className="sci-trial-tag sci-trial-tag-good">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {trialScoringResult.weaknesses.length > 0 && (
                  <div className="sci-trial-tags-block">
                    <h4>待改进点</h4>
                    <div className="sci-trial-tags">
                      {trialScoringResult.weaknesses.map((item, idx) => (
                        <span key={`weakness-${idx}`} className="sci-trial-tag sci-trial-tag-weak">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {trialScoringResult.suggestions.length > 0 && (
                  <div className="sci-trial-summary-block">
                    <h4>改进建议</h4>
                    <ul>
                      {trialScoringResult.suggestions.map((item, idx) => (
                        <li key={`suggestion-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="sci-trial-summary-block">
                  <h4>总评</h4>
                  <p>{trialScoringResult.summary}</p>
                </div>
              </div>

              <div className="sci-trial-plan-actions">
                <button
                  type="button"
                  className="sci-trial-action-btn sci-trial-action-btn-score"
                  onClick={() => void generateTrialPlan()}
                  disabled={isTrialPlanGenerating}
                >
                  {isTrialPlanGenerating ? <Loader2 size={14} className="aura-spin" /> : <Sparkles size={14} />}
                  {isTrialPlanGenerating ? '生成中' : trialPlanResult ? '重新生成演讲方案' : '生成参考演讲方案'}
                </button>
                {trialPlanResult?.audioData && (
                  <button
                    type="button"
                    className="sci-trial-action-btn"
                    onClick={toggleTrialPlanAudio}
                    disabled={isTrialPlanGenerating}
                  >
                    {isTrialPlanAudioPlaying ? <Square size={14} /> : <Volume2 size={14} />}
                    {isTrialPlanAudioPlaying ? '停止语音' : '播放方案语音'}
                  </button>
                )}
              </div>

              {trialPlanErrorMessage && <p className="sci-trial-error">{trialPlanErrorMessage}</p>}

              {trialPlanResult && (
                <section className="sci-trial-plan-result">
                  <div className="sci-trial-summary-block">
                    <h4>参考演讲文稿</h4>
                    <p>{trialPlanResult.script}</p>
                  </div>
                  <div className="sci-trial-summary-block">
                    <h4>演讲注意点</h4>
                    <ul>
                      {trialPlanResult.notes.map((item, idx) => (
                        <li key={`plan-note-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
            </section>
          </div>
        )}

        {isKnowledgeModalOpen && (
          <div
            className="sci-trial-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="知识库导入插件"
            onClick={(event) => {
              if (event.target !== event.currentTarget) return;
              closeKnowledgeModal();
            }}
          >
            <section className="sci-panel sci-trial-modal sci-kb-modal">
              <div className="sci-trial-modal-head">
                <div>
                  <h3>知识库插件</h3>
                  <p>上传 PDF / Word / PPT 等文档，自动提取文本并切分为可检索知识条目。</p>
                </div>
                <button
                  type="button"
                  className="sci-trial-close"
                  onClick={closeKnowledgeModal}
                  aria-label="关闭知识库插件"
                  disabled={isKnowledgeIngesting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="sci-kb-stats">
                <article className="sci-kb-stat-item">
                  <span>实时可用条目</span>
                  <strong>{totalKnowledgeEntryCount}</strong>
                </article>
                <article className="sci-kb-stat-item">
                  <span>本地导入条目</span>
                  <strong>{localKnowledgeEntryCount}</strong>
                </article>
              </div>

              <label className={`sci-kb-upload ${isKnowledgeIngesting ? 'sci-kb-upload-disabled' : ''}`}>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.markdown,.json"
                  onChange={(event) => void handleKnowledgeFileUpload(event)}
                  disabled={isKnowledgeIngesting}
                />
                <CloudUpload size={18} />
                <span>{isKnowledgeIngesting ? '文档解析中...' : '选择文档并导入知识库'}</span>
              </label>

              <p className="sci-kb-hint">
                建议优先使用可复制文本的 PDF / DOCX / PPTX。扫描件若无法提取文字，会自动跳过。
              </p>

              <div className="sci-kb-actions">
                <button
                  type="button"
                  className="sci-trial-action-btn"
                  onClick={exportLocalKnowledgeBase}
                  disabled={isKnowledgeIngesting}
                >
                  导出本地知识库 JSON
                </button>
                <button
                  type="button"
                  className="sci-trial-action-btn"
                  onClick={clearLocalKnowledgeEntries}
                  disabled={isKnowledgeIngesting || localKnowledgeEntryCount === 0}
                >
                  清空本地导入知识
                </button>
              </div>

              {knowledgeIngestMessage && <p className="sci-kb-message">{knowledgeIngestMessage}</p>}

              {knowledgeIngestReports.length > 0 && (
                <section className="sci-kb-report-list">
                  {knowledgeIngestReports.map((item, index) => (
                    <article
                      key={`${item.fileName}-${index}`}
                      className={`sci-kb-report-item sci-kb-report-item-${item.status}`}
                    >
                      <header>
                        <strong>{item.fileName}</strong>
                        <span>{item.entryCount > 0 ? `+${item.entryCount}` : item.status.toUpperCase()}</span>
                      </header>
                      <p>{item.message}</p>
                    </article>
                  ))}
                </section>
              )}
            </section>
          </div>
        )}
      </div>
    );
  };

  const isHomeMode = mode === AppMode.UPLOAD;

  return (
    <div
      className={`sci-app ${
        isHomeMode ? 'aura-app selection:bg-blue-500/20' : 'aura-stage selection:bg-blue-500/20'
      }`}
    >
      <div className="sci-shell">
        <header className={isHomeMode ? 'aura-header' : 'aura-header aura-header-stage'}>
          {isHomeMode ? (
            <>
              <div className="aura-brand">
                <div className="aura-logo">
                  <Library size={20} />
                </div>
                <div>
                  <h1 className="aura-title">频安AI智能商学院</h1>
                  <p className="aura-subtitle">课程中台 · 企业培训 · 自动讲解 · 实时答疑</p>
                </div>
              </div>
              <nav className="aura-nav">
                <button
                  type="button"
                  className={`aura-nav-item aura-nav-item-btn ${homeSection === 'library' ? 'aura-nav-item-active' : ''}`}
                  onClick={() => setHomeSection('library')}
                >
                  课程书柜
                </button>
                <button
                  type="button"
                  className={`aura-nav-item aura-nav-item-btn ${homeSection === 'exam' ? 'aura-nav-item-active' : ''}`}
                  onClick={() => setHomeSection('exam')}
                >
                  考试中心
                </button>
                <span className="aura-nav-item aura-nav-item-muted">系统设置</span>
              </nav>
              <div className="aura-header-right">
                <span className="aura-header-chip">
                  <Sparkles size={13} />
                  SYSTEM ONLINE
                </span>
                <span className="aura-header-chip aura-header-chip-soft">
                  <Settings2 size={13} />
                  课程 {presetCourses.length}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="aura-brand">
                <div className="aura-logo">
                  <Library size={20} />
                </div>
                <div>
                  <h1 className="aura-title">频安AI智能商学院</h1>
                  <p className="aura-subtitle">智能演示舱 · 自动讲解 + 实时答疑 + 试讲评分 + 扫描聚焦</p>
                </div>
              </div>
              <div className="aura-header-right">
                <button type="button" className="aura-back-btn" onClick={backToLibrary}>
                  <ArrowLeft size={14} />
                  返回书柜
                </button>
                {activeCourseDisplayName && (
                  <span className="aura-header-chip aura-header-chip-soft">课程：{activeCourseDisplayName}</span>
                )}
                <span className="aura-header-chip">状态：{getModeLabel(mode)}</span>
                {slides.length > 0 && <span className="aura-header-chip aura-header-chip-soft">已加载 {slides.length} 页</span>}
              </div>
            </>
          )}
        </header>

        <main className="sci-main">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;


