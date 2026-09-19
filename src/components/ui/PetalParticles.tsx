import React, { useMemo } from 'react';

interface PetalParticlesProps {
  count?: number;
  reducedMotion?: boolean;
}

export const PetalParticles: React.FC<PetalParticlesProps> = ({ count = 16, reducedMotion = false }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const type = i % 3 === 0 ? 'marigold_orange' : i % 3 === 1 ? 'marigold_yellow' : 'rose_pink';
      const swayX = ((i % 5) - 2) * 20 + 15; // -25px to +35px sway
      return {
        id: i,
        left: `${(i * 100) / count + ((i % 3) * 4 - 6)}%`,
        duration: `${7.5 + ((i * 1.7) % 6)}s`,
        delay: `${(i * 1.1) % 7}s`,
        size: 13 + ((i * 3) % 10),
        type,
        opacity: 0.4 + ((i % 4) * 0.12),
        swayX: `${swayX}px`,
      };
    });
  }, [count]);

  if (reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-petal-fall"
          style={{
            left: p.left,
            top: '-6%',
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
            ['--sway-x' as string]: p.swayX,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 30 30" fill="none">
            {p.type === 'marigold_orange' && (
              <path
                d="M15 2 C23 8, 26 18, 15 28 C4 18, 7 8, 15 2 Z"
                fill="#EA580C"
                stroke="#F59E0B"
                strokeWidth="1"
              />
            )}
            {p.type === 'marigold_yellow' && (
              <path
                d="M15 2 C22 9, 25 19, 15 28 C5 19, 8 9, 15 2 Z"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="1"
              />
            )}
            {p.type === 'rose_pink' && (
              <path
                d="M15 2 C24 10, 23 20, 15 28 C7 20, 6 10, 15 2 Z"
                fill="#FB7185"
                stroke="#BE123C"
                strokeWidth="1"
              />
            )}
          </svg>
        </div>
      ))}
    </div>
  );
};
