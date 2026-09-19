import React, { useMemo } from 'react';

interface FloatingPetalsProps {
  count?: number;
  reducedMotion?: boolean;
}

export const FloatingPetals: React.FC<FloatingPetalsProps> = ({ count = 22, reducedMotion = false }) => {
  const petals = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${(i * 97) % 100}%`,
      animationDuration: `${7 + ((i * 3) % 8)}s`,
      animationDelay: `${((i * 1.7) % 6)}s`,
      size: 14 + ((i * 5) % 12),
      isMarigold: i % 2 === 0,
      opacity: 0.5 + ((i % 5) * 0.1),
    }));
  }, [count]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map(p => (
        <div
          key={p.id}
          className="absolute -top-10 animate-float-slow transition-transform"
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            opacity: p.opacity,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 30 30" fill="none">
            {p.isMarigold ? (
              // Orange Marigold petal
              <path
                d="M15 2 C22 8, 26 18, 15 28 C4 18, 8 8, 15 2 Z"
                fill="#F59E0B"
                stroke="#EA580C"
                strokeWidth="1"
              />
            ) : (
              // Rose Pink petal
              <path
                d="M15 2 C23 10, 24 20, 15 28 C6 20, 7 10, 15 2 Z"
                fill="#FB7185"
                stroke="#E11D48"
                strokeWidth="1"
              />
            )}
          </svg>
        </div>
      ))}
    </div>
  );
};
