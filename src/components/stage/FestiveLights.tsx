import React from 'react';
import { DiyaVector } from '../common/DiyaVector';

interface FestiveLightsProps {
  reducedMotion?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const FestiveLights: React.FC<FestiveLightsProps> = ({
  reducedMotion = false,
  intensity = 'high',
}) => {
  const isLow = intensity === 'low';
  const isHigh = intensity === 'high';

  // Generate festoon string bulb coordinates across the top arch
  const bulbCount = isLow ? 12 : isHigh ? 28 : 20;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-15">
      {/* ──────────────────────────────────────────────────────────────────────
          1. HANGING STRING FAIRY LIGHTS ACROSS THE MANDAP ARCH
         ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-10 sm:top-14 inset-x-0 w-full overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[1400px] h-16 sm:h-20">
          {/* Catenary / festoon string wire */}
          <svg
            viewBox="0 0 1000 60"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full opacity-60"
          >
            <path
              d="M 0 10 
                 Q 125 45, 250 15 
                 Q 375 50, 500 18 
                 Q 625 50, 750 15 
                 Q 875 45, 1000 10"
              stroke="#B45309"
              strokeWidth="1.5"
            />
          </svg>

          {/* Glowing Bulbs placed along the festoon */}
          <div className="absolute inset-0 flex justify-between px-3 sm:px-8 items-start">
            {Array.from({ length: bulbCount }).map((_, i) => {
              // Alternate animation classes for staggered twinkle/breathing
              const animClass = reducedMotion
                ? ''
                : i % 3 === 0
                ? 'animate-fairy-a'
                : i % 3 === 1
                ? 'animate-fairy-b'
                : 'animate-fairy-c';

              // Alternate bulb colors (warm gold, radiant saffron, festive crimson)
              const bulbColor =
                i % 4 === 0
                  ? 'bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                  : i % 4 === 1
                  ? 'bg-yellow-200 shadow-[0_0_14px_rgba(254,240,138,0.9)]'
                  : i % 4 === 2
                  ? 'bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.8)]'
                  : 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.7)]';

              // Catenary vertical sag offset (rough parabolic shape)
              const t = (i / (bulbCount - 1)) * 4; // 4 scallops
              const frac = t % 1;
              const sag = Math.sin(frac * Math.PI) * (window.innerWidth < 640 ? 12 : 22);

              return (
                <div
                  key={i}
                  className="flex flex-col items-center"
                  style={{
                    transform: `translateY(${sag}px)`,
                  }}
                >
                  {/* Tiny brass bulb socket */}
                  <div className="w-1 h-1.5 bg-amber-800" />
                  {/* Glowing Bulb bead */}
                  <div
                    className={`w-2.5 h-3 sm:w-3 sm:h-3.5 rounded-full ${bulbColor} ${animClass}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          2. HANGING TRADITIONAL BRASS BELLS & LANTERNS (DESKTOP & TABLET)
         ────────────────────────────────────────────────────────────────────── */}
      {/* Left Hanging Brass Bell */}
      <div
        className={`hidden sm:block absolute top-12 md:top-16 left-16 md:left-24 lg:left-28 ${
          reducedMotion ? '' : 'animate-stage-bell'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Brass hanging chain */}
          <div className="w-0.5 h-16 md:h-24 bg-gradient-to-b from-amber-700 via-amber-500 to-yellow-600 border-x border-amber-900/50" />
          {/* Temple Bell */}
          <svg viewBox="0 0 36 44" fill="none" className="w-7 h-9 md:w-9 md:h-11 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
            <ellipse cx="18" cy="6" rx="4" ry="3" fill="#D97706" />
            <path d="M 18 8 C 14 14, 8 26, 6 34 L 30 34 C 28 26, 22 14, 18 8 Z" fill="url(#brassBellGrad)" />
            <ellipse cx="18" cy="34" rx="12" ry="4" fill="#B45309" stroke="#FEF08A" strokeWidth="1" />
            <circle cx="18" cy="39" r="3.5" fill="#F59E0B" />
            <defs>
              <linearGradient id="brassBellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="30%" stopColor="#F59E0B" />
                <stop offset="65%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Right Hanging Brass Bell */}
      <div
        className={`hidden sm:block absolute top-12 md:top-16 right-16 md:right-24 lg:right-28 ${
          reducedMotion ? '' : 'animate-stage-bell'
        }`}
        style={{ animationDelay: '1.8s' }}
      >
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-16 md:h-24 bg-gradient-to-b from-amber-700 via-amber-500 to-yellow-600 border-x border-amber-900/50" />
          <svg viewBox="0 0 36 44" fill="none" className="w-7 h-9 md:w-9 md:h-11 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
            <ellipse cx="18" cy="6" rx="4" ry="3" fill="#D97706" />
            <path d="M 18 8 C 14 14, 8 26, 6 34 L 30 34 C 28 26, 22 14, 18 8 Z" fill="url(#brassBellGrad)" />
            <ellipse cx="18" cy="34" rx="12" ry="4" fill="#B45309" stroke="#FEF08A" strokeWidth="1" />
            <circle cx="18" cy="39" r="3.5" fill="#F59E0B" />
          </svg>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          3. TRADITIONAL PEDESTAL FLICKERING DIYAS
         ────────────────────────────────────────────────────────────────────── */}
      {/* Bottom Left Pedestal Diya */}
      <div className="absolute bottom-6 sm:bottom-10 left-2 sm:left-6 md:left-28 z-20 pointer-events-none">
        <div className="flex flex-col items-center">
          <div className="animate-diya-flicker">
            <DiyaVector size={window.innerWidth < 640 ? 36 : 46} />
          </div>
          {/* Subtle diya base glow */}
          <div className="w-14 sm:w-20 h-4 bg-amber-500/25 rounded-full blur-md -mt-1" />
        </div>
      </div>

      {/* Bottom Right Pedestal Diya */}
      <div className="absolute bottom-6 sm:bottom-10 right-2 sm:right-6 md:right-28 z-20 pointer-events-none">
        <div className="flex flex-col items-center">
          <div className="animate-diya-flicker" style={{ animationDelay: '1.1s' }}>
            <DiyaVector size={window.innerWidth < 640 ? 36 : 46} />
          </div>
          <div className="w-14 sm:w-20 h-4 bg-amber-500/25 rounded-full blur-md -mt-1" />
        </div>
      </div>
    </div>
  );
};
