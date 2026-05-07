import { Slide, SlideTextRegion } from '../types';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface RawTextRegion {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const toPercent = (value: number, total: number): number => {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return clamp((value / total) * 100, 0, 100);
};

const appendText = (left: string, right: string): string => {
  if (!left) return right;
  if (!right) return left;
  const needsSpace = /[A-Za-z0-9)]$/.test(left) && /^[A-Za-z0-9(]/.test(right);
  return `${left}${needsSpace ? ' ' : ''}${right}`;
};

const extractTextRegions = async (page: any, viewport: any, slideId: number): Promise<SlideTextRegion[]> => {
  try {
    const textContent = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    });

    const viewWidth = Number(viewport?.width || 0);
    const viewHeight = Number(viewport?.height || 0);
    if (!viewWidth || !viewHeight) return [];

    const rawRegions: RawTextRegion[] = [];
    for (const item of textContent?.items || []) {
      const text = String(item?.str ?? '').trim();
      if (!text) continue;

      const itemTransform = Array.isArray(item?.transform) ? item.transform : null;
      if (!itemTransform) continue;

      const transformed = window.pdfjsLib?.Util?.transform(viewport.transform, itemTransform);
      if (!Array.isArray(transformed)) continue;

      const x = Number(transformed[4] ?? 0);
      const y = Number(transformed[5] ?? 0);
      const fontHeight = Math.max(
        Math.hypot(Number(transformed[2] ?? 0), Number(transformed[3] ?? 0)),
        Math.hypot(Number(transformed[0] ?? 0), Number(transformed[1] ?? 0)),
        Number(item?.height ?? 0) * Number(viewport?.scale ?? 1),
        8
      );
      const estimatedWidth = Math.max(
        Number(item?.width ?? 0) * Number(viewport?.scale ?? 1),
        text.length * fontHeight * 0.45,
        8
      );

      const boxX = clamp(x, 0, Math.max(0, viewWidth - 1));
      const boxY = clamp(y - fontHeight * 0.85, 0, Math.max(0, viewHeight - 1));
      const boxW = clamp(estimatedWidth, 4, Math.max(4, viewWidth - boxX));
      const boxH = clamp(fontHeight * 1.1, 10, Math.max(10, viewHeight - boxY));

      rawRegions.push({
        text,
        x: boxX,
        y: boxY,
        w: boxW,
        h: boxH,
      });
    }

    if (rawRegions.length === 0) return [];

    const lineTolerance = Math.max(6, viewHeight * 0.012);
    const gapTolerance = Math.max(12, viewWidth * 0.08);
    const sorted = [...rawRegions].sort((a, b) => {
      if (Math.abs(a.y - b.y) <= lineTolerance) return a.x - b.x;
      return a.y - b.y;
    });

    const merged: RawTextRegion[] = [];
    for (const current of sorted) {
      const currentCenterY = current.y + current.h / 2;
      let bestMatchIndex = -1;
      let bestScore = Number.POSITIVE_INFINITY;

      for (let i = 0; i < merged.length; i++) {
        const target = merged[i];
        const targetCenterY = target.y + target.h / 2;
        const yDelta = Math.abs(targetCenterY - currentCenterY);
        if (yDelta > lineTolerance) continue;

        const horizontalGap = current.x - (target.x + target.w);
        if (horizontalGap > gapTolerance) continue;

        const score = yDelta + Math.max(horizontalGap, 0) * 0.12;
        if (score < bestScore) {
          bestScore = score;
          bestMatchIndex = i;
        }
      }

      if (bestMatchIndex < 0) {
        merged.push({ ...current });
        continue;
      }

      const target = merged[bestMatchIndex];
      const minX = Math.min(target.x, current.x);
      const minY = Math.min(target.y, current.y);
      const maxX = Math.max(target.x + target.w, current.x + current.w);
      const maxY = Math.max(target.y + target.h, current.y + current.h);

      target.x = minX;
      target.y = minY;
      target.w = clamp(maxX - minX, 4, Math.max(4, viewWidth - minX));
      target.h = clamp(maxY - minY, 10, Math.max(10, viewHeight - minY));
      target.text = appendText(target.text, current.text);
    }

    return merged
      .map((region, index) => ({
        id: `${slideId}-text-${index + 1}`,
        text: region.text.trim().replace(/\s+/g, ' '),
        x: toPercent(region.x, viewWidth),
        y: toPercent(region.y, viewHeight),
        w: toPercent(region.w, viewWidth),
        h: toPercent(region.h, viewHeight),
      }))
      .filter((region) => !!region.text && region.w >= 2 && region.h >= 1)
      .sort((a, b) => {
        if (Math.abs(a.y - b.y) < 1.4) return a.x - b.x;
        return a.y - b.y;
      })
      .slice(0, 160);
  } catch (error) {
    console.warn(`Extracting text regions failed on slide ${slideId}:`, error);
    return [];
  }
};

export const convertPdfToImages = async (file: File): Promise<Slide[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const slideCount = pdf.numPages;
  const slides: Slide[] = [];

  for (let i = 1; i <= slideCount; i++) {
    const page = await pdf.getPage(i);
    // Reduced scale from 1.5 to 1.0 to save tokens
    const viewport = page.getViewport({ scale: 1.0 }); 
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Reduced quality from 0.8 to 0.6 to save bandwidth and tokens
    const base64 = canvas.toDataURL('image/jpeg', 0.6);
    const textRegions = await extractTextRegions(page, viewport, i);
    
    slides.push({
      id: i,
      imageData: base64,
      textRegions,
    });
  }

  return slides;
};

export const stripBase64Prefix = (base64: string): string => {
  return base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
};
