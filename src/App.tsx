import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PresentationDeck, ScoreHistoryItem, Participant, ParticipantMode, ThemeMode, ScoreJumpEvent } from './types';
import { DEFAULT_DECKS } from './data/defaultDecks';
import {
  getSavedGameSetup,
  saveGameSetup,
  resetAllScores,
  getSavedHistory,
  saveHistory,
  getSavedSlideIndex,
  saveSlideIndex,
  getSavedDeckId,
  saveDeckId,
  getSavedThemeMode,
  saveThemeMode,
  getRandomEmoji,
} from './utils/storage';
import { savePptxToDb, getPptxFromDb } from './utils/db';
import { soundEffects } from './utils/audio';
import { parseUploadedPptx, parseZip, buildPresentation } from './utils/pptxEngine';
import { TopHeader } from './components/TopHeader';
import { SlideViewer } from './components/SlideViewer';
import { BottomScoreBar } from './components/BottomScoreBar';
import { ScoreJumpOverlay } from './components/ScoreJumpOverlay';
import { ThumbnailsDrawer } from './components/ThumbnailsDrawer';
import { WinnerModal } from './components/WinnerModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { TeamSetupModal } from './components/TeamSetupModal';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  // --- Persistent Participant & Game Mode States ---
  const [initialSetup] = useState(() => getSavedGameSetup());
  const [gameMode, setGameMode] = useState<ParticipantMode>(initialSetup.mode);
  const [participants, setParticipants] = useState<Participant[]>(initialSetup.participants);
  const [hasConfiguredTeams, setHasConfiguredTeams] = useState<boolean>(initialSetup.hasConfigured);
  
  // Ask user for Team or Members setup when the website loads
  const [isTeamSetupOpen, setIsTeamSetupOpen] = useState<boolean>(() => {
    try {
      const promptedSession = sessionStorage.getItem('ppt_prompted_session_v2');
      if (!promptedSession) {
        sessionStorage.setItem('ppt_prompted_session_v2', 'true');
        return true;
      }
      return !initialSetup.hasConfigured;
    } catch {
      return true;
    }
  });

  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryItem[]>(() => getSavedHistory());

  // --- Theme Mode State (Default to Dark Mode) ---
  const [theme, setTheme] = useState<ThemeMode>(() => getSavedThemeMode());

  // Synchronize document theme class and localStorage
  useEffect(() => {
    saveThemeMode(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    soundEffects.playSlideClick();
  }, []);

  // --- Decks & Slides ---
  const [customDeck, setCustomDeck] = useState<PresentationDeck | null>(null);
  const allDecks: PresentationDeck[] = customDeck ? [...DEFAULT_DECKS, customDeck] : DEFAULT_DECKS;

  const [currentDeckId, setCurrentDeckId] = useState<string>(() => {
    const savedId = getSavedDeckId();
    const exists = allDecks.some((d) => d.id === savedId);
    return exists ? savedId : DEFAULT_DECKS[0].id;
  });

  const activeDeck = allDecks.find((d) => d.id === currentDeckId) || DEFAULT_DECKS[0];

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(() => {
    const saved = getSavedSlideIndex();
    return saved >= 0 && saved < activeDeck.slides.length ? saved : 0;
  });

  const [slideDirection, setSlideDirection] = useState<number>(1);

  // --- UI States ---
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState<boolean>(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [lastAddedParticipantId, setLastAddedParticipantId] = useState<string | null>(null);
  const [scoreJumpEvents, setScoreJumpEvents] = useState<ScoreJumpEvent[]>([]);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    canUndo?: boolean;
    prevScores?: Array<{ id: string; score: number }>;
  } | null>(null);

  const appContainerRef = useRef<HTMLDivElement>(null);

  // Restore uploaded PPTX from IndexedDB on startup
  useEffect(() => {
    async function restoreUploadedPptx() {
      try {
        const stored = await getPptxFromDb();
        if (stored && stored.buffer) {
          const zip = await parseZip(stored.buffer);
          const presentation = await buildPresentation(zip);
          const slideCount = presentation.slides.length;
          const slides = Array.from({ length: slideCount }, (_, i) => ({
            id: `stored-slide-${i + 1}`,
            title: `Slide ${i + 1}`,
            points: 10,
          }));
          const restoredDeck: PresentationDeck = {
            id: 'deck-stored-uploaded',
            title: stored.deckTitle || stored.fileName.replace(/\.[^/.]+$/, ''),
            description: `PowerPoint Presentation (${slideCount} slides)`,
            slides,
            sourceType: 'uploaded-pptx',
            fileName: stored.fileName,
            rawPptxBuffer: stored.buffer,
          };
          setCustomDeck(restoredDeck);
          const savedId = getSavedDeckId();
          if (savedId === 'deck-stored-uploaded' || savedId.startsWith('deck-')) {
            setCurrentDeckId(restoredDeck.id);
          }
        }
      } catch (err) {
        console.warn('Could not restore stored presentation from IndexedDB:', err);
      }
    }
    restoreUploadedPptx();
  }, []);

  // Sync audio mute state
  useEffect(() => {
    soundEffects.enabled = soundEnabled;
  }, [soundEnabled]);

  // Persist game setup (mode, participants)
  useEffect(() => {
    saveGameSetup(gameMode, participants, hasConfiguredTeams);
  }, [gameMode, participants, hasConfiguredTeams]);

  // Persist score history
  useEffect(() => {
    saveHistory(scoreHistory);
  }, [scoreHistory]);

  // Persist slide index
  useEffect(() => {
    saveSlideIndex(currentSlideIndex);
  }, [currentSlideIndex]);

  // Persist active deck id
  useEffect(() => {
    saveDeckId(currentDeckId);
  }, [currentDeckId]);

  // --- Score Handlers ---
  const handleAddScore = useCallback((index: number, delta = 10) => {
    setParticipants((prev) => {
      if (!prev[index]) return prev;
      const updated = [...prev];
      const target = updated[index];
      const newScore = Math.max(0, target.score + delta);
      updated[index] = { ...target, score: newScore };

      if (delta > 0) {
        soundEffects.playParticipant(index);

        // Trigger slide center jumping score animation
        const jumpId = `jump-${target.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const fallbackName = gameMode === 'teams' ? `Team ${String.fromCharCode(65 + index)}` : `Member ${index + 1}`;
        const newJump: ScoreJumpEvent = {
          id: jumpId,
          participantId: target.id,
          participantName: target.name || fallbackName,
          avatarEmoji: target.avatarEmoji || '🦊',
          color: target.color || 'cyan',
          delta,
          newScore,
          timestamp: Date.now(),
        };

        setScoreJumpEvents((prev) => [...prev.slice(-2), newJump]);
        setTimeout(() => {
          setScoreJumpEvents((prev) => prev.filter((ev) => ev.id !== jumpId));
        }, 1600);
      }
      setLastAddedParticipantId(target.id);

      setScoreHistory((h) => [
        ...h,
        {
          id: `h-${Date.now()}`,
          participantId: target.id,
          participantName: target.name,
          delta,
          newScore,
          timestamp: Date.now(),
          slideNumber: currentSlideIndex + 1,
        },
      ]);

      return updated;
    });

    setTimeout(() => setLastAddedParticipantId(null), 700);
  }, [currentSlideIndex]);

  const handleUpdateParticipantName = (index: number, newName: string) => {
    setParticipants((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], name: newName };
      }
      return next;
    });
  };

  const handleRandomizeParticipantEmoji = (index: number) => {
    setParticipants((prev) => {
      const next = [...prev];
      if (next[index]) {
        const currentEmojis = next.map((p) => p.avatarEmoji);
        const newEmoji = getRandomEmoji(currentEmojis);
        next[index] = { ...next[index], avatarEmoji: newEmoji };
        soundEffects.playSlideClick();
      }
      return next;
    });
  };

  const handleSaveGameSetup = (newMode: ParticipantMode, newParticipants: Participant[]) => {
    setGameMode(newMode);
    setParticipants(newParticipants);
    setHasConfiguredTeams(true);
    saveGameSetup(newMode, newParticipants, true);
    soundEffects.playSlideClick();
    setUploadSuccess(`Configured ${newParticipants.length} ${newMode === 'teams' ? 'teams' : 'members'}!`);
    setTimeout(() => setUploadSuccess(null), 3500);
  };

  const handleResetScores = useCallback(() => {
    const prevScores = participants.map((p) => ({ id: p.id, score: p.score }));
    soundEffects.playReset();
    const reset = resetAllScores(participants);
    const updated = reset.map((p, idx) => {
      if (gameMode === 'teams') {
        return {
          ...p,
          name: `Team ${String.fromCharCode(65 + idx)}`,
        };
      }
      return p;
    });
    setParticipants(updated);
    setScoreHistory([]);

    setToastMessage({
      text: gameMode === 'teams'
        ? `Scores reset to 0 and team names reset to Team A, Team B...`
        : `Scores reset to 0 for all ${participants.length} members.`,
      canUndo: true,
      prevScores,
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  }, [participants, gameMode]);

  const handleUndoReset = () => {
    if (toastMessage?.prevScores) {
      const scoreMap = new Map(toastMessage.prevScores.map((s) => [s.id, s.score]));
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          score: scoreMap.get(p.id) ?? p.score,
        }))
      );
      setToastMessage(null);
    }
  };

  // --- Slide Navigation Handlers ---
  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < activeDeck.slides.length - 1) {
      setSlideDirection(1);
      setCurrentSlideIndex((prev) => prev + 1);
      soundEffects.playSlideClick();
    }
  }, [currentSlideIndex, activeDeck.slides.length]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setSlideDirection(-1);
      setCurrentSlideIndex((prev) => prev - 1);
      soundEffects.playSlideClick();
    }
  }, [currentSlideIndex]);

  const handleSelectSlide = (index: number) => {
    setSlideDirection(index >= currentSlideIndex ? 1 : -1);
    setCurrentSlideIndex(index);
    soundEffects.playSlideClick();
  };

  // --- Deck Selection ---
  const handleSelectDeck = (deckId: string) => {
    setCurrentDeckId(deckId);
    setCurrentSlideIndex(0);
  };

  // --- File Upload Handling (.pptx with @aiden0z/pptx-renderer) ---
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.pptx') && !fileName.endsWith('.ppt')) {
        throw new Error('Please upload a Microsoft PowerPoint (.pptx) file.');
      }

      if (fileName.endsWith('.ppt')) {
        throw new Error(
          'Legacy binary .ppt file detected. Please open and save your presentation as modern .pptx in PowerPoint before uploading.'
        );
      }

      // Parse with @aiden0z/pptx-renderer
      const { deck, rawBuffer } = await parseUploadedPptx(file);

      // Save to IndexedDB for persistent reload
      await savePptxToDb({
        fileName: file.name,
        deckTitle: deck.title,
        buffer: rawBuffer,
        slideCount: deck.slides.length,
        uploadedAt: Date.now(),
      });

      setCustomDeck(deck);
      setCurrentDeckId(deck.id);
      setCurrentSlideIndex(0);
      setUploadSuccess(`Loaded "${deck.title}" (${deck.slides.length} slides) with full MS PowerPoint fidelity!`);
      setTimeout(() => setUploadSuccess(null), 4500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse PowerPoint file.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Drag and Drop PPTX files ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // --- Fullscreen Handling ---
  const handleToggleFullscreen = () => {
    const elem = appContainerRef.current || document.documentElement;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // --- Global Keyboard Event Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key;

      // Number keys 1..9 for participants 0..8
      if (/^[1-9]$/.test(key)) {
        const idx = parseInt(key, 10) - 1;
        if (participants[idx]) {
          e.preventDefault();
          handleAddScore(idx, 10);
        }
      }
      // Letters A, B, C, D for participants 0..3 (especially for teams)
      else if (['a', 'b', 'c', 'd'].includes(key.toLowerCase())) {
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
        const idx = map[key.toLowerCase()];
        if (participants[idx]) {
          e.preventDefault();
          handleAddScore(idx, 10);
        }
      }
      // Winner Modal: W or w
      else if (key === 'w' || key === 'W') {
        e.preventDefault();
        setIsWinnerModalOpen(true);
      }
      // Teams / Member Setup: T or t
      else if (key === 't' || key === 'T') {
        e.preventDefault();
        setIsTeamSetupOpen(true);
      }
      // Slide Next: Right Arrow or Space or PageDown
      else if (key === 'ArrowRight' || key === ' ' || key === 'PageDown') {
        e.preventDefault();
        handleNextSlide();
      }
      // Slide Prev: Left Arrow or Backspace or PageUp
      else if (key === 'ArrowLeft' || key === 'Backspace' || key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      }
      // Fullscreen: F or f
      else if (key === 'f' || key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      }
      // Reset scores: R or r
      else if (key === 'r' || key === 'R') {
        e.preventDefault();
        handleResetScores();
      }
      // Sound mute toggle: M or m
      else if (key === 'm' || key === 'M') {
        e.preventDefault();
        setSoundEnabled((prev) => !prev);
      }
      // Help / Shortcuts: ?
      else if (key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      // Close open modals on Escape
      else if (key === 'Escape') {
        if (isThumbnailsOpen) setIsThumbnailsOpen(false);
        if (isWinnerModalOpen) setIsWinnerModalOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (isTeamSetupOpen && hasConfiguredTeams) setIsTeamSetupOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    participants,
    handleAddScore,
    handleNextSlide,
    handlePrevSlide,
    handleResetScores,
    isThumbnailsOpen,
    isWinnerModalOpen,
    isShortcutsOpen,
    isTeamSetupOpen,
    hasConfiguredTeams,
  ]);

  const currentSlide = activeDeck.slides[currentSlideIndex] || activeDeck.slides[0];

  return (
    <div
      ref={appContainerRef}
      id="ppt-player-app"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col h-screen w-screen overflow-hidden select-none antialiased transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-slate-100 text-slate-800'
          : 'bg-[#05070e] text-slate-100'
      }`}
    >
      {/* iOS 26 Ambient Spatial Lighting Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[130px] transition-colors duration-500 ${
          theme === 'light' ? 'bg-cyan-400/20' : 'bg-blue-600/10'
        }`} />
        <div className={`absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full blur-[130px] transition-colors duration-500 ${
          theme === 'light' ? 'bg-amber-300/25' : 'bg-rose-600/10'
        }`} />
      </div>

      {/* Drag & Drop Visual Backdrop */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 border-4 border-dashed border-cyan-400/80 backdrop-blur-xl">
          <div className="p-6 rounded-3xl bg-[#080d1a] border border-cyan-500/40 text-center shadow-2xl">
            <h3 className="text-xl font-black text-white mb-1">Drop PowerPoint Presentation (.pptx)</h3>
            <p className="text-xs text-cyan-300">Renders immediately with native MS PowerPoint fidelity</p>
          </div>
        </div>
      )}

      {/* Top Header Island */}
      <TopHeader
        currentDeck={activeDeck}
        availableDecks={allDecks}
        onSelectDeck={handleSelectDeck}
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenThumbnails={() => setIsThumbnailsOpen(true)}
        onOpenSetup={() => setIsTeamSetupOpen(true)}
        participantMode={gameMode}
        participantCount={participants.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentSlideIndex={currentSlideIndex}
        totalSlides={activeDeck.slides.length}
      />

      {/* Alerts / Feedback Toasts */}
      {uploadError && (
        <div className="absolute top-16 inset-x-4 z-40 max-w-md mx-auto bg-rose-950/90 border border-rose-500/50 p-3 rounded-2xl flex items-center justify-between text-rose-200 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-rose-300 hover:text-white ml-2 font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="absolute top-16 inset-x-4 z-40 max-w-md mx-auto bg-emerald-950/90 border border-emerald-500/50 p-3 rounded-2xl flex items-center justify-between text-emerald-200 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button
            onClick={() => setUploadSuccess(null)}
            className="text-emerald-300 hover:text-white ml-2 font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Slide Presentation Stage with @aiden0z/pptx-renderer */}
      <SlideViewer
        deck={activeDeck}
        slide={currentSlide}
        currentIndex={currentSlideIndex}
        totalSlides={activeDeck.slides.length}
        direction={slideDirection}
        onNextSlide={handleNextSlide}
        onPrevSlide={handlePrevSlide}
        onSelectSlide={handleSelectSlide}
        theme={theme}
      />

      {/* Floating Dynamic Score Jump Animation (Bottom to Top via Center of Slide) */}
      <ScoreJumpOverlay events={scoreJumpEvents} theme={theme} />

      {/* iOS 26 Floating Dynamic Bottom Score Dock */}
      <BottomScoreBar
        participants={participants}
        mode={gameMode}
        theme={theme}
        onAddScore={handleAddScore}
        onUpdateParticipantName={handleUpdateParticipantName}
        onRandomizeParticipantEmoji={handleRandomizeParticipantEmoji}
        onResetGame={handleResetScores}
        onDeclareWinner={() => setIsWinnerModalOpen(true)}
        onOpenSetup={() => setIsTeamSetupOpen(true)}
        lastAddedParticipantId={lastAddedParticipantId}
      />

      {/* Undo Reset Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 border ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/50'
            : 'bg-[#0c101c]/95 border-white/15 text-slate-200 shadow-black/80'
        }`}>
          <span>{toastMessage.text}</span>
          {toastMessage.canUndo && (
            <button
              onClick={handleUndoReset}
              className={`flex items-center gap-1 font-bold underline transition-colors ${
                theme === 'light' ? 'text-cyan-700 hover:text-cyan-800' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              Undo
            </button>
          )}
        </div>
      )}

      {/* Slide Thumbnails Drawer with live previews */}
      <ThumbnailsDrawer
        isOpen={isThumbnailsOpen}
        onClose={() => setIsThumbnailsOpen(false)}
        deck={activeDeck}
        slides={activeDeck.slides}
        currentIndex={currentSlideIndex}
        onSelectSlide={handleSelectSlide}
        theme={theme}
      />

      {/* Team / Members Initial Prompt & Setup Modal */}
      <TeamSetupModal
        isOpen={isTeamSetupOpen}
        onClose={() => setIsTeamSetupOpen(false)}
        onSave={handleSaveGameSetup}
        currentMode={gameMode}
        currentParticipants={participants}
        theme={theme}
        isInitialPrompt={!hasConfiguredTeams}
      />

      {/* Winner Celebration Dialog */}
      <WinnerModal
        isOpen={isWinnerModalOpen}
        onClose={() => setIsWinnerModalOpen(false)}
        participants={participants}
        mode={gameMode}
        theme={theme}
        onResetGame={handleResetScores}
        onOpenSetup={() => setIsTeamSetupOpen(true)}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        theme={theme}
      />
    </div>
  );
}
