import React from 'react';
import { audioManager } from '../../services/audioService';

export type ButtonVariant = 'primary-gold' | 'secondary-glass' | 'crimson' | 'icon-pill' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  shine?: boolean;
  glow?: boolean;
  sound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary-gold',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  shine = false,
  glow = false,
  sound = true,
  className = '',
  onClick,
  disabled,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (sound) {
      audioManager.playClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Size styling ensuring standard comfortable mobile touch targets
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'min-h-[40px] px-3.5 py-1.5 text-xs rounded-xl gap-1.5 font-semibold',
    md: 'min-h-[46px] px-5 py-2.5 text-sm rounded-2xl gap-2 font-bold',
    lg: 'min-h-[54px] px-7 py-3 text-base rounded-2xl gap-2.5 font-extrabold tracking-wide',
    xl: 'min-h-[62px] px-8 py-3.5 text-lg rounded-2xl gap-3 font-black tracking-wider',
  };

  // Variant styling with refined tactile polish
  const variantStyles: Record<ButtonVariant, string> = {
    'primary-gold': 'btn-3d-gold text-slate-950 border border-yellow-200/80 hover:brightness-105 active:brightness-95',
    'secondary-glass': 'btn-3d-glass text-amber-200 hover:bg-amber-500/20 hover:text-amber-100 hover:border-amber-400/50',
    'crimson': 'btn-3d-crimson text-white border border-rose-300/40 hover:brightness-105 active:brightness-95',
    'icon-pill': 'p-2.5 min-w-[44px] min-h-[44px] rounded-2xl bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 active:scale-95 transition-all flex items-center justify-center hover:border-amber-400/60',
    'ghost': 'bg-transparent text-amber-300 hover:bg-white/10 active:scale-95 transition-all min-h-[44px] px-3 rounded-xl',
  };

  const glowStyle = glow ? 'shadow-gold-glow animate-pulse-glow' : '';
  const shineStyle = shine ? 'shine-sweep' : '';
  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled ? 'opacity-45 cursor-not-allowed pointer-events-none filter grayscale' : 'cursor-pointer active-press';

  return (
    <button
      {...rest}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none overflow-hidden transition-all duration-150 ${variantStyles[variant]} ${variant !== 'icon-pill' ? sizeStyles[size] : ''} ${glowStyle} ${shineStyle} ${widthStyle} ${disabledStyle} ${className}`}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110">{icon}</span>}
      {children && <span className="truncate">{children}</span>}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110">{icon}</span>}
    </button>
  );
};
