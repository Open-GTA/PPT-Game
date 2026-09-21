import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { ScoreJumpEvent, ThemeMode } from '../types';

interface ScoreJumpOverlayProps {
  events: ScoreJumpEvent[];
  theme?: ThemeMode;
}

const COLOR_STYLES: Record<string, {
  textGradient: string;
  glow: string;
  neonColor: string;
  nameColor: string;
  particleColor: string;
  flareColor: string;
}> = {
  cyan: {
    textGradient: 'from-cyan-300 via-sky-100 to-white',
    glow: 'rgba(6, 182, 212, 0.75)',
    neonColor: '#06b6d4',
    nameColor: 'text-cyan-300',
    particleColor: '#22d3ee',
    flareColor: 'bg-cyan-500/30',
  },
  rose: {
    textGradient: 'from-rose-300 via-pink-100 to-white',
    glow: 'rgba(244, 63, 94, 0.75)',
    neonColor: '#f43f5e',
    nameColor: 'text-rose-300',
    particleColor: '#fb7185',
    flareColor: 'bg-rose-500/30',
  },
  amber: {
    textGradient: 'from-amber-300 via-yellow-100 to-white',
    glow: 'rgba(245, 158, 11, 0.75)',
    neonColor: '#f59e0b',
    nameColor: 'text-amber-300',
    particleColor: '#f59e0b',
    flareColor: 'bg-amber-500/30',
  },
  emerald: {
    textGradient: 'from-emerald-300 via-teal-100 to-white',
    glow: 'rgba(16, 185, 129, 0.75)',
    neonColor: '#10b981',
    nameColor: 'text-emerald-300',
    particleColor: '#34d399',
    flareColor: 'bg-emerald-500/30',
  },
  indigo: {
    textGradient: 'from-indigo-300 via-blue-100 to-white',
    glow: 'rgba(99, 102, 241, 0.75)',
    neonColor: '#6366f1',
    nameColor: 'text-indigo-300',
    particleColor: '#818cf8',
    flareColor: 'bg-indigo-500/30',
  },
  purple: {
    textGradient: 'from-purple-300 via-violet-100 to-white',
    glow: 'rgba(168, 85, 247, 0.75)',
    neonColor: '#a855f7',
    nameColor: 'text-purple-300',
    particleColor: '#c084fc',
    flareColor: 'bg-purple-500/30',
  },
  fuchsia: {
    textGradient: 'from-fuchsia-300 via-pink-100 to-white',
    glow: 'rgba(217, 70, 239, 0.75)',
    neonColor: '#d946ef',
    nameColor: 'text-fuchsia-300',
    particleColor: '#e879f9',
    flareColor: 'bg-fuchsia-500/30',
  },
  teal: {
    textGradient: 'from-teal-300 via-emerald-100 to-white',
    glow: 'rgba(20, 184, 166, 0.75)',
    neonColor: '#14b8a6',
    nameColor: 'text-teal-300',
    particleColor: '#2dd4bf',
    flareColor: 'bg-teal-500/30',
  },
};

export const ScoreJumpOverlay: React.FC<ScoreJumpOverlayProps> = ({ events }) => {
  return (
    <div
      id="score-jump-overlay-stage"
      className="absolute inset-0 pointer-events-none flex items-center justify-center z-40 overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {events.map((ev) => {
          const style = COLOR_STYLES[ev.color] || COLOR_STYLES.cyan;
          const isPositive = ev.delta >= 0;
          const sign = isPositive ? '+' : '';

          return (
            <motion.div
              key={ev.id}
              initial={{
                opacity: 0,
                y: '46vh',
                scale: 0.3,
                rotate: -5,
              }}
              animate={{
                opacity: [0, 1, 1, 1, 0],
                y: ['46vh', '0vh', '-2vh', '-48vh'],
                scale: [0.3, 1.35, 1.38, 0.85],
                rotate: [-5, 0, 1, 4],
              }}
              exit={{
                opacity: 0,
                y: '-55vh',
                scale: 0.7,
              }}
              transition={{
                duration: 1.6,
                times: [0, 0.3, 0.7, 1],
                ease: ['easeOut', 'easeInOut', 'easeIn'],
              }}
              className="absolute flex flex-col items-center justify-center select-none"
            >
              {/* Expanding Game Blast Flare Ring - completely borderless */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0.95 }}
                animate={{ scale: 3.2, opacity: 0 }}
                transition={{ duration: 0.85, delay: 0.25, ease: 'easeOut' }}
                className="absolute w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${style.glow} 0%, rgba(255,255,255,0.8) 30%, rgba(0,0,0,0) 70%)`,
                  filter: 'blur(4px)',
                }}
              />

              {/* Game Ambient Radial Light Burst */}
              <div
                className="absolute w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${style.glow} 0%, rgba(0,0,0,0) 65%)`,
                }}
              />

              {/* Bursting Game Sparkles */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-5">
                {[-45, 0, 45, 135, 180, 225].map((angle, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [1, 1, 0],
                      scale: [0, 1.5, 0.5],
                      x: Math.cos((angle * Math.PI) / 180) * 120,
                      y: Math.sin((angle * Math.PI) / 180) * 120,
                    }}
                    transition={{ duration: 0.8, delay: 0.28, ease: 'easeOut' }}
                    className="absolute text-yellow-300 text-lg font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                  >
                    ★
                  </motion.div>
                ))}
              </div>

              {/* BORDERLESS GAME POPUP CONTAINER */}
              <div className="flex flex-col items-center justify-center px-6 py-3 select-none">
                {/* Game Player Badge: Avatar & Name Tag */}
                <motion.div
                  initial={{ scale: 0.8, y: 10 }}
                  animate={{ scale: [0.8, 1.15, 1], y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.8)] mb-1"
                >
                  <span className="text-2xl sm:text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-bounce">
                    {ev.avatarEmoji}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs sm:text-sm font-black tracking-wider uppercase ${style.nameColor} drop-shadow-md`}>
                      {ev.participantName}
                    </span>
                    <span className="flex items-center px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 text-[10px] font-black tracking-widest uppercase">
                      <Zap className="w-2.5 h-2.5 mr-0.5 fill-yellow-400" />
                      POINT!
                    </span>
                  </div>
                </motion.div>

                {/* Massive 3D Arcade Score Typography (No border box) */}
                <div className="relative flex items-center justify-center my-1">
                  {/* Neon Glow Layer behind numbers */}
                  <span
                    className={`absolute text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter tabular-nums select-none blur-md opacity-80 ${style.nameColor}`}
                    aria-hidden="true"
                  >
                    {sign}{ev.delta}
                  </span>

                  {/* Foreground High-Impact Arcade Font with 3D Text Stroke */}
                  <span
                    className={`relative text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter tabular-nums bg-gradient-to-b ${style.textGradient} bg-clip-text text-transparent drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]`}
                    style={{
                      WebkitTextStroke: '2px rgba(255, 255, 255, 0.6)',
                      filter: `drop-shadow(0 0 20px ${style.glow}) drop-shadow(0 8px 12px rgba(0,0,0,0.9))`,
                    }}
                  >
                    {sign}{ev.delta}
                  </span>
                </div>

                {/* Total Score Game Pill (Borderless, sleek glass HUD) */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-white/95 tracking-wider bg-black/60 backdrop-blur-xl px-4 py-1 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TOTAL SCORE: <span className="text-yellow-300 font-mono text-sm sm:text-base">{ev.newScore}</span> PTS</span>
                  <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
