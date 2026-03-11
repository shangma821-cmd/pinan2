import { Slide } from '../types';

export interface PresetCourseMeta {
  id: string;
  title: string;
  description?: string;
  slideCount?: number;
  coverImage?: string;
  updatedAt?: string;
  dataFile: string;
}

export interface PresetCourseData {
  id: string;
  title?: string;
  description?: string;
  sourcePdf?: string;
  updatedAt?: string;
  slides: Slide[];
}

interface PresetCatalogFile {
  courses?: PresetCourseMeta[];
}

interface RawPresetSlide {
  id?: number;
  imageData?: string;
  image?: string;
  script?: string;
  audioData?: string;
  audioFile?: string;
  textRegions?: Slide['textRegions'];
}

const PRESET_INDEX_URL = '/preset-courses/index.json';

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const resolveAssetPath = (baseFile: string, target: string): string => {
  const cleanTarget = String(target || '').trim();
  if (!cleanTarget) return '';
  if (/^(data:|https?:\/\/|blob:|\/)/i.test(cleanTarget)) return cleanTarget;
  const base = stripTrailingSlash(baseFile.replace(/\/[^/]*$/, ''));
  return `${base}/${cleanTarget}`;
};

const normalizeMeta = (item: PresetCourseMeta): PresetCourseMeta => {
  return {
    id: String(item?.id || '').trim(),
    title: String(item?.title || '').trim(),
    description: String(item?.description || '').trim(),
    slideCount: Number(item?.slideCount || 0) || undefined,
    coverImage: String(item?.coverImage || '').trim(),
    updatedAt: String(item?.updatedAt || '').trim(),
    dataFile: String(item?.dataFile || '').trim(),
  };
};

const normalizeSlide = (slide: RawPresetSlide, idx: number, dataFilePath: string): Slide => {
  const imageInput = String(slide?.imageData || slide?.image || '').trim();
  const imageData = resolveAssetPath(dataFilePath, imageInput);
  const audioData = String(slide?.audioData || '').trim();
  const audioFile = String(slide?.audioFile || '').trim();
  return {
    id: Number(slide?.id || idx + 1),
    imageData,
    script: String(slide?.script || '').trim(),
    audioData: audioData || (audioFile ? `FILE:${resolveAssetPath(dataFilePath, audioFile)}` : undefined),
    textRegions: slide?.textRegions || [],
  };
};

export const listPresetCourseMetas = async (): Promise<PresetCourseMeta[]> => {
  const resp = await fetch(PRESET_INDEX_URL, { cache: 'no-cache' });
  if (!resp.ok) {
    throw new Error(`Preset course index error ${resp.status}`);
  }

  const json = (await resp.json()) as PresetCatalogFile | PresetCourseMeta[];
  const rawList = Array.isArray(json) ? json : json?.courses || [];
  return rawList
    .map((item) => normalizeMeta(item))
    .filter((item) => !!item.id && !!item.title && !!item.dataFile);
};

export const loadPresetCourseByMeta = async (meta: PresetCourseMeta): Promise<PresetCourseData> => {
  const dataFilePath = resolveAssetPath(PRESET_INDEX_URL, meta.dataFile);
  const resp = await fetch(dataFilePath, { cache: 'no-cache' });
  if (!resp.ok) {
    throw new Error(`Preset course payload error ${resp.status}`);
  }

  const json = (await resp.json()) as Partial<PresetCourseData> & { slides?: RawPresetSlide[] };
  const slides = (json.slides || [])
    .map((item, idx) => normalizeSlide(item, idx, dataFilePath))
    .filter((item) => !!item.imageData);

  return {
    id: String(json.id || meta.id).trim(),
    title: String(json.title || meta.title).trim(),
    description: String(json.description || meta.description || '').trim(),
    sourcePdf: String(json.sourcePdf || '').trim(),
    updatedAt: String(json.updatedAt || meta.updatedAt || '').trim(),
    slides,
  };
};

export const loadPresetCourseById = async (
  metas: PresetCourseMeta[],
  courseId: string
): Promise<PresetCourseData | null> => {
  const id = String(courseId || '').trim();
  if (!id) return null;
  const meta = metas.find((item) => item.id === id);
  if (!meta) return null;
  return loadPresetCourseByMeta(meta);
};
