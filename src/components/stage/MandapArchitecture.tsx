import React from 'react';

interface MandapArchitectureProps {
  reducedMotion?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const MandapArchitecture: React.FC<MandapArchitectureProps> = ({
  reducedMotion = false,
  intensity = 'high',
}) => {
  const isLow = intensity === 'low';
  const isHigh = intensity === 'high';

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* ──────────────────────────────────────────────────────────────────────
          1. CENTRAL SANCTUM FOCAL AURA (BEHIND CONTENT)
         ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-[32%] sm:top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {/* Deep sacred golden halo glow */}
        <div
          className={`rounded-full blur-3xl transition-opacity duration-700 ${
            isLow ? 'opacity-20 w-[300px] h-[300px] bg-amber-600/20' :
            isHigh ? 'opacity-40 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-orange-500/20' :
            'opacity-30 w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] bg-amber-500/25'
          }`}
        />

        {/* Sacred Divine Aura Ring with concentric rays */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] ${
          reducedMotion ? 'opacity-25' : 'animate-pulse-glow opacity-30'
        }`}>
          <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
            {/* Outer dotted divine ring */}
            <circle cx="200" cy="200" r="190" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.6" />
            <circle cx="200" cy="200" r="172" stroke="#FDE047" strokeWidth="1" opacity="0.5" />
            {/* 16 Sacred Lotus Petals */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              return (
                <path
                  key={i}
                  d="M 200 40 C 215 90, 215 130, 200 160 C 185 130, 185 90, 200 40 Z"
                  fill="url(#sacredPetalGrad)"
                  opacity="0.35"
                  transform={`rotate(${angle} 200 200)`}
                />
              );
            })}
            {/* Inner Sacred Chakra Ring */}
            <circle cx="200" cy="200" r="110" stroke="#F59E0B" strokeWidth="2" opacity="0.7" />
            <circle cx="200" cy="200" r="85" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <defs>
              <linearGradient id="sacredPetalGrad" x1="200" y1="40" x2="200" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#EA580C" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          2. GRAND MANDAP TOP ARCH (SCALLOPED TORAN ARCH)
         ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 w-full z-10">
        {/* Desktop & Tablet Full Ornate Arch */}
        <div className="hidden sm:block w-full">
          <svg
            viewBox="0 0 1440 140"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-24 sm:h-28 md:h-32 drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]"
          >
            <defs>
              <linearGradient id="mandapGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="25%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="mandapFiligreeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B45309" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#FDE047" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Upper Stage Cornice Bar */}
            <rect x="0" y="0" width="1440" height="22" fill="url(#mandapGoldGrad)" />
            <line x1="0" y1="22" x2="1440" y2="22" stroke="#451A03" strokeWidth="2" />

            {/* Sacred Ornamental Dentils & Filigree Border */}
            {Array.from({ length: 36 }).map((_, i) => (
              <rect
                key={i}
                x={i * 40 + 4}
                y="6"
                width="16"
                height="10"
                rx="2"
                fill="#451A03"
                opacity="0.45"
              />
            ))}

            {/* Grand Scalloped Archway Profile */}
            <path
              d="M 0 22 
                 L 160 22
                 C 280 22, 340 78, 480 82
                 C 580 85, 640 45, 720 45
                 C 800 45, 860 85, 960 82
                 C 1100 78, 1160 22, 1280 22
                 L 1440 22
                 L 1440 42
                 C 1300 42, 1220 95, 1100 102
                 C 980 110, 880 72, 720 72
                 C 560 72, 460 110, 340 102
                 C 220 95, 140 42, 0 42
                 Z"
              fill="url(#mandapGoldGrad)"
            />

            {/* Arch Carved Filigree Outline */}
            <path
              d="M 0 42 
                 C 140 42, 220 95, 340 102
                 C 460 110, 560 72, 720 72
                 C 880 72, 980 110, 1100 102
                 C 1220 95, 1300 42, 1440 42"
              stroke="#FDE047"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="12 6"
            />

            {/* Central Sacred Kalash Finial with Coconut and Mango Leaves */}
            <g transform="translate(720, 20)">
              {/* Crown Kalash Pot */}
              <ellipse cx="0" cy="18" rx="20" ry="14" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2" />
              <path d="M -16 12 L 16 12 L 10 2 Z" fill="#D97706" stroke="#FEF08A" strokeWidth="1.5" />
              {/* Sacred Coconut */}
              <ellipse cx="0" cy="0" rx="10" ry="12" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
              {/* Mango leaves */}
              <path d="M -8 3 C -18 -8, -22 -14, -12 -18 C -4 -16, -2 -6, -2 0 Z" fill="#047857" />
              <path d="M 8 3 C 18 -8, 22 -14, 12 -18 C 4 -16, 2 -6, 2 0 Z" fill="#047857" />
              <path d="M 0 0 C -4 -12, 0 -22, 0 -24 C 0 -22, 4 -12, 0 0 Z" fill="#059669" />
              {/* Kalash Base Neck */}
              <rect x="-14" y="28" width="28" height="6" rx="2" fill="#FDE68A" />
            </g>
          </svg>
        </div>

        {/* Mobile Streamlined Arch (Crisp, High-Performance) */}
        <div className="block sm:hidden w-full">
          <svg
            viewBox="0 0 360 48"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-11 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          >
            {/* Top Border Bar */}
            <rect x="0" y="0" width="360" height="10" fill="url(#mandapGoldMob)" />
            {/* Scalloped Under-curtain */}
            <path
              d="M 0 10 
                 C 40 10, 60 26, 100 28
                 C 140 30, 160 18, 180 18
                 C 200 18, 220 30, 260 28
                 C 300 26, 320 10, 360 10
                 L 360 20
                 C 320 20, 300 36, 260 38
                 C 220 40, 200 28, 180 28
                 C 160 28, 140 40, 100 38
                 C 60 36, 40 20, 0 20
                 Z"
              fill="url(#mandapGoldMob)"
            />
            {/* Center Crown Crest */}
            <circle cx="180" cy="12" r="9" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="180" cy="12" r="4" fill="#E11D48" />
            <defs>
              <linearGradient id="mandapGoldMob" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          3. MANDAP SIDE PILLARS (LEFT & RIGHT)
         ────────────────────────────────────────────────────────────────────── */}
      {/* Left Pillar (Desktop / Tablet) */}
      <div className="hidden sm:block absolute top-0 left-0 bottom-0 w-16 md:w-24 lg:w-28 z-10 pointer-events-none">
        <div className="w-full h-full relative flex flex-col justify-between">
          {/* Pillar Capital (Carved top bracket) */}
          <div className="w-full h-20 bg-gradient-to-b from-[#78350F] via-[#B45309] to-[#92400E] border-r-2 border-[#FDE047]/40 shadow-xl relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-4 bg-[#F59E0B] border-t border-[#FEF08A]/60" />
            {/* Ornamental Lotus bracket cuts */}
            <div className="absolute bottom-4 right-1 w-8 h-10 border-r-4 border-b-4 border-[#FBBF24]/70 rounded-br-2xl" />
          </div>

          {/* Fluted Pillar Shaft */}
          <div className="flex-1 w-full bg-gradient-to-r from-[#451A03] via-[#78350F] to-[#92400E] border-r-2 border-[#F59E0B]/35 relative flex justify-around px-1.5 opacity-90">
            {/* Vertical Fluted Grooves */}
            <div className="w-1.5 h-full bg-[#3B1502] opacity-60" />
            <div className="w-2 h-full bg-[#B45309] opacity-40 shadow-inner" />
            <div className="w-1.5 h-full bg-[#3B1502] opacity-60" />
            {/* Carved Mid-ring Bands */}
            <div className="absolute top-1/4 inset-x-0 h-3 bg-gradient-to-r from-[#F59E0B] via-[#FEF08A] to-[#D97706] shadow-md border-y border-[#78350F]" />
            <div className="absolute top-2/4 inset-x-0 h-3 bg-gradient-to-r from-[#F59E0B] via-[#FEF08A] to-[#D97706] shadow-md border-y border-[#78350F]" />
            <div className="absolute top-3/4 inset-x-0 h-3 bg-gradient-to-r from-[#F59E0B] via-[#FEF08A] to-[#D97706] shadow-md border-y border-[#78350F]" />
          </div>

          {/* Pillar Base Pedestal */}
          <div className="w-full h-24 bg-gradient-to-t from-[#260B02] via-[#451A03] to-[#78350F] border-r-2 border-[#F59E0B]/50 relative">
            <div className="absolute top-0 inset-x-0 h-3 bg-[#FBBF24] border-b border-[#78350F]" />
            <div className="absolute inset-x-2 bottom-3 h-10 border border-[#F59E0B]/40 rounded-lg flex items-center justify-center">
              <span className="text-xs text-amber-300 font-festive">ॐ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pillar (Desktop / Tablet) */}
      <div className="hidden sm:block absolute top-0 right-0 bottom-0 w-16 md:w-24 lg:w-28 z-10 pointer-events-none">
        <div className="w-full h-full relative flex flex-col justify-between">
          {/* Pillar Capital */}
          <div className="w-full h-20 bg-gradient-to-b from-[#78350F] via-[#B45309] to-[#92400E] border-l-2 border-[#FDE047]/40 shadow-xl relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-4 bg-[#F59E0B] border-t border-[#FEF08A]/60" />
            <div className="absolute bottom-4 left-1 w-8 h-10 border-l-4 border-b-4 border-[#FBBF24]/70 rounded-bl-2xl" />
          </div>

          {/* Fluted Pillar Shaft */}
          <div className="flex-1 w-full bg-gradient-to-l from-[#451A03] via-[#78350F] to-[#92400E] border-l-2 border-[#F59E0B]/35 relative flex justify-around px-1.5 opacity-90">
            <div className="w-1.5 h-full bg-[#3B1502] opacity-60" />
            <div className="w-2 h-full bg-[#B45309] opacity-40 shadow-inner" />
            <div className="w-1.5 h-full bg-[#3B1502] opacity-60" />
            <div className="absolute top-1/4 inset-x-0 h-3 bg-gradient-to-r from-[#D97706] via-[#FEF08A] to-[#F59E0B] shadow-md border-y border-[#78350F]" />
            <div className="absolute top-2/4 inset-x-0 h-3 bg-gradient-to-r from-[#D97706] via-[#FEF08A] to-[#F59E0B] shadow-md border-y border-[#78350F]" />
            <div className="absolute top-3/4 inset-x-0 h-3 bg-gradient-to-r from-[#D97706] via-[#FEF08A] to-[#F59E0B] shadow-md border-y border-[#78350F]" />
          </div>

          {/* Pillar Base Pedestal */}
          <div className="w-full h-24 bg-gradient-to-t from-[#260B02] via-[#451A03] to-[#78350F] border-l-2 border-[#F59E0B]/50 relative">
            <div className="absolute top-0 inset-x-0 h-3 bg-[#FBBF24] border-b border-[#78350F]" />
            <div className="absolute inset-x-2 bottom-3 h-10 border border-[#F59E0B]/40 rounded-lg flex items-center justify-center">
              <span className="text-xs text-amber-300 font-festive">ॐ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Subtle Edge Pillars (Slim Golden Trim Framing) */}
      <div className="block sm:hidden absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-amber-600/40 via-yellow-500/30 to-transparent z-10" />
      <div className="block sm:hidden absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-amber-600/40 via-yellow-500/30 to-transparent z-10" />

      {/* ──────────────────────────────────────────────────────────────────────
          4. GLOWING STAGE RANGOLI FLOOR MANDALA
         ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none w-[550px] sm:w-[850px] md:w-[1100px] h-48 sm:h-64 overflow-hidden">
        <div
          className={`w-full h-full flex items-end justify-center ${
            reducedMotion ? '' : 'animate-stage-rangoli'
          }`}
        >
          <svg
            viewBox="0 0 800 400"
            fill="none"
            className="w-full h-auto drop-shadow-[0_0_25px_rgba(245,158,11,0.35)]"
          >
            {/* Concentric Semicircular Lotus Rangoli */}
            <circle cx="400" cy="400" r="360" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.6" />
            <circle cx="400" cy="400" r="320" stroke="#E11D48" strokeWidth="2" opacity="0.5" />
            <circle cx="400" cy="400" r="260" stroke="#FBBF24" strokeWidth="1.5" opacity="0.7" />
            <circle cx="400" cy="400" r="190" stroke="#EA580C" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
            <circle cx="400" cy="400" r="120" stroke="#FDE047" strokeWidth="2" opacity="0.8" />

            {/* Geometric Rangoli Star Rays */}
            <polygon
              points="400,40 430,300 700,400 430,400 400,400 370,400 100,400 370,300"
              fill="url(#rangoliGoldGrad)"
              opacity="0.25"
            />
            <polygon
              points="400,120 425,320 620,400 425,400 400,400 375,400 180,400 375,320"
              fill="url(#rangoliCrimsonGrad)"
              opacity="0.3"
            />

            {/* Rangoli Radial Petal Dots */}
            {Array.from({ length: 19 }).map((_, i) => {
              const rad = (i * Math.PI) / 18;
              const cx = 400 + Math.cos(rad) * 320;
              const cy = 400 - Math.sin(rad) * 320;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#FEF08A"
                  stroke="#F59E0B"
                  strokeWidth="1"
                />
              );
            })}

            <defs>
              <linearGradient id="rangoliGoldGrad" x1="400" y1="40" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE047" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="rangoliCrimsonGrad" x1="400" y1="120" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FB7185" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#9F1239" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
