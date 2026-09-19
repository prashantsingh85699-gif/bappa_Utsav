import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { audioManager } from '../../services/audioService';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setIsClosing(false);
    } else if (mounted) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
      }, 190);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

  const handleClose = () => {
    if (isClosing) return;
    audioManager.playClick();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen || mounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, mounted]);

  if (!mounted && !isOpen) return null;

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md select-none transition-opacity duration-200 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'animate-fade-in'
      }`}
    >
      {/* Backdrop Click Dismiss */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      {/* Modal Container: Bottom Sheet on Mobile, Centered Card on Tablet/Desktop */}
      <div
        className={`relative w-full max-w-full ${maxWidthClasses[maxWidth]} box-border festive-glass-glow rounded-t-3xl sm:rounded-3xl border-t border-b-0 border-x-0 sm:border border-amber-500/50 shadow-2xl p-4 sm:p-7 z-10 max-h-[88dvh] sm:max-h-[90vh] flex flex-col will-change-transform ${
          isClosing ? 'animate-modal-exit' : 'animate-modal-pop'
        }`}
      >
        {/* Mobile drag handle notch */}
        <div className="w-12 h-1.5 bg-amber-500/40 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Decorative corner glows */}
        <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-amber-500/20 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-rose-500/20 blur-xl pointer-events-none" />

        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between pb-3.5 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-xl shadow-md flex-shrink-0 animate-scale-pulse">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-lg sm:text-2xl font-bold font-festive text-amber-100 leading-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-amber-300/80 font-medium mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-300 transition-colors active-press flex-shrink-0 ml-2 touch-target"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-4 pr-1 text-left space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
