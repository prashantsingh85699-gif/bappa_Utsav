import React from 'react';

export type CardVariant = 'glass' | 'glow' | 'ornate' | 'stat-pill';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  cornerMotifs?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'md',
  interactive = false,
  cornerMotifs = false,
  className = '',
  ...rest
}) => {
  const paddingStyles: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles: Record<CardVariant, string> = {
    glass: 'festive-glass rounded-3xl',
    glow: 'festive-glass-glow rounded-3xl',
    ornate: 'festive-glass-glow rounded-3xl border-2 border-amber-400/50 shadow-gold-glow',
    'stat-pill': 'bg-black/40 border border-amber-500/30 rounded-2xl',
  };

  const interactiveStyle = interactive
    ? 'card-hover-lift cursor-pointer'
    : '';

  return (
    <div
      {...rest}
      className={`relative select-none ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyle} ${className}`}
    >
      {/* Optional Ornate Golden Corner Accents */}
      {cornerMotifs && (
        <>
          <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/80 rounded-tl pointer-events-none transition-opacity duration-200" />
          <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/80 rounded-tr pointer-events-none transition-opacity duration-200" />
          <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/80 rounded-bl pointer-events-none transition-opacity duration-200" />
          <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/80 rounded-br pointer-events-none transition-opacity duration-200" />
        </>
      )}
      {children}
    </div>
  );
};
