import React from 'react';

interface DiyaVectorProps {
  className?: string;
  size?: number;
  flicker?: boolean;
}

export const DiyaVector: React.FC<DiyaVectorProps> = ({ className = '', size = 56, flicker = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {flicker && (
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400/40 blur-md animate-diya-flicker pointer-events-none"
          style={{ width: size * 0.7, height: size * 0.8 }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative select-none"
      >
        <defs>
          {/* Flame Gradient */}
          <radialGradient id="flameInner" cx="50" cy="35" r="25" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFBEB" />
            <stop offset="0.3" stopColor="#FDE047" />
            <stop offset="0.7" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </radialGradient>
          {/* Clay Bowl Gradient */}
          <linearGradient id="clayGrad" x1="15" y1="50" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D97706" />
            <stop offset="0.4" stopColor="#B45309" />
            <stop offset="1" stopColor="#78350F" />
          </linearGradient>
        </defs>

        {/* Diya Base Clay Bowl */}
        <path 
          d="M15 56 C20 84, 80 84, 85 56 C75 60, 25 60, 15 56 Z" 
          fill="url(#clayGrad)" 
          stroke="#92400E" 
          strokeWidth="2" 
        />
        {/* Diya Lip & Rim */}
        <ellipse cx="50" cy="56" rx="35" ry="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <ellipse cx="50" cy="56" rx="30" ry="5" fill="#78350F" />

        {/* Flickering Sacred Flame */}
        <g className={flicker ? 'animate-diya-flicker origin-bottom' : ''}>
          {/* Outer orange flame */}
          <path 
            d="M50 15 C42 30, 40 45, 50 54 C60 45, 58 30, 50 15 Z" 
            fill="url(#flameInner)" 
          />
          {/* Inner bright yellow core */}
          <path 
            d="M50 25 C46 34, 45 44, 50 50 C55 44, 54 34, 50 25 Z" 
            fill="#FFFBEB" 
          />
        </g>
      </svg>
    </div>
  );
};
