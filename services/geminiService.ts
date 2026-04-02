import { GEMINI_MODEL_QNA, GEMINI_MODEL_TTS, GEMINI_MODEL_VISION } from "../constants";
import { Slide } from "../types";
import pako from "pako";

export interface ScriptGenerationProgress {
  totalSlides: number;
  completedSlides: number;
  successSlides: number;
  failedSlides: number;
  currentSlideId: number;
  currentSlideIndex: number;
}

export class GeminiApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiApiKeyError";
  }
}

const INVALID_KEY_MESSAGE =
  "Ark API key is invalid or missing. Please set VITE_ARK_API_KEY in .env.local.";
const DEFAULT_VOLC_TTS_SPEAKER = "zh_female_shuangkuaisisi_moon_bigtts";
const DEFAULT_VOLC_ASR_RESOURCE_ID = "volc.bigasr.auc_turbo";
const DEFAULT_VOLC_ASR_ENDPOINT = "/api/volc-asr";
const DEFAULT_VOLC_ASR_SUBMIT_ENDPOINT = "/api/volc-asr-submit";
const DEFAULT_VOLC_ASR_QUERY_ENDPOINT = "/api/volc-asr-query";
const DEFAULT_VOLC_DIALOG_RESOURCE_ID = "volc.speech.dialog";
const DEFAULT_VOLC_DIALOG_ENDPOINT = "/api/volc-dialog";
const DEFAULT_VOLC_DIALOG_APP_KEY = "PlgvMymc7f3tQnJ6";
const DEFAULT_VOLC_DIALOG_TIMEOUT_MS = 60000;
const DEFAULT_VOLC_DIALOG_CONNECT_TIMEOUT_MS = 12000;
const DEFAULT_VOLC_DIALOG_SESSION_READY_TIMEOUT_MS = 18000;
const DEFAULT_SCRIPT_CONCURRENCY = 4;
const MAX_SCRIPT_CONCURRENCY = 8;
const DEFAULT_SCRIPT_POLISH_BATCH_SIZE = 6;
let cachedVolcSpeaker: string | null = null;
let hasWarnedSpeakerFallback = false;
let hasWarnedRealtimeSpeakerForTts = false;
let hasWarnedIncompatibleRealtimeDialogVoice = false;
let hasWarnedRealtimeProxyConfig = false;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error: any) {
    if (controller.signal.aborted) {
      throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

interface ArkTextContent {
  type: "input_text";
  text: string;
}

interface ArkImageContent {
  type: "input_image";
  image_url: string;
}

type ArkInputContent = ArkTextContent | ArkImageContent;

interface ArkResponse {
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

interface VolcTtsLine {
  code?: number;
  message?: string;
  data?: string | null;
}

interface VolcAsrResponse {
  result?: {
    text?: string;
    utterances?: Array<{ text?: string }>;
  };
}

export interface RealtimeQaResult {
  answerText: string;
  answerAudioBase64: string | null;
  transcript: string;
}

export interface TrialLectureDimensionScore {
  name: string;
  score: number;
  comment: string;
}

export interface TrialLectureEvaluation {
  overallScore: number;
  dimensionScores: TrialLectureDimensionScore[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

export interface TrialLecturePlan {
  script: string;
  notes: string[];
}

export type RealtimeVoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "answering"
  | "closed";

export interface RealtimeVoiceSessionCallbacks {
  onStateChange?: (state: RealtimeVoiceState) => void;
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
  onAssistantTextDelta?: (delta: string, fullText: string) => void;
  onAssistantTextFinal?: (fullText: string) => void;
  onAssistantAudioChunk?: (pcmChunk: Uint8Array) => void;
  onUserSpeechStart?: () => void;
  onUserSpeechEnd?: () => void;
  onAssistantSpeechEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface RealtimeVoiceSession {
  start: () => Promise<void>;
  sendAudioChunk: (pcmChunk: Uint8Array) => void;
  close: () => Promise<void>;
  isReady: () => boolean;
}

export interface RealtimeKnowledgeBaseEntry {
  id?: string;
  title: string;
  content: string;
  keywords?: string[];
}

const readArkConfig = () => {
  const processEnv = (globalThis as any)?.process?.env ?? {};
  const metaEnv = (import.meta as any)?.env ?? {};

  const apiKey = String(
    processEnv.VITE_ARK_API_KEY || metaEnv.VITE_ARK_API_KEY || processEnv.ARK_API_KEY || ""
  ).trim();
  const model = String(processEnv.VITE_ARK_MODEL || metaEnv.VITE_ARK_MODEL || GEMINI_MODEL_VISION).trim();
  const baseUrl = String(
    processEnv.VITE_ARK_BASE_URL ||
      metaEnv.VITE_ARK_BASE_URL ||
      "https://ark.cn-beijing.volces.com/api/v3"
  )
    .trim()
    .replace(/\/+$/, "");

  return { apiKey, model, baseUrl };
};

const ensureArkConfig = () => {
  const cfg = readArkConfig();
  if (!cfg.apiKey) {
    throw new GeminiApiKeyError(INVALID_KEY_MESSAGE);
  }
  if (!cfg.model) {
    throw new Error("Ark model is missing. Please set VITE_ARK_MODEL in .env.local.");
  }
  return cfg;
};

const readVolcTtsConfig = () => {
  const processEnv = (globalThis as any)?.process?.env ?? {};
  const metaEnv = (import.meta as any)?.env ?? {};

  const appId = String(
    processEnv.VITE_VOLC_TTS_APP_ID || metaEnv.VITE_VOLC_TTS_APP_ID || processEnv.VITE_VOLC_APP_ID || metaEnv.VITE_VOLC_APP_ID || ""
  ).trim();
  const accessToken = String(
    processEnv.VITE_VOLC_TTS_ACCESS_TOKEN ||
      metaEnv.VITE_VOLC_TTS_ACCESS_TOKEN ||
      processEnv.VITE_VOLC_ACCESS_TOKEN ||
      metaEnv.VITE_VOLC_ACCESS_TOKEN ||
      ""
  ).trim();
  const resourceId = String(
    processEnv.VITE_VOLC_TTS_RESOURCE_ID || metaEnv.VITE_VOLC_TTS_RESOURCE_ID || "volc.service_type.10029"
  ).trim();
  const speaker = String(
    processEnv.VITE_VOLC_TTS_SPEAKER || metaEnv.VITE_VOLC_TTS_SPEAKER || DEFAULT_VOLC_TTS_SPEAKER
  ).trim();
  const endpoint = String(
    processEnv.VITE_VOLC_TTS_ENDPOINT ||
      metaEnv.VITE_VOLC_TTS_ENDPOINT ||
      "/api/volc-tts"
  ).trim();
  const uid = String(processEnv.VITE_VOLC_TTS_UID || metaEnv.VITE_VOLC_TTS_UID || "ppt-user").trim();

  return { appId, accessToken, resourceId, speaker, endpoint, uid };
};

const readVolcAsrConfig = () => {
  const processEnv = (globalThis as any)?.process?.env ?? {};
  const metaEnv = (import.meta as any)?.env ?? {};

  const appId = String(
    processEnv.VITE_VOLC_ASR_APP_ID ||
      metaEnv.VITE_VOLC_ASR_APP_ID ||
      processEnv.VITE_VOLC_TTS_APP_ID ||
      metaEnv.VITE_VOLC_TTS_APP_ID ||
      processEnv.VITE_VOLC_APP_ID ||
      metaEnv.VITE_VOLC_APP_ID ||
      ""
  ).trim();
  const accessToken = String(
    processEnv.VITE_VOLC_ASR_ACCESS_TOKEN ||
      metaEnv.VITE_VOLC_ASR_ACCESS_TOKEN ||
      processEnv.VITE_VOLC_TTS_ACCESS_TOKEN ||
      metaEnv.VITE_VOLC_TTS_ACCESS_TOKEN ||
      processEnv.VITE_VOLC_ACCESS_TOKEN ||
      metaEnv.VITE_VOLC_ACCESS_TOKEN ||
      ""
  ).trim();
  const resourceId = String(
    processEnv.VITE_VOLC_ASR_RESOURCE_ID || metaEnv.VITE_VOLC_ASR_RESOURCE_ID || DEFAULT_VOLC_ASR_RESOURCE_ID
  ).trim();
  const endpoint = String(
    processEnv.VITE_VOLC_ASR_ENDPOINT || metaEnv.VITE_VOLC_ASR_ENDPOINT || DEFAULT_VOLC_ASR_ENDPOINT
  ).trim();
  const submitEndpoint = String(
    processEnv.VITE_VOLC_ASR_SUBMIT_ENDPOINT ||
      metaEnv.VITE_VOLC_ASR_SUBMIT_ENDPOINT ||
      DEFAULT_VOLC_ASR_SUBMIT_ENDPOINT
  ).trim();
  const queryEndpoint = String(
    processEnv.VITE_VOLC_ASR_QUERY_ENDPOINT ||
      metaEnv.VITE_VOLC_ASR_QUERY_ENDPOINT ||
      DEFAULT_VOLC_ASR_QUERY_ENDPOINT
  ).trim();
  const uid = String(
    processEnv.VITE_VOLC_ASR_UID ||
      metaEnv.VITE_VOLC_ASR_UID ||
      processEnv.VITE_VOLC_TTS_UID ||
      metaEnv.VITE_VOLC_TTS_UID ||
      "ppt-user"
  ).trim();

  return { appId, accessToken, resourceId, endpoint, submitEndpoint, queryEndpoint, uid };
};

const readVolcRealtimeDialogConfig = () => {
  const processEnv = (globalThis as any)?.process?.env ?? {};
  const metaEnv = (import.meta as any)?.env ?? {};

  const appId = String(
    processEnv.VITE_VOLC_DIALOG_APP_ID ||
      metaEnv.VITE_VOLC_DIALOG_APP_ID ||
      processEnv.VITE_VOLC_TTS_APP_ID ||
      metaEnv.VITE_VOLC_TTS_APP_ID ||
      processEnv.VITE_VOLC_APP_ID ||
      metaEnv.VITE_VOLC_APP_ID ||
      ""
  ).trim();
  const accessToken = String(
    processEnv.VITE_VOLC_DIALOG_ACCESS_TOKEN ||
      metaEnv.VITE_VOLC_DIALOG_ACCESS_TOKEN ||
      processEnv.VITE_VOLC_TTS_ACCESS_TOKEN ||
      metaEnv.VITE_VOLC_TTS_ACCESS_TOKEN ||
      processEnv.VITE_VOLC_ACCESS_TOKEN ||
      metaEnv.VITE_VOLC_ACCESS_TOKEN ||
      ""
  ).trim();
  const resourceId = String(
    processEnv.VITE_VOLC_DIALOG_RESOURCE_ID ||
      metaEnv.VITE_VOLC_DIALOG_RESOURCE_ID ||
      DEFAULT_VOLC_DIALOG_RESOURCE_ID
  ).trim();
  const appKey = String(
    processEnv.VITE_VOLC_DIALOG_APP_KEY ||
      metaEnv.VITE_VOLC_DIALOG_APP_KEY ||
      DEFAULT_VOLC_DIALOG_APP_KEY
  ).trim();
  const endpoint = String(
    processEnv.VITE_VOLC_DIALOG_ENDPOINT ||
      metaEnv.VITE_VOLC_DIALOG_ENDPOINT ||
      DEFAULT_VOLC_DIALOG_ENDPOINT
  ).trim();
  const voice = String(
    processEnv.VITE_VOLC_DIALOG_VOICE ||
      metaEnv.VITE_VOLC_DIALOG_VOICE ||
      ""
  ).trim();
  const model = String(
    processEnv.VITE_VOLC_DIALOG_MODEL ||
      metaEnv.VITE_VOLC_DIALOG_MODEL ||
      ""
  ).trim();

  return { appId, accessToken, resourceId, appKey, endpoint, voice, model };
};

const readScriptGenerationConfig = () => {
  const processEnv = (globalThis as any)?.process?.env ?? {};
  const metaEnv = (import.meta as any)?.env ?? {};

  const rawConcurrency = Number(
    processEnv.VITE_SCRIPT_CONCURRENCY || metaEnv.VITE_SCRIPT_CONCURRENCY || DEFAULT_SCRIPT_CONCURRENCY
  );
  const concurrency = Number.isFinite(rawConcurrency)
    ? Math.max(1, Math.min(MAX_SCRIPT_CONCURRENCY, Math.floor(rawConcurrency)))
    : DEFAULT_SCRIPT_CONCURRENCY;

  return { concurrency };
};

const isInvalidApiKeyError = (error: any): boolean => {
  const message = String(error?.message ?? "");
  return (
    message.includes("API_KEY_INVALID") ||
    message.includes("API key not valid") ||
    message.includes("Ark API error 401") ||
    message.includes("Ark API error 403") ||
    message.includes("Unauthorized")
  );
};

const isAbortErrorLike = (error: any): boolean => {
  const name = String(error?.name ?? "");
  const message = String(error?.message ?? "");
  return name.includes("AbortError") || message.includes("AbortError") || message.includes("signal is aborted");
};

async function withRetry<T>(operation: () => Promise<T>, retries = 2, initialDelay = 3000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (isInvalidApiKeyError(error) || error instanceof GeminiApiKeyError) {
      throw new GeminiApiKeyError(INVALID_KEY_MESSAGE);
    }

    const message = String(error?.message ?? "");
    const isRetryable =
      message.includes("429") ||
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("504") ||
      message.includes("AbortError") ||
      message.includes("timeout") ||
      message.includes("timed out") ||
      message.includes("signal is aborted without reason") ||
      isAbortErrorLike(error) ||
      message.includes("NetworkError") ||
      message.includes("Failed to fetch");

    if (isRetryable && retries > 0) {
      await wait(initialDelay);
      return withRetry(operation, retries - 1, initialDelay * 2);
    }

    throw error;
  }
}

const extractOutputText = (resp: ArkResponse): string => {
  const chunks: string[] = [];
  for (const item of resp.output ?? []) {
    if (item?.type !== "message") continue;
    for (const c of item.content ?? []) {
      if (c?.type === "output_text" && c.text) {
        chunks.push(c.text);
      }
    }
  }

  const text = chunks.join("\n").trim();
  if (!text) {
    throw new Error("Ark response did not include output_text.");
  }
  return text;
};

const extractJsonObjectOrArray = (text: string): string | null => {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBracket = Math.min(
    ...[text.indexOf("["), text.indexOf("{")].filter((n) => n >= 0)
  );
  if (!Number.isFinite(firstBracket)) return null;

  const lastArray = text.lastIndexOf("]");
  const lastObj = text.lastIndexOf("}");
  const lastBracket = Math.max(lastArray, lastObj);
  if (lastBracket <= firstBracket) return null;

  return text.slice(firstBracket, lastBracket + 1).trim();
};

const parseScriptOutput = (rawText: string, slideId: number): { slideId: number; script: string }[] => {
  const candidate = extractJsonObjectOrArray(rawText);
  if (candidate) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        const normalized = parsed
          .map((x) => ({
            slideId: Number(x?.slideId ?? slideId),
            script: String(x?.script ?? "").trim(),
          }))
          .filter((x) => !!x.script);
        if (normalized.length > 0) return normalized;
      }
      if (parsed && typeof parsed === "object") {
        const script = String((parsed as any).script ?? "").trim();
        if (script) {
          return [{ slideId: Number((parsed as any).slideId ?? slideId), script }];
        }
      }
    } catch {
      // Fallback to plain text below.
    }
  }

  const fallback = rawText.trim();
  return [{ slideId, script: fallback || "This slide has no generated script." }];
};

const parseScriptArrayOutput = (rawText: string): { slideId: number; script: string }[] => {
  const candidate = extractJsonObjectOrArray(rawText);
  if (!candidate) {
    throw new Error("No JSON array found in polished script output.");
  }

  const parsed = JSON.parse(candidate);
  if (!Array.isArray(parsed)) {
    throw new Error("Polished script output is not an array.");
  }

  return parsed
    .map((x) => ({
      slideId: Number(x?.slideId),
      script: String(x?.script ?? "").trim(),
    }))
    .filter((x) => Number.isFinite(x.slideId) && !!x.script);
};

const clampScore = (value: any, fallback: number = 0): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const normalizeStringArray = (value: any, fallback: string[] = []): string[] => {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
  return list.length > 0 ? list : fallback;
};

const parseTrialLectureEvaluationOutput = (rawText: string): TrialLectureEvaluation => {
  const fallbackSummary = rawText.trim() || "模型已返回结果，但未提取到结构化评分。";
  const fallback: TrialLectureEvaluation = {
    overallScore: 70,
    dimensionScores: [
      { name: "内容准确度", score: 70, comment: "请补充更贴合页面信息的关键点。" },
      { name: "结构表达", score: 70, comment: "建议先结论再展开，层次会更清晰。" },
      { name: "重点覆盖", score: 70, comment: "可加强对本页核心内容的覆盖。" },
      { name: "语言感染力", score: 70, comment: "适当增加提问或案例增强互动感。" },
    ],
    strengths: [],
    weaknesses: [],
    suggestions: ["对照当前页图文重新组织1次试讲，再进行复评。"],
    summary: fallbackSummary,
  };

  const candidate = extractJsonObjectOrArray(rawText);
  if (!candidate) return fallback;

  try {
    const parsed = JSON.parse(candidate);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fallback;
    }

    const obj = parsed as any;
    const overallScore = clampScore(
      obj.overallScore ?? obj.totalScore ?? obj.score ?? obj["总分"] ?? obj["评分"],
      fallback.overallScore
    );

    const rawDimensions = obj.dimensionScores ?? obj.dimensions ?? obj["维度评分"] ?? obj["评分维度"];
    const dimensionScores = Array.isArray(rawDimensions)
      ? rawDimensions
          .map((item: any, idx: number) => ({
            name: String(item?.name ?? item?.dimension ?? item?.title ?? item?.["维度"] ?? `维度${idx + 1}`).trim(),
            score: clampScore(item?.score ?? item?.value ?? item?.["分数"], 70),
            comment: String(item?.comment ?? item?.feedback ?? item?.["点评"] ?? item?.["评价"] ?? "").trim(),
          }))
          .filter((item) => !!item.name)
      : [];

    const strengths = normalizeStringArray(
      obj.strengths ?? obj.pros ?? obj["优点"] ?? obj["好的地方"],
      fallback.strengths
    );
    const weaknesses = normalizeStringArray(
      obj.weaknesses ?? obj.cons ?? obj["不足"] ?? obj["待改进"],
      fallback.weaknesses
    );
    const suggestions = normalizeStringArray(
      obj.suggestions ?? obj.advice ?? obj["建议"] ?? obj["改进建议"],
      fallback.suggestions
    );
    const summary = String(obj.summary ?? obj.conclusion ?? obj["总结"] ?? obj["总评"] ?? "").trim() || fallbackSummary;

    return {
      overallScore,
      dimensionScores: dimensionScores.length > 0 ? dimensionScores : fallback.dimensionScores,
      strengths,
      weaknesses,
      suggestions,
      summary,
    };
  } catch {
    return fallback;
  }
};

const parseTrialLecturePlanOutput = (rawText: string): TrialLecturePlan => {
  const fallbackScript =
    normalizeStringArray([rawText], ["请结合评分建议，先概括结论，再用一到两个贴合页面的例子展开。"])[0];
  const fallbackNotes = [
    "先说结论，再展开原因，避免一上来堆细节。",
    "每段控制在1-2个重点，讲完一个再切下一个。",
    "结尾补一句可执行建议，增强行动感。",
  ];

  const candidate = extractJsonObjectOrArray(rawText);
  if (!candidate) {
    return {
      script: fallbackScript,
      notes: fallbackNotes,
    };
  }

  try {
    const parsed = JSON.parse(candidate);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        script: fallbackScript,
        notes: fallbackNotes,
      };
    }

    const script = String((parsed as any).script ?? (parsed as any).speech ?? "").trim() || fallbackScript;
    const notes = normalizeStringArray(
      (parsed as any).notes ?? (parsed as any).tips ?? (parsed as any)["注意点"] ?? (parsed as any).cautions,
      fallbackNotes
    ).slice(0, 8);

    return { script, notes };
  } catch {
    return {
      script: fallbackScript,
      notes: fallbackNotes,
    };
  }
};

