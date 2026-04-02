import type { RealtimeKnowledgeBaseEntry } from './geminiService';

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export interface KnowledgeIngestFileReport {
  fileName: string;
  status: 'imported' | 'skipped' | 'failed';
  entryCount: number;
  message: string;
}

export interface KnowledgeIngestBatchResult {
  entries: RealtimeKnowledgeBaseEntry[];
  reports: KnowledgeIngestFileReport[];
}

const MAX_SOURCE_TEXT_LENGTH = 72000;
const MIN_CHUNK_LENGTH = 80;
const MAX_CHUNK_LENGTH = 680;
const TARGET_CHUNK_LENGTH = 480;

const STOP_WORDS = new Set([
  '这个',
  '那个',
  '我们',
  '你们',
  '他们',
  '以及',
  '然后',
  '如果',
  '所以',
  '进行',
  '通过',
  '可以',
  '需要',
  '已经',
  '为了',
  '一个',
  '一种',
  '对于',
  '课程',
  '内容',
  '讲解',
  '问题',
  '进行',
  'about',
  'with',
  'that',
  'this',
  'from',
  'into',
  'your',
  'their',
  'have',
  'will',
  'would',
]);

const getFileExtension = (name: string): string =>
  String(name || '')
    .trim()
    .toLowerCase()
    .split('.')
    .pop() || '';

const getFileBaseName = (name: string): string => {
  const clean = String(name || '').trim();
  if (!clean) return '未命名文档';
  return clean.replace(/\.[^.]+$/, '').trim() || '未命名文档';
};

const normalizeText = (input: string): string => {
  return String(input || '')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const hashText = (input: string): string => {
  let hash = 2166136261;
  const text = String(input || '');
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
};

const decodeXmlEntities = (value: string): string => {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
};

const extractKeywordCandidates = (text: string): string[] => {
  const source = String(text || '');
  const candidates = source.match(/[\u4e00-\u9fff]{2,8}|[a-zA-Z][a-zA-Z0-9_-]{2,20}/g) || [];
  return candidates.map((item) => item.toLowerCase()).filter((item) => !STOP_WORDS.has(item));
};

const buildKeywords = (chunk: string, seed: string): string[] => {
  const seedTokens = extractKeywordCandidates(seed);
  const tokens = [...seedTokens, ...extractKeywordCandidates(chunk)];
  const scoreMap = new Map<string, number>();

  for (const token of tokens) {
    const current = scoreMap.get(token) || 0;
    scoreMap.set(token, current + 1);
  }

  return [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map((item) => item[0]);
};

const splitTextToChunks = (text: string): string[] => {
  const normalized = normalizeText(text).slice(0, MAX_SOURCE_TEXT_LENGTH);
  if (!normalized) return [];

  const roughParagraphs = normalized
    .split(/\n{2,}|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sentences: string[] = [];
  for (const paragraph of roughParagraphs) {
    const parts = paragraph.split(/(?<=[。！？.!?；;])/).map((item) => item.trim());
    for (const part of parts) {
      if (!part) continue;
      sentences.push(part);
    }
  }

  const sourceParts = sentences.length > 0 ? sentences : roughParagraphs;
  const chunks: string[] = [];
  let current = '';

  const pushCurrent = () => {
    const cleaned = normalizeText(current);
    if (cleaned.length >= MIN_CHUNK_LENGTH) {
      chunks.push(cleaned);
    }
    current = '';
  };

  for (const piece of sourceParts) {
    if (!piece) continue;
    const joined = current ? `${current} ${piece}` : piece;
    if (joined.length <= MAX_CHUNK_LENGTH) {
      current = joined;
      continue;
    }

    if (current.length >= MIN_CHUNK_LENGTH) {
      pushCurrent();
      current = piece;
      continue;
    }

    const sliceSize = TARGET_CHUNK_LENGTH;
    let cursor = 0;
    while (cursor < joined.length) {
      const fragment = joined.slice(cursor, cursor + sliceSize).trim();
      if (fragment.length >= MIN_CHUNK_LENGTH) {
        chunks.push(fragment);
      }
      cursor += sliceSize;
    }
    current = '';
  }

  if (current) {
    pushCurrent();
  }

  return chunks.slice(0, 40);
};

const buildEntriesFromText = (fileName: string, rawText: string): RealtimeKnowledgeBaseEntry[] => {
  const baseName = getFileBaseName(fileName);
  const chunks = splitTextToChunks(rawText);
  const now = Date.now();
  return chunks.map((content, index) => {
    const title = `${baseName} - 知识段 ${index + 1}`;
    return {
      id: `kb-import-${now}-${index + 1}-${hashText(`${fileName}-${index}-${content.slice(0, 64)}`)}`,
      title,
      content,
      keywords: buildKeywords(content, baseName),
    };
  });
};

const extractPdfText = async (file: File): Promise<string> => {
  if (!window.pdfjsLib?.getDocument) {
    throw new Error('PDF 解析器未加载，请检查 pdf.js 脚本。');
  }

  const data = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data }).promise;
  const pageLimit = Math.min(Number(pdf?.numPages || 0), 80);
  const lines: string[] = [];

  for (let i = 1; i <= pageLimit; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    });
    const line = (textContent?.items || [])
      .map((item: any) => String(item?.str || '').trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (line) {
      lines.push(`第${i}页 ${line}`);
    }
  }

  return normalizeText(lines.join('\n'));
};

