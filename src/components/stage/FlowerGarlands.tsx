import React from 'react';

interface FlowerGarlandsProps {
  reducedMotion?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const FlowerGarlands: React.FC<FlowerGarlandsProps> = ({
  reducedMotion = false,
  intensity = 'high',
}) => {
  const isLow = intensity === 'low';

  if (isLow) return null; // In low intensity (action gameplay), hide garlands for total visual clarity

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
      {/* ──────────────────────────────────────────────────────────────────────
          1. TOP ARCH DRAPED MARIGOLD & JASMINE TORAN
         ────────────────────────────────────────────────────────────────────── */}
      <div
        className={`absolute top-4 sm:top-6 inset-x-0 w-full flex justify-center ${
          reducedMotion ? '' : 'animate-stage-sway'
        }`}
      >
        <div className="w-full max-w-[1400px] h-14 sm:h-20 relative">
          <svg
            viewBox="0 0 1200 80"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          >
            {/* Scalloped Garlands Across 3 Major Arches */}
            {/* Swag 1 */}
            <path
              d="M 60 10 Q 240 70, 420 10"
              stroke="#EA580C"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 60 10 Q 240 70, 420 10"
              stroke="#FBBF24"
              strokeWidth="6"
              strokeDasharray="14 10"
              strokeLinecap="round"
            />
            <path
              d="M 60 10 Q 240 70, 420 10"
              stroke="#BE123C"
              strokeWidth="4"
              strokeDasharray="6 18"
              strokeLinecap="round"
            />

            {/* Swag 2 (Center Swag - Grand) */}
            <path
              d="M 400 10 Q 600 78, 800 10"
              stroke="#EA580C"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 400 10 Q 600 78, 800 10"
              stroke="#FDE047"
              strokeWidth="7"
              strokeDasharray="14 10"
              strokeLinecap="round"
            />
            <path
              d="M 400 10 Q 600 78, 800 10"
              stroke="#BE123C"
              strokeWidth="4.5"
              strokeDasharray="6 18"
              strokeLinecap="round"
            />

            {/* Swag 3 */}
            <path
              d="M 780 10 Q 960 70, 1140 10"
              stroke="#EA580C"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 780 10 Q 960 70, 1140 10"
              stroke="#FBBF24"
              strokeWidth="6"
              strokeDasharray="14 10"
              strokeLinecap="round"
            />
            <path
              d="M 780 10 Q 960 70, 1140 10"
              stroke="#BE123C"
              strokeWidth="4"
              strokeDasharray="6 18"
              strokeLinecap="round"
            />

            {/* Mango Leaves (Toran Patte) along the top line */}
            {Array.from({ length: 24 }).map((_, i) => (
              <path
                key={i}
                d={`M ${i * 50 + 20} 8 C ${i * 50 + 15} 24, ${i * 50 + 25} 24, ${i * 50 + 20} 32 C ${i * 50 + 15} 24, ${i * 50 + 25} 24, ${i * 50 + 20} 8 Z`}
                fill="#059669"
                opacity="0.85"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          2. VERTICAL CASCADING MARIGOLD STRINGS (DESKTOP & TABLET)
         ────────────────────────────────────────────────────────────────────── */}
      {/* Left Hanging Garland */}
      <div
        className={`hidden md:block absolute top-10 left-12 lg:left-20 w-8 h-[360px] ${
          reducedMotion ? '' : 'animate-stage-sway'
        }`}
      >
        <div className="w-full h-full flex flex-col items-center justify-between py-2 drop-shadow-md">
          {Array.from({ length: 14 }).map((_, i) => {
            const isMarigold = i % 3 !== 2;
            const color = isMarigold
              ? i % 2 === 0
                ? 'bg-amber-500 border-amber-300'
                : 'bg-yellow-400 border-yellow-200'
              : 'bg-rose-600 border-rose-400';
            return (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border shadow-sm ${color} flex items-center justify-center`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            );
          })}
          {/* Hanging Bell at bottom */}
          <div className="w-3.5 h-4 bg-amber-400 rounded-b-md border border-amber-300 shadow-md" />
        </div>
      </div>

      {/* Right Hanging Garland */}
      <div
        className={`hidden md:block absolute top-10 right-12 lg:right-20 w-8 h-[360px] ${
          reducedMotion ? '' : 'animate-stage-sway-reverse'
        }`}
        style={{ animationDelay: '1s' }}
      >
        <div className="w-full h-full flex flex-col items-center justify-between py-2 drop-shadow-md">
          {Array.from({ length: 14 }).map((_, i) => {
            const isMarigold = i % 3 !== 2;
            const color = isMarigold
              ? i % 2 === 0
                ? 'bg-amber-500 border-amber-300'
                : 'bg-yellow-400 border-yellow-200'
              : 'bg-rose-600 border-rose-400';
            return (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border shadow-sm ${color} flex items-center justify-center`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            );
          })}
          <div className="w-3.5 h-4 bg-amber-400 rounded-b-md border border-amber-300 shadow-md" />
        </div>
      </div>
    </div>
  );
};