const callArkResponses = async (
  content: ArkInputContent[],
  modelOverride?: string,
  timeoutMs: number = 35000
): Promise<string> => {
  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || "");
        if (!result) {
          reject(new Error("Image FileReader returned empty result."));
          return;
        }
        resolve(result);
      };
      reader.onerror = () => reject(reader.error || new Error("Image FileReader failed."));
      reader.readAsDataURL(blob);
    });

  const normalizeArkImageUrl = async (rawUrl: string): Promise<string> => {
    const imageUrl = String(rawUrl || "").trim();
    if (!imageUrl) return imageUrl;
    if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(imageUrl)) return imageUrl;

    // Local/static relative paths are invalid for Ark URL validation; inline as data URL.
    if (typeof window !== "undefined" && /^(\/|\.\/|\.\.\/|blob:)/i.test(imageUrl)) {
      try {
        const resolved = new URL(imageUrl, window.location.href).toString();
        const fetched = await fetchWithTimeout(resolved, { method: "GET", cache: "no-cache" }, 12000);
        if (fetched.ok) {
          return await blobToDataUrl(await fetched.blob());
        }
      } catch {
        // Keep original input for downstream error reporting.
      }
      return imageUrl;
    }

    if (/^[A-Za-z0-9+/=_-]+$/.test(imageUrl) && imageUrl.length > 256) {
      return `data:image/jpeg;base64,${imageUrl}`;
    }

    return imageUrl;
  };

  const normalizedContent: ArkInputContent[] = await Promise.all(
    content.map(async (item) => {
      if (item.type !== "input_image") return item;
      return {
        ...item,
        image_url: await normalizeArkImageUrl(item.image_url),
      };
    })
  );

  const { apiKey, baseUrl, model } = ensureArkConfig();
  const body = {
    model: modelOverride || model,
    input: [{ role: "user", content: normalizedContent }],
  };

  const resp = await fetchWithTimeout(
    `${baseUrl}/responses`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    timeoutMs
  );

  if (!resp.ok) {
    const errText = await resp.text();
    if (
      resp.status === 401 ||
      errText.includes("API_KEY_INVALID") ||
      /invalid api key|invalid_api_key|api key invalid|unauthorized/i.test(errText)
    ) {
      throw new GeminiApiKeyError(INVALID_KEY_MESSAGE);
    }
    if (resp.status === 403) {
      throw new Error(
        `Ark API 403：当前 Key 对模型或资源无权限（或被策略拒绝）。请检查 VITE_ARK_API_KEY / VITE_ARK_MODEL。原始错误：${errText}`
      );
    }
    if (resp.status === 400 && /invalid scheme/i.test(errText) && /"param":"url"/i.test(errText)) {
      throw new Error(
        "评分图片地址无效（Ark 不接受当前 URL 形式）。请重试；若使用预设课程，建议先刷新页面后再次评分。"
      );
    }
    throw new Error(`Ark API error ${resp.status}: ${errText}`);
  }

  const json = (await resp.json()) as ArkResponse;
  return extractOutputText(json);
};

const parseVolcTtsChunks = (raw: string): string => {
  const decodeBase64ToBytes = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const encodeBytesToBase64 = (bytes: Uint8Array): string => {
    let binary = "";
    const CHUNK_SIZE = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
    }
    return btoa(binary);
  };

  const pcmChunks: Uint8Array[] = [];
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    let parsed: VolcTtsLine | null = null;
    try {
      parsed = JSON.parse(line) as VolcTtsLine;
    } catch {
      continue;
    }

    if (parsed.code && parsed.code !== 0 && parsed.code !== 20000000) {
      throw new Error(`Volc TTS error ${parsed.code}: ${parsed.message || "unknown"}`);
    }

    if (typeof parsed.data === "string" && parsed.data.length > 0) {
      pcmChunks.push(decodeBase64ToBytes(parsed.data));
    }
  }

  if (pcmChunks.length === 0) {
    throw new Error("Volc TTS returned no audio chunks.");
  }

  const totalLen = pcmChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of pcmChunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return encodeBytesToBase64(merged);
};

