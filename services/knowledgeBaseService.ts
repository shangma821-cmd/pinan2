import type { RealtimeKnowledgeBaseEntry } from './geminiService';

interface RealtimeKnowledgeBaseFile {
  entries?: RealtimeKnowledgeBaseEntry[];
}

const KNOWLEDGE_BASE_INDEX_URL = '/knowledge-base/index.json';
const KNOWLEDGE_BASE_LOCAL_STORAGE_KEY = 'ppt.realtime.knowledge.base.local.v1';

interface AppendKnowledgeEntriesResult {
  added: number;
  duplicated: number;
  total: number;
}

const normalizeKnowledgeEntry = (
  input: Partial<RealtimeKnowledgeBaseEntry> | null | undefined,
  index: number
): RealtimeKnowledgeBaseEntry | null => {
  const title = String(input?.title || '').trim();
  const content = String(input?.content || '').trim();
  if (!title || !content) return null;

  const rawKeywords = Array.isArray(input?.keywords) ? input?.keywords : [];
  const keywordSet = new Set(
    rawKeywords
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 32)
  );

  const id = String(input?.id || '').trim() || `kb-${index + 1}`;
  return {
    id,
    title,
    content,
    keywords: Array.from(keywordSet),
  };
};

const normalizeKeyText = (value: string): string => {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。、“”‘’：:；;,.!?！？（）()【】\[\]<>《》\-—_、/\\|'"`~%^&*+=]+/g, '');
};

const getEntryFingerprint = (entry: RealtimeKnowledgeBaseEntry): string => {
  const title = normalizeKeyText(entry.title);
  const content = normalizeKeyText(entry.content).slice(0, 400);
  return `${title}::${content}`;
};

const dedupeEntries = (entries: RealtimeKnowledgeBaseEntry[]): RealtimeKnowledgeBaseEntry[] => {
  const fingerprintSet = new Set<string>();
  const output: RealtimeKnowledgeBaseEntry[] = [];
  for (const entry of entries) {
    const normalized = normalizeKnowledgeEntry(entry, output.length);
    if (!normalized) continue;
    const fingerprint = getEntryFingerprint(normalized);
    if (!fingerprint || fingerprintSet.has(fingerprint)) continue;
    fingerprintSet.add(fingerprint);
    output.push(normalized);
  }
  return output;
};

const canUseLocalStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const getRawLocalEntries = (): RealtimeKnowledgeBaseEntry[] => {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = String(window.localStorage.getItem(KNOWLEDGE_BASE_LOCAL_STORAGE_KEY) || '').trim();
    if (!raw) return [];
    const json = JSON.parse(raw) as unknown;
    if (!Array.isArray(json)) return [];
    return json
      .map((item, index) => normalizeKnowledgeEntry(item as RealtimeKnowledgeBaseEntry, index))
      .filter(Boolean) as RealtimeKnowledgeBaseEntry[];
  } catch (error) {
    console.warn('Parse local knowledge base failed, resetting local cache.', error);
    return [];
  }
};

const setRawLocalEntries = (entries: RealtimeKnowledgeBaseEntry[]): void => {
  if (!canUseLocalStorage()) return;
  try {
    const safeEntries = dedupeEntries(entries).slice(-1200);
    window.localStorage.setItem(KNOWLEDGE_BASE_LOCAL_STORAGE_KEY, JSON.stringify(safeEntries));
  } catch (error) {
    console.warn('Save local knowledge base failed.', error);
  }
};

const loadBuiltinRealtimeKnowledgeBase = async (): Promise<RealtimeKnowledgeBaseEntry[]> => {
  try {
    const response = await fetch(KNOWLEDGE_BASE_INDEX_URL, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Knowledge base index error ${response.status}`);
    }

    const json = (await response.json()) as RealtimeKnowledgeBaseFile | RealtimeKnowledgeBaseEntry[];
    const rawList = Array.isArray(json) ? json : json?.entries || [];
    return rawList
      .map((item, index) => normalizeKnowledgeEntry(item, index))
      .filter(Boolean) as RealtimeKnowledgeBaseEntry[];
  } catch (error) {
    console.warn('Load built-in knowledge base failed.', error);
    return [];
  }
};

export const listLocalRealtimeKnowledgeBase = (): RealtimeKnowledgeBaseEntry[] => {
  return dedupeEntries(getRawLocalEntries());
};

export const appendLocalRealtimeKnowledgeEntries = (
  entries: RealtimeKnowledgeBaseEntry[]
): AppendKnowledgeEntriesResult => {
  const incoming = dedupeEntries(entries);
  if (incoming.length === 0) {
    return {
      added: 0,
      duplicated: 0,
      total: listLocalRealtimeKnowledgeBase().length,
    };
  }

  const existing = listLocalRealtimeKnowledgeBase();
  const existingFingerprintSet = new Set(existing.map((item) => getEntryFingerprint(item)));
  let added = 0;
  let duplicated = 0;
  const merged = [...existing];

  for (const item of incoming) {
    const fingerprint = getEntryFingerprint(item);
    if (existingFingerprintSet.has(fingerprint)) {
      duplicated += 1;
      continue;
    }
    existingFingerprintSet.add(fingerprint);
    merged.push(item);
    added += 1;
  }

  setRawLocalEntries(merged);
  return {
    added,
    duplicated,
    total: merged.length,
  };
};

export const clearLocalRealtimeKnowledgeBase = (): void => {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(KNOWLEDGE_BASE_LOCAL_STORAGE_KEY);
};

export const loadRealtimeKnowledgeBase = async (): Promise<RealtimeKnowledgeBaseEntry[]> => {
  const [builtinEntries] = await Promise.all([loadBuiltinRealtimeKnowledgeBase()]);
  const localEntries = listLocalRealtimeKnowledgeBase();
  return dedupeEntries([...localEntries, ...builtinEntries]);
};
