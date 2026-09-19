import React, { useState } from 'react';
import { useToast, ToastItem } from '../../hooks/useToast';
import { X, CheckCircle2, Sparkles, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 w-full max-w-sm px-4 pointer-events-none select-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleClose = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  const typeConfig = {
    success: {
      bg: 'bg-[#18042B]/95 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      bar: 'bg-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      text: 'text-emerald-200',
    },
    achievement: {
      bg: 'bg-[#18042B]/95 border-yellow-400/80 shadow-[0_0_25px_rgba(245,158,11,0.5)]',
      bar: 'bg-yellow-400',
      icon: <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />,
      text: 'text-amber-200',
    },
    alert: {
      bg: 'bg-[#2A0515]/95 border-rose-400/70 shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      bar: 'bg-rose-400',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      text: 'text-rose-200',
    },
    info: {
      bg: 'bg-[#18042B]/95 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      bar: 'bg-amber-400',
      icon: <Info className="w-5 h-5 text-amber-400" />,
      text: 'text-amber-200',
    },
  };

  const config = typeConfig[toast.type];
  const duration = toast.duration || 3500;

  return (
    <div
      className={`pointer-events-auto w-full p-3.5 rounded-2xl border backdrop-blur-xl flex flex-col relative overflow-hidden transition-all duration-200 ${
        isDismissing ? 'animate-toast-out opacity-0' : 'animate-toast-in'
      } ${config.bg}`}
    >
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 text-xl">
            {toast.icon ? toast.icon : config.icon}
          </div>
          <div className="min-w-0">
            {toast.title && (
              <h5 className="text-xs font-bold font-festive text-amber-100 uppercase tracking-wider leading-none mb-0.5">
                {toast.title}
              </h5>
            )}
            <p className={`text-xs font-semibold leading-tight truncate ${config.text}`}>
              {toast.message}
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="p-1.5 rounded-full text-amber-400/60 hover:text-amber-200 hover:bg-white/10 active-press transition-colors flex-shrink-0"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle duration timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
        <div 
          className={`h-full ${config.bar} opacity-70`}
          style={{
            animation: `toastTimer ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toastTimer {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