const decodeBase64Bytes = (base64: string): Uint8Array => {
  const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = `${normalized}${"=".repeat(padding)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const encodeBytesBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const REALTIME_MESSAGE_TYPE = {
  FULL_CLIENT: 0x1,
  AUDIO_ONLY_CLIENT: 0x2,
  FULL_SERVER: 0x9,
  AUDIO_ONLY_SERVER: 0xb,
  ERROR: 0xf,
} as const;

const REALTIME_FLAG_WITH_EVENT = 0x4;
const REALTIME_VERSION_AND_HEADER_SIZE = 0x11; // v1 + 4-byte header
const REALTIME_SERIALIZATION_JSON_NONE = 0x10; // json + no compression
const REALTIME_SERIALIZATION_RAW_NONE = 0x00; // raw + no compression
const REALTIME_COMPRESSION_NONE = 0x0;
const REALTIME_COMPRESSION_GZIP = 0x1;
const REALTIME_AUDIO_CHUNK_BYTES = 640; // 20ms for 16kHz/int16/mono
const REALTIME_CONNECT_EVENTS = new Set([1, 2, 50, 51, 52]);
const REALTIME_CONNECT_ID_EVENTS = new Set([50, 51, 52]);

interface RealtimeFrameBuildOptions {
  messageType: number;
  flags?: number;
  serializationAndCompression?: number;
  event?: number;
  sessionId?: string;
  payload?: Uint8Array;
}

interface RealtimeParsedFrame {
  messageType: number;
  flags: number;
  serialization: number;
  compression: number;
  event: number | null;
  sequence: number | null;
  errorCode: number | null;
  sessionId: string;
  connectId: string;
  payloadBytes: Uint8Array;
  payloadText: string;
  payloadJson: any;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const createRealtimeId = (): string => {
  const cryptoApi = (globalThis as any)?.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const concatUint8Arrays = (parts: Uint8Array[]): Uint8Array => {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }
  return merged;
};

const int32ToBytes = (value: number): Uint8Array => {
  const bytes = new Uint8Array(4);
  const view = new DataView(bytes.buffer);
  view.setInt32(0, value, false);
  return bytes;
};

const uint32ToBytes = (value: number): Uint8Array => {
  const bytes = new Uint8Array(4);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, value >>> 0, false);
  return bytes;
};

const buildRealtimeFrame = ({
  messageType,
  flags = REALTIME_FLAG_WITH_EVENT,
  serializationAndCompression = REALTIME_SERIALIZATION_JSON_NONE,
  event = 0,
  sessionId = "",
  payload = new Uint8Array(0),
}: RealtimeFrameBuildOptions): Uint8Array => {
  const parts: Uint8Array[] = [];
  parts.push(
    new Uint8Array([
      REALTIME_VERSION_AND_HEADER_SIZE,
      ((messageType & 0x0f) << 4) | (flags & 0x0f),
      serializationAndCompression,
      0x00,
    ])
  );

  if ((flags & REALTIME_FLAG_WITH_EVENT) === REALTIME_FLAG_WITH_EVENT) {
    parts.push(int32ToBytes(event));
    if (!REALTIME_CONNECT_EVENTS.has(event)) {
      const sessionIdBytes = textEncoder.encode(sessionId);
      parts.push(uint32ToBytes(sessionIdBytes.length));
      parts.push(sessionIdBytes);
    }
  }

  parts.push(uint32ToBytes(payload.length));
  parts.push(payload);
  return concatUint8Arrays(parts);
};

const parseRealtimeFrame = (input: ArrayBuffer | Uint8Array): RealtimeParsedFrame => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 8) {
    throw new Error("Realtime frame is too short.");
  }

  const version = (bytes[0] >> 4) & 0x0f;
  if (version !== 1) {
    throw new Error(`Realtime protocol version ${version} is not supported.`);
  }

  const headerWordCount = bytes[0] & 0x0f;
  const headerSize = headerWordCount * 4;
  if (headerSize < 4 || bytes.length < headerSize) {
    throw new Error("Realtime frame header is invalid.");
  }

  const messageType = (bytes[1] >> 4) & 0x0f;
  const flags = bytes[1] & 0x0f;
  const serialization = (bytes[2] >> 4) & 0x0f;
  const compression = bytes[2] & 0x0f;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = headerSize;

  const requireSize = (size: number, label: string) => {
    if (offset + size > bytes.length) {
      throw new Error(`Realtime frame is truncated while reading ${label}.`);
    }
  };

  let errorCode: number | null = null;
  if (messageType === REALTIME_MESSAGE_TYPE.ERROR) {
    requireSize(4, "error code");
    errorCode = view.getUint32(offset, false);
    offset += 4;
  }

  const hasSequence = (flags & 0x3) !== 0;
  let sequence: number | null = null;
  if (hasSequence) {
    requireSize(4, "sequence");
    sequence = view.getInt32(offset, false);
    offset += 4;
  }

  let event: number | null = null;
  let sessionId = "";
  let connectId = "";
  if ((flags & REALTIME_FLAG_WITH_EVENT) === REALTIME_FLAG_WITH_EVENT) {
    requireSize(4, "event");
    event = view.getUint32(offset, false);
    offset += 4;

    if (!REALTIME_CONNECT_EVENTS.has(event)) {
      requireSize(4, "session id size");
      const sessionIdSize = view.getUint32(offset, false);
      offset += 4;
      requireSize(sessionIdSize, "session id");
      if (sessionIdSize > 0) {
        sessionId = textDecoder.decode(bytes.subarray(offset, offset + sessionIdSize));
      }
      offset += sessionIdSize;
    } else if (REALTIME_CONNECT_ID_EVENTS.has(event)) {
      requireSize(4, "connect id size");
      const connectIdSize = view.getUint32(offset, false);
      offset += 4;
      requireSize(connectIdSize, "connect id");
      if (connectIdSize > 0) {
        connectId = textDecoder.decode(bytes.subarray(offset, offset + connectIdSize));
      }
      offset += connectIdSize;
    }
  }

  requireSize(4, "payload size");
  const payloadSize = view.getUint32(offset, false);
  offset += 4;
  requireSize(payloadSize, "payload");

  const rawPayloadBytes = bytes.slice(offset, offset + payloadSize);
  let payloadBytes = rawPayloadBytes;
  if (compression === REALTIME_COMPRESSION_GZIP) {
    try {
      payloadBytes = pako.ungzip(rawPayloadBytes);
    } catch (error) {
      throw new Error(`Realtime frame gzip decode failed: ${String((error as any)?.message || error)}`);
    }
  } else if (compression !== REALTIME_COMPRESSION_NONE) {
    throw new Error(`Realtime frame compression ${compression} is not supported.`);
  }
  let payloadText = "";
  let payloadJson: any = null;

  if (serialization === 1 && payloadBytes.length > 0) {
    payloadText = textDecoder.decode(payloadBytes);
    try {
      payloadJson = JSON.parse(payloadText);
    } catch {
      payloadJson = null;
    }
  } else if (serialization !== 0 && payloadBytes.length > 0) {
    payloadText = textDecoder.decode(payloadBytes);
  }

  return {
    messageType,
    flags,
    serialization,
    compression,
    event,
    sequence,
    errorCode,
    sessionId,
    connectId,
    payloadBytes,
    payloadText,
    payloadJson,
  };
};

const mergeAudioByteChunks = (chunks: Uint8Array[]): string | null => {
  if (chunks.length === 0) return null;
  return encodeBytesBase64(concatUint8Arrays(chunks));
};

const isLikelyRealtimeStreamingVoice = (voice: string): boolean => {
  const trimmed = String(voice || "").trim();
  if (!trimmed) return false;
  return /_streaming$/i.test(trimmed) || /^(BV|ICL_|saturn_|S_)/i.test(trimmed);
};

const isLikelyIncompatibleRealtimeDialogVoice = (voice: string): boolean => {
  const trimmed = String(voice || "").trim();
  if (!trimmed) return false;
  return /_streaming$/i.test(trimmed) || /^BV\d+(_|$)/i.test(trimmed);
};

const normalizeRealtimeDialogVoice = (voice: string): string => {
  const trimmed = String(voice || "").trim();
  if (!trimmed) return "";

  if (isLikelyIncompatibleRealtimeDialogVoice(trimmed)) {
    if (!hasWarnedIncompatibleRealtimeDialogVoice) {
      console.warn(
        `Volc realtime dialog voice "${trimmed}" is incompatible with realtime dialog resource "${DEFAULT_VOLC_DIALOG_RESOURCE_ID}". ` +
          `Ignoring VITE_VOLC_DIALOG_VOICE and using service default voice.`
      );
      hasWarnedIncompatibleRealtimeDialogVoice = true;
    }
    return "";
  }

  return trimmed;
};

interface RealtimeRagDocument {
  title: string;
  content: string;
}

const normalizeRecallText = (value: string): string => {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。、“”‘’：:；;,.!?！？（）()【】\[\]<>《》\-—_、/\\|'"`~%^&*+=]+/g, "");
};

const extractRecallTokens = (value: string): string[] => {
  const source = String(value || "");
  const tokenSet = new Set<string>();

  const chineseChunks = source.match(/[\u4e00-\u9fff]{2,}/g) || [];
  for (const chunk of chineseChunks) {
    const clean = chunk.trim();
    if (!clean) continue;
    if (clean.length <= 8) {
      tokenSet.add(clean);
      continue;
    }
    for (let i = 0; i <= clean.length - 2; i++) {
      tokenSet.add(clean.slice(i, i + 2));
    }
  }

  const latinWords = source.toLowerCase().match(/[a-z0-9]{3,}/g) || [];
  for (const word of latinWords) {
    tokenSet.add(word);
  }

  return Array.from(tokenSet).slice(0, 48);
};

const trimRagContent = (value: string, maxChars: number = 520): string => {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, maxChars)}...`;
};

const retrieveRealtimeKnowledge = (
  query: string,
  entries: RealtimeKnowledgeBaseEntry[],
  limit: number = 3
): RealtimeRagDocument[] => {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) return [];
  if (!Array.isArray(entries) || entries.length === 0) return [];

  const queryNorm = normalizeRecallText(cleanQuery);
  const tokens = extractRecallTokens(cleanQuery);

  const scored = entries
    .map((entry) => {
      const title = String(entry?.title || "").trim();
      const content = String(entry?.content || "").trim();
      const keywords = Array.isArray(entry?.keywords)
        ? entry.keywords.map((item) => String(item || "").trim()).filter(Boolean)
        : [];
      if (!title || !content) return null;

      const titleNorm = normalizeRecallText(title);
      const contentNorm = normalizeRecallText(content);
      const keywordNormList = keywords.map((item) => normalizeRecallText(item));
      const combinedNorm = `${titleNorm}${contentNorm}${keywordNormList.join("")}`;

      let score = 0;
      if (queryNorm && combinedNorm.includes(queryNorm)) score += 8;

      for (const token of tokens) {
        if (!token) continue;
        if (keywordNormList.some((k) => k.includes(token) || token.includes(k))) {
          score += 4;
          continue;
        }
        if (titleNorm.includes(token)) {
          score += 3;
          continue;
        }
        if (contentNorm.includes(token)) {
          score += 1;
        }
      }

      return score > 0
        ? {
            score,
            item: {
              title,
              content: trimRagContent(content),
            },
          }
        : null;
    })
    .filter(Boolean) as Array<{ score: number; item: RealtimeRagDocument }>;

  const ranked = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((item) => item.score >= 3)
    .map((item) => item.item);

  return ranked;
};

const buildRealtimeSystemRole = (
  slideScript: string,
  fullCourseContext: string = "",
  currentSlideNumber: number = 0
): string => {
  const context = slideScript?.trim()
    ? `当前页讲稿上下文：${slideScript.trim()}`
    : "当前页讲稿上下文：未提供。";
  const wholeCourseContext = fullCourseContext?.trim()
    ? `全课讲稿索引（可跨页检索）：\n${fullCourseContext.trim()}`
    : "全课讲稿索引：未提供。";
  const currentSlideHint =
    currentSlideNumber > 0 ? `当前讲解页：第${Math.max(1, Math.floor(currentSlideNumber))}页。` : "当前讲解页：未提供。";

  return [
    "你是PPT课堂中的实时语音答疑女讲师（专业、耐心、表达清晰）。",
    currentSlideHint,
    context,
    wholeCourseContext,
    "回答要求：",
    "1) 优先结合全课讲稿索引回答；若问题对应其他页，先检索并说明“对应第X页”，再回答。",
    "2) 默认回答长度为4-8句（不要太短），先结论，再解释，再给一个例子/应用点。",
    "3) 如果讲稿里无法确认，明确说“根据当前课件内容暂无法确认”，并给出可执行的下一步建议。",
    "4) 回答完成后，必须主动补一句追问：你要不要我继续讲课？",
    "5) 若用户表达继续讲课意向（如“继续讲”“接着讲”），请简短确认并停止延展答疑。",
  ].join("\n");
};

const buildRealtimeWsUrl = (endpoint: string): string => {
  if (/^wss?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  if (typeof window === "undefined") {
    throw new Error("Realtime voice requires browser runtime.");
  }

  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const normalizedPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${wsProtocol}//${window.location.host}${normalizedPath}`;
};

