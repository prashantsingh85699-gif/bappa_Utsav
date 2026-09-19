import React, { createContext, useContext, useState, useCallback } from 'react';
import { audioManager } from '../services/audioService';

export type ToastType = 'success' | 'info' | 'achievement' | 'alert';

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  icon?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, title, type = 'info', icon, duration = 3500 }: Omit<ToastItem, 'id'>) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

      if (type === 'achievement' || type === 'success') {
        audioManager.playTempleBell();
      } else if (type === 'alert') {
        audioManager.playHazardHit();
      } else {
        audioManager.playClick();
      }

      setToasts((prev) => [...prev.slice(-2), { id, message, title, type, icon, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
