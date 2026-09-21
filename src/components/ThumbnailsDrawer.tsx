import React, { useEffect, useRef } from 'react';
import { X, Play, Award, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { SlideData, PresentationDeck, ThemeMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { SlideThumbnailPreview } from './SlideThumbnailPreview';

interface ThumbnailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deck: PresentationDeck;
  slides: SlideData[];
  currentIndex: number;
  theme?: ThemeMode;
  onSelectSlide: (index: number) => void;
}

export const ThumbnailsDrawer: React.FC<ThumbnailsDrawerProps> = ({
  isOpen,
  onClose,
  deck,
  slides,
  currentIndex,
  theme = 'light',
  onSelectSlide,
}) => {
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  // Scroll active thumbnail into view when drawer opens or current slide changes
  useEffect(() => {
    if (isOpen && activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [isOpen, currentIndex]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 backdrop-blur-md z-40 ${
              isLight ? 'bg-slate-900/40' : 'bg-black/70'
            }`}
          />

          {/* iOS 26 Slide-Over Bottom Sheet with Slide Previews */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`fixed bottom-0 inset-x-0 p-3 sm:p-4 z-50 max-h-[60vh] sm:max-h-[55vh] flex flex-col shadow-2xl backdrop-blur-3xl rounded-t-3xl ring-1 ${
              isLight
                ? 'bg-white/95 border-t border-slate-200 text-slate-800 shadow-slate-400/20 ring-black/5'
                : 'bg-[#080c18]/95 border-t border-white/12 text-white shadow-black/80 ring-white/10'
            }`}
          >
            {/* Grab Handle */}
            <div className={`w-12 h-1 rounded-full mx-auto mb-2.5 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />

            {/* Header bar */}
            <div className={`flex items-center justify-between pb-2.5 mb-2 border-b px-1 ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs sm:text-sm font-bold tracking-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      Slide Navigator
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isLight
                        ? 'text-cyan-800 bg-cyan-100 border-cyan-300'
                        : 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30'
                    }`}>
                      Slide {currentIndex + 1} of {slides.length}
                    </span>
                  </div>
                  <p className={`text-[11px] hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Click any slide preview to jump directly to it
                  </p>
                </div>
              </div>

              {/* Quick prev / next buttons + Close */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleScrollLeft}
                  className={`p-1.5 rounded-full transition-all border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border-white/5'
                  }`}
                  title="Scroll thumbnails left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleScrollRight}
                  className={`p-1.5 rounded-full transition-all border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border-white/5'
                  }`}
                  title="Scroll thumbnails right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className={`p-1.5 ml-1 rounded-full transition-all border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border-white/10'
                  }`}
                  title="Close Slide Navigator"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Previews Carousel */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-3.5 py-2 px-1 scroll-smooth"
            >
              {slides.map((s, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={s.id || idx}
                    ref={isActive ? activeThumbRef : null}
                    onClick={() => {
                      onSelectSlide(idx);
                      onClose();
                    }}
                    className={`flex-shrink-0 w-52 sm:w-60 rounded-2xl border p-2 text-left flex flex-col gap-2 transition-all duration-200 group relative overflow-hidden focus:outline-none ${
                      isActive
                        ? isLight
                          ? 'border-cyan-500 bg-cyan-50/80 ring-2 ring-cyan-500/30 shadow-md scale-[1.02]'
                          : 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/50 shadow-xl shadow-cyan-950/60 scale-[1.02]'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    {/* Realistic Rendered Slide Preview */}
                    <div className="w-full relative shadow-md rounded-lg overflow-hidden group-hover:shadow-cyan-500/10 transition-shadow aspect-[16/9] bg-black/10">
                      <SlideThumbnailPreview deck={deck} slide={s} slideIndex={idx} width={240} height={135} />
                      
                      {/* Active Indicator Overlay */}
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] shadow-sm">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Live</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div className="flex items-center justify-between text-[11px] gap-1 px-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                          isActive
                            ? isLight
                              ? 'bg-cyan-600 text-white'
                              : 'bg-cyan-500 text-slate-950'
                            : isLight
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-white/10 text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className={`font-semibold truncate max-w-[130px] sm:max-w-[150px] ${
                          isActive
                            ? isLight
                              ? 'text-cyan-900 font-bold'
                              : 'text-cyan-200 font-bold'
                            : isLight
                              ? 'text-slate-700 group-hover:text-slate-900'
                              : 'text-slate-300 group-hover:text-white'
                        }`}>
                          {s.title || `Slide ${idx + 1}`}
                        </span>
                      </div>

                      {s.points && (
                        <span className={`font-mono text-[10px] font-bold flex items-center gap-0.5 shrink-0 ${
                          isLight ? 'text-amber-700' : 'text-amber-400'
                        }`}>
                          <Award className="w-2.5 h-2.5" />
                          {s.points}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