const isAbsoluteRealtimeEndpoint = (endpoint: string): boolean => /^wss?:\/\//i.test(String(endpoint || "").trim());

const ensureRealtimeClientConfig = (cfg: ReturnType<typeof readVolcRealtimeDialogConfig>) => {
  const needClientSideAuth = isAbsoluteRealtimeEndpoint(cfg.endpoint);
  if (needClientSideAuth) {
    if (!cfg.appId || !cfg.accessToken) {
      throw new Error(
        "Volc realtime voice config missing. Please set VITE_VOLC_DIALOG_APP_ID and VITE_VOLC_DIALOG_ACCESS_TOKEN."
      );
    }
    if (!cfg.resourceId) {
      throw new Error("Volc realtime voice config missing VITE_VOLC_DIALOG_RESOURCE_ID.");
    }
    return;
  }

  // Reverse proxy mode (/api/volc-dialog): auth headers are injected by server.
  if ((!cfg.appId || !cfg.accessToken || !cfg.resourceId) && !hasWarnedRealtimeProxyConfig) {
    console.warn(
      "Realtime dialog is using proxy endpoint; missing VITE_VOLC_DIALOG_* on client will be ignored."
    );
    hasWarnedRealtimeProxyConfig = true;
  }
};

const buildRealtimeWsAuthHint = (
  cfg: ReturnType<typeof readVolcRealtimeDialogConfig>,
  extraHint: string = ""
): string => {
  const detail = [
    `resource_id=${cfg.resourceId || "(empty)"}`,
    cfg.model ? `model=${cfg.model}` : "",
    extraHint,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    `Likely upstream handshake rejection (${detail}). ` +
    "Verify VITE_VOLC_DIALOG_APP_ID / VITE_VOLC_DIALOG_ACCESS_TOKEN / VITE_VOLC_DIALOG_RESOURCE_ID are from the same app " +
    "and the realtime dialog resource is granted in Volc console."
  );
};

const buildRealtimeWsFailureHint = (
  cfg: ReturnType<typeof readVolcRealtimeDialogConfig>,
  wsUrl: string,
  opened: boolean,
  extraHint: string = ""
): string => {
  const mode = isAbsoluteRealtimeEndpoint(cfg.endpoint) ? "direct" : "proxy";
  const phaseHint = opened
    ? "WebSocket failed after opening."
    : "WebSocket failed before opening.";
  const endpointHint =
    mode === "proxy"
      ? `Endpoint mode=proxy (${cfg.endpoint} -> ${wsUrl}). Ensure your local server has a WS proxy route to /api/v3/realtime/dialogue and injects X-Api-App-ID/X-Api-Access-Key/X-Api-Resource-Id/X-Api-App-Key.`
      : `Endpoint mode=direct (${cfg.endpoint}). Browser WebSocket cannot attach required auth headers; prefer VITE_VOLC_DIALOG_ENDPOINT=/api/volc-dialog.`;
  return `${phaseHint} ${endpointHint} ${buildRealtimeWsAuthHint(cfg, extraHint)}`;
};

const safeInvoke = <T extends any[]>(
  fn: ((...args: T) => void) | undefined,
  ...args: T
) => {
  if (!fn) return;
  try {
    fn(...args);
  } catch (error) {
    console.error("Realtime callback failed:", error);
  }
};

const normalizeTtsSpeaker = (speaker: string): string => {
  const trimmed = String(speaker || "").trim();
  if (!trimmed) return DEFAULT_VOLC_TTS_SPEAKER;
  if (isLikelyRealtimeStreamingVoice(trimmed)) {
    if (!hasWarnedRealtimeSpeakerForTts) {
      console.warn(
        `Volc TTS speaker "${trimmed}" looks like a realtime-dialog voice. ` +
          `For narration TTS, use a BigTTS speaker (keeping "${DEFAULT_VOLC_TTS_SPEAKER}" as fallback). ` +
          `Use VITE_VOLC_DIALOG_VOICE for realtime Q&A voice.`
      );
      hasWarnedRealtimeSpeakerForTts = true;
    }
    return DEFAULT_VOLC_TTS_SPEAKER;
  }
  return trimmed;
};

const callVolcTtsPcm = async (text: string): Promise<string> => {
  const cfg = readVolcTtsConfig();
  if (!cfg.appId || !cfg.accessToken) {
    throw new Error("Volc TTS config missing. Please set VITE_VOLC_TTS_APP_ID and VITE_VOLC_TTS_ACCESS_TOKEN.");
  }

  const selectedSpeaker = normalizeTtsSpeaker(cachedVolcSpeaker || cfg.speaker);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cfg.appId) headers["X-Api-App-Id"] = cfg.appId;
  if (cfg.accessToken) headers["X-Api-Access-Key"] = cfg.accessToken;
  if (cfg.resourceId) headers["X-Api-Resource-Id"] = cfg.resourceId;

  const requestWithSpeaker = async (speaker: string): Promise<string> => {
    const body = {
      user: { uid: cfg.uid },
      req_params: {
        text,
        speaker,
        audio_params: {
          format: "pcm",
          sample_rate: 24000,
        },
      },
    };

    const resp = await fetchWithTimeout(
      cfg.endpoint,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
      20000
    );

    const raw = await resp.text();
    if (!resp.ok) {
      throw new Error(`Volc TTS HTTP ${resp.status}: ${raw}`);
    }

    return parseVolcTtsChunks(raw);
  };

  try {
    const audio = await requestWithSpeaker(selectedSpeaker);
    cachedVolcSpeaker = selectedSpeaker;
    return audio;
  } catch (error: any) {
    const message = String(error?.message ?? "");
    const isSpeakerResourceMismatch = message.includes("resource ID is mismatched with speaker related resource");
    const shouldFallback = isSpeakerResourceMismatch && selectedSpeaker !== DEFAULT_VOLC_TTS_SPEAKER;

    if (shouldFallback) {
      if (!hasWarnedSpeakerFallback) {
        console.warn(
          `Volc speaker "${selectedSpeaker}" is not available for resource "${cfg.resourceId}". Falling back to "${DEFAULT_VOLC_TTS_SPEAKER}".`
        );
        hasWarnedSpeakerFallback = true;
      }
      cachedVolcSpeaker = DEFAULT_VOLC_TTS_SPEAKER;
      return requestWithSpeaker(DEFAULT_VOLC_TTS_SPEAKER);
    }

    throw error;
  }
};

const isVolcResourceRejectedMessage = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("requested resource not granted") ||
    normalized.includes("resourceid") && normalized.includes("is not allowed") ||
    normalized.includes("45000030") ||
    normalized.includes("45000000")
  );
};

type VolcAsrAuthProfile = "asr" | "tts" | "dialog";
const DEFAULT_VOLC_ASR_AUTH_PROFILES: VolcAsrAuthProfile[] = ["asr", "tts", "dialog"];

const isVolcAuthRejectedMessage = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("unauthorized") ||
    normalized.includes("auth failed") ||
    normalized.includes("authentication failed") ||
    normalized.includes("invalid access key") ||
    normalized.includes("invalid token") ||
    normalized.includes("invalid app id") ||
    normalized.includes("x-api-app-id") && normalized.includes("invalid") ||
    normalized.includes("x-api-app-key") && normalized.includes("invalid") ||
    normalized.includes("permission denied") ||
    normalized.includes("鉴权失败")
  );
};

const extractAsrTextFromRaw = (rawText: string): string => {
  let parsed: VolcAsrResponse | null = null;
  try {
    parsed = JSON.parse(rawText) as VolcAsrResponse;
  } catch {
    throw new Error(`Volc ASR returned non-JSON response: ${rawText.slice(0, 120)}`);
  }

  const utteranceText = (parsed.result?.utterances ?? [])
    .map((x) => String(x?.text ?? "").trim())
    .filter(Boolean)
    .join("");
  const text = (parsed.result?.text || utteranceText || "").trim();
  if (!text) {
    throw new Error("Volc ASR returned empty transcript.");
  }
  return text;
};

const buildAsrRequestId = (): string => {
  const cryptoApi = (globalThis as any)?.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const callVolcAsrFlash = async (
  audioBase64: string,
  resourceId: string,
  authProfile: VolcAsrAuthProfile
): Promise<string> => {
  const cfg = readVolcAsrConfig();
  const body = {
    user: { uid: cfg.uid },
    audio: {
      data: audioBase64,
    },
    request: {
      model_name: "bigmodel",
    },
  };

  const resp = await fetchWithTimeout(
    cfg.endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Volc-Resource-Id": resourceId,
        "X-Volc-Auth-Profile": authProfile,
      },
      body: JSON.stringify(body),
    },
    25000
  );

  const rawText = await resp.text();
  if (!resp.ok) {
    if ((resp.status === 403 || resp.status === 400) && isVolcResourceRejectedMessage(rawText)) {
      throw new Error(`Volc ASR resource rejected for flash. profile=${authProfile}, resource_id=${resourceId}.`);
    }
    if ((resp.status === 403 || resp.status === 400) && isVolcAuthRejectedMessage(rawText)) {
      throw new Error(`Volc ASR auth rejected for flash. profile=${authProfile}.`);
    }
    throw new Error(`Volc ASR flash HTTP ${resp.status}: ${rawText}`);
  }

  return extractAsrTextFromRaw(rawText);
};

