import PptxGenJS from 'pptxgenjs';
import { parseZip, buildPresentation, PptxViewer } from '@aiden0z/pptx-renderer';
import { PresentationDeck, SlideData } from '../types';

// In-memory cache for generated deck buffers to avoid redundant generation
const deckBufferCache = new Map<string, ArrayBuffer>();

/**
 * Generate a valid, high-fidelity Microsoft PowerPoint (.pptx) ArrayBuffer from slide data.
 * Fully compatible with MS PowerPoint, Apple Keynote, and @aiden0z/pptx-renderer.
 */
export async function generatePptxBuffer(deck: PresentationDeck): Promise<ArrayBuffer> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = deck.title;
  pptx.subject = deck.description || 'PowerPoint Presentation';

  for (let idx = 0; idx < deck.slides.length; idx++) {
    const slideData = deck.slides[idx];
    const slide = pptx.addSlide();

    // Deep spatial dark background for authentic presentation aesthetics
    slide.background = { color: '0B0F19' };

    // Slide Header Bar: Category Tag & Slide Index Pill
    if (slideData.category) {
      slide.addText(slideData.category.toUpperCase(), {
        x: 0.8,
        y: 0.5,
        w: 2.6,
        h: 0.38,
        fontSize: 10,
        bold: true,
        color: '38BDF8',
        fill: { color: '1E293B' },
        align: 'center',
        valign: 'middle',
      });
    }

    slide.addText(`SLIDE ${idx + 1} OF ${deck.slides.length}`, {
      x: 3.6,
      y: 0.5,
      w: 2.4,
      h: 0.38,
      fontSize: 10,
      fontFace: 'Arial',
      color: '94A3B8',
      align: 'left',
      valign: 'middle',
    });

    if (slideData.points && slideData.points > 0) {
      slide.addText(`+${slideData.points} PTS`, {
        x: 10.4,
        y: 0.5,
        w: 2.1,
        h: 0.38,
        fontSize: 11,
        bold: true,
        color: 'FBBF24',
        fill: { color: '332200' },
        align: 'center',
        valign: 'middle',
      });
    }

    // Title
    slide.addText(slideData.title, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 1.0,
      fontSize: 26,
      bold: true,
      color: 'F8FAFC',
      fontFace: 'Arial',
      valign: 'top',
    });

    // Subtitle
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.8,
        y: 2.15,
        w: 11.7,
        h: 0.55,
        fontSize: 14,
        color: '94A3B8',
        fontFace: 'Arial',
      });
    }

    // Bullets or body content
    if (slideData.bullets && slideData.bullets.length > 0) {
      const startY = slideData.subtitle ? 2.85 : 2.4;
      const textRows = slideData.bullets.map((b) => ({
        text: b,
        options: {
          fontSize: 15,
          color: 'E2E8F0',
          bullet: true,
          breakLine: true,
          fontFace: 'Arial',
          paraSpaceAfter: 12,
        },
      }));

      slide.addText(textRows, {
        x: 0.8,
        y: startY,
        w: 11.7,
        h: 3.5,
        valign: 'top',
      });
    }

    // Answer callout box (if present)
    if (slideData.answer) {
      slide.addText(`Answer: ${slideData.answer}`, {
        x: 0.8,
        y: 6.2,
        w: 11.7,
        h: 0.65,
        fontSize: 12,
        bold: true,
        color: '34D399',
        fill: { color: '064E3B' },
        align: 'left',
        valign: 'middle',
      });
    }
  }

  const buffer = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
  return buffer;
}

/**
 * Returns the PPTX ArrayBuffer for any deck, using cache or generating if needed.
 */
export async function getDeckBuffer(deck: PresentationDeck): Promise<ArrayBuffer> {
  if (deck.rawPptxBuffer) {
    return deck.rawPptxBuffer;
  }
  if (deckBufferCache.has(deck.id)) {
    return deckBufferCache.get(deck.id)!;
  }
  const buffer = await generatePptxBuffer(deck);
  deckBufferCache.set(deck.id, buffer);
  return buffer;
}

/**
 * Parses an uploaded PPTX file using @aiden0z/pptx-renderer.
 * Keeps the raw ArrayBuffer for 100% faithful OOXML slide rendering in the browser.
 */
export async function parseUploadedPptx(file: File): Promise<{
  deck: PresentationDeck;
  rawBuffer: ArrayBuffer;
}> {
  const buffer = await file.arrayBuffer();

  // Validate that @aiden0z/pptx-renderer parses the zip & presentation model
  const zip = await parseZip(buffer);
  const presentation = await buildPresentation(zip);

  const slideCount = presentation.slides.length;
  if (slideCount === 0) {
    throw new Error('The uploaded PowerPoint file does not contain any readable slides.');
  }

  const slides: SlideData[] = [];
  for (let i = 0; i < slideCount; i++) {
    slides.push({
      id: `pptx-slide-${i + 1}`,
      title: `Slide ${i + 1}`,
      points: 10,
    });
  }

  const deckTitle = file.name.replace(/\.[^/.]+$/, '');
  const deck: PresentationDeck = {
    id: `deck-${Date.now()}`,
    title: deckTitle,
    description: `PowerPoint Presentation (${slideCount} slides)`,
    slides,
    sourceType: 'uploaded-pptx',
    fileName: file.name,
    rawPptxBuffer: buffer,
  };

  // Cache buffer for fast retrieval
  deckBufferCache.set(deck.id, buffer);

  return { deck, rawBuffer: buffer };
}

/**
 * Helper to download current deck as a real MS PowerPoint file
 */
export async function downloadDeckAsPptx(deck: PresentationDeck): Promise<void> {
  const buffer = await getDeckBuffer(deck);
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deck.fileName || deck.title || 'presentation'}.pptx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Active viewer registry for rendering slide thumbnails
let activeViewerInstance: PptxViewer | null = null;
const viewerChangeSubscribers = new Set<(viewer: PptxViewer | null) => void>();

export function registerActiveViewer(viewer: PptxViewer | null): void {
  activeViewerInstance = viewer;
  viewerChangeSubscribers.forEach((fn) => {
    try {
      fn(viewer);
    } catch {
      // ignore
    }
  });
}

export function getActiveViewer(): PptxViewer | null {
  return activeViewerInstance;
}

export function onActiveViewerChange(cb: (viewer: PptxViewer | null) => void): () => void {
  viewerChangeSubscribers.add(cb);
  return () => {
    viewerChangeSubscribers.delete(cb);
  };
}

export { PptxViewer, parseZip, buildPresentation };
