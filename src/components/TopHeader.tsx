import React, { useRef } from 'react';
import {
  Upload,
  Download,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Keyboard,
  Layers,
  ChevronDown,
  Sparkles,
  Users,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import { PresentationDeck, ParticipantMode, ThemeMode } from '../types';
import { downloadDeckAsPptx } from '../utils/pptxEngine';

interface TopHeaderProps {
  currentDeck: PresentationDeck;
  availableDecks: PresentationDeck[];
  onSelectDeck: (deckId: string) => void;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenShortcuts: () => void;
  onOpenThumbnails: () => void;
  onOpenSetup?: () => void;
  participantMode?: ParticipantMode;
  participantCount?: number;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  currentSlideIndex: number;
  totalSlides: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentDeck,
  availableDecks,
  onSelectDeck,
  onFileUpload,
  isUploading,
  isFullscreen,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
  onOpenShortcuts,
  onOpenThumbnails,
  onOpenSetup,
  participantMode = 'teams',
  participantCount = 2,
  theme = 'light',
  onToggleTheme,
  currentSlideIndex,
  totalSlides,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === 'light';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    try {
      await downloadDeckAsPptx(currentDeck);
    } catch (err) {
      console.error('Failed to export presentation:', err);
    }
  };

  return (
    <header
      id="top-header"
      className="relative z-30 w-full px-2 sm:px-4 lg:px-6 pt-2 pb-1 flex justify-center items-center shrink-0"
    >
      {/* ox.lol Inspired Floating Capsule Header */}
      <div className={`w-full max-w-[98vw] 2xl:max-w-[99vw] rounded-2xl sm:rounded-full px-2.5 sm:px-4 py-1.5 backdrop-blur-2xl flex items-center justify-between gap-1.5 sm:gap-3 transition-all border ${
        isLight
          ? 'bg-white/80 border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-[#161715]'
          : 'bg-[#161715]/85 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-[#f7f7f5]'
      }`}>
        
        {/* LEFT: OX LOGO MARK & DECK SELECTOR */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
          <div className="flex items-center gap-2">
            {/* Signature OX Inverted Logo Mark */}
            <div className={`grid size-7 sm:size-8 shrink-0 place-items-center rounded-xl font-black text-xs sm:text-sm tracking-tighter shadow-md transition-transform hover:scale-105 ${
              isLight ? 'bg-[#161715] text-[#f7f6f2]' : 'bg-[#f7f7f5] text-[#131512]'
            }`}>
              OX
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <div className={`text-xs font-bold tracking-[-0.03em] ${
                isLight ? 'text-[#161715]' : 'text-white'
              }`}>
                PPT QUIZ
              </div>
              {/* Electric Lime Live Status Indicator */}
              <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-semibold tracking-[0.16em] px-2 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-lime-500/10 border-lime-500/30 text-lime-800'
                  : 'bg-lime-400/10 border-lime-400/20 text-lime-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 dark:bg-lime-400 animate-pulse" />
                LIVE
              </span>
            </div>
          </div>

          {/* Segmented Deck Switcher */}
          <div className="relative min-w-0">
            <select
              value={currentDeck.id}
              onChange={(e) => onSelectDeck(e.target.value)}
              className={`appearance-none rounded-full text-[11px] sm:text-xs font-medium pl-3 pr-7 sm:pr-8 py-1 focus:outline-none focus:ring-1 focus:ring-lime-500 cursor-pointer max-w-[100px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-[220px] truncate backdrop-blur-xl transition-all border ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/5 text-[#161715]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
              title="Switch presentation deck"
            >
              {availableDecks.map((d) => (
                <option key={d.id} value={d.id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#161715] text-white'}>
                  {d.title} ({d.slides.length} slides)
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`} />
          </div>
        </div>

        {/* CENTER: SLIDE NAVIGATOR & TEAMS/MEMBERS CAPSULE */}
        <div className="flex items-center justify-center gap-1.5 shrink-0">
          <button
            id="btn-open-thumbnails"
            onClick={onOpenThumbnails}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full transition-all backdrop-blur-xl group active:scale-95 border ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 border-black/5 text-[#161715]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
            }`}
            title="Browse all slide thumbnails & previews (or press S)"
          >
            <Layers className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${
              isLight ? 'text-lime-600' : 'text-lime-400'
            }`} />
            <span className="font-mono text-[10px] sm:text-[11px] tracking-tight font-bold">
              <span className="hidden sm:inline">SLIDE </span>
              {String(currentSlideIndex + 1).padStart(2, '0')}/{String(totalSlides).padStart(2, '0')}
            </span>
            <span className={`hidden md:inline text-[9px] uppercase tracking-[0.14em] font-semibold pl-1 border-l ${
              isLight ? 'text-slate-400 border-black/10' : 'text-slate-500 border-white/10'
            }`}>
              MAP
            </span>
          </button>

          {onOpenSetup && (
            <button
              id="btn-header-setup-teams"
              onClick={onOpenSetup}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all backdrop-blur-xl active:scale-95 text-xs font-medium ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/5 text-[#161715]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 hover:text-white'
              }`}
              title="Configure Teams or Individual Members"
            >
              {participantMode === 'teams' ? (
                <Users className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
              ) : (
                <User className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
              )}
              <span className="text-[10px] sm:text-[11px] font-mono font-medium">
                {participantCount} {participantMode === 'teams' ? 'Teams' : 'Members'}
              </span>
            </button>
          )}
        </div>

        {/* RIGHT: ACTIONS (UPLOAD, EXPORT, THEME TOGGLE, SOUND, SHORTCUTS, FULLSCREEN) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Dark / Light Mode Toggle Button */}
          {onToggleTheme && (
            <button
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              className={`p-1.5 sm:p-2 rounded-full border text-xs transition-all backdrop-blur-xl active:scale-95 ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-300'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* File Upload Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileChange}
            className="hidden"
            id="ppt-file-upload-input"
          />

          {/* OX Signature High-Contrast Action Button */}
          <button
            id="btn-upload-ppt"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full active:scale-95 text-xs font-bold transition-all disabled:opacity-50 shadow-sm border ${
              isLight
                ? 'bg-[#161715] text-[#f7f6f2] hover:bg-black/85 border-transparent'
                : 'bg-[#f7f7f5] text-[#131512] hover:bg-white/90 border-transparent'
            }`}
            title="Upload any PowerPoint (.pptx) file directly from your device"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden md:inline">
              {isUploading ? 'Loading...' : 'Upload PPTX'}
            </span>
            <span className="hidden xs:inline md:hidden">Upload</span>
          </button>

          {/* Download / Export current deck */}
          <button
            id="btn-download-pptx"
            onClick={handleDownload}
            className={`p-1.5 sm:p-2 rounded-full border text-xs transition-all backdrop-blur-xl ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Download active presentation as a genuine .pptx file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Audio toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className={`p-1.5 sm:p-2 rounded-full border text-xs transition-all backdrop-blur-xl ${
              soundEnabled
                ? isLight
                  ? 'bg-lime-500/10 border-lime-500/30 text-lime-800'
                  : 'bg-lime-400/10 border-lime-400/20 text-lime-400'
                : isLight
                  ? 'bg-black/5 border-black/5 text-slate-400'
                  : 'bg-white/5 border-white/10 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Shortcuts cheatsheet */}
          <button
            id="btn-keyboard-shortcuts"
            onClick={onOpenShortcuts}
            className={`p-1.5 sm:p-2 rounded-full border text-xs transition-all backdrop-blur-xl ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="View keyboard shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            id="btn-fullscreen-toggle"
            onClick={onToggleFullscreen}
            className={`p-1.5 sm:p-2 rounded-full border text-xs transition-all backdrop-blur-xl ${
              isFullscreen
                ? isLight
                  ? 'bg-black/10 border-black/10 text-[#161715] font-bold'
                  : 'bg-white/15 border-white/20 text-white font-bold'
                : isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

        </div>

      </div>
    </header>
  );
};
