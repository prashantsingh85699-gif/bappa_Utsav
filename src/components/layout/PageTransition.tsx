import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`w-full flex-1 flex flex-col animate-slide-in-up pb-24 md:pb-8 will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};