const extractDocxText = async (file: File): Promise<string> => {
  const mammoth = await import('mammoth/mammoth.browser');
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return normalizeText(result.value || '');
};

const getSlideOrderNumber = (path: string): number => {
  const match = String(path || '').match(/slide(\d+)\.xml$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1] || 0);
};

const extractPptxText = async (file: File): Promise<string> => {
  const zipModule = await import('jszip');
  const JSZip = zipModule.default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((left, right) => getSlideOrderNumber(left) - getSlideOrderNumber(right));

  const lines: string[] = [];
  for (const slidePath of slideFiles) {
    const xml = await zip.file(slidePath)?.async('string');
    if (!xml) continue;
    const texts = Array.from(xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g))
      .map((item) => decodeXmlEntities(item[1] || '').trim())
      .filter(Boolean);
    const merged = texts.join(' ').replace(/\s+/g, ' ').trim();
    if (!merged) continue;
    const pageNo = getSlideOrderNumber(slidePath);
    lines.push(`第${pageNo}页 ${merged}`);
  }

  return normalizeText(lines.join('\n'));
};

const extractTxtText = async (file: File): Promise<string> => {
  return normalizeText(await file.text());
};

const parseStructuredJsonEntries = async (file: File): Promise<RealtimeKnowledgeBaseEntry[]> => {
  const raw = String(await file.text() || '').trim();
  if (!raw) return [];

  const json = JSON.parse(raw) as unknown;
  const list = Array.isArray(json)
    ? json
    : Array.isArray((json as any)?.entries)
      ? (json as any).entries
      : [];

  return list
    .map((item: any, index: number) => {
      const title = String(item?.title || '').trim();
      const content = String(item?.content || '').trim();
      if (!title || !content) return null;
      const keywords = Array.isArray(item?.keywords)
        ? item.keywords.map((x: any) => String(x || '').trim()).filter(Boolean)
        : buildKeywords(content, title);
      return {
        id: String(item?.id || '').trim() || `kb-import-json-${Date.now()}-${index + 1}`,
        title,
        content,
        keywords,
      } as RealtimeKnowledgeBaseEntry;
    })
    .filter(Boolean) as RealtimeKnowledgeBaseEntry[];
};

const extractTextByFileType = async (file: File): Promise<string> => {
  const ext = getFileExtension(file.name);
  if (ext === 'pdf') return extractPdfText(file);
  if (ext === 'docx') return extractDocxText(file);
  if (ext === 'pptx') return extractPptxText(file);
  if (ext === 'txt' || ext === 'md' || ext === 'markdown') return extractTxtText(file);
  if (ext === 'doc') throw new Error('暂不支持 .doc，请先另存为 .docx。');
  if (ext === 'ppt') throw new Error('暂不支持 .ppt，请先另存为 .pptx。');
  throw new Error(`暂不支持 .${ext || 'unknown'} 文件。`);
};

export const ingestKnowledgeFiles = async (files: File[]): Promise<KnowledgeIngestBatchResult> => {
  const list = Array.from(files || []).filter(Boolean);
  const reports: KnowledgeIngestFileReport[] = [];
  const entries: RealtimeKnowledgeBaseEntry[] = [];

  for (const file of list) {
    const ext = getFileExtension(file.name);
    try {
      if (ext === 'json') {
        const jsonEntries = await parseStructuredJsonEntries(file);
        if (jsonEntries.length === 0) {
          reports.push({
            fileName: file.name,
            status: 'skipped',
            entryCount: 0,
            message: 'JSON 中未发现可用的 entries 数据。',
          });
          continue;
        }
        entries.push(...jsonEntries);
        reports.push({
          fileName: file.name,
          status: 'imported',
          entryCount: jsonEntries.length,
          message: `已导入 ${jsonEntries.length} 条结构化知识。`,
        });
        continue;
      }

      const text = await extractTextByFileType(file);
      if (!text || text.length < MIN_CHUNK_LENGTH) {
        reports.push({
          fileName: file.name,
          status: 'skipped',
          entryCount: 0,
          message: '未提取到足够文本，可能是扫描件或纯图片文档。',
        });
        continue;
      }

      const chunkEntries = buildEntriesFromText(file.name, text);
      if (chunkEntries.length === 0) {
        reports.push({
          fileName: file.name,
          status: 'skipped',
          entryCount: 0,
          message: '文本过短，未生成知识条目。',
        });
        continue;
      }

      entries.push(...chunkEntries);
      reports.push({
        fileName: file.name,
        status: 'imported',
        entryCount: chunkEntries.length,
        message: `已解析并生成 ${chunkEntries.length} 条知识。`,
      });
    } catch (error) {
      reports.push({
        fileName: file.name,
        status: 'failed',
        entryCount: 0,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { entries, reports };
};