const callVolcAsrStandard = async (
  audioBase64: string,
  resourceId: string,
  authProfile: VolcAsrAuthProfile
): Promise<string> => {
  const cfg = readVolcAsrConfig();
  const requestId = buildAsrRequestId();
  const headers = {
    "Content-Type": "application/json",
    "X-Volc-Resource-Id": resourceId,
    "X-Volc-Request-Id": requestId,
    "X-Volc-Auth-Profile": authProfile,
  };

  const submitBody = {
    user: { uid: cfg.uid },
    audio: {
      format: "wav",
      data: audioBase64,
    },
    request: {
      model_name: "bigmodel",
      enable_punc: true,
    },
  };

  const submitResp = await fetchWithTimeout(
    cfg.submitEndpoint,
    {
      method: "POST",
      headers,
      body: JSON.stringify(submitBody),
    },
    15000
  );
  const submitRaw = await submitResp.text();
  if (!submitResp.ok) {
    if ((submitResp.status === 403 || submitResp.status === 400) && isVolcResourceRejectedMessage(submitRaw)) {
      throw new Error(`Volc ASR resource rejected for standard. profile=${authProfile}, resource_id=${resourceId}.`);
    }
    if ((submitResp.status === 403 || submitResp.status === 400) && isVolcAuthRejectedMessage(submitRaw)) {
      throw new Error(`Volc ASR auth rejected for standard. profile=${authProfile}.`);
    }
    throw new Error(`Volc ASR standard submit HTTP ${submitResp.status}: ${submitRaw}`);
  }

  const maxAttempts = 12;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const queryResp = await fetchWithTimeout(
      cfg.queryEndpoint,
      {
        method: "POST",
        headers,
        body: "{}",
      },
      12000
    );
    const queryRaw = await queryResp.text();
    const statusCode = Number(queryResp.headers.get("x-api-status-code") || 0);
    const statusMessage = String(queryResp.headers.get("x-api-message") || "");

    if (!queryResp.ok) {
      if (
        (queryResp.status === 403 || queryResp.status === 400) &&
        isVolcResourceRejectedMessage(`${statusMessage} ${queryRaw}`)
      ) {
        throw new Error(`Volc ASR resource rejected for standard. profile=${authProfile}, resource_id=${resourceId}.`);
      }
      if (
        (queryResp.status === 403 || queryResp.status === 400) &&
        isVolcAuthRejectedMessage(`${statusMessage} ${queryRaw}`)
      ) {
        throw new Error(`Volc ASR auth rejected for standard. profile=${authProfile}.`);
      }
      throw new Error(`Volc ASR standard query HTTP ${queryResp.status}: ${queryRaw}`);
    }

    if (statusCode === 20000000) {
      return extractAsrTextFromRaw(queryRaw);
    }

    if (statusCode === 20000001 || statusCode === 20000002) {
      await wait(700);
      continue;
    }

    if (statusCode === 20000003) {
      throw new Error("Volc ASR returned empty transcript.");
    }

    throw new Error(`Volc ASR standard query failed (${statusCode}): ${statusMessage || queryRaw}`);
  }

  throw new Error("Volc ASR standard query timeout.");
};

const callVolcAsr = async (audioBase64: string): Promise<string> => {
  if (!audioBase64?.trim()) {
    throw new Error("Volc ASR input audio is empty.");
  }

  const cfg = readVolcAsrConfig();
  if (!cfg.appId || !cfg.accessToken) {
    throw new Error("Volc ASR config missing. Please set VITE_VOLC_ASR_APP_ID and VITE_VOLC_ASR_ACCESS_TOKEN.");
  }

  const flashCandidates = Array.from(
    new Set([cfg.resourceId, DEFAULT_VOLC_ASR_RESOURCE_ID].filter(Boolean))
  );
  const authProfiles = Array.from(new Set(DEFAULT_VOLC_ASR_AUTH_PROFILES));
  const triedTargets: string[] = [];

  for (const authProfile of authProfiles) {
    for (const resourceId of flashCandidates) {
      triedTargets.push(`${authProfile}:${resourceId}`);
      try {
        return await callVolcAsrFlash(audioBase64, resourceId, authProfile);
      } catch (error: any) {
        const message = String(error?.message ?? "");
        const retryableProfileError =
          message.includes("resource rejected") || message.includes("auth rejected");
        if (!retryableProfileError) {
          throw error;
        }
      }
    }
  }

  const standardCandidates = Array.from(
    new Set([cfg.resourceId, "volc.bigasr.auc", "volc.seedasr.auc"].filter(Boolean))
  );
  for (const authProfile of authProfiles) {
    for (const resourceId of standardCandidates) {
      triedTargets.push(`${authProfile}:${resourceId}`);
      try {
        return await callVolcAsrStandard(audioBase64, resourceId, authProfile);
      } catch (error: any) {
        const message = String(error?.message ?? "");
        const retryableProfileError =
          message.includes("resource rejected") || message.includes("auth rejected");
        if (!retryableProfileError) {
          throw error;
        }
      }
    }
  }

  throw new Error(
    `Volc ASR has no permitted resource for current credentials. Tried: ${[
      ...new Set(triedTargets),
    ].join(", ")}.`
  );
};

export const generateGlobalPresentationScript = async (
  slides: Slide[],
  onProgress?: (progress: ScriptGenerationProgress) => void
): Promise<{ slideId: number; script: string }[]> => {
  ensureArkConfig();
  const { concurrency } = readScriptGenerationConfig();

  const generatedByIndex: Array<{ slideId: number; script: string } | null> = new Array(slides.length).fill(null);
  let completedSlides = 0;
  let successSlides = 0;
  let failedSlides = 0;

  console.log(
    `Starting script generation for ${slides.length} slides with ${GEMINI_MODEL_VISION} (concurrency: ${concurrency})...`
  );

  const generateSingleSlide = async (i: number) => {
    const slide = slides[i];
    const isFirstSlide = i === 0;
    const isLastSlide = i === slides.length - 1;

    const openingHint = isFirstSlide
      ? "这是开场页。第一句用提问、对比或场景引入来抓住注意力。"
      : "这不是开场页。先用一句与上一页自然衔接，不要重复开场白。";
    const endingHint = isLastSlide
      ? "这是最后一页。结尾用一句总结和可执行建议，不要再预告下一页。"
      : "结尾用一句自然过渡到下一页，但不要使用模板化句式（如“下一页我们来看”）。";
    const textAnchors = Array.from(
      new Set(
        (slide.textRegions || [])
          .map((region) => String(region.text || "").trim())
          .filter((text) => !!text)
      )
    ).slice(0, 16);
    const textAnchorHint =
      textAnchors.length > 0
        ? `页面可见文本（辅助参考，不必逐字复述）：${textAnchors.join(" ｜ ")}`
        : "页面可见文本较少，请更依赖图像内容。";

    const prompt = [
      "你是一位有感染力、会讲故事的中文讲师，正在面对真实课堂讲解 PPT。",
      `当前是第 ${i + 1} 页（共 ${slides.length} 页）。`,
      "请仅根据当前页图片内容讲解，不要假设看不见的数据。",
      textAnchorHint,
      openingHint,
      endingHint,
      "任务：根据页面视觉内容，写“可直接朗读”的一段讲稿。",
      "讲稿风格要求：",
      "1) 口语化、有互动感，像真人讲课，不像摘要。",
      "2) 必须包含一个具体点：类比、例子、情境或提问（至少一种）。",
      "3) 避免空话和套话，禁止只说“这一页主要讲了……”。",
      "4) 不要编造图片里看不到的具体数据、人名或结论。",
      "5) 不要使用列表、标题、markdown，只输出一段自然中文。",
      "长度建议：120-180字，语速正常约20-35秒。",
      `返回 JSON 数组，仅包含一项：[{\"slideId\": ${slide.id}, \"script\": \"...\"}]`,
    ].join("\n");

    const operation = async () => {
      const outputText = await callArkResponses([
        { type: "input_image", image_url: slide.imageData },
        { type: "input_text", text: prompt },
      ]);
      return parseScriptOutput(outputText, slide.id);
    };

    try {
      const result = await withRetry(operation);
      const matched = result.find((x) => x.slideId === slide.id);
      const script = (matched?.script || result[0]?.script || "").trim();
      if (!script) {
        throw new Error("Script output is empty.");
      }
      generatedByIndex[i] = { slideId: slide.id, script };
      successSlides += 1;
    } catch (error) {
      if (error instanceof GeminiApiKeyError || isInvalidApiKeyError(error)) {
        throw new GeminiApiKeyError(INVALID_KEY_MESSAGE);
      }

      console.error(`Generation failed for slide ${i + 1}`, error);
      failedSlides += 1;
      generatedByIndex[i] = {
        slideId: slide.id,
        script: "这一页讲稿生成失败，请检查网络或接口配置后重试。",
      };
    } finally {
      completedSlides += 1;
      onProgress?.({
        totalSlides: slides.length,
        completedSlides,
        successSlides,
        failedSlides,
        currentSlideId: slide.id,
        currentSlideIndex: i + 1,
      });
    }
  };

  let nextIndex = 0;
  const workerCount = Math.min(concurrency, slides.length);
  const workers = Array.from({ length: workerCount }, () =>
    (async () => {
      while (true) {
        const i = nextIndex++;
        if (i >= slides.length) return;
        await generateSingleSlide(i);
        if (i < slides.length - 1) {
          await wait(120);
        }
      }
    })()
  );

  await Promise.all(workers);

  let allScripts = generatedByIndex.map((entry, idx) => {
    if (entry) return entry;
    return {
      slideId: slides[idx].id,
      script: "这一页讲稿生成失败，请检查网络或接口配置后重试。",
    };
  });

  if (allScripts.length > 1) {
    const totalBatches = Math.ceil(allScripts.length / DEFAULT_SCRIPT_POLISH_BATCH_SIZE);
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * DEFAULT_SCRIPT_POLISH_BATCH_SIZE;
      const batch = allScripts.slice(start, start + DEFAULT_SCRIPT_POLISH_BATCH_SIZE);
      if (batch.length === 0) continue;

      const polishPrompt = [
        "你将收到同一份PPT的一批逐页讲稿草稿（JSON数组）。",
        `这是第 ${batchIndex + 1}/${totalBatches} 批。`,
        "请在不改变每页核心事实的前提下，统一为“有趣、像在上课”的口播风格，并增强这批内部的上下页衔接。",
        "硬性要求：",
        "1) 保留数组顺序和每个 slideId，不增删页。",
        "2) 每页保持 120-180 字，适合中文朗读。",
        "3) 不编造图片中没有的新事实、新数字。",
        "4) 避免模板化重复表达，提升课堂互动感。",
        "5) 只返回 JSON 数组，不要任何解释文本。",
        `讲稿草稿JSON：${JSON.stringify(batch)}`,
      ].join("\n");

      try {
        const polishedText = await withRetry(
          () => callArkResponses([{ type: "input_text", text: polishPrompt }], GEMINI_MODEL_QNA, 45000),
          1,
          1200
        );
        const polishedArray = parseScriptArrayOutput(polishedText);
        if (polishedArray.length === 0) continue;

        const polishedMap = new Map(polishedArray.map((x) => [x.slideId, x.script]));
        allScripts = allScripts.map((x) => ({
          slideId: x.slideId,
          script: polishedMap.get(x.slideId) || x.script,
        }));
      } catch (error) {
        if (!isAbortErrorLike(error)) {
          console.warn(`Script polish batch ${batchIndex + 1}/${totalBatches} skipped:`, error);
        }
      }
    }
  }

  return allScripts;
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!text?.trim()) return null;
  void GEMINI_MODEL_TTS;

  try {
    return await withRetry(() => callVolcTtsPcm(text), 1, 1200);
  } catch (ttsError) {
    const ttsMsg = String((ttsError as any)?.message ?? "");
    const quotaExceeded = /quota exceeded|45000292/i.test(ttsMsg);
    if (quotaExceeded) {
      console.warn("Volc TTS quota exceeded, trying realtime ChatTTSText fallback.");
    } else {
      console.warn("Volc TTS failed, trying realtime ChatTTSText fallback:", ttsError);
    }
  }

  try {
    return await withRetry(() => callVolcRealtimeChatTtsText(text), 1, 1000);
  } catch (realtimeError) {
    console.error("Realtime ChatTTSText failed, fallback to browser TTS:", realtimeError);
    return `TEXT:${encodeURIComponent(text)}`;
  }
};

