import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Award,
  HelpCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { SlideData, PresentationDeck, ThemeMode } from '../types';
import { PptxViewer, getDeckBuffer, registerActiveViewer } from '../utils/pptxEngine';
import { SlideThumbnailPreview } from './SlideThumbnailPreview';

interface SlideViewerProps {
  deck: PresentationDeck;
  slide: SlideData;
  currentIndex: number;
  totalSlides: number;
  direction: number;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onSelectSlide?: (index: number) => void;
  transitionType?: 'slide' | 'fade' | 'zoom';
  theme?: ThemeMode;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  deck,
  slide,
  currentIndex,
  totalSlides,
  onNextSlide,
  onPrevSlide,
  onSelectSlide,
  theme = 'dark',
}) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  const isLight = theme === 'light';

  // Hover state for progress bar slide preview
  const [hoveredProgressSlide, setHoveredProgressSlide] = useState<{ index: number; x: number } | null>(null);

  // References for DOM container and PptxViewer instance
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PptxViewer | null>(null);
  const currentLoadedDeckIdRef = useRef<string | null>(null);

  // Reset answer reveal state on slide change
  useEffect(() => {
    setShowAnswer(false);
  }, [currentIndex, deck.id]);

  // Initialize or update PptxViewer when deck changes
  useEffect(() => {
    let isCancelled = false;

    async function loadPresentation() {
      if (!slideContainerRef.current) return;

      setIsLoading(true);
      setRenderError(null);

      try {
        const buffer = await getDeckBuffer(deck);
        if (isCancelled) return;

        // Clean up previous viewer instance if any
        if (viewerRef.current) {
          try {
            viewerRef.current.destroy();
          } catch (e) {
            console.warn('Error destroying previous viewer:', e);
          }
          viewerRef.current = null;
          registerActiveViewer(null);
        }

        // Clean container DOM
        if (slideContainerRef.current) {
          slideContainerRef.current.innerHTML = '';
        }

        // Instantiate new high-fidelity @aiden0z/pptx-renderer
        const viewer = new PptxViewer(slideContainerRef.current, {
          fitMode: 'contain',
        });

        viewerRef.current = viewer;
        currentLoadedDeckIdRef.current = deck.id;

        // Open presentation in slide mode
        await viewer.open(buffer, { renderMode: 'slide' });
        if (isCancelled) return;

        // Navigate to current slide
        await viewer.goToSlide(currentIndex);

        // Register active viewer for thumbnail previews
        registerActiveViewer(viewer);
      } catch (err: unknown) {
        if (isCancelled) return;
        console.error('Failed to render PPTX with @aiden0z/pptx-renderer:', err);
        setRenderError(
          err instanceof Error ? err.message : 'Failed to render PowerPoint presentation.'
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    // If deck ID changed or viewer hasn't been created yet, perform full load
    if (currentLoadedDeckIdRef.current !== deck.id || !viewerRef.current) {
      loadPresentation();
    } else if (viewerRef.current) {
      // Just change slide if the same deck is already loaded
      viewerRef.current.goToSlide(currentIndex).catch((err) => {
        console.warn('Slide navigation error:', err);
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [deck, deck.id]);

  // Handle slide index changes on an already-mounted deck
  useEffect(() => {
    if (viewerRef.current && currentLoadedDeckIdRef.current === deck.id) {
      viewerRef.current.goToSlide(currentIndex).catch((err) => {
        console.warn('Slide transition error:', err);
      });
    }
  }, [currentIndex, deck.id]);

  // Clean up viewer on unmount
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch {
          // ignore
        }
        viewerRef.current = null;
        registerActiveViewer(null);
      }
    };
  }, []);

  // Compute slide progress percentage
  const progressPercent = totalSlides > 1 ? (currentIndex / (totalSlides - 1)) * 100 : 100;

  return (
    <main
      id="presentation-stage-viewport"
      className="relative flex-1 w-full h-full flex flex-col items-center justify-center p-1 sm:p-2 lg:p-2.5 overflow-hidden select-none"
    >
      {/* Game Stage Screen - Completely Borderless Immersive Canvas */}
      <div
        id="pptx-display-frame"
        className={`group relative flex flex-col rounded-2xl md:rounded-3xl border-0 ring-0 overflow-hidden backdrop-blur-3xl transition-all duration-300 ${
          isLight
            ? 'bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)]'
            : 'bg-[#05070e] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)]'
        }`}
        style={{
          width: 'min(98vw, calc((100vh - 110px) * 16 / 9))',
          height: 'min(calc(100vh - 110px), calc(98vw * 9 / 16))',
          aspectRatio: '16/9',
        }}
      >
        {/* TOP STATUS ISLAND: Category & Points Pill (Borderless Game HUD) */}
        <div className="absolute top-3 inset-x-3 sm:inset-x-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {slide.category && (
              <span className={`px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase backdrop-blur-xl shadow-lg ${
                isLight
                  ? 'bg-cyan-900/90 text-cyan-200'
                  : 'bg-black/70 text-cyan-300'
              }`}>
                {slide.category}
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold backdrop-blur-xl shadow-md ${
              isLight
                ? 'bg-slate-900/80 text-white'
                : 'bg-black/60 text-slate-200'
            }`}>
              ROUND {currentIndex + 1} / {totalSlides}
            </span>
          </div>

          {slide.points !== undefined && slide.points > 0 && (
            <div className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wide backdrop-blur-xl shadow-lg pointer-events-auto ${
              isLight
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-amber-400/25'
            }`}>
              <Award className="w-3.5 h-3.5 text-slate-950" />
              <span>+{slide.points} PTS</span>
            </div>
          )}
        </div>

        {/* PPTX DOM RENDER CONTAINER (Fills available stage area) */}
        <div
          ref={slideContainerRef}
          id="pptx-renderer-canvas-container"
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          style={{ width: '100%', height: '100%' }}
        />

        {/* LOADING INDICATOR */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-md gap-3 ${
                isLight ? 'bg-white/85 text-slate-800' : 'bg-[#07090e]/85 text-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
              </div>
              <p className={`text-xs font-medium tracking-wide ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Rendering PowerPoint Presentation...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR STATE */}
        {renderError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/90 p-6 text-center backdrop-blur-md">
            <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
            <h4 className="text-base font-bold text-white mb-1">Presentation Rendering Error</h4>
            <p className="text-xs text-red-200 max-w-md">{renderError}</p>
          </div>
        )}

        {/* FLOATING PREVIOUS SLIDE NAVIGATION */}
        <div className="absolute inset-y-0 left-2 sm:left-3 flex items-center pointer-events-none z-20">
          <div className="relative pointer-events-auto">
            <button
              id="btn-slide-prev"
              onClick={onPrevSlide}
              disabled={currentIndex === 0}
              aria-label="Previous Slide (Arrow Left)"
              className={`p-2.5 sm:p-3 rounded-full disabled:opacity-0 disabled:pointer-events-none hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 transition-all duration-200 shadow-2xl backdrop-blur-2xl opacity-75 sm:opacity-0 group-hover:opacity-100 ${
                isLight
                  ? 'bg-slate-900/80 hover:bg-slate-900 text-white shadow-slate-900/40'
                  : 'bg-black/60 hover:bg-black/90 text-white shadow-black/80'
              }`}
              title="Previous Slide (Arrow Left)"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* FLOATING NEXT SLIDE NAVIGATION */}
        <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center pointer-events-none z-20">
          <div className="relative pointer-events-auto">
            <button
              id="btn-slide-next"
              onClick={onNextSlide}
              disabled={currentIndex === totalSlides - 1}
              aria-label="Next Slide (Arrow Right or Space)"
              className={`p-2.5 sm:p-3 rounded-full disabled:opacity-0 disabled:pointer-events-none hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 transition-all duration-200 shadow-2xl backdrop-blur-2xl opacity-75 sm:opacity-0 group-hover:opacity-100 ${
                isLight
                  ? 'bg-slate-900/80 hover:bg-slate-900 text-white shadow-slate-900/40'
                  : 'bg-black/60 hover:bg-black/90 text-white shadow-black/80'
              }`}
              title="Next Slide (Arrow Right or Space)"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* INTERACTIVE ANSWER REVEAL ACCORDION (For quiz & duel rounds) */}
        {slide.answer && (
          <div className="absolute bottom-3.5 inset-x-4 z-20 flex flex-col items-center pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center w-full max-w-lg">
              <button
                id="btn-reveal-answer"
                onClick={() => setShowAnswer(!showAnswer)}
                aria-expanded={showAnswer}
                aria-controls="slide-answer-panel"
                aria-label={showAnswer ? 'Hide question answer' : 'Reveal question answer'}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/15 text-white text-xs font-semibold transition-all shadow-xl backdrop-blur-2xl active:scale-95 hover:border-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
              >
                {showAnswer ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hide Answer</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reveal Answer</span>
                  </>
                )}
                <span className="text-[10px] text-slate-400 border-l border-white/10 pl-2 ml-1 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  Quiz Mode
                </span>
              </button>

              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    id="slide-answer-panel"
                    role="region"
                    aria-label="Revealed Answer"
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                    className="mt-2 w-full p-3.5 bg-black/90 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-2xl text-center"
                  >
                    {slide.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* BOTTOM INTERACTIVE PROGRESS TRACK WITH HOVER SLIDE PREVIEWS */}
        <div
          id="slide-progress-bar-container"
          role="progressbar"
          aria-label="Slide progression"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSlides}
          tabIndex={0}
          className="absolute bottom-0 inset-x-0 h-1.5 sm:h-2 bg-white/10 z-20 cursor-pointer group/progress focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const targetIndex = Math.min(totalSlides - 1, Math.floor(ratio * totalSlides));
            setHoveredProgressSlide({ index: targetIndex, x: e.clientX - rect.left });
          }}
          onMouseLeave={() => setHoveredProgressSlide(null)}
          onClick={(e) => {
            if (onSelectSlide) {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const targetIndex = Math.min(totalSlides - 1, Math.floor(ratio * totalSlides));
              onSelectSlide(targetIndex);
            }
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Hover Slide Preview Tooltip */}
          {hoveredProgressSlide && (
            <div
              className="absolute bottom-3 -translate-x-1/2 w-44 sm:w-52 p-2 rounded-2xl bg-[#080c18]/95 border border-white/20 shadow-2xl backdrop-blur-2xl z-40 pointer-events-none"
              style={{
                left: `${Math.max(100, Math.min(window.innerWidth - 100, hoveredProgressSlide.x))}px`,
              }}
            >
              <div className="text-[10px] font-mono text-cyan-300 font-bold mb-1 flex items-center justify-between">
                <span>SLIDE {hoveredProgressSlide.index + 1} OF {totalSlides}</span>
              </div>
              <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/10 mb-1 shadow-inner">
                <SlideThumbnailPreview
                  deck={deck}
                  slide={deck.slides[hoveredProgressSlide.index]}
                  slideIndex={hoveredProgressSlide.index}
                  width={200}
                  height={112}
                />
              </div>
              <p className="text-[11px] font-bold text-white truncate">
                {deck.slides[hoveredProgressSlide.index]?.title}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
