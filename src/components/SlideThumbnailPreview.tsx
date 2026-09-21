import React, { useEffect, useRef, useState } from 'react';
import { SlideData, PresentationDeck } from '../types';
import { getActiveViewer, onActiveViewerChange } from '../utils/pptxEngine';
import { Award, FileText } from 'lucide-react';

interface SlideThumbnailPreviewProps {
  deck: PresentationDeck;
  slide: SlideData;
  slideIndex: number;
  className?: string;
  width?: number;
  height?: number;
}

export const SlideThumbnailPreview: React.FC<SlideThumbnailPreviewProps> = ({
  deck,
  slide,
  slideIndex,
  className = '',
  width = 192,
  height = 108,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedNative, setRenderedNative] = useState<boolean>(false);

  useEffect(() => {
    let disposeThumbnail: (() => void) | null = null;
    let isCancelled = false;

    function attemptRender(viewer: ReturnType<typeof getActiveViewer>) {
      if (!viewer || !containerRef.current) return;

      try {
        // Clean any previous thumbnail DOM
        containerRef.current.innerHTML = '';

        const thumb = viewer.renderThumbnailToContainer(slideIndex, containerRef.current, {
          width,
          height,
        });

        if (thumb && !isCancelled) {
          disposeThumbnail = thumb.dispose;
          setRenderedNative(true);
        }
      } catch (err) {
        console.warn('Thumbnail render attempt error:', err);
      }
    }

    const currentViewer = getActiveViewer();
    if (currentViewer) {
      attemptRender(currentViewer);
    }

    const unsubscribe = onActiveViewerChange((v) => {
      if (!isCancelled) {
        attemptRender(v);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
      if (disposeThumbnail) {
        try {
          disposeThumbnail();
        } catch {
          // ignore
        }
      }
    };
  }, [deck.id, slideIndex, width, height]);

  return (
    <div
      className={`relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#070b14] border border-white/10 shadow-md select-none flex items-center justify-center ${className}`}
    >
      {/* Native PPTX Renderer Container */}
      <div
        ref={containerRef}
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
          renderedNative ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        }`}
      />

      {/* Styled High-Fidelity Miniature Slide Preview (Visible immediately & as fallback) */}
      <div className="absolute inset-0 p-2 sm:p-2.5 flex flex-col justify-between bg-gradient-to-br from-[#0c1222] via-[#090d1a] to-[#060913] pointer-events-none">
        {/* Top Header Row: Category & Points */}
        <div className="flex items-center justify-between gap-1">
          {slide.category ? (
            <span className="text-[8px] font-bold text-cyan-300 uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 truncate max-w-[65%]">
              {slide.category}
            </span>
          ) : (
            <span className="text-[8px] font-mono text-slate-400 flex items-center gap-1">
              <FileText className="w-2.5 h-2.5 text-cyan-400" />
              Slide {slideIndex + 1}
            </span>
          )}

          {slide.points !== undefined && slide.points > 0 && (
            <span className="text-[8px] font-bold text-amber-300 px-1 py-0.2 rounded bg-amber-950/60 border border-amber-500/30 flex items-center gap-0.5 shrink-0">
              <Award className="w-2 h-2 text-amber-400" />
              +{slide.points}
            </span>
          )}
        </div>

        {/* Center: Slide Title & Body Lines */}
        <div className="my-auto py-1">
          <h4 className="text-[10px] sm:text-[11px] font-bold text-white line-clamp-2 leading-tight">
            {slide.title}
          </h4>
          {slide.subtitle && (
            <p className="text-[8px] text-slate-400 line-clamp-1 mt-0.5 leading-none">
              {slide.subtitle}
            </p>
          )}

          {/* Miniature bullet line indicators */}
          {slide.bullets && slide.bullets.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {slide.bullets.slice(0, 2).map((_, bIdx) => (
                <div key={bIdx} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-cyan-400/80 shrink-0" />
                  <div
                    className="h-1 bg-white/20 rounded-full"
                    style={{ width: bIdx === 0 ? '75%' : '55%' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Slide Info */}
        <div className="flex items-center justify-between text-[7px] text-slate-400 pt-0.5 border-t border-white/5">
          <span className="font-mono">#{slideIndex + 1}</span>
          {slide.answer && (
            <span className="text-emerald-400 font-medium">Has Answer</span>
          )}
        </div>
      </div>
    </div>
  );
};
