import React from 'react';
import { X, Keyboard, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode } from '../types';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, theme = 'light' }) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  const shortcuts = [
    { key: '1 or A', desc: 'Add 10 points to Team / Member 1', highlight: 'cyan' },
    { key: '2 or B', desc: 'Add 10 points to Team / Member 2', highlight: 'rose' },
    { key: '3 or C', desc: 'Add 10 points to Team / Member 3', highlight: 'amber' },
    { key: '4 or D', desc: 'Add 10 points to Team / Member 4', highlight: 'emerald' },
    { key: 'W', desc: 'Declare Winner & Show Standings', highlight: 'amber' },
    { key: 'T', desc: 'Configure Teams or Individual Members', highlight: 'indigo' },
    { key: '→ / Space', desc: 'Advance to Next Slide', highlight: 'neutral' },
    { key: '← / Backspace', desc: 'Return to Previous Slide', highlight: 'neutral' },
    { key: 'F', desc: 'Toggle Fullscreen Mode', highlight: 'neutral' },
    { key: 'R', desc: 'Reset Match Scores', highlight: 'rose' },
    { key: 'M', desc: 'Mute / Unmute Sound FX', highlight: 'neutral' },
    { key: '?', desc: 'Show Keyboard Shortcuts', highlight: 'neutral' },
    { key: 'Esc', desc: 'Close Modals or Exit Fullscreen', highlight: 'neutral' },
  ];

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl ${
        isLight ? 'bg-black/40' : 'bg-black/75'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl backdrop-blur-3xl border ${
            isLight
              ? 'bg-[#fbfbf9]/98 border-black/10 text-[#161715] shadow-[0_20px_60px_rgba(0,0,0,0.12)]'
              : 'bg-[#161715]/98 border-white/10 text-[#f7f7f5] shadow-[0_25px_80px_rgba(0,0,0,0.85)]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-2xl border ${
                isLight
                  ? 'bg-black/5 text-[#161715] border-black/5'
                  : 'bg-white/5 text-white border-white/10'
              }`}>
                <Keyboard className="w-5 h-5 text-lime-500 dark:text-lime-400" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight">
                  Keyboard Shortcuts
                </h3>
                <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Tactile game master hotkeys
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-all border ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/5 text-slate-600'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {shortcuts.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                  isLight
                    ? 'bg-black/[0.02] border-black/5 hover:bg-black/[0.04]'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                <span className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {item.desc}
                </span>
                <kbd
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${
                    item.highlight === 'cyan' || item.highlight === 'rose' || item.highlight === 'indigo' || item.highlight === 'amber'
                      ? isLight
                        ? 'bg-black/5 border-black/15 text-[#161715]'
                        : 'bg-white/10 border-white/20 text-[#a3e635]'
                      : isLight
                        ? 'bg-black/[0.03] border-black/10 text-slate-700'
                        : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 text-center">
            <p className={`text-[11px] flex items-center justify-center gap-1.5 font-medium ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Zap className="w-3.5 h-3.5 text-lime-500" />
              Shortcuts respond instantly unless typing into a text field.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
