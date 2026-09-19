import React from 'react';

interface FestivalSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FestivalSpinner: React.FC<FestivalSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizePx = size === 'sm' ? 44 : size === 'lg' ? 96 : 64;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer Rotating Ornate Ring */}
      <svg
        width={sizePx}
        height={sizePx}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin-slow"
      >
        <circle cx="50" cy="50" r="46" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <circle
            key={i}
            cx={50 + 46 * Math.cos((angle * Math.PI) / 180)}
            cy={50 + 46 * Math.sin((angle * Math.PI) / 180)}
            r="3"
            fill="#FDE047"
          />
        ))}
      </svg>

      {/* Inner Reverse Rotating Ring */}
      <svg
        width={sizePx * 0.75}
        height={sizePx * 0.75}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute animate-spin-reverse-slow"
      >
        <circle cx="40" cy="40" r="34" stroke="#BE123C" strokeWidth="2" strokeDasharray="4 4" />
        <polygon points="40,8 48,28 68,28 52,40 58,60 40,48 22,60 28,40 12,28 32,28" stroke="#FBBF24" strokeWidth="1.5" fill="none" opacity="0.7" />
      </svg>

      {/* Central Sacred Flame */}
      <div className="absolute text-center animate-diya-flicker">
        <span className="text-xl sm:text-2xl filter drop-shadow-[0_0_8px_#F59E0B]">🪔</span>
      </div>
    </div>
  );
};
