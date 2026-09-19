import React, { useMemo } from 'react';
import { DiyaVector } from '../common/DiyaVector';

interface FloatingDiyasProps {
  count?: number;
  reducedMotion?: boolean;
}

export const FloatingDiyas: React.FC<FloatingDiyasProps> = ({ count = 3, reducedMotion = false }) => {
  const diyas = useMemo(() => {
    const positions = [
      { left: '4%', top: '76%', scale: 0.85, delay: '0s', duration: '5.5s' },
      { left: '88%', top: '74%', scale: 0.85, delay: '1.4s', duration: '6.2s' },
      { left: '10%', top: '22%', scale: 0.7, delay: '2.2s', duration: '7s' },
      { left: '85%', top: '20%', scale: 0.7, delay: '0.8s', duration: '6.8s' },
      { left: '48%', top: '91%', scale: 0.9, delay: '1.8s', duration: '5.8s' },
    ];
    return positions.slice(0, count);
  }, [count]);

  if (reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {diyas.map((d, idx) => (
        <div
          key={idx}
          className="absolute animate-diya-float transition-transform will-change-transform"
          style={{
            left: d.left,
            top: d.top,
            transform: `scale(${d.scale})`,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        >
          {/* Subtle water glow ring beneath diya */}
          <div 
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-14 h-5 rounded-full border border-amber-500/25 bg-amber-500/10 animate-pulse opacity-50 pointer-events-none"
            style={{ animationDuration: '3s' }} 
          />
          <DiyaVector size={46} flicker={true} />
        </div>
      ))}
    </div>
  );
};
