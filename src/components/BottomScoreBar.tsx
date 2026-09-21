import React, { useState, useRef } from 'react';
import {
  RotateCcw,
  Trophy,
  Plus,
  Minus,
  Edit2,
  Sparkles,
  Users,
  User,
  Check,
  Dices,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Participant, ParticipantMode, ThemeMode } from '../types';

interface BottomScoreBarProps {
  participants: Participant[];
  mode: ParticipantMode;
  theme?: ThemeMode;
  onAddScore: (index: number, delta: number) => void;
  onUpdateParticipantName: (index: number, newName: string) => void;
  onRandomizeParticipantEmoji?: (index: number) => void;
  onResetGame: () => void;
  onDeclareWinner: () => void;
  onOpenSetup: () => void;
  lastAddedParticipantId: string | null;
}

export const BottomScoreBar: React.FC<BottomScoreBarProps> = ({
  participants,
  mode,
  theme = 'dark',
  onAddScore,
  onUpdateParticipantName,
  onRandomizeParticipantEmoji,
  onResetGame,
  onDeclareWinner,
  onOpenSetup,
  lastAddedParticipantId,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editNameVal, setEditNameVal] = useState<string>('');
  const podsScrollRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  // Calculate score leader and margin
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const highestScore = sorted[0]?.score || 0;
  const leaders = sorted.filter((p) => p.score === highestScore);
  const isTie = leaders.length > 1;
  const runnerUpScore = sorted.find((p) => p.score < highestScore)?.score || 0;
  const leadMargin = highestScore - runnerUpScore;

  const handleStartEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditNameVal(currentName);
  };

  const handleSaveEdit = (index: number) => {
    if (editNameVal.trim()) {
      onUpdateParticipantName(index, editNameVal.trim());
    }
    setEditingIndex(null);
  };

  const handleScrollPods = (direction: 'left' | 'right') => {
    if (podsScrollRef.current) {
      const offset = direction === 'left' ? -250 : 250;
      podsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const themeConfig = {
    cyan: {
      bgGradient: isLight ? 'bg-cyan-100/80 hover:bg-cyan-100' : 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 shadow-[0_4px_20px_rgba(6,182,212,0.15)]',
      textAccent: isLight ? 'text-cyan-700' : 'text-cyan-300',
      textLight: isLight ? 'text-cyan-950 font-black' : 'text-cyan-200',
      avatarBg: isLight ? 'bg-white shadow-sm' : 'bg-cyan-500/20 text-white shadow-inner',
      plusBtn: isLight ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30' : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
      badge: isLight ? 'bg-cyan-200/80 text-cyan-900' : 'bg-cyan-500/30 text-cyan-300',
    },
    rose: {
      bgGradient: isLight ? 'bg-rose-100/80 hover:bg-rose-100' : 'bg-gradient-to-r from-rose-950/80 to-red-950/60 shadow-[0_4px_20px_rgba(244,63,94,0.15)]',
      textAccent: isLight ? 'text-rose-700' : 'text-rose-300',
      textLight: isLight ? 'text-rose-950 font-black' : 'text-rose-200',
      avatarBg: isLight ? 'bg-white shadow-sm' : 'bg-rose-500/20 text-white shadow-inner',
      plusBtn: isLight ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]',
      badge: isLight ? 'bg-rose-200/80 text-rose-900' : 'bg-rose-500/30 text-rose-300',
    },
    amber: {
      bgGradient: isLight ? 'bg-amber-100/80 hover:bg-amber-100' : 'bg-gradient-to-r from-amber-950/80 to-orange-950/60 shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
      textAccent: isLight ? 'text-amber-800' : 'text-amber-300',
      textLight: isLight ? 'text-amber-950 font-black' : 'text-amber-200',
      avatarBg: isLight ? 'bg-white shadow-sm' : 'bg-amber-500/20 text-white shadow-inner',
      plusBtn: isLight ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30' : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
      badge: isLight ? 'bg-amber-200/80 text-amber-900' : 'bg-amber-500/30 text-amber-300',
    },
    emerald: {
      bgGradient: isLight ? 'bg-emerald-100/80 hover:bg-emerald-100' : 'bg-gradient-to-r from-emerald-950/80 to-teal-950/60 shadow-[0_4px_20px_rgba(16,185,129,0.15)]',
      textAccent: isLight ? 'text-emerald-700' : 'text-emerald-300',
      textLight: isLight ? 'text-emerald-950 font-black' : 'text-emerald-200',
      avatarBg: isLight ? 'bg-white shadow-sm' : 'bg-emerald-500/20 text-white shadow-inner',
      plusBtn: isLight ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
      badge: isLight ? 'bg-emerald-200/80 text-emerald-900' : 'bg-emerald-500/30 text-emerald-300',
    },
    indigo: {
      bgGradient: isLight ? 'bg-indigo-100/80 hover:bg-indigo-100' : 'bg-gradient-to-r from-indigo-950/80 to-blue-950/60 shadow-[0_4px_20px_rgba(99,102,241,0.15)]',
      textAccent: isLight ? 'text-indigo-700' : 'text-indigo-300',
      textLight: isLight ? 'text-indigo-950 font-black' : 'text-indigo-200',
      avatarBg: isLight ? 'bg-white shadow-sm' : 'bg-indigo-500/20 text-white shadow-inner',
      plusBtn: isLight ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30' : 'bg-indigo-400 hover:bg-indigo-300 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]',
      badge: isLight ? 'bg-indigo-200/80 text-indigo-900' : 'bg-indigo-500/30 text-indigo-300',
    },
    purple: {
      bgGradient: isLight ? 'bg-purple-100/80 hover:bg-purple-100' : 'bg-gradient-to-r from-purple-950/80 to-pink-950/60 shadow-[0_4px_20px_rgba(168,85,247,0.15)]',
      textAccent: isLight ? 'text-purple-700' : 'text-purple-300',
      textLight: isLight ? 'text-purple-950 font-black' : 'text-purple-200',
      avatarBg: isLight ? 'bg-white shadow-sm' : 'bg-purple-500/20 text-white shadow-inner',
      plusBtn: isLight ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30' : 'bg-purple-400 hover:bg-purple-300 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]',
      badge: isLight ? 'bg-purple-200/80 text-purple-900' : 'bg-purple-500/30 text-purple-300',
    },
    fuchsia: {
      bgGradient: isLight ? 'bg-fuchsia-100/80 hover:bg-fuchsia-100' : 'bg-gradient-to-r from-fuchsia-950/80 to-pink-950/60 shadow-[0_4px_20px_rgba(217,70,239,0.15)]',
      textAccent: isLight ? 'text-fuchsia-700' : 'text-fuchsia-300',
      textLight: isLight ? 'text-fuchsia-950 font-black' : 'text-fuchsia-200',
      avatarBg: isLight ? 'bg-white shadow-sm' : 'bg-fuchsia-500/20 text-white shadow-inner',
      plusBtn: isLight ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-600/30' : 'bg-fuchsia-400 hover:bg-fuchsia-300 text-white shadow-[0_0_12px_rgba(217,70,239,0.5)]',
      badge: isLight ? 'bg-fuchsia-200/80 text-fuchsia-900' : 'bg-fuchsia-500/30 text-fuchsia-300',
    },
    teal: {
      bgGradient: isLight ? 'bg-teal-100/80 hover:bg-teal-100' : 'bg-gradient-to-r from-teal-950/80 to-emerald-950/60 shadow-[0_4px_20px_rgba(20,184,166,0.15)]',
      textAccent: isLight ? 'text-teal-700' : 'text-teal-300',
      textLight: isLight ? 'text-teal-950 font-black' : 'text-teal-200',
      avatarBg: isLight ? 'bg-white shadow-sm' : 'bg-teal-500/20 text-white shadow-inner',
      plusBtn: isLight ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30' : 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-[0_0_12px_rgba(20,184,166,0.5)]',
      badge: isLight ? 'bg-teal-200/80 text-teal-900' : 'bg-teal-500/30 text-teal-300',
    },
  };

  const isManyParticipants = participants.length > 4;

  return (
    <footer
      id="bottom-score-bar"
      className="relative z-30 w-full px-2 sm:px-4 lg:px-6 pb-2 pt-0.5 flex justify-center items-center shrink-0"
    >
      {/* ox.lol Inspired Floating Dock */}
      <div className={`w-full max-w-[98vw] 2xl:max-w-[99vw] rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 backdrop-blur-2xl flex flex-col xl:flex-row items-center justify-between gap-1.5 sm:gap-2 transition-all border ${
        isLight
          ? 'bg-white/80 border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-[#161715]'
          : 'bg-[#161715]/85 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-[#f7f7f5]'
      }`}>
        
        {/* PARTICIPANT PODS CONTAINER */}
        <div className="w-full flex-1 min-w-0 flex items-center gap-1">
          {/* Optional scroll button left if many participants */}
          {isManyParticipants && (
            <button
              type="button"
              onClick={() => handleScrollPods('left')}
              className={`hidden sm:flex items-center justify-center p-1.5 rounded-xl shrink-0 transition-all border ${
                isLight ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Pods Grid / Scroll Row */}
          <div
            ref={podsScrollRef}
            className={`w-full items-center gap-1.5 sm:gap-2 ${
              isManyParticipants
                ? 'flex overflow-x-auto pb-1 scrollbar-thin scroll-smooth'
                : 'grid grid-cols-2 md:grid-cols-2 lg:flex lg:flex-1'
            }`}
          >
            {participants.map((p, idx) => {
              const themeStyle = themeConfig[p.color] || themeConfig.cyan;
              const isEditing = editingIndex === idx;
              const isRecentlyAdded = lastAddedParticipantId === p.id;
              const isTopScorer = highestScore > 0 && p.score === highestScore;
              const emojiAvatar = p.avatarEmoji || '🦊';
              const displayName = p.name || (mode === 'teams' ? `Team ${String.fromCharCode(65 + idx)}` : `Member #${idx + 1}`);

              return (
                <div
                  key={p.id}
                  id={`participant-pod-${idx}`}
                  className={`min-w-0 flex items-center justify-between gap-1 sm:gap-2 rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-1.5 transition-all relative overflow-hidden border ${
                    isTopScorer && !isTie
                      ? isLight
                        ? 'bg-amber-500/[0.07] border-amber-500/40 shadow-sm'
                        : 'bg-lime-400/[0.06] border-lime-400/40 shadow-[0_0_16px_rgba(163,230,53,0.12)]'
                      : isLight
                        ? 'bg-black/[0.025] hover:bg-black/[0.05] border-black/5'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10'
                  } ${
                    isManyParticipants ? 'min-w-[195px] sm:min-w-[215px] max-w-[250px] shrink-0' : 'flex-1'
                  }`}
                >
                  {/* Identity & Key Indicator */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Emoji Avatar DP with quick randomize dice button */}
                    <div className="relative group shrink-0">
                      <button
                        type="button"
                        onClick={() => onRandomizeParticipantEmoji && onRandomizeParticipantEmoji(idx)}
                        aria-label={`Randomize avatar emoji for ${displayName}`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center text-sm sm:text-base cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 transition-all shadow-sm ${
                          isLight
                            ? 'bg-white border-black/5 text-[#161715]'
                            : 'bg-white/10 border-white/10 text-white'
                        }`}
                        title="Click to roll new random Emoji DP!"
                      >
                        <span>{emojiAvatar}</span>
                      </button>
                      {onRandomizeParticipantEmoji && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#161715] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Dices className="w-2 h-2" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editNameVal}
                            onChange={(e) => setEditNameVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(idx);
                              if (e.key === 'Escape') setEditingIndex(null);
                            }}
                            autoFocus
                            maxLength={20}
                            aria-label={`Edit name for ${displayName}`}
                            className={`text-[11px] px-1.5 py-0.5 rounded border w-24 outline-none focus-visible:ring-2 focus-visible:ring-lime-500 font-bold ${
                              isLight
                                ? 'bg-white border-black/15 text-slate-900'
                                : 'bg-[#161715] border-white/20 text-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(idx)}
                            aria-label={`Save name for ${displayName}`}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                              isLight ? 'bg-black/5 border-black/10 text-slate-800' : 'bg-white/15 border-white/20 text-white'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs sm:text-sm font-bold tracking-tight truncate max-w-[80px] sm:max-w-[120px] ${
                              isLight ? 'text-[#161715]' : 'text-[#f7f7f5]'
                            }`}
                            title={displayName}
                          >
                            {displayName}
                          </span>
                          <button
                            onClick={() => handleStartEdit(idx, p.name)}
                            aria-label={`Rename ${displayName}`}
                            title="Rename participant"
                            className={`transition-colors p-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 rounded ${
                              isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'
                            }`}
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className={`px-1.5 py-0.2 rounded font-mono font-medium text-[9px] border ${
                          isLight
                            ? 'bg-black/5 border-black/5 text-slate-600'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}>
                          KEY {p.keyLabel}
                        </span>
                        {isTopScorer && !isTie && (
                          <span className={`flex items-center gap-0.5 text-[9px] font-mono font-bold tracking-wider ${
                            isLight ? 'text-amber-700' : 'text-lime-400'
                          }`}>
                            #1 LEADER
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score & Touch Micro-Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Numerical Score with Floating Delta */}
                    <div className="relative flex items-center">
                      <span
                        aria-label={`${displayName} current score: ${p.score}`}
                        className={`font-mono text-xl sm:text-2xl lg:text-3xl font-black tracking-tight tabular-nums min-w-[2.2ch] text-right ${
                          isTopScorer && !isTie
                            ? isLight
                              ? 'text-amber-700'
                              : 'text-lime-400'
                            : isLight
                              ? 'text-[#161715]'
                              : 'text-[#f7f7f5]'
                        }`}
                      >
                        {p.score}
                      </span>
                      <AnimatePresence>
                        {isRecentlyAdded && (
                          <motion.span
                            key={`score-float-${p.id}-${Date.now()}`}
                            initial={{ opacity: 1, y: 0, scale: 1 }}
                            animate={{ opacity: 0, y: -22, scale: 1.3 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className={`absolute -top-3 right-0 font-mono font-bold text-xs sm:text-sm pointer-events-none drop-shadow-md ${
                              isLight ? 'text-lime-700' : 'text-lime-400'
                            }`}
                          >
                            +10
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Add / Subtract Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-add-score-${idx}`}
                        onClick={() => onAddScore(idx, 10)}
                        aria-label={`Add 10 points to ${displayName} (Key ${p.keyLabel})`}
                        className={`px-2 py-1 rounded-lg sm:rounded-xl font-mono font-bold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 transition-all flex items-center gap-0.5 text-xs border ${
                          isLight
                            ? 'bg-[#161715] text-[#f7f6f2] hover:bg-black/80 border-transparent shadow-sm'
                            : 'bg-[#f7f7f5] text-[#131512] hover:bg-white/90 border-transparent shadow-sm'
                        }`}
                        title={`Add 10 points to ${displayName} (Key ${p.keyLabel})`}
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span className="text-[10px] sm:text-[11px]">10</span>
                      </button>
                      <button
                        id={`btn-sub-score-${idx}`}
                        onClick={() => onAddScore(idx, -10)}
                        disabled={p.score <= 0}
                        aria-label={`Subtract 10 points from ${displayName}`}
                        className={`p-1 rounded-lg sm:rounded-xl border transition-all text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 disabled:opacity-20 disabled:cursor-not-allowed ${
                          isLight
                            ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                        title={`Subtract 10 points from ${displayName}`}
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional scroll button right if many participants */}
          {isManyParticipants && (
            <button
              type="button"
              onClick={() => handleScrollPods('right')}
              className={`hidden sm:flex items-center justify-center p-1.5 rounded-xl border shrink-0 transition-all ${
                isLight ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* CENTER / RIGHT TELEMETRY & MATCH ACTIONS */}
        <div
          id="center-game-controls"
          className="flex items-center justify-between w-full xl:w-auto xl:justify-end gap-1.5 sm:gap-2 shrink-0 pt-0.5 xl:pt-0"
        >
          {/* Match Leader Capsule */}
          <div className={`px-3 py-1 border rounded-full flex items-center gap-1.5 text-[11px] sm:text-xs backdrop-blur-xl shrink-0 ${
            isLight
              ? 'bg-black/5 border-black/5 text-[#161715]'
              : 'bg-white/5 border-white/10 text-slate-200'
          }`}>
            {!isTie && leaders[0] ? (
              <span className="flex items-center gap-1.5">
                <span className={`text-[9px] uppercase font-semibold tracking-[0.16em] ${
                  isLight ? 'text-lime-700' : 'text-lime-400'
                }`}>
                  LEADER
                </span>
                <span className="text-xs">{leaders[0].avatarEmoji}</span>
                <span className="font-bold truncate max-w-[80px] sm:max-w-[110px]">{leaders[0].name || 'Leader'}</span>
                {leadMargin > 0 && (
                  <span className={`font-mono text-[10px] px-1 rounded ${
                    isLight ? 'bg-black/5 text-slate-600' : 'bg-white/10 text-slate-300'
                  }`}>
                    +{leadMargin}
                  </span>
                )}
              </span>
            ) : (
              <span className={`font-medium flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Tied ({highestScore})</span>
              </span>
            )}
          </div>

          {/* Setup / Team Management Trigger */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              id="btn-open-team-setup"
              onClick={onOpenSetup}
              aria-label={mode === 'teams' ? `Configure Teams: currently ${participants.length} teams` : `Configure Members: currently ${participants.length} members`}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all text-xs font-medium active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/5 text-[#161715]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
              title={mode === 'teams' ? 'Configure Teams (Max 4)' : 'Configure Members (Max 20)'}
            >
              {mode === 'teams' ? <Users className="w-3 h-3 text-lime-500 dark:text-lime-400" /> : <User className="w-3 h-3 text-lime-500 dark:text-lime-400" />}
              <span className="text-[11px] sm:text-xs font-mono">
                {participants.length} {mode === 'teams' ? 'Teams' : 'Members'}
              </span>
            </button>

            {/* Reset Confirmation Dialog Trigger */}
            <div className="relative shrink-0">
              <button
                id="btn-reset-scores"
                onClick={() => setShowResetConfirm(true)}
                aria-label="Reset scores for a new match"
                aria-expanded={showResetConfirm}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all text-xs font-medium active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                  isLight
                    ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700 hover:text-rose-700'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-rose-400'
                }`}
                title="Reset scores for a new match (Key R)"
              >
                <RotateCcw className="w-3 h-3 text-rose-500" />
                <span className="text-[11px] sm:text-xs">Reset</span>
              </button>

              {/* Game Popover */}
              <AnimatePresence>
                {showResetConfirm && (
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm reset match scores"
                    initial={{ opacity: 0, scale: 0.92, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 8 }}
                    className={`absolute bottom-full mb-3 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 border p-4 rounded-2xl shadow-2xl w-60 sm:w-64 text-center z-50 backdrop-blur-2xl ${
                      isLight
                        ? 'bg-white/95 border-black/10 shadow-slate-900/10 text-[#161715]'
                        : 'bg-[#161715]/95 border-white/15 shadow-black/95 text-[#f7f7f5]'
                    }`}
                  >
                    <p className="text-xs font-bold mb-1">
                      Reset Match Scores?
                    </p>
                    <p className={`text-[11px] mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {mode === 'teams'
                        ? 'All scores reset to 0 and names reset to Team A, Team B, Team C, Team D.'
                        : `All scores will be reset to 0 for all ${participants.length} members.`}
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          onResetGame();
                          setShowResetConfirm(false);
                        }}
                        aria-label="Confirm reset match scores"
                        className="px-3.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-all active:scale-95 border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        Yes, Reset
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        aria-label="Cancel score reset"
                        className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                          isLight
                            ? 'bg-black/5 border-black/5 text-slate-700'
                            : 'bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* OX Signature Primary Winner Button */}
            <button
              id="btn-declare-winner"
              onClick={onDeclareWinner}
              aria-label="Show the Winner and final standings with fanfare and confetti (Key W)"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border active:scale-95 text-xs font-black tracking-tight transition-all shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                isLight
                  ? 'bg-[#161715] text-[#f7f6f2] hover:bg-black/85 border-transparent'
                  : 'bg-[#a3e635] text-[#131512] hover:bg-[#bef264] border-transparent shadow-[0_0_16px_rgba(163,230,53,0.3)]'
              }`}
              title="Show the Winner & final standings with fanfare & confetti (Key W)"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs uppercase">WINNER</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
