import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  X,
  RotateCcw,
  Users,
  Crown,
  Medal,
  Flame,
  Copy,
  Check,
  Volume2,
  PartyPopper,
  TrendingUp,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audio';
import { Participant, ParticipantMode, ThemeMode } from '../types';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  mode: ParticipantMode;
  theme?: ThemeMode;
  onResetGame: () => void;
  onOpenSetup?: () => void;
}

const COLOR_CONFIGS: Record<
  string,
  {
    gradient: string;
    lightBg: string;
    darkBg: string;
    text: string;
    glow: string;
    accent: string;
  }
> = {
  cyan: {
    gradient: 'from-cyan-500 to-blue-600',
    lightBg: 'bg-cyan-50',
    darkBg: 'bg-cyan-950/40',
    text: 'text-cyan-400',
    glow: 'rgba(6, 182, 212, 0.4)',
    accent: '#06b6d4',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50',
    darkBg: 'bg-rose-950/40',
    text: 'text-rose-400',
    glow: 'rgba(244, 63, 94, 0.4)',
    accent: '#f43f5e',
  },
  amber: {
    gradient: 'from-amber-500 to-yellow-600',
    lightBg: 'bg-amber-50',
    darkBg: 'bg-amber-950/40',
    text: 'text-amber-400',
    glow: 'rgba(245, 158, 11, 0.4)',
    accent: '#f59e0b',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    darkBg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    glow: 'rgba(16, 185, 129, 0.4)',
    accent: '#10b981',
  },
  indigo: {
    gradient: 'from-indigo-500 to-purple-600',
    lightBg: 'bg-indigo-50',
    darkBg: 'bg-indigo-950/40',
    text: 'text-indigo-400',
    glow: 'rgba(99, 102, 241, 0.4)',
    accent: '#6366f1',
  },
  purple: {
    gradient: 'from-purple-500 to-indigo-600',
    lightBg: 'bg-purple-50',
    darkBg: 'bg-purple-950/40',
    text: 'text-purple-400',
    glow: 'rgba(168, 85, 247, 0.4)',
    accent: '#a855f7',
  },
  fuchsia: {
    gradient: 'from-fuchsia-500 to-pink-600',
    lightBg: 'bg-fuchsia-50',
    darkBg: 'bg-fuchsia-950/40',
    text: 'text-fuchsia-400',
    glow: 'rgba(217, 70, 239, 0.4)',
    accent: '#d946ef',
  },
  teal: {
    gradient: 'from-teal-500 to-emerald-600',
    lightBg: 'bg-teal-50',
    darkBg: 'bg-teal-950/40',
    text: 'text-teal-400',
    glow: 'rgba(20, 184, 166, 0.4)',
    accent: '#14b8a6',
  },
};

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  onClose,
  participants,
  mode,
  theme = 'light',
  onResetGame,
  onOpenSetup,
}) => {
  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'podium' | 'table'>('podium');

  const triggerGrandConfetti = () => {
    const defaults = {
      origin: { y: 0.65 },
      zIndex: 99999,
      disableForReducedMotion: true ? false : false,
    };

    // Central burst
    confetti({
      ...defaults,
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Left cannon crackers
    confetti({
      ...defaults,
      particleCount: 60,
      angle: 60,
      spread: 60,
      origin: { x: 0.05, y: 0.75 },
      colors: ['#a3e635', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'],
    });

    // Right cannon crackers
    confetti({
      ...defaults,
      particleCount: 60,
      angle: 120,
      spread: 60,
      origin: { x: 0.95, y: 0.75 },
      colors: ['#a3e635', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'],
    });

    // Second wave after modal transition completes
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 90,
        spread: 100,
        decay: 0.91,
        scalar: 1.1,
        origin: { y: 0.55 },
      });
    }, 260);

    // Third lateral cracker barrage
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 50,
        angle: 65,
        spread: 60,
        origin: { x: 0.08, y: 0.8 },
      });
      confetti({
        ...defaults,
        particleCount: 50,
        angle: 115,
        spread: 60,
        origin: { x: 0.92, y: 0.8 },
      });
    }, 550);
  };

  useEffect(() => {
    if (isOpen) {
      soundEffects.playFanfare();
      const timer = setTimeout(() => {
        triggerGrandConfetti();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || participants.length === 0) return null;

  // Sort participants by score descending
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const highestScore = sorted[0].score;
  const winners = sorted.filter((p) => p.score === highestScore);
  const isTie = winners.length > 1;
  const runnerUp = sorted.find((p) => p.score < highestScore);
  const leadMargin = runnerUp ? highestScore - runnerUp.score : 0;
  const totalMatchPoints = sorted.reduce((sum, p) => sum + Math.max(0, p.score), 0);

  const champion = sorted[0];
  const championColor = COLOR_CONFIGS[champion.color] || COLOR_CONFIGS.amber;

  // Replay fanfare sound and fire extra fireworks confetti
  const handleReplayFanfare = () => {
    soundEffects.playFanfare();
    triggerGrandConfetti();
  };

  // Copy structured match report to clipboard
  const handleCopyStandings = () => {
    const title = isTie
      ? `🏆 Game Show Deadlock: ${winners.map((w) => w.name).join(' & ')} tied at ${highestScore} PTS!`
      : `🏆 Champion: ${champion.name} won with ${champion.score} PTS!`;
    const rows = sorted
      .map((p, i) => `${i + 1}. ${p.avatarEmoji || ''} ${p.name}: ${p.score} pts`)
      .join('\n');
    const text = `${title}\n\nFinal Standings:\n${rows}\n\nTotal Points: ${totalMatchPoints}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  };

  return (
    <AnimatePresence>
      <div
        id="winner-modal-backdrop"
        className={`fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 backdrop-blur-xl overflow-y-auto ${
          isLight ? 'bg-black/40' : 'bg-black/80'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-8 text-center shadow-2xl backdrop-blur-3xl border my-auto overflow-hidden ${
            isLight
              ? 'bg-[#fbfbf9]/98 text-[#161715] border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]'
              : 'bg-[#161715]/98 text-[#f7f7f5] border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)]'
          }`}
        >
          {/* Ambient Subtle Accent Glow */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 rounded-full pointer-events-none -z-10 blur-3xl opacity-30"
            style={{
              background: `radial-gradient(circle, #a3e635 0%, #84cc16 35%, rgba(0,0,0,0) 70%)`,
            }}
          />

          {/* Close button */}
          <button
            id="btn-close-winner-modal"
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all active:scale-95 border ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Ceremony Capsule */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.16em] uppercase border ${
              isLight
                ? 'bg-black/5 border-black/5 text-lime-700'
                : 'bg-white/5 border-white/10 text-lime-400'
            }`}>
              <Sparkles className="w-3 h-3 text-lime-500 fill-lime-500" />
              GRAND FINALE • MATCH PODIUM
            </span>
          </div>

          {/* HERO CHAMPION BANNER */}
          {isTie ? (
            /* TIE / DEADLOCK SHOWCASE */
            <div className="my-3 text-center">
              <div className="relative inline-flex items-center justify-center mb-2">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm ${
                  isLight ? 'bg-amber-500/10 border-amber-500/30 text-amber-700' : 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                }`}>
                  <Trophy className="w-7 h-7" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                DEADLOCK TIE
              </h2>
              <p className={`mt-1 text-xs sm:text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                A phenomenal tie between <span className="font-bold text-amber-500 dark:text-lime-400">{winners.length} champions</span> with{' '}
                <span className="font-mono font-bold">{highestScore} PTS</span> each!
              </p>

              {/* Co-Champions Card Strip */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-4">
                {winners.map((winner) => (
                  <div
                    key={winner.id}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${
                      isLight ? 'bg-black/[0.03] border-black/10 text-[#161715]' : 'bg-white/[0.04] border-white/10 text-[#f7f7f5]'
                    }`}
                  >
                    <div className="relative">
                      <span className="text-2xl">{winner.avatarEmoji || '👑'}</span>
                      <Crown className="w-3.5 h-3.5 text-lime-500 absolute -top-1.5 -right-1 fill-lime-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold uppercase tracking-wide">{winner.name}</div>
                      <div className="text-[11px] font-mono font-bold text-lime-600 dark:text-lime-400">
                        {winner.score} PTS • {mode === 'teams' ? 'Team' : 'Player'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* SINGLE CHAMPION HERO CARD */
            <div className="my-3">
              {/* Grand Floating Avatar with Crown */}
              <div className="relative inline-flex flex-col items-center justify-center mb-2">
                <div className="relative flex items-center justify-center">
                  {/* Floating Gold Crown */}
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="absolute -top-5 text-lime-500 dark:text-lime-400 z-10"
                  >
                    <Crown className="w-8 h-8 fill-current" />
                  </motion.div>

                  {/* Emoji Avatar DP Card */}
                  <div className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border p-1 shadow-md flex items-center justify-center ${
                    isLight
                      ? 'bg-black/[0.03] border-black/10'
                      : 'bg-white/[0.05] border-white/15'
                  }`}>
                    <div
                      className={`w-full h-full rounded-xl flex items-center justify-center ${
                        isLight ? 'bg-white shadow-inner' : 'bg-[#1a1d18]'
                      }`}
                    >
                      <span className="text-4xl sm:text-5xl filter drop-shadow-sm select-none">
                        {champion.avatarEmoji || '🦊'}
                      </span>
                    </div>
                  </div>

                  {/* 1st Place Signature Badge */}
                  <span className={`absolute -bottom-2.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase shadow-sm flex items-center gap-1 border ${
                    isLight
                      ? 'bg-[#161715] text-[#f7f6f2] border-transparent'
                      : 'bg-[#a3e635] text-[#131512] border-transparent'
                  }`}>
                    <Trophy className="w-3 h-3" />
                    01 CHAMPION
                  </span>
                </div>
              </div>

              {/* Champion Name & Title */}
              <div className="mt-4">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
                  <span>{champion.name}</span>{' '}
                  <span className={isLight ? 'text-slate-400 font-light' : 'text-slate-500 font-light'}>WINS</span>
                </h2>

                {/* Score & Match Highlights */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2 font-mono">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isLight
                      ? 'bg-black/5 border-black/5 text-slate-800'
                      : 'bg-white/5 border-white/10 text-slate-200'
                  }`}>
                    <Award className="w-3.5 h-3.5 text-lime-500" />
                    {champion.score} POINTS
                  </span>

                  {leadMargin > 0 && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                      isLight
                        ? 'bg-lime-500/10 border-lime-500/20 text-lime-800'
                        : 'bg-lime-400/10 border-lime-400/20 text-lime-400'
                    }`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{leadMargin} LEAD
                    </span>
                  )}

                  {totalMatchPoints > 0 && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                      isLight
                        ? 'bg-black/5 border-black/5 text-slate-600'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}>
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {Math.round((champion.score / totalMatchPoints) * 100)}% TOTAL SHARE
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW TOGGLE: PODIUM vs DIRECTORY LIST (if 3+ players) */}
          {participants.length >= 3 && (
            <div className="flex items-center justify-center gap-1 my-3">
              <div
                className={`p-1 rounded-full flex items-center gap-1 border ${
                  isLight ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('podium')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'podium'
                      ? isLight
                        ? 'bg-[#161715] text-[#f7f6f2] shadow-sm'
                        : 'bg-[#a3e635] text-[#131512] shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Top 3 Podium
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'table'
                      ? isLight
                        ? 'bg-[#161715] text-[#f7f6f2] shadow-sm'
                        : 'bg-[#a3e635] text-[#131512] shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full Standings ({participants.length})
                </button>
              </div>
            </div>
          )}

          {/* PODIUM VIEW (TOP 3 STAGE) */}
          {activeTab === 'podium' && participants.length >= 3 ? (
            <div className="my-4 px-2">
              <div className="flex items-end justify-center gap-2 sm:gap-3.5 max-w-md mx-auto pt-4 pb-2">
                {/* 2nd Place */}
                {sorted[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex flex-col items-center select-none"
                  >
                    <div className="text-2xl sm:text-3xl mb-1">{sorted[1].avatarEmoji}</div>
                    <div className="text-[11px] sm:text-xs font-bold truncate max-w-[90px] sm:max-w-[110px]">
                      {sorted[1].name}
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-400 mb-1.5">
                      {sorted[1].score} pts
                    </div>
                    {/* Podium Block 2 */}
                    <div className={`w-full h-24 sm:h-26 rounded-t-2xl border border-b-0 flex flex-col items-center justify-start pt-2.5 ${
                      isLight
                        ? 'bg-black/[0.04] border-black/10 text-[#161715]'
                        : 'bg-white/[0.04] border-white/10 text-white'
                    }`}>
                      <span className="text-lg sm:text-xl font-mono font-bold">02</span>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-slate-500">SILVER</span>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place (Gold - Elevated Center) */}
                {sorted[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex-1 flex flex-col items-center select-none -translate-y-2 z-10"
                  >
                    <div className="relative mb-1">
                      <Crown className="w-4 h-4 text-lime-500 absolute -top-3 left-1/2 -translate-x-1/2 fill-lime-500" />
                      <div className="text-3xl sm:text-4xl">{sorted[0].avatarEmoji}</div>
                    </div>
                    <div className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[130px] text-lime-600 dark:text-lime-400">
                      {sorted[0].name}
                    </div>
                    <div className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 mb-1.5">
                      {sorted[0].score} pts
                    </div>
                    {/* Podium Block 1 */}
                    <div className={`w-full h-32 sm:h-34 rounded-t-2xl border border-b-0 flex flex-col items-center justify-start pt-3 ${
                      isLight
                        ? 'bg-amber-500/[0.08] border-amber-500/30 text-[#161715]'
                        : 'bg-lime-400/[0.08] border-lime-400/30 text-white'
                    }`}>
                      <span className="text-2xl sm:text-3xl font-mono font-black">01</span>
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">GOLD</span>
                      <Sparkles className="w-3.5 h-3.5 mt-1 text-lime-500" />
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {sorted[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex-1 flex flex-col items-center select-none"
                  >
                    <div className="text-2xl sm:text-3xl mb-1">{sorted[2].avatarEmoji}</div>
                    <div className="text-[11px] sm:text-xs font-bold truncate max-w-[90px] sm:max-w-[110px]">
                      {sorted[2].name}
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-400 mb-1.5">
                      {sorted[2].score} pts
                    </div>
                    {/* Podium Block 3 */}
                    <div className={`w-full h-18 sm:h-20 rounded-t-2xl border border-b-0 flex flex-col items-center justify-start pt-2 ${
                      isLight
                        ? 'bg-black/[0.03] border-black/10 text-[#161715]'
                        : 'bg-white/[0.03] border-white/10 text-white'
                    }`}>
                      <span className="text-base sm:text-lg font-mono font-bold">03</span>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-slate-500">BRONZE</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            /* DIRECTORY STANDINGS LIST */
            <div className="my-4 space-y-1.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
              {sorted.map((participant, index) => {
                const isChampion = participant.score === highestScore;
                const percentOfLeader =
                  highestScore > 0 ? Math.max(8, Math.round((participant.score / highestScore) * 100)) : 100;
                const rankFormatted = (index + 1).toString().padStart(2, '0');

                return (
                  <div
                    key={participant.id}
                    className={`relative flex items-center justify-between p-2 sm:p-2.5 rounded-xl transition-all overflow-hidden border ${
                      isChampion
                        ? isLight
                          ? 'bg-amber-500/[0.06] border-amber-500/30 text-[#161715]'
                          : 'bg-lime-400/[0.06] border-lime-400/30 text-[#f7f7f5]'
                        : isLight
                        ? 'bg-black/[0.02] border-black/5 text-[#161715]'
                        : 'bg-white/[0.025] border-white/10 text-[#f7f7f5]'
                    }`}
                  >
                    {/* Background Progress Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-lime-500/10 dark:bg-lime-400/10 pointer-events-none rounded-xl"
                      style={{ width: `${percentOfLeader}%` }}
                    />

                    {/* Left Rank, Avatar & Name */}
                    <div className="relative flex items-center gap-2.5 min-w-0 z-10">
                      <span className="font-mono text-xs sm:text-sm font-bold shrink-0 w-6 text-center text-slate-400">
                        {rankFormatted}
                      </span>

                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 border ${
                          isLight ? 'bg-white border-black/5' : 'bg-[#1a1d18] border-white/10'
                        }`}
                      >
                        {participant.avatarEmoji || '🦊'}
                      </div>

                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm truncate max-w-[130px] sm:max-w-[200px]">
                            {participant.name}
                          </span>
                          {isChampion && (
                            <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded border ${
                              isLight
                                ? 'bg-black/5 border-black/10 text-amber-800'
                                : 'bg-white/10 border-white/15 text-lime-400'
                            }`}>
                              Winner
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {mode === 'teams' ? 'Team' : 'Player'} • Key {participant.keyLabel}
                        </div>
                      </div>
                    </div>

                    {/* Right Numerical Score */}
                    <div className="relative text-right shrink-0 z-10">
                      <div className="text-lg sm:text-xl font-bold font-mono tabular-nums tracking-tight">
                        {participant.score}
                        <span className={`text-[11px] font-normal ml-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CELEBRATORY ACTION BAR */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {/* Play Again (Reset Scores) */}
            <button
              id="btn-winner-reset"
              onClick={() => {
                onResetGame();
                onClose();
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700 hover:text-rose-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-rose-400'
              }`}
              title="Reset scores to 0 for a brand new match"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Match</span>
            </button>

            {/* Fire More Confetti / Fanfare */}
            <button
              id="btn-winner-confetti"
              onClick={handleReplayFanfare}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Launch more confetti celebration and play victory chime"
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cheer</span>
            </button>

            {/* Copy Match Report */}
            <button
              id="btn-winner-copy"
              onClick={handleCopyStandings}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                copied
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Copy match results summary to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            {/* Setup / Reconfigure Teams */}
            {onOpenSetup && (
              <button
                id="btn-winner-reconfigure"
                onClick={() => {
                  onClose();
                  onOpenSetup();
                }}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                  isLight
                    ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
                title="Configure teams, players, avatars, and colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Setup</span>
              </button>
            )}

            {/* Dismiss / Resume (Signature Primary CTA Button) */}
            <button
              id="btn-winner-continue"
              onClick={onClose}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 border ${
                isLight
                  ? 'bg-[#161715] text-[#f7f6f2] hover:bg-black/85 border-transparent shadow-sm'
                  : 'bg-[#a3e635] text-[#131512] hover:bg-[#bef264] border-transparent shadow-[0_0_16px_rgba(163,230,53,0.3)]'
              }`}
            >
              Resume Match
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
