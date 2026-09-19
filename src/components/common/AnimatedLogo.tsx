import React from 'react';
import { Sparkles } from 'lucide-react';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className = '', size = 'lg' }) => {
  const isLarge = size === 'lg';

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Radiant Rotating Mandala / Sunburst Halo Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10 flex items-center justify-center">
        {/* Outer ambient golden glow */}
        <div className="w-72 sm:w-96 h-28 sm:h-36 bg-gradient-to-r from-amber-500/25 via-yellow-400/35 to-rose-500/25 blur-3xl rounded-full animate-pulse-glow" />

        {/* Slow rotating divine sunburst rays */}
        <svg
          className="absolute w-64 sm:w-80 h-64 sm:h-80 opacity-20 animate-spin-slow text-yellow-300"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 8" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="100"
              y1="18"
              x2="100"
              y2="30"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </svg>

        {/* Reverse rotating fine sacred mandala ring */}
        <svg
          className="absolute w-52 sm:w-68 h-52 sm:h-68 opacity-15 animate-spin-reverse-slow text-amber-400"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 5" />
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
            <circle
              key={deg}
              cx="100"
              cy="48"
              r="2"
              fill="currentColor"
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </svg>
      </div>

      {/* Auspicious Invocation Header */}
      <div className="flex items-center gap-2 mb-1 animate-fade-in">
        <span className="text-amber-400/70 text-xs sm:text-sm font-serif">✦</span>
        <span className="text-[11px] sm:text-xs font-shloka font-bold tracking-widest text-amber-300/90 uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-inner">
          ॥ श्री गणेशाय नमः ॥
        </span>
        <span className="text-amber-400/70 text-xs sm:text-sm font-serif">✦</span>
      </div>

      {/* Main Logo Container with 3D Shimmering Text & Sparkles */}
      <div className="relative group cursor-default">
        {/* Floating Sparkles Accents */}
        <div className="absolute -top-3 -left-3 sm:-left-5 text-amber-300 animate-float-slow">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 drop-shadow-[0_0_8px_#F59E0B]" />
        </div>
        <div className="absolute -bottom-2 -right-3 sm:-right-5 text-amber-400 animate-float-sway">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 drop-shadow-[0_0_8px_#FBBF24]" />
        </div>

        {/* BAPPA UTSAV Lettermark */}
        <div className="relative inline-block">
          {/* Subtle 3D background drop text for depth */}
          <span
            className={`absolute top-1 left-0 right-0 font-festive font-black tracking-widest sm:tracking-[0.18em] text-transparent select-none filter blur-[1px] opacity-40 ${
              isLarge ? 'text-4xl sm:text-6xl md:text-7xl' : 'text-3xl sm:text-5xl'
            }`}
            style={{
              WebkitTextStroke: '2px #78350F',
            }}
            aria-hidden="true"
          >
            BAPPA UTSAV
          </span>

          {/* Primary Golden Shimmer Title */}
          <h1
            className={`relative font-festive font-black tracking-widest sm:tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-b from-[#FFFBEB] via-[#FDE047] to-[#D97706] drop-shadow-[0_4px_18px_rgba(245,158,11,0.7)] transition-all duration-300 group-hover:scale-[1.02] ${
              isLarge ? 'text-4xl sm:text-6xl md:text-7xl' : 'text-3xl sm:text-5xl'
            }`}
            style={{
              textShadow: '0 0 25px rgba(251, 191, 36, 0.45), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            BAPPA UTSAV
          </h1>
        </div>
      </div>

      {/* Festive Slogan / Decorative Ribbon */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 mt-1.5 text-center">
        <span className="inline-block w-4 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-400/60" />
        <p className="text-xs sm:text-sm md:text-base font-bold text-amber-200/95 tracking-wider sm:tracking-widest flex items-center gap-1.5">
          <span>Play</span>
          <span className="text-amber-400 text-[10px]">•</span>
          <span>Celebrate</span>
          <span className="text-amber-400 text-[10px]">•</span>
          <span>Create</span>
          <span className="text-amber-400 text-[10px]">•</span>
          <span className="text-yellow-300 font-festive">Morya!</span>
        </p>
        <span className="inline-block w-4 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-400/60" />
      </div>
    </div>
  );
};