export const createRealtimeVoiceSession = (
  slideScript: string,
  callbacks: RealtimeVoiceSessionCallbacks = {},
  fullCourseContext: string = "",
  currentSlideNumber: number = 0,
  knowledgeBaseEntries: RealtimeKnowledgeBaseEntry[] = []
): RealtimeVoiceSession => {
  const cfg = readVolcRealtimeDialogConfig();
  ensureRealtimeClientConfig(cfg);

  const wsUrl = buildRealtimeWsUrl(cfg.endpoint);
  const sessionId = createRealtimeId();
  const voice = normalizeRealtimeDialogVoice(cfg.voice);
  const dialogModel = cfg.model.trim();
  const startupHint = [
    voice ? `voice=${voice}` : "",
    dialogModel ? `model=${dialogModel}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const startSessionPayload = {
    asr: {
      extra: {
        end_smooth_window_ms: 1200,
      },
    },
    tts: {
      ...(voice ? { speaker: voice } : {}),
      audio_config: {
        channel: 1,
        format: "pcm_s16le",
        sample_rate: 24000,
      },
    },
    dialog: {
      bot_name: "PPT助教",
      system_role: buildRealtimeSystemRole(slideScript, fullCourseContext, currentSlideNumber),
      speaking_style: "自然、清晰、课堂答疑风格",
      extra: {
        input_mod: "audio",
        recv_timeout: 120,
        ...(dialogModel ? { model: dialogModel } : {}),
      },
    },
  };
  const startSessionPayloadBytes = textEncoder.encode(JSON.stringify(startSessionPayload));

  let ws: WebSocket | null = null;
  let ready = false;
  let closed = false;
  let userInitiatedClose = false;
  let state: RealtimeVoiceState = "idle";
  let startPromise: Promise<void> | null = null;
  let resolveStart: (() => void) | null = null;
  let rejectStart: ((error: Error) => void) | null = null;
  let assistantTextBuffer = "";
  let lastServerPacketAt = 0;
  const pendingAudioChunks: Uint8Array[] = [];
  let connectTimeout: ReturnType<typeof setTimeout> | null = null;
  let sessionReadyTimeout: ReturnType<typeof setTimeout> | null = null;
  let overallTimeout: ReturnType<typeof setTimeout> | null = null;
  let stallWatchdog: ReturnType<typeof setInterval> | null = null;
  let pendingExternalRagDocs: RealtimeRagDocument[] = [];

  const emitState = (nextState: RealtimeVoiceState) => {
    if (state === nextState) return;
    state = nextState;
    safeInvoke(callbacks.onStateChange, nextState);
  };

  const clearStartWaiters = () => {
    resolveStart = null;
    rejectStart = null;
  };

  const clearStartupTimers = () => {
    if (connectTimeout) {
      clearTimeout(connectTimeout);
      connectTimeout = null;
    }
    if (sessionReadyTimeout) {
      clearTimeout(sessionReadyTimeout);
      sessionReadyTimeout = null;
    }
    if (overallTimeout) {
      clearTimeout(overallTimeout);
      overallTimeout = null;
    }
    if (stallWatchdog) {
      clearInterval(stallWatchdog);
      stallWatchdog = null;
    }
  };

  const rejectStartIfWaiting = (error: Error) => {
    if (rejectStart) {
      const rejectFn = rejectStart;
      clearStartWaiters();
      rejectFn(error);
    }
  };

  const resolveStartIfWaiting = () => {
    if (resolveStart) {
      const resolveFn = resolveStart;
      clearStartWaiters();
      resolveFn();
    }
  };

  const clearSocketHandlers = (socket: WebSocket | null) => {
    if (!socket) return;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
  };

  const sendFrame = (socket: WebSocket, frame: Uint8Array) => {
    if (socket.readyState !== WebSocket.OPEN) {
      throw new Error("Realtime websocket is not open.");
    }
    socket.send(frame);
  };

  const sendAudioChunkFrame = (socket: WebSocket, chunk: Uint8Array) => {
    sendFrame(
      socket,
      buildRealtimeFrame({
        messageType: REALTIME_MESSAGE_TYPE.AUDIO_ONLY_CLIENT,
        serializationAndCompression: REALTIME_SERIALIZATION_RAW_NONE,
        event: 200,
        sessionId,
        payload: chunk,
      })
    );
  };

  const safeFrameError = (frame: RealtimeParsedFrame): string => {
    const statusCode =
      String(
        frame.payloadJson?.status_code ||
          frame.payloadJson?.code ||
          frame.errorCode ||
          ""
      ).trim() || "unknown";
    const message =
      String(
        frame.payloadJson?.message ||
          frame.payloadJson?.error ||
          frame.payloadText ||
          "unknown"
      ).trim() || "unknown";
    return `${statusCode}: ${message}`;
  };

  const failSession = (error: Error) => {
    if (closed) return;
    clearStartupTimers();
    safeInvoke(callbacks.onError, error);
    rejectStartIfWaiting(error);
    void closeInternal(false);
  };

  const flushPendingAudio = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !ready || pendingAudioChunks.length === 0) {
      return;
    }
    while (pendingAudioChunks.length > 0) {
      const chunk = pendingAudioChunks.shift();
      if (!chunk || chunk.length === 0) continue;
      try {
        sendAudioChunkFrame(ws, chunk);
      } catch (error) {
        failSession(error as Error);
        return;
      }
    }
  };

  const handleParsedFrame = (frame: RealtimeParsedFrame) => {
    if (closed) return;
    lastServerPacketAt = Date.now();

    if (frame.messageType === REALTIME_MESSAGE_TYPE.ERROR) {
      failSession(new Error(`Volc realtime voice error ${safeFrameError(frame)}`));
      return;
    }

    const eventId = Number(frame.event ?? -1);
    switch (eventId) {
      case 50: {
        if (!ws) return;
        try {
          sendFrame(
            ws,
            buildRealtimeFrame({
              messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
              event: 100,
              sessionId,
              payload: startSessionPayloadBytes,
            })
          );
        } catch (error) {
          failSession(error as Error);
        }
        return;
      }
      case 150: {
        ready = true;
        clearStartupTimers();
        emitState("listening");
        resolveStartIfWaiting();
        flushPendingAudio();
        return;
      }
      case 450: {
        safeInvoke(callbacks.onUserSpeechStart);
        emitState("listening");
        return;
      }
      case 451: {
        const results = Array.isArray(frame.payloadJson?.results) ? frame.payloadJson.results : [];
        const transcript = results.map((item: any) => String(item?.text || "")).join("").trim();
        if (!transcript) return;
        const hasFinalResult = results.some((item: any) => item?.is_interim === false);
        if (hasFinalResult) {
          pendingExternalRagDocs = retrieveRealtimeKnowledge(transcript, knowledgeBaseEntries);
          if (pendingExternalRagDocs.length > 0) {
            console.info("[QNA] knowledge hit", {
              query: transcript,
              hitCount: pendingExternalRagDocs.length,
              titles: pendingExternalRagDocs.map((item) => item.title),
            });
          }
        }
        safeInvoke(callbacks.onTranscriptUpdate, transcript, hasFinalResult);
        return;
      }
      case 459: {
        if (pendingExternalRagDocs.length > 0 && ws) {
          try {
            sendFrame(
              ws,
              buildRealtimeFrame({
                messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
                event: 502,
                sessionId,
                payload: textEncoder.encode(
                  JSON.stringify({
                    external_rag: JSON.stringify(pendingExternalRagDocs),
                  })
                ),
              })
            );
          } catch (error) {
            failSession(error as Error);
            return;
          } finally {
            pendingExternalRagDocs = [];
          }
        }
        safeInvoke(callbacks.onUserSpeechEnd);
        emitState("thinking");
        return;
      }
      case 550: {
        const delta = String(frame.payloadJson?.content || frame.payloadJson?.text || "");
        if (!delta) return;
        assistantTextBuffer += delta;
        safeInvoke(callbacks.onAssistantTextDelta, delta, assistantTextBuffer);
        emitState("answering");
        return;
      }
      case 559: {
        const finalText = assistantTextBuffer.trim();
        if (finalText) {
          safeInvoke(callbacks.onAssistantTextFinal, finalText);
        }
        assistantTextBuffer = "";
        return;
      }
      case 352: {
        if (frame.payloadBytes.length > 0) {
          safeInvoke(callbacks.onAssistantAudioChunk, frame.payloadBytes);
          emitState("answering");
        }
        return;
      }
      case 359: {
        safeInvoke(callbacks.onAssistantSpeechEnd);
        emitState("listening");
        return;
      }
      case 51:
      case 151:
      case 153:
      case 599: {
        failSession(new Error(`Volc realtime session failed (${eventId}): ${safeFrameError(frame)}`));
        return;
      }
      case 52:
      case 152: {
        if (!ready) {
          failSession(new Error(`Volc realtime session closed during startup (event ${eventId}).`));
          return;
        }
        void closeInternal(false);
        return;
      }
      default:
        return;
    }
  };

  const handleMessageData = async (rawData: ArrayBuffer | Blob | string) => {
    if (typeof rawData === "string") {
      if (rawData.trim()) {
        console.warn("Realtime server text frame:", rawData.slice(0, 180));
      }
      return;
    }

    const frameBytes =
      rawData instanceof ArrayBuffer
        ? new Uint8Array(rawData)
        : new Uint8Array(await rawData.arrayBuffer());

    const parsed = parseRealtimeFrame(frameBytes);
    handleParsedFrame(parsed);
  };

  const closeInternal = async (sendFinishEvents: boolean) => {
    if (closed) return;
    closed = true;
    ready = false;
    clearStartupTimers();
    emitState("closed");
    pendingAudioChunks.length = 0;
    if (!userInitiatedClose) {
      rejectStartIfWaiting(new Error("Realtime voice session closed."));
    }

    const socket = ws;
    ws = null;
    clearSocketHandlers(socket);

    if (socket && sendFinishEvents && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
            event: 102,
            sessionId,
            payload: textEncoder.encode("{}"),
          })
        );
      } catch {
        // Ignore best-effort finish session errors.
      }

      await wait(30);

      try {
        socket.send(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
            event: 2,
            payload: textEncoder.encode("{}"),
          })
        );
      } catch {
        // Ignore best-effort finish connection errors.
      }

      await wait(30);
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      socket.close();
    }
  };

  const start = async () => {
    if (closed) {
      throw new Error("Realtime voice session is closed.");
    }
    if (startPromise) {
      return startPromise;
    }

    startPromise = new Promise<void>((resolve, reject) => {
      resolveStart = resolve;
      rejectStart = reject;
      let socketOpened = false;

      emitState("connecting");
      ws = new WebSocket(wsUrl);
      ws.binaryType = "arraybuffer";
      lastServerPacketAt = Date.now();

      connectTimeout = setTimeout(() => {
        failSession(new Error("Volc realtime websocket connect timeout."));
      }, DEFAULT_VOLC_DIALOG_CONNECT_TIMEOUT_MS);
      sessionReadyTimeout = setTimeout(() => {
        if (!ready) {
          const hint = startupHint ? ` (${startupHint})` : "";
          failSession(
            new Error(
              `Volc realtime session start timeout (no event 150)${hint}. ` +
                "Please verify VITE_VOLC_DIALOG_RESOURCE_ID / VITE_VOLC_DIALOG_MODEL / VITE_VOLC_DIALOG_VOICE."
            )
          );
        }
      }, DEFAULT_VOLC_DIALOG_SESSION_READY_TIMEOUT_MS);
      overallTimeout = setTimeout(() => {
        if (!ready) {
          const hint = startupHint ? ` (${startupHint})` : "";
          failSession(new Error(`Volc realtime voice startup timeout${hint}.`));
        }
      }, DEFAULT_VOLC_DIALOG_TIMEOUT_MS);
      stallWatchdog = setInterval(() => {
        if (ready || closed) return;
        const idleMs = Date.now() - lastServerPacketAt;
        if (idleMs > 9000) {
          failSession(new Error("Volc realtime handshake stalled (no server events for 9s)."));
        }
      }, 2000);

      ws.onopen = () => {
        if (!ws || closed) return;
        try {
          socketOpened = true;
          lastServerPacketAt = Date.now();
          sendFrame(
            ws,
            buildRealtimeFrame({
              messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
              event: 1,
              payload: textEncoder.encode("{}"),
            })
          );
        } catch (error) {
          failSession(error as Error);
        }
      };

      ws.onmessage = (event) => {
        void handleMessageData(event.data as ArrayBuffer | Blob | string)
          .catch((error) => {
            failSession(error instanceof Error ? error : new Error(String(error)));
          });
      };

      ws.onerror = () => {
        const hint = startupHint ? `startup=${startupHint}` : "";
        failSession(new Error(`Volc realtime websocket error. ${buildRealtimeWsFailureHint(cfg, wsUrl, socketOpened, hint)}`));
      };

      ws.onclose = (event: CloseEvent) => {
        if (closed) return;
        const hint = startupHint ? `startup=${startupHint}` : "";
        failSession(
          new Error(
            `Volc realtime websocket closed (${event.code}). ${buildRealtimeWsFailureHint(cfg, wsUrl, socketOpened, hint)}`
          )
        );
      };
    });

    return startPromise;
  };

  const sendAudioChunk = (pcmChunk: Uint8Array) => {
    if (closed || !pcmChunk || pcmChunk.length === 0) return;
    const chunkCopy = pcmChunk.slice();

    if (!ready || !ws || ws.readyState !== WebSocket.OPEN) {
      pendingAudioChunks.push(chunkCopy);
      if (pendingAudioChunks.length > 120) {
        pendingAudioChunks.shift();
      }
      return;
    }

    try {
      sendAudioChunkFrame(ws, chunkCopy);
    } catch (error) {
      failSession(error as Error);
    }
  };

  const close = async () => {
    userInitiatedClose = true;
    await closeInternal(true);
  };

  return {
    start,
    sendAudioChunk,
    close,
    isReady: () => ready,
  };
};

const callVolcRealtimeChatTtsText = async (text: string): Promise<string> => {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    throw new Error("Realtime ChatTTSText input text is empty.");
  }

  const cfg = readVolcRealtimeDialogConfig();
  ensureRealtimeClientConfig(cfg);

  const wsUrl = buildRealtimeWsUrl(cfg.endpoint);
  const sessionId = createRealtimeId();
  const voice = normalizeRealtimeDialogVoice(cfg.voice);
  const dialogModel = cfg.model.trim();

  const startSessionPayload = {
    asr: {
      extra: {
        end_smooth_window_ms: 1200,
      },
    },
    tts: {
      ...(voice ? { speaker: voice } : {}),
      audio_config: {
        channel: 1,
        format: "pcm_s16le",
        sample_rate: 24000,
      },
    },
    dialog: {
      bot_name: "PPT助教",
      system_role: [
        "你是课堂讲解助手。",
        "用户会输入一段讲稿文本。",
        "请仅基于用户文本进行口语化朗读，不要扩写，不要提问，不要输出多余内容。",
      ].join("\n"),
      speaking_style: "自然、清晰、课堂讲解风格",
      extra: {
        input_mod: "text",
        recv_timeout: 120,
        ...(dialogModel ? { model: dialogModel } : {}),
      },
    },
  };
  const startSessionPayloadBytes = textEncoder.encode(JSON.stringify(startSessionPayload));

  return await new Promise<string>((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    let finished = false;
    let socketOpened = false;
    let startSessionSent = false;
    let querySent = false;
    let chatEnded = false;
    let ttsEnded = false;
    const audioChunks: Uint8Array[] = [];
    let finalizeTimer: ReturnType<typeof setTimeout> | null = null;

    const timeoutId = setTimeout(() => {
      rejectOnce(new Error("Volc realtime ChatTTSText timeout."));
    }, DEFAULT_VOLC_DIALOG_TIMEOUT_MS);

    const clearTimers = () => {
      clearTimeout(timeoutId);
      if (finalizeTimer) {
        clearTimeout(finalizeTimer);
        finalizeTimer = null;
      }
    };

    const closeSocket = () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };

    const cleanup = () => {
      clearTimers();
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
    };

    const finishAndClose = async () => {
      if (ws.readyState !== WebSocket.OPEN) {
        closeSocket();
        return;
      }

      try {
        ws.send(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
            event: 102,
            sessionId,
            payload: textEncoder.encode("{}"),
          })
        );
      } catch {
        // Ignore best-effort finish event errors.
      }

      await wait(40);

      try {
        ws.send(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
            event: 2,
            payload: textEncoder.encode("{}"),
          })
        );
      } catch {
        // Ignore best-effort finish event errors.
      }

      await wait(60);
      closeSocket();
    };

    const resolveOnce = (audioBase64: string | null) => {
      if (finished) return;
      finished = true;
      cleanup();
      if (!audioBase64) {
        reject(new Error("Realtime ChatTTSText returned no audio."));
      } else {
        resolve(audioBase64);
      }
      void finishAndClose();
    };

    const rejectOnce = (error: Error) => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(error);
      closeSocket();
    };

    const sendFrame = (frame: Uint8Array) => {
      if (ws.readyState !== WebSocket.OPEN) {
        throw new Error("Realtime websocket is not open.");
      }
      ws.send(frame);
    };

    const sendStartSession = () => {
      if (startSessionSent) return;
      sendFrame(
        buildRealtimeFrame({
          messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
          event: 100,
          sessionId,
          payload: startSessionPayloadBytes,
        })
      );
      startSessionSent = true;
    };

    const sendChatTextQuery = () => {
      if (querySent) return;
      querySent = true;
      sendFrame(
        buildRealtimeFrame({
          messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
          event: 501,
          sessionId,
          payload: textEncoder.encode(JSON.stringify({ content: normalizedText })),
        })
      );
    };

    const scheduleResolve = () => {
      if (finished) return;
      if (finalizeTimer) {
        clearTimeout(finalizeTimer);
      }
      let delay = 1200;
      if (ttsEnded) {
        delay = 80;
      } else if (chatEnded) {
        delay = audioChunks.length > 0 ? 6000 : 1200;
      }
      finalizeTimer = setTimeout(() => {
        resolveOnce(mergeAudioByteChunks(audioChunks));
      }, delay);
    };

    const safeFrameDetail = (frame: RealtimeParsedFrame): string => {
      return (
        String(frame.payloadJson?.message || frame.payloadJson?.error || frame.payloadText || "unknown").trim() ||
        "unknown"
      );
    };

    const handleParsedFrame = (frame: RealtimeParsedFrame) => {
      const eventId = Number(frame.event ?? -1);

      if (frame.messageType === REALTIME_MESSAGE_TYPE.ERROR) {
        rejectOnce(new Error(`Volc realtime ChatTTSText error ${frame.errorCode ?? "unknown"}: ${safeFrameDetail(frame)}`));
        return;
      }

      switch (eventId) {
        case 50: {
          try {
            sendStartSession();
          } catch (error) {
            rejectOnce(error as Error);
          }
          return;
        }
        case 150: {
          try {
            sendChatTextQuery();
          } catch (error) {
            rejectOnce(error as Error);
          }
          return;
        }
        case 352: {
          if (frame.payloadBytes.length > 0) {
            audioChunks.push(frame.payloadBytes);
          }
          return;
        }
        case 553: {
          return;
        }
        case 559: {
          chatEnded = true;
          scheduleResolve();
          return;
        }
        case 359: {
          ttsEnded = true;
          scheduleResolve();
          return;
        }
        case 51:
        case 151:
        case 153:
        case 599: {
          rejectOnce(new Error(`Volc realtime ChatTTSText failed (${eventId}): ${safeFrameDetail(frame)}`));
          return;
        }
        case 52:
        case 152: {
          scheduleResolve();
          return;
        }
        default:
          return;
      }
    };

    const handleMessageData = async (rawData: ArrayBuffer | Blob | string) => {
      if (typeof rawData === "string") {
        if (rawData.trim()) {
          throw new Error(`Unexpected text frame from realtime server: ${rawData.slice(0, 120)}`);
        }
        return;
      }

      const frameBytes =
        rawData instanceof ArrayBuffer
          ? new Uint8Array(rawData)
          : new Uint8Array(await rawData.arrayBuffer());
      const parsed = parseRealtimeFrame(frameBytes);
      handleParsedFrame(parsed);
    };

    ws.onopen = () => {
      try {
        socketOpened = true;
        sendFrame(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
            event: 1,
            payload: textEncoder.encode("{}"),
          })
        );
      } catch (error) {
        rejectOnce(error as Error);
      }
    };

    ws.onmessage = (event) => {
      void handleMessageData(event.data as ArrayBuffer | Blob | string).catch((error) => {
        rejectOnce(error instanceof Error ? error : new Error(String(error)));
      });
    };

    ws.onerror = () => {
      rejectOnce(new Error(`Volc realtime websocket error. ${buildRealtimeWsFailureHint(cfg, wsUrl, socketOpened)}`));
    };

    ws.onclose = (event: CloseEvent) => {
      if (finished) return;
      rejectOnce(
        new Error(`Volc realtime websocket closed (${event.code}). ${buildRealtimeWsFailureHint(cfg, wsUrl, socketOpened)}`)
      );
    };
  });
};

const callVolcRealtimeDialog = async (
  audioPcmBase64: string,
  slideScript: string
): Promise<RealtimeQaResult> => {
  const cfg = readVolcRealtimeDialogConfig();
  ensureRealtimeClientConfig(cfg);
  if (!audioPcmBase64?.trim()) {
    throw new Error("Volc realtime voice input audio is empty.");
  }

  const inputAudioBytes = decodeBase64Bytes(audioPcmBase64);
  if (inputAudioBytes.length === 0) {
    throw new Error("Volc realtime voice input audio decoded to empty bytes.");
  }

  const wsUrl = buildRealtimeWsUrl(cfg.endpoint);
  const sessionId = createRealtimeId();
  const voice = normalizeRealtimeDialogVoice(cfg.voice);
  const dialogModel = cfg.model.trim();

  const startSessionPayload = {
    asr: {
      extra: {
        end_smooth_window_ms: 1200,
      },
    },
    tts: {
      ...(voice ? { speaker: voice } : {}),
      audio_config: {
        channel: 1,
        format: "pcm_s16le",
        sample_rate: 24000,
      },
    },
    dialog: {
      bot_name: "PPT助教",
      system_role: buildRealtimeSystemRole(slideScript),
      speaking_style: "自然、清晰、课堂答疑风格",
      extra: {
        input_mod: "audio_file",
        recv_timeout: 20,
        ...(dialogModel ? { model: dialogModel } : {}),
      },
    },
  };
  const startSessionPayloadBytes = textEncoder.encode(JSON.stringify(startSessionPayload));

  return await new Promise<RealtimeQaResult>((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    let finished = false;
    let socketOpened = false;
    let startSessionSent = false;
    let audioSent = false;
    let transcript = "";
    let answerText = "";
    const answerAudioChunks: Uint8Array[] = [];
    let chatEnded = false;
    let ttsEnded = false;
    let finalizeTimer: ReturnType<typeof setTimeout> | null = null;

    const timeoutId = setTimeout(() => {
      rejectOnce(new Error("Volc realtime voice timeout."));
    }, DEFAULT_VOLC_DIALOG_TIMEOUT_MS);

    const clearTimers = () => {
      clearTimeout(timeoutId);
      if (finalizeTimer) {
        clearTimeout(finalizeTimer);
        finalizeTimer = null;
      }
    };

    const closeSocket = () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };

    const cleanup = () => {
      clearTimers();
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
    };

    const bestAnswerText = () => {
      const trimmed = answerText.trim();
      if (trimmed) return trimmed;
      const transcriptTrimmed = transcript.trim();
      if (transcriptTrimmed) return `我听到你的问题是“${transcriptTrimmed}”，但本轮未返回完整文本答案。`;
      return "我收到了你的问题，但本轮未返回文本结果。";
    };

    const finishAndClose = async () => {
      if (ws.readyState !== WebSocket.OPEN) {
        closeSocket();
        return;
      }

      try {
        ws.send(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
            event: 102,
            sessionId,
            payload: textEncoder.encode("{}"),
          })
        );
      } catch {
        // Ignore best-effort finish event errors.
      }

      await wait(50);

      try {
        ws.send(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
            event: 2,
            payload: textEncoder.encode("{}"),
          })
        );
      } catch {
        // Ignore best-effort finish event errors.
      }

      await wait(100);
      closeSocket();
    };

    const resolveOnce = (result: RealtimeQaResult) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(result);
      void finishAndClose();
    };

    const rejectOnce = (error: Error) => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(error);
      closeSocket();
    };

    const sendFrame = (frame: Uint8Array) => {
      if (ws.readyState !== WebSocket.OPEN) {
        throw new Error("Realtime websocket is not open.");
      }
      ws.send(frame);
    };

    const sendStartSession = () => {
      if (startSessionSent) return;
      sendFrame(
        buildRealtimeFrame({
          messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
          event: 100,
          sessionId,
          payload: startSessionPayloadBytes,
        })
      );
      startSessionSent = true;
    };

    const sendTaskAudioChunks = async () => {
      if (audioSent) return;
      audioSent = true;

      for (let offset = 0; offset < inputAudioBytes.length; offset += REALTIME_AUDIO_CHUNK_BYTES) {
        if (finished || ws.readyState !== WebSocket.OPEN) return;
        const chunk = inputAudioBytes.slice(offset, Math.min(offset + REALTIME_AUDIO_CHUNK_BYTES, inputAudioBytes.length));
        if (chunk.length === 0) continue;

        sendFrame(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.AUDIO_ONLY_CLIENT,
            serializationAndCompression: REALTIME_SERIALIZATION_RAW_NONE,
            event: 200,
            sessionId,
            payload: chunk,
          })
        );

        if (offset + REALTIME_AUDIO_CHUNK_BYTES < inputAudioBytes.length) {
          await wait(4);
        }
      }
    };

    const scheduleResolve = () => {
      if (finished) return;
      if (finalizeTimer) {
        clearTimeout(finalizeTimer);
      }
      let delay = 1200;
      if (ttsEnded) {
        delay = 80;
      } else if (chatEnded) {
        delay = answerAudioChunks.length > 0 ? 6000 : 1200;
      }
      finalizeTimer = setTimeout(() => {
        resolveOnce({
          answerText: bestAnswerText(),
          answerAudioBase64: mergeAudioByteChunks(answerAudioChunks),
          transcript: transcript.trim(),
        });
      }, delay);
    };

    const handleParsedFrame = (frame: RealtimeParsedFrame) => {
      const eventId = frame.event;

      if (frame.messageType === REALTIME_MESSAGE_TYPE.ERROR) {
        const errMessage =
          String(frame.payloadJson?.error || frame.payloadJson?.message || frame.payloadText || "unknown").trim() ||
          "unknown";
        rejectOnce(new Error(`Volc realtime voice error ${frame.errorCode ?? "unknown"}: ${errMessage}`));
        return;
      }

      switch (eventId) {
        case 50: {
          sendStartSession();
          return;
        }
        case 51: {
          const detail = String(frame.payloadJson?.error || frame.payloadJson?.message || frame.payloadText || "unknown");
          rejectOnce(new Error(`Volc realtime connection failed: ${detail}`));
          return;
        }
        case 150: {
          void sendTaskAudioChunks();
          return;
        }
        case 451: {
          const results = Array.isArray(frame.payloadJson?.results) ? frame.payloadJson.results : [];
          const combined = results.map((item: any) => String(item?.text || "")).join("").trim();
          if (combined) {
            const hasFinalResult = results.some((item: any) => item?.is_interim === false);
            transcript = hasFinalResult ? combined : combined;
          }
          return;
        }
        case 550: {
          const content = String(frame.payloadJson?.content || "");
          if (content) {
            answerText += content;
          }
          return;
        }
        case 352: {
          if (frame.payloadBytes.length > 0) {
            answerAudioChunks.push(frame.payloadBytes);
          }
          return;
        }
        case 559: {
          chatEnded = true;
          scheduleResolve();
          return;
        }
        case 359: {
          ttsEnded = true;
          scheduleResolve();
          return;
        }
        case 153:
        case 599: {
          const detail = String(
            frame.payloadJson?.message || frame.payloadJson?.error || frame.payloadText || "unknown"
          );
          rejectOnce(new Error(`Volc realtime session failed (${eventId}): ${detail}`));
          return;
        }
        case 152:
        case 52: {
          scheduleResolve();
          return;
        }
        default:
          return;
      }
    };

    const handleMessageData = async (rawData: ArrayBuffer | Blob | string) => {
      if (typeof rawData === "string") {
        throw new Error(`Unexpected text frame from realtime server: ${rawData.slice(0, 120)}`);
      }

      const frameBytes =
        rawData instanceof ArrayBuffer
          ? new Uint8Array(rawData)
          : new Uint8Array(await rawData.arrayBuffer());

      const parsed = parseRealtimeFrame(frameBytes);
      handleParsedFrame(parsed);
    };

    ws.onopen = () => {
      try {
        socketOpened = true;
        sendFrame(
          buildRealtimeFrame({
            messageType: REALTIME_MESSAGE_TYPE.FULL_CLIENT,
            event: 1,
            payload: textEncoder.encode("{}"),
          })
        );
      } catch (error) {
        rejectOnce(error as Error);
      }
    };

    ws.onmessage = (event) => {
      void handleMessageData(event.data as ArrayBuffer | Blob | string).catch((error) => {
        rejectOnce(error instanceof Error ? error : new Error(String(error)));
      });
    };

    ws.onerror = () => {
      rejectOnce(new Error(`Volc realtime websocket error. ${buildRealtimeWsFailureHint(cfg, wsUrl, socketOpened)}`));
    };

    ws.onclose = (event: CloseEvent) => {
      if (finished) return;
      rejectOnce(
        new Error(`Volc realtime websocket closed (${event.code}). ${buildRealtimeWsFailureHint(cfg, wsUrl, socketOpened)}`)
      );
    };
  });
};

export const answerQuestionRealtime = async (
  audioPcmBase64: string,
  slideScript: string
): Promise<RealtimeQaResult> => {
  return withRetry(() => callVolcRealtimeDialog(audioPcmBase64, slideScript), 1, 1000);
};

export const transcribeTrialLectureAudio = async (audioBase64: string): Promise<string> => {
  const input = String(audioBase64 || "").trim();
  if (!input) {
    throw new Error("录音内容为空，请先完成试讲录音。");
  }

  try {
    return await withRetry(() => callVolcAsr(input), 1, 800);
  } catch (error) {
    if (error instanceof GeminiApiKeyError || isInvalidApiKeyError(error)) {
      throw new GeminiApiKeyError(INVALID_KEY_MESSAGE);
    }

    const message = String((error as any)?.message ?? "");
    if (message.includes("Volc ASR has no permitted resource")) {
      throw new Error(
        "语音识别资源未授权。请检查 VITE_VOLC_ASR_APP_ID / VITE_VOLC_ASR_ACCESS_TOKEN / VITE_VOLC_ASR_RESOURCE_ID，或将 ASR 配置对齐到已授权的 TTS/Dialog 应用。"
      );
    }
    if (message.includes("Volc ASR resource rejected")) {
      throw new Error("当前 ASR resource_id 不可用，请在火山控制台确认资源授权。");
    }
    if (message.includes("Volc ASR HTTP 403")) {
      throw new Error("语音识别鉴权失败（403），请检查 ASR 鉴权配置。");
    }
    if (message.includes("empty transcript")) {
      throw new Error("没有识别到有效试讲内容，请靠近麦克风再试一次。");
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
};

export const evaluateTrialLecture = async (
  trialSpeech: string,
  slideImageBase64: string,
  referenceScript: string = ""
): Promise<TrialLectureEvaluation> => {
  const cleanSpeech = String(trialSpeech || "").replace(/\s+/g, " ").trim();
  if (!cleanSpeech) {
    throw new Error("试讲文本为空，请先录音转写或手动输入。");
  }

  const cleanReference = String(referenceScript || "").replace(/\s+/g, " ").trim();
  const prompt = [
    "你是严格但建设性的PPT讲解评审专家，请对学员试讲进行打分。",
    "输入信息：当前页图片 + 参考讲稿（可为空） + 学员试讲文本。",
    `参考讲稿：${cleanReference || "（无）"}`,
    `学员试讲文本：${cleanSpeech}`,
    "评分规则：",
    "1) 只能依据当前页图片与试讲文本评价，不得臆造页面外事实。",
    "2) 总分0-100，分项分0-100。",
    "3) 评分维度固定四项：内容准确度、结构表达、重点覆盖、语言感染力。",
    "4) 给出学员讲得好的地方、不足、可执行改进建议。",
    "请只输出JSON对象，不要markdown，不要额外解释。",
    "JSON格式：",
    "{\"overallScore\":88,\"dimensionScores\":[{\"name\":\"内容准确度\",\"score\":90,\"comment\":\"...\"},{\"name\":\"结构表达\",\"score\":86,\"comment\":\"...\"},{\"name\":\"重点覆盖\",\"score\":87,\"comment\":\"...\"},{\"name\":\"语言感染力\",\"score\":89,\"comment\":\"...\"}],\"strengths\":[\"...\"],\"weaknesses\":[\"...\"],\"suggestions\":[\"...\"],\"summary\":\"...\"}",
  ].join("\n");

  const output = await withRetry(() =>
    callArkResponses(
      [
        { type: "input_image", image_url: slideImageBase64 },
        { type: "input_text", text: prompt },
      ],
      GEMINI_MODEL_QNA,
      60000
    )
  );

  return parseTrialLectureEvaluationOutput(output);
};

export const generateTrialLecturePlan = async (
  trialSpeech: string,
  slideImageBase64: string,
  referenceScript: string = "",
  evaluation?: TrialLectureEvaluation
): Promise<TrialLecturePlan> => {
  const cleanSpeech = String(trialSpeech || "").replace(/\s+/g, " ").trim();
  if (!cleanSpeech) {
    throw new Error("试讲文本为空，无法生成参考演讲方案。");
  }

  const cleanReference = String(referenceScript || "").replace(/\s+/g, " ").trim();
  const evalSummary = evaluation
    ? JSON.stringify(
        {
          overallScore: evaluation.overallScore,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          suggestions: evaluation.suggestions,
          summary: evaluation.summary,
        },
        null,
        2
      )
    : "（无）";

  const prompt = [
    "你是演讲教练。请基于当前页图片、学员原试讲文本和评分结果，输出可直接练习的“参考演讲方案”。",
    `学员原试讲：${cleanSpeech}`,
    `参考讲稿：${cleanReference || "（无）"}`,
    `评分结果：${evalSummary}`,
    "输出要求：",
    "1) script：120-220字，口语化，可直接朗读；结构为“结论 -> 解释 -> 例子/应用 -> 收束”。",
    "2) notes：3-6条，给学员的演讲注意点，必须具体可执行。",
    "3) 不要编造图片中没有的数字或结论。",
    "仅输出JSON对象，不要markdown，不要额外解释。",
    '格式：{"script":"...","notes":["...","..."]}',
  ].join("\n");

  const output = await withRetry(() =>
    callArkResponses(
      [
        { type: "input_image", image_url: slideImageBase64 },
        { type: "input_text", text: prompt },
      ],
      GEMINI_MODEL_QNA,
      60000
    )
  );

  return parseTrialLecturePlanOutput(output);
};

export const answerQuestion = async (audioBase64: string, slideImageBase64: string): Promise<string> => {
  try {
    const questionText = await withRetry(() => callVolcAsr(audioBase64), 1, 800);

    const prompt = [
      "用户正在针对这页幻灯片提问。",
      `用户问题：${questionText}`,
      "请基于图片内容回答，若问题超出图片信息范围，请明确说出无法从该页确认。",
      "回答要求：中文，2-4句，简短直接，像老师在课堂即时答疑。",
    ].join("\n");

    return await withRetry(() =>
      callArkResponses(
        [
          { type: "input_image", image_url: slideImageBase64 },
          { type: "input_text", text: prompt },
        ],
        GEMINI_MODEL_QNA
      )
    );
  } catch (error) {
    if (error instanceof GeminiApiKeyError || isInvalidApiKeyError(error)) {
      return "Ark API key invalid. Please update VITE_ARK_API_KEY and retry.";
    }

    const message = String((error as any)?.message ?? "");
    if (message.includes("Volc ASR has no permitted resource")) {
      return "语音识别资源未授权到当前 App/Token。请在火山控制台确认 ASR 资源授权，并核对 AppID 与 Access Token 属于同一应用。";
    }
    if (message.includes("Volc ASR resource rejected")) {
      return "当前 resource_id 对该接口不可用。请在控制台确认该应用可用的 ASR resource_id。";
    }
    if (message.includes("Volc ASR HTTP 403")) {
      return "语音识别鉴权失败（403）。请检查 VITE_VOLC_ASR_APP_ID / VITE_VOLC_ASR_ACCESS_TOKEN / VITE_VOLC_ASR_RESOURCE_ID。";
    }
    if (message.includes("empty transcript")) {
      return "没有听清你的问题，请靠近麦克风再问一次。";
    }

    console.error("Q&A failed", error);
    return "语音答疑服务连接异常，请稍后重试。";
  }
};
