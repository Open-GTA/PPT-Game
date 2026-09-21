import JSZip from 'jszip';
import { SlideData, SlideElement, PresentationDeck } from '../types';

/**
 * Parses a .pptx file in the browser using JSZip and DOMParser.
 * Extracts slide texts, shapes, titles, and media images.
 */
export async function parsePptxFile(file: File): Promise<PresentationDeck> {
  const zip = await JSZip.loadAsync(file);
  const parser = new DOMParser();

  // 1. Read presentation.xml and its relationships to get ordered slides
  const presXmlStr = await zip.file('ppt/presentation.xml')?.async('text');
  const presRelsXmlStr = await zip.file('ppt/_rels/presentation.xml.rels')?.async('text');

  const slideRelMap = new Map<string, string>(); // rId -> path (e.g. slides/slide1.xml)

  if (presRelsXmlStr) {
    const relsDoc = parser.parseFromString(presRelsXmlStr, 'application/xml');
    const relNodes = relsDoc.getElementsByTagName('Relationship');
    for (let i = 0; i < relNodes.length; i++) {
      const rel = relNodes[i];
      const id = rel.getAttribute('Id');
      const target = rel.getAttribute('Target');
      if (id && target) {
        // Target can be 'slides/slide1.xml' or '/ppt/slides/slide1.xml'
        const cleanTarget = target.replace(/^\/?ppt\//, '').replace(/^\//, '');
        slideRelMap.set(id, cleanTarget);
      }
    }
  }

  const slideFilePaths: string[] = [];

  if (presXmlStr) {
    const presDoc = parser.parseFromString(presXmlStr, 'application/xml');
    const sldIds = presDoc.getElementsByTagName('p:sldId');
    for (let i = 0; i < sldIds.length; i++) {
      const rId = sldIds[i].getAttribute('r:id');
      if (rId && slideRelMap.has(rId)) {
        slideFilePaths.push('ppt/' + slideRelMap.get(rId));
      }
    }
  }

  // Fallback: search all slides in ppt/slides/slide*.xml if presentation.xml parsing was empty
  if (slideFilePaths.length === 0) {
    const allFiles = Object.keys(zip.files);
    const slideMatches = allFiles
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
        const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
        return numA - numB;
      });
    slideFilePaths.push(...slideMatches);
  }

  if (slideFilePaths.length === 0) {
    throw new Error('No slides found in the PPTX archive. Please ensure it is a valid .pptx file.');
  }

  const slides: SlideData[] = [];

  // 2. Parse each slide
  for (let idx = 0; idx < slideFilePaths.length; idx++) {
    const slidePath = slideFilePaths[idx];
    const slideXmlStr = await zip.file(slidePath)?.async('text');
    if (!slideXmlStr) continue;

    // Check for slide relationships (images)
    const relsPath = slidePath.replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels';
    const slideRelsStr = await zip.file(relsPath)?.async('text');
    const mediaMap = new Map<string, string>(); // rId -> media blob url

    if (slideRelsStr) {
      const relsDoc = parser.parseFromString(slideRelsStr, 'application/xml');
      const rels = relsDoc.getElementsByTagName('Relationship');
      for (let r = 0; r < rels.length; r++) {
        const rel = rels[r];
        const rId = rel.getAttribute('Id');
        const target = rel.getAttribute('Target');
        if (rId && target) {
          // target is usually '../media/image1.png'
          const cleanMedia = target.replace(/^\.\.\//, 'ppt/');
          const mediaFile = zip.file(cleanMedia);
          if (mediaFile) {
            try {
              const blob = await mediaFile.async('blob');
              const url = URL.createObjectURL(blob);
              mediaMap.set(rId, url);
            } catch {
              // skip unreadable media
            }
          }
        }
      }
    }

    const slideDoc = parser.parseFromString(slideXmlStr, 'application/xml');

    let title = '';
    let subtitle = '';
    const bullets: string[] = [];
    const elements: SlideElement[] = [];

    // Check shapes
    const shapes = slideDoc.getElementsByTagName('p:sp');
    for (let s = 0; s < shapes.length; s++) {
      const shape = shapes[s];
      const ph = shape.getElementsByTagName('p:ph')[0];
      const phType = ph ? ph.getAttribute('type') : null;

      // Extract all paragraphs in shape
      const paragraphs = shape.getElementsByTagName('a:p');
      let shapeFullText = '';

      for (let p = 0; p < paragraphs.length; p++) {
        const para = paragraphs[p];
        const textRuns = para.getElementsByTagName('a:t');
        let paraText = '';
        for (let t = 0; t < textRuns.length; t++) {
          paraText += textRuns[t].textContent || '';
        }
        paraText = paraText.trim();
        if (paraText) {
          shapeFullText += (shapeFullText ? ' ' : '') + paraText;
          if (phType !== 'title' && phType !== 'ctrTitle' && phType !== 'subTitle') {
            bullets.push(paraText);
          }
        }
      }

      if (shapeFullText) {
        if (phType === 'title' || phType === 'ctrTitle' || (!title && s === 0)) {
          if (!title) {
            title = shapeFullText;
          } else if (!subtitle) {
            subtitle = shapeFullText;
          }
        } else if (phType === 'subTitle' && !subtitle) {
          subtitle = shapeFullText;
        }
      }
    }

    // Check pictures <p:pic>
    const pics = slideDoc.getElementsByTagName('p:pic');
    for (let p = 0; p < pics.length; p++) {
      const pic = pics[p];
      const blip = pic.getElementsByTagName('a:blip')[0];
      const embedId = blip ? (blip.getAttribute('r:embed') || blip.getAttribute('embed')) : null;
      if (embedId && mediaMap.has(embedId)) {
        const imgUrl = mediaMap.get(embedId)!;
        elements.push({
          id: `img-${idx}-${p}`,
          type: 'image',
          src: imgUrl,
        });
      }
    }

    // Default title if none detected
    if (!title) {
      if (bullets.length > 0) {
        title = bullets[0];
        bullets.shift();
      } else {
        title = `Slide ${idx + 1}`;
      }
    }

    slides.push({
      id: `uploaded-slide-${idx + 1}`,
      title,
      subtitle: subtitle || undefined,
      bullets: bullets.slice(0, 8),
      elements: elements.length > 0 ? elements : undefined,
      imageUrl: elements[0]?.src,
      points: 10,
    });
  }

  const deckTitle = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `deck-${Date.now()}`,
    title: deckTitle,
    description: `Uploaded from ${file.name} (${slides.length} slides)`,
    slides,
    sourceType: 'uploaded-pptx',
    fileName: file.name,
  };
}

/**
 * Helper to create presentation from image files (e.g. exported slides)
 */
export function createDeckFromImages(files: File[]): PresentationDeck {
  const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const slides: SlideData[] = sortedFiles.map((file, idx) => {
    const url = URL.createObjectURL(file);
    return {
      id: `img-slide-${idx + 1}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      imageUrl: url,
      points: 10,
    };
  });

  return {
    id: `deck-img-${Date.now()}`,
    title: sortedFiles[0]?.name.replace(/[-_]\d+.*$/, '') || 'Slide Deck',
    description: `${slides.length} image slides`,
    slides,
    sourceType: 'uploaded-images',
  };
}
