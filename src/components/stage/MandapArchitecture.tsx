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
          1. PANDAL CEILING CANOPY & SILK BACKDROP (CHANDOBA FABRIC DRAPES)
         ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        {/* Warm Silk Pandal Backdrop: Crimson & Deep Saffron Radial Folds */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3B0716] via-[#2A0824] to-[#16021F] opacity-95" />
        
        {/* Radiating Canopy Pleats (Fabric Tent ceiling of the Mandap) */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-35"
        >
          <defs>
            <radialGradient id="canopyGlow" cx="50%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#BE123C" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#4C0519" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </radialGradient>
            <linearGradient id="pleatGradA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#BE123C" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4C0519" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="pleatGradB" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#9F1239" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4C0519" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#canopyGlow)" />

          {/* Radiating decorative fabric folds radiating from behind Bappa */}
          {[-700, -500, -300, -100, 100, 300, 500, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100].map((x, i) => (
            <polygon
              key={i}
              points={`720,300 ${x},0 ${x + 90},0`}
              fill={i % 2 === 0 ? 'url(#pleatGradA)' : 'url(#pleatGradB)'}
              opacity="0.4"
            />
          ))}
        </svg>

        {/* Ambient Sanctum Divine Golden Core Warmth */}
        <div className="absolute top-[32%] sm:top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          2. CENTRAL CARVED GOLDEN MAKHAR (TEMPLE SHRINE ARCH BEHIND BAPPA)
         ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-[28%] sm:top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-5">
        <div className={`w-[260px] sm:w-[480px] md:w-[680px] h-[260px] sm:h-[480px] md:h-[680px] transition-transform ${
          reducedMotion ? 'opacity-50' : 'animate-pulse-glow opacity-60'
        }`}>
          <svg viewBox="0 0 500 500" fill="none" className="w-full h-full drop-shadow-[0_0_25px_rgba(251,191,36,0.55)]">
            <defs>
              <linearGradient id="makharGoldLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="makharRedTrim" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
            </defs>

            {/* Outer Sacred Sunburst Rays (32 rays) */}
            {Array.from({ length: 32 }).map((_, i) => {
              const angle = (i * 360) / 32;
              return (
                <polygon
                  key={i}
                  points="250,18 244,48 256,48"
                  fill="url(#makharGoldLight)"
                  transform={`rotate(${angle} 250 250)`}
                  opacity="0.8"
                />
              );
            })}

            {/* Sacred Concentric Carved Rings */}
            <circle cx="250" cy="250" r="215" stroke="url(#makharGoldLight)" strokeWidth="3.5" />
            <circle cx="250" cy="250" r="202" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.85" />
            <circle cx="250" cy="250" r="192" stroke="url(#makharRedTrim)" strokeWidth="4" opacity="0.9" />

            {/* 20 Carved Sacred Lotus Petals */}
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i * 360) / 20;
              return (
                <path
                  key={i}
                  d="M 250 58 C 265 110, 265 150, 250 175 C 235 150, 235 110, 250 58 Z"
                  fill="url(#makharGoldLight)"
                  opacity="0.45"
                  transform={`rotate(${angle} 250 250)`}
                />
              );
            })}

            {/* Inner Ring with Pearl Beading */}
            <circle cx="250" cy="250" r="145" stroke="#FDE047" strokeWidth="2.5" opacity="0.9" />
            <circle cx="250" cy="250" r="120" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          3. ROYAL CRIMSON & GOLD VELVET DRAPED PANDAL CURTAINS (LEFT & RIGHT)
         ────────────────────────────────────────────────────────────────────── */}
      {/* Left Velvet Curtain Drapes */}
      <div className="absolute top-0 left-0 bottom-0 w-2 sm:w-28 md:w-44 lg:w-56 z-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full relative bg-gradient-to-r from-[#3B0716] via-[#7F1D1D] to-[#991B1B] shadow-[6px_0_20px_rgba(0,0,0,0.7)] border-r border-[#F59E0B]/70">
          {/* Vertical Pleated Folds Texture */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/35" />
          <div className="hidden sm:block absolute top-0 bottom-0 left-1/4 w-3 bg-black/30 blur-[2px]" />
          <div className="hidden sm:block absolute top-0 bottom-0 left-2/4 w-3 bg-black/30 blur-[2px]" />
          <div className="hidden sm:block absolute top-0 bottom-0 left-3/4 w-3 bg-black/30 blur-[2px]" />

          {/* Golden Brocade Zari Border on inner edge */}
          <div className="absolute top-0 bottom-0 right-0 w-2 sm:w-7 bg-gradient-to-b from-[#F59E0B] via-[#FEF08A] to-[#B45309] shadow-md flex flex-col justify-around py-6">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="hidden sm:block w-2 h-2 sm:w-3.5 sm:h-3.5 rounded-full bg-[#78350F] mx-auto border border-[#FEF08A]/60" />
            ))}
          </div>

          {/* Royal Golden Rope Tie-back with Tassels (Desktop only) */}
          <div className="hidden sm:flex absolute top-[48%] right-2 sm:right-5 -translate-y-1/2 w-8 sm:w-14 h-12 sm:h-20 bg-gradient-to-b from-[#FDE047] via-[#F59E0B] to-[#92400E] rounded-xl shadow-2xl border-2 border-[#FEF08A] flex-col items-center justify-center">
            <span className="text-xs sm:text-base text-amber-950 font-bold">⚜️</span>
            <div className="w-2 h-4 sm:h-6 bg-[#B45309] rounded-b-md mt-1 border border-amber-300" />
          </div>
        </div>
      </div>

      {/* Right Velvet Curtain Drapes */}
      <div className="absolute top-0 right-0 bottom-0 w-2 sm:w-28 md:w-44 lg:w-56 z-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full relative bg-gradient-to-l from-[#3B0716] via-[#7F1D1D] to-[#991B1B] shadow-[-6px_0_20px_rgba(0,0,0,0.7)] border-l border-[#F59E0B]/70">
          {/* Vertical Pleated Folds Texture */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-transparent to-black/35" />
          <div className="hidden sm:block absolute top-0 bottom-0 right-1/4 w-3 bg-black/30 blur-[2px]" />
          <div className="hidden sm:block absolute top-0 bottom-0 right-2/4 w-3 bg-black/30 blur-[2px]" />
          <div className="hidden sm:block absolute top-0 bottom-0 right-3/4 w-3 bg-black/30 blur-[2px]" />

          {/* Golden Brocade Zari Border on inner edge */}
          <div className="absolute top-0 bottom-0 left-0 w-2 sm:w-7 bg-gradient-to-b from-[#F59E0B] via-[#FEF08A] to-[#B45309] shadow-md flex flex-col justify-around py-6">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="hidden sm:block w-2 h-2 sm:w-3.5 sm:h-3.5 rounded-full bg-[#78350F] mx-auto border border-[#FEF08A]/60" />
            ))}
          </div>

          {/* Royal Golden Rope Tie-back with Tassels (Desktop only) */}
          <div className="hidden sm:flex absolute top-[48%] left-2 sm:left-5 -translate-y-1/2 w-8 sm:w-14 h-12 sm:h-20 bg-gradient-to-b from-[#FDE047] via-[#F59E0B] to-[#92400E] rounded-xl shadow-2xl border-2 border-[#FEF08A] flex-col items-center justify-center">
            <span className="text-xs sm:text-base text-amber-950 font-bold">⚜️</span>
            <div className="w-2 h-4 sm:h-6 bg-[#B45309] rounded-b-md mt-1 border border-amber-300" />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          4. GRAND CARVED GOLDEN MANDAP PILLARS (STAMBH - Desktop/Tablet)
         ────────────────────────────────────────────────────────────────────── */}
      {/* Left Pillar */}
      <div className="hidden sm:block absolute top-0 left-24 md:left-40 lg:left-52 bottom-0 w-8 md:w-10 z-11 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-[#78350F] via-[#F59E0B] to-[#FEF08A] shadow-[0_0_15px_rgba(245,158,11,0.4)] border-x-2 border-[#451A03] relative">
          {/* Pillar Pediment / Capital Rings with Golden Filigree */}
          <div className="absolute top-0 inset-x-0 h-6 sm:h-10 bg-gradient-to-b from-[#FEF08A] via-[#F59E0B] to-[#78350F] border-b-2 border-amber-950" />
          <div className="absolute top-1/4 inset-x-0 h-3 sm:h-4 bg-[#451A03] border-y border-[#FEF08A]" />
          <div className="absolute top-2/4 inset-x-0 h-3 sm:h-4 bg-[#451A03] border-y border-[#FEF08A]" />
          <div className="absolute top-3/4 inset-x-0 h-3 sm:h-4 bg-[#451A03] border-y border-[#FEF08A]" />
          <div className="absolute bottom-0 inset-x-0 h-8 sm:h-12 bg-gradient-to-t from-[#FEF08A] via-[#F59E0B] to-[#78350F] border-t-2 border-amber-950" />

          {/* Hanging Brass Temple Bell on Pillar */}
          <div className="absolute top-36 -right-2 sm:-right-4 w-4 sm:w-6 flex flex-col items-center">
            <div className="w-0.5 h-6 bg-red-600" />
            <div className="w-3 sm:w-5 h-3 sm:h-4 bg-gradient-to-b from-[#FEF08A] to-[#B45309] rounded-t-full shadow-md border border-yellow-200" />
            <div className="w-1.5 h-1.5 bg-[#451A03] rounded-full" />
          </div>
        </div>
      </div>

      {/* Right Pillar (Desktop/Tablet) */}
      <div className="hidden sm:block absolute top-0 right-24 md:right-40 lg:right-52 bottom-0 w-8 md:w-10 z-11 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-l from-[#78350F] via-[#F59E0B] to-[#FEF08A] shadow-[0_0_15px_rgba(245,158,11,0.4)] border-x-2 border-[#451A03] relative">
          <div className="absolute top-0 inset-x-0 h-6 sm:h-10 bg-gradient-to-b from-[#FEF08A] via-[#F59E0B] to-[#78350F] border-b-2 border-amber-950" />
          <div className="absolute top-1/4 inset-x-0 h-3 sm:h-4 bg-[#451A03] border-y border-[#FEF08A]" />
          <div className="absolute top-2/4 inset-x-0 h-3 sm:h-4 bg-[#451A03] border-y border-[#FEF08A]" />
          <div className="absolute top-3/4 inset-x-0 h-3 sm:h-4 bg-[#451A03] border-y border-[#FEF08A]" />
          <div className="absolute bottom-0 inset-x-0 h-8 sm:h-12 bg-gradient-to-t from-[#FEF08A] via-[#F59E0B] to-[#78350F] border-t-2 border-amber-950" />

          {/* Hanging Brass Temple Bell on Pillar */}
          <div className="absolute top-36 -left-2 sm:-left-4 w-4 sm:w-6 flex flex-col items-center">
            <div className="w-0.5 h-6 bg-red-600" />
            <div className="w-3 sm:w-5 h-3 sm:h-4 bg-gradient-to-b from-[#FEF08A] to-[#B45309] rounded-t-full shadow-md border border-yellow-200" />
            <div className="w-1.5 h-1.5 bg-[#451A03] rounded-full" />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          5. GRAND MANDAP TOP ARCH (ORNATE CARVED GOLDEN TORAN & KALASH FINIAL)
         ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 w-full z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 140"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-20 sm:h-28 md:h-36 drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)]"
        >
          <defs>
            <linearGradient id="grandArchGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="25%" stopColor="#F59E0B" />
              <stop offset="65%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="scallopVelvet" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BE123C" />
              <stop offset="50%" stopColor="#881337" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>
          </defs>

          {/* Main Top Mandap Beam */}
          <rect x="0" y="0" width="1440" height="26" fill="url(#grandArchGold)" />
          <line x1="0" y1="26" x2="1440" y2="26" stroke="#451A03" strokeWidth="3" />

          {/* Royal Velvet Scalloped Valance Drapes */}
          <path
            d="M 0 26 
               C 120 26, 160 70, 240 72
               C 320 74, 360 26, 480 26
               C 600 26, 640 70, 720 72
               C 800 74, 840 26, 960 26
               C 1080 26, 1120 70, 1200 72
               C 1280 74, 1320 26, 1440 26
               L 1440 38
               C 1320 38, 1280 84, 1200 82
               C 1120 80, 1080 38, 960 38
               C 840 38, 800 84, 720 82
               C 640 80, 600 38, 480 38
               C 360 38, 320 84, 240 82
               C 160 80, 120 38, 0 38
               Z"
            fill="url(#scallopVelvet)"
            stroke="#FEF08A"
            strokeWidth="2"
          />

          {/* Grand Carved Scalloped Golden Arch */}
          <path
            d="M 0 26 
               L 120 26
               C 220 26, 280 98, 440 102
               C 560 106, 620 58, 720 58
               C 820 58, 880 106, 1000 102
               C 1160 98, 1220 26, 1320 26
               L 1440 26
               L 1440 48
               C 1300 48, 1220 118, 1000 122
               C 860 126, 800 78, 720 78
               C 640 78, 580 126, 440 122
               C 220 118, 140 48, 0 48
               Z"
            fill="url(#grandArchGold)"
            stroke="#FEF08A"
            strokeWidth="2"
          />

          {/* Sacred Central Kalash Finial with Coconut & Mango Leaves */}
          <g transform="translate(720, 22)">
            <ellipse cx="0" cy="22" rx="26" ry="18" fill="#F59E0B" stroke="#FEF08A" strokeWidth="3" />
            <path d="M -22 14 L 22 14 L 14 0 Z" fill="#D97706" stroke="#FEF08A" strokeWidth="2" />
            <ellipse cx="0" cy="-4" rx="14" ry="16" fill="#78350F" stroke="#F59E0B" strokeWidth="2.5" />
            <path d="M -12 2 C -24 -12, -28 -20, -16 -24 C -4 -22, -2 -8, -2 0 Z" fill="#047857" stroke="#10B981" />
            <path d="M 12 2 C 24 -12, 28 -20, 16 -24 C 4 -22, 2 -8, 2 0 Z" fill="#047857" stroke="#10B981" />
            <path d="M 0 -4 C -5 -18, 0 -32, 0 -34 C 0 -32, 5 -18, 0 -4 Z" fill="#10B981" />
          </g>
        </svg>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          6. CONSECRATED SACRED ALTAR DAIS (CHAURANG / PEETHA) & GLOWING SAMAI
         ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 h-8 sm:h-36 z-5 pointer-events-none flex justify-center items-end">
        <div className="w-full max-w-5xl h-8 sm:h-28 bg-gradient-to-t from-[#1F020B] via-[#4A051B] to-[#7F1D1D] rounded-t-3xl border-t-2 sm:border-t-3 border-[#F59E0B] shadow-[0_-8px_30px_rgba(245,158,11,0.25)] relative overflow-hidden flex flex-col items-center">
          {/* Golden Zari Lace Trim on Dais */}
          <div className="w-full h-1.5 sm:h-3 bg-gradient-to-r from-[#D97706] via-[#FEF08A] to-[#D97706] shadow-md" />
          
          {/* Sacred Auspicious Shloka on Altar (Tablet & Desktop only) */}
          <div className="mt-2 text-amber-200 font-festive text-xs sm:text-base font-extrabold hidden sm:flex items-center gap-2 sm:gap-4 tracking-widest opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span>🌸</span>
            <span>॥ श्री गणेशाय नमः • सुखकर्ता दुःखहर्ता ॥</span>
            <span>🌸</span>
          </div>

          {/* Twin Traditional Tall Brass Samai Lamps on Altar Flanks */}
          <div className="w-full flex justify-between px-6 sm:px-16 mt-auto pb-2">
            {/* Left Brass Samai */}
            <div className="flex flex-col items-center">
              <div className="w-3.5 h-5 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 rounded-full animate-flame blur-[0.5px] shadow-[0_0_16px_rgba(251,191,36,1)]" />
              <div className="w-8 h-2.5 bg-gradient-to-r from-[#B45309] via-[#FDE047] to-[#B45309] rounded-full mt-0.5 border border-amber-300" />
              <div className="w-2.5 h-7 bg-[#92400E] border-x border-[#FDE68A]" />
              <div className="w-10 h-3 bg-gradient-to-r from-[#78350F] via-[#F59E0B] to-[#78350F] rounded-md shadow-md" />
            </div>

            {/* Right Brass Samai */}
            <div className="flex flex-col items-center">
              <div className="w-3.5 h-5 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 rounded-full animate-flame blur-[0.5px] shadow-[0_0_16px_rgba(251,191,36,1)]" />
              <div className="w-8 h-2.5 bg-gradient-to-r from-[#B45309] via-[#FDE047] to-[#B45309] rounded-full mt-0.5 border border-amber-300" />
              <div className="w-2.5 h-7 bg-[#92400E] border-x border-[#FDE68A]" />
              <div className="w-10 h-3 bg-gradient-to-r from-[#78350F] via-[#F59E0B] to-[#78350F] rounded-md shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandapArchitecture;
