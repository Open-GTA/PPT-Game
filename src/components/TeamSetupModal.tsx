import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, User, X, Check, Dices, ArrowRight, RotateCcw, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Participant, ParticipantMode, ThemeMode } from '../types';
import { COLOR_CONFIGS, getRandomEmoji } from '../utils/storage';

interface TeamSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mode: ParticipantMode, participants: Participant[]) => void;
  currentMode: ParticipantMode;
  currentParticipants: Participant[];
  theme?: ThemeMode;
  isInitialPrompt?: boolean;
}

const MAX_MEMBERS = 20;
const MAX_TEAMS = 4;

export const TeamSetupModal: React.FC<TeamSetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentMode,
  currentParticipants,
  theme = 'dark',
  isInitialPrompt = false,
}) => {
  const [mode, setMode] = useState<ParticipantMode>(currentMode);
  const [count, setCount] = useState<number>(() => {
    if (currentMode === 'teams') {
      return Math.min(MAX_TEAMS, Math.max(2, currentParticipants.length));
    }
    return Math.min(MAX_MEMBERS, Math.max(2, currentParticipants.length));
  });

  const [names, setNames] = useState<string[]>(() => {
    return Array.from({ length: MAX_MEMBERS }, (_, i) => {
      if (currentParticipants[i]?.name) {
        return currentParticipants[i].name;
      }
      return currentMode === 'teams' ? `Team ${String.fromCharCode(65 + i)}` : '';
    });
  });

  const [emojis, setEmojis] = useState<string[]>(() => {
    const used: string[] = [];
    return Array.from({ length: MAX_MEMBERS }, (_, i) => {
      if (currentParticipants[i]?.avatarEmoji) {
        used.push(currentParticipants[i].avatarEmoji);
        return currentParticipants[i].avatarEmoji;
      }
      const random = getRandomEmoji(used);
      used.push(random);
      return random;
    });
  });

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setMode(currentMode);
      const safeCount = currentMode === 'teams'
        ? Math.min(MAX_TEAMS, Math.max(2, currentParticipants.length))
        : Math.min(MAX_MEMBERS, Math.max(2, currentParticipants.length));
      setCount(safeCount);

      setNames(Array.from({ length: MAX_MEMBERS }, (_, i) => {
        if (currentParticipants[i]?.name) {
          return currentParticipants[i].name;
        }
        return currentMode === 'teams' ? `Team ${String.fromCharCode(65 + i)}` : '';
      }));

      const used: string[] = [];
      setEmojis(Array.from({ length: MAX_MEMBERS }, (_, i) => {
        if (currentParticipants[i]?.avatarEmoji) {
          used.push(currentParticipants[i].avatarEmoji);
          return currentParticipants[i].avatarEmoji;
        }
        const random = getRandomEmoji(used);
        used.push(random);
        return random;
      }));
    }
  }, [isOpen, currentMode, currentParticipants]);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleNameChange = (index: number, val: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRandomizeSingleEmoji = (index: number) => {
    const currentEmoji = emojis[index];
    const newEmoji = getRandomEmoji([currentEmoji]);
    setEmojis((prev) => {
      const next = [...prev];
      next[index] = newEmoji;
      return next;
    });
  };

  const handleModeChange = (newMode: ParticipantMode) => {
    setMode(newMode);
    if (newMode === 'teams') {
      setCount((prev) => Math.min(MAX_TEAMS, Math.max(2, prev)));
      setNames((prev) => {
        return prev.map((name, i) => {
          // In Team mode, default names are Team A, Team B, Team C, Team D
          if (!name || name.startsWith('Team ')) {
            return `Team ${String.fromCharCode(65 + i)}`;
          }
          return `Team ${String.fromCharCode(65 + i)}`;
        });
      });
    } else {
      // In Members mode: user has to manually type name, so default to empty name ""
      setNames((prev) => {
        return prev.map((name) => {
          if (name.startsWith('Team ')) {
            return '';
          }
          return name;
        });
      });
    }
  };

  const handleResetNames = () => {
    if (mode === 'teams') {
      // Reset team names to Team A, Team B, Team C, Team D...
      setNames(Array.from({ length: MAX_MEMBERS }, (_, i) => `Team ${String.fromCharCode(65 + i)}`));
    } else {
      // For members, reset sets to empty names so user can manually type them
      setNames(Array.from({ length: MAX_MEMBERS }, () => ''));
    }
  };

  const handleAddMember = () => {
    if (count < MAX_MEMBERS) {
      setCount((prev) => prev + 1);
    }
  };

  const handleRemoveMember = (idx: number) => {
    if (count <= 2) return;
    setNames((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      next.push('');
      return next;
    });
    setEmojis((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      next.push(getRandomEmoji());
      return next;
    });
    setCount((prev) => prev - 1);
  };

  // Validation: In members mode, all active members must have a non-empty name typed
  const emptyMemberIndices = mode === 'members'
    ? Array.from({ length: count }, (_, i) => i).filter((i) => !names[i]?.trim())
    : [];
  const allMembersNamed = emptyMemberIndices.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'members' && !allMembersNamed) {
      return;
    }

    const finalParticipants: Participant[] = [];

    for (let i = 0; i < count; i++) {
      const colorConfig = COLOR_CONFIGS[i % COLOR_CONFIGS.length];
      const trimmed = names[i]?.trim();
      const defaultTeamName = `Team ${String.fromCharCode(65 + i)}`;
      const assignedName = mode === 'teams' ? (trimmed || defaultTeamName) : trimmed;

      const existingScore = currentParticipants[i]?.score || 0;
      const emoji = emojis[i] || colorConfig.defaultEmoji || getRandomEmoji();
      const letter = String.fromCharCode(65 + i);
      const keyLabel = i < 4 ? `${i + 1} / ${letter}` : i < 9 ? `${i + 1}` : `#${i + 1}`;

      finalParticipants.push({
        id: currentParticipants[i]?.id || `p-${i + 1}`,
        name: assignedName,
        score: existingScore,
        color: colorConfig.color,
        keyLabel,
        avatarEmoji: emoji,
      });
    }

    onSave(mode, finalParticipants);
    onClose();
  };

  const colorAvatarClasses: Record<string, string> = {
    cyan: isLight ? 'from-cyan-100 to-blue-200 border-cyan-300' : 'from-cyan-900/60 to-blue-900/60 border-cyan-500/40',
    rose: isLight ? 'from-rose-100 to-pink-200 border-rose-300' : 'from-rose-900/60 to-red-900/60 border-rose-500/40',
    amber: isLight ? 'from-amber-100 to-orange-200 border-amber-300' : 'from-amber-900/60 to-orange-900/60 border-amber-500/40',
    emerald: isLight ? 'from-emerald-100 to-teal-200 border-emerald-300' : 'from-emerald-900/60 to-teal-900/60 border-emerald-500/40',
    indigo: isLight ? 'from-indigo-100 to-blue-200 border-indigo-300' : 'from-indigo-900/60 to-blue-900/60 border-indigo-500/40',
    purple: isLight ? 'from-purple-100 to-violet-200 border-purple-300' : 'from-purple-900/60 to-violet-900/60 border-purple-500/40',
    fuchsia: isLight ? 'from-fuchsia-100 to-pink-200 border-fuchsia-300' : 'from-fuchsia-900/60 to-pink-900/60 border-fuchsia-500/40',
    teal: isLight ? 'from-teal-100 to-emerald-200 border-teal-300' : 'from-teal-900/60 to-emerald-900/60 border-teal-500/40',
  };

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xl overflow-y-auto ${
        isLight ? 'bg-black/40' : 'bg-black/80'
      }`}>
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-setup-modal-title"
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          className={`relative w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-3xl border my-auto max-h-[90vh] flex flex-col ${
            isLight
              ? 'bg-[#fbfbf9]/98 text-[#161715] border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]'
              : 'bg-[#161715]/98 text-[#f7f7f5] border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)]'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 mb-3 shrink-0 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm ${
                isLight
                  ? 'bg-black/5 border-black/5 text-[#161715]'
                  : 'bg-white/5 border-white/10 text-white'
              }`}>
                {mode === 'teams' ? <Users className="w-5 h-5 text-lime-500 dark:text-lime-400" /> : <User className="w-5 h-5 text-lime-500 dark:text-lime-400" />}
              </div>
              <div>
                <h3 id="team-setup-modal-title" className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <span>Match Setup</span>
                  {isInitialPrompt && (
                    <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-black/5 border-black/10 text-lime-700'
                        : 'bg-white/10 border-white/15 text-lime-400'
                    }`}>
                      Welcome
                    </span>
                  )}
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {mode === 'teams'
                    ? 'Default teams: Team A, Team B, Team C, Team D (max 4)'
                    : 'Individual members (up to 20): manually type each name to continue'}
                </p>
              </div>
            </div>

            {!isInitialPrompt && (
              <button
                onClick={onClose}
                aria-label="Close match setup dialog"
                className={`p-1.5 rounded-full transition-all active:scale-95 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                  isLight
                    ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-600'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* STEP 1: Mode Selection */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                1. Select Match Structure
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="mode-teams-btn"
                  onClick={() => handleModeChange('teams')}
                  aria-pressed={mode === 'teams'}
                  aria-label="Select Teams mode, up to 4 teams"
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                    mode === 'teams'
                      ? isLight
                        ? 'bg-black/5 border-black/20 text-[#161715] ring-1 ring-black/10'
                        : 'bg-white/10 border-lime-400/50 text-white ring-1 ring-lime-400/30'
                      : isLight
                        ? 'bg-black/[0.02] border-black/5 hover:border-black/15 text-slate-600'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Users className={`w-4 h-4 ${mode === 'teams' ? 'text-lime-500' : 'text-slate-400'}`} />
                      <span>Teams (Max 4)</span>
                    </div>
                    {mode === 'teams' && (
                      <span className="w-4 h-4 rounded-full bg-[#161715] dark:bg-lime-400 text-white dark:text-black flex items-center justify-center text-[10px] font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Defaults to Team A, Team B, Team C, Team D
                  </p>
                </button>

                <button
                  type="button"
                  id="mode-members-btn"
                  onClick={() => handleModeChange('members')}
                  aria-pressed={mode === 'members'}
                  aria-label="Select Individual Members mode, up to 20 members"
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                    mode === 'members'
                      ? isLight
                        ? 'bg-black/5 border-black/20 text-[#161715] ring-1 ring-black/10'
                        : 'bg-white/10 border-lime-400/50 text-white ring-1 ring-lime-400/30'
                      : isLight
                        ? 'bg-black/[0.02] border-black/5 hover:border-black/15 text-slate-600'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <User className={`w-4 h-4 ${mode === 'members' ? 'text-lime-500' : 'text-slate-400'}`} />
                      <span>Individual Members (Max 20)</span>
                    </div>
                    {mode === 'members' && (
                      <span className="w-4 h-4 rounded-full bg-[#161715] dark:bg-lime-400 text-white dark:text-black flex items-center justify-center text-[10px] font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Custom name for every participant
                  </p>
                </button>
              </div>
            </div>

            {/* STEP 2: Count Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  2. Number of {mode === 'teams' ? 'Teams (2 to 4)' : 'Members (2 to 20)'}
                </label>
                <span className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {count} {mode === 'teams' ? 'teams' : 'members'} configured
                </span>
              </div>

              {mode === 'teams' ? (
                /* Teams count: 2, 3, or 4 */
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCount(num)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        count === num
                          ? isLight
                            ? 'bg-[#161715] border-[#161715] text-white shadow-sm'
                            : 'bg-[#a3e635] border-transparent text-[#131512] font-black shadow-sm'
                          : isLight
                            ? 'bg-black/[0.03] border-black/5 text-slate-600 hover:bg-black/[0.06]'
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                      }`}
                    >
                      {num} Teams
                    </button>
                  ))}
                </div>
              ) : (
                /* Members count: Quick presets + Stepper */
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Stepper buttons */}
                    <button
                      type="button"
                      onClick={() => setCount((c) => Math.max(2, c - 1))}
                      disabled={count <= 2}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all ${
                        isLight ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                      title="Decrease members count"
                    >
                      -1
                    </button>
                    <div className={`flex-1 text-center py-1.5 px-3 rounded-xl border text-xs font-mono font-bold ${
                      isLight ? 'bg-black/[0.03] border-black/10 text-[#161715]' : 'bg-white/[0.05] border-white/10 text-white'
                    }`}>
                      {count} Members (Max 20)
                    </div>
                    <button
                      type="button"
                      onClick={() => setCount((c) => Math.min(MAX_MEMBERS, c + 1))}
                      disabled={count >= MAX_MEMBERS}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all ${
                        isLight ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                      title="Increase members count"
                    >
                      +1
                    </button>
                  </div>

                  {/* Quick count presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono mr-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Presets:
                    </span>
                    {[2, 4, 6, 8, 10, 12, 16, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCount(num)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                          count === num
                            ? isLight
                              ? 'bg-[#161715] border-transparent text-white shadow-sm'
                              : 'bg-[#a3e635] border-transparent text-[#131512] shadow-sm'
                            : isLight
                              ? 'bg-black/[0.03] border-black/5 text-slate-600 hover:bg-black/[0.06]'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: Enter Names & Emoji DP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  3. {mode === 'teams' ? 'Team Names' : 'Member Names (Manually Type Each)'}
                </label>
                <button
                  type="button"
                  onClick={handleResetNames}
                  className={`flex items-center gap-1 text-[11px] font-semibold transition-colors active:scale-95 ${
                    isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                  title={mode === 'teams' ? 'Reset to Team A, Team B, Team C, Team D' : 'Clear all member names'}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{mode === 'teams' ? 'Reset to Team A, B, C' : 'Clear Names'}</span>
                </button>
              </div>

              {mode === 'members' && !allMembersNamed && (
                <div className="mb-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Please manually type names for all <strong>{count} members</strong> ({count - emptyMemberIndices.length}/{count} filled) to continue.
                  </span>
                </div>
              )}

              <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
                {Array.from({ length: count }, (_, idx) => {
                  const colorConfig = COLOR_CONFIGS[idx % COLOR_CONFIGS.length];
                  const label = mode === 'teams' ? `Team ${String.fromCharCode(65 + idx)}` : `Member #${idx + 1}`;
                  const isCurrentEmpty = mode === 'members' && !names[idx]?.trim();
                  const currentEmoji = emojis[idx] || colorConfig.defaultEmoji || '🦊';
                  const keyLabel = idx < 4 ? `${idx + 1} / ${String.fromCharCode(65 + idx)}` : idx < 9 ? `${idx + 1}` : `#${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all ${
                        isCurrentEmpty
                          ? isLight
                            ? 'bg-amber-500/[0.04] border-amber-300/80 shadow-sm'
                            : 'bg-amber-400/[0.04] border-amber-500/40'
                          : isLight
                            ? 'bg-black/[0.02] border-black/5 focus-within:border-black/20 shadow-sm'
                            : 'bg-white/[0.03] border-white/10 focus-within:border-white/25'
                      }`}
                    >
                      {/* Interactive Emoji DP Button */}
                      <button
                        type="button"
                        onClick={() => handleRandomizeSingleEmoji(idx)}
                        aria-label={`Randomize avatar emoji for ${label}`}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base shadow-sm shrink-0 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 transition-all group relative cursor-pointer ${
                          isLight
                            ? 'bg-white border-black/5 text-[#161715]'
                            : 'bg-[#1a1d18] border-white/10 text-white'
                        }`}
                        title="Click to roll a new random Emoji DP!"
                      >
                        <span>{currentEmoji}</span>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#161715] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Dices className="w-2.5 h-2.5" />
                        </div>
                      </button>

                      {/* Name Input & Key Label */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold mb-0.5 flex items-center justify-between">
                          <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{label}</span>
                          <div className="flex items-center gap-1.5">
                            {isCurrentEmpty && (
                              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                Required
                              </span>
                            )}
                            <span className="font-mono text-[9px] text-slate-400">Key {keyLabel}</span>
                          </div>
                        </div>
                        <input
                          type="text"
                          id={`participant-input-${idx}`}
                          value={names[idx] || ''}
                          onChange={(e) => handleNameChange(idx, e.target.value)}
                          placeholder={mode === 'teams' ? `Team ${String.fromCharCode(65 + idx)}` : 'Type member name...'}
                          maxLength={25}
                          aria-label={`${label} name`}
                          aria-required={mode === 'members'}
                          className={`w-full text-xs px-2.5 py-1.5 rounded-lg border font-medium outline-none focus-visible:ring-2 focus-visible:ring-lime-500 transition-all ${
                            isCurrentEmpty
                              ? isLight
                                ? 'bg-white text-slate-900 border-amber-400 focus:border-amber-500 placeholder:text-slate-400'
                                : 'bg-black/40 text-white border-amber-500/50 focus:border-amber-400 placeholder:text-slate-500'
                              : isLight
                                ? 'bg-white text-slate-900 border-black/10 focus:border-black/30 placeholder:text-slate-400'
                                : 'bg-[#161715] text-white border-white/10 focus:border-white/30 placeholder:text-slate-600'
                          }`}
                        />
                      </div>

                      {/* Optional Remove button in members mode if count > 2 */}
                      {mode === 'members' && count > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          aria-label={`Remove member #${idx + 1}`}
                          className={`p-1.5 rounded-lg transition-colors text-slate-400 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                            isLight ? 'hover:bg-rose-50' : 'hover:bg-rose-950/40'
                          }`}
                          title={`Remove Member #${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add member button if members mode and count < 20 */}
                {mode === 'members' && count < MAX_MEMBERS && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    aria-label={`Add member (${count + 1} of ${MAX_MEMBERS})`}
                    className={`w-full py-2 px-3 rounded-xl border border-dashed text-xs font-bold flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                      isLight
                        ? 'border-black/15 hover:border-black/30 text-[#161715] hover:bg-black/[0.02]'
                        : 'border-white/15 hover:border-lime-400/50 text-slate-200 hover:bg-white/[0.02]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member ({count + 1} of {MAX_MEMBERS})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 shrink-0">
              <button
                type="submit"
                id="btn-save-team-setup"
                disabled={mode === 'members' && !allMembersNamed}
                aria-label={
                  mode === 'members' && !allMembersNamed
                    ? `Please type all ${count} member names to continue`
                    : `Start match with ${count} ${mode === 'teams' ? 'Teams' : 'Members'}`
                }
                className={`w-full py-2.5 px-4 rounded-full font-black text-xs sm:text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                  mode === 'members' && !allMembersNamed
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                    : isLight
                    ? 'bg-[#161715] hover:bg-black/85 text-[#f7f6f2]'
                    : 'bg-[#a3e635] hover:bg-[#bef264] text-[#131512] shadow-[0_0_16px_rgba(163,230,53,0.3)]'
                }`}
              >
                {mode === 'members' && !allMembersNamed ? (
                  <span>Type all {count} member names to continue ({count - emptyMemberIndices.length}/{count} filled)</span>
                ) : (
                  <>
                    <span>Start Match with {count} {mode === 'teams' ? 'Teams' : 'Members'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
              <p className={`text-center text-[10px] mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {mode === 'teams'
                  ? 'Default teams: Team A, Team B, Team C, Team D with hotkeys (1-4 / A-D).'
                  : `Each member receives a unique Emoji DP. Members list can be up to ${MAX_MEMBERS}.`}
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
