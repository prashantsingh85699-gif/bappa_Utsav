import React, { useState, useEffect, useRef } from 'react';
import { BappaMurti } from '../common/BappaMurti';
import { FestivalSpinner } from './FestivalSpinner';
import { audioManager } from '../../services/audioService';

interface LoadingScreenProps {
  onComplete: () => void;
  message?: string;
}

const BLESSING_QUOTES = [
  "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ • निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा",
  "May Lord Ganesha remove all obstacles and illuminate your path with wisdom.",
  "Lord Ganesha’s large ears remind us to listen with patience and deep compassion.",
  "The sacred Modak represents the supreme sweetness of self-knowledge and liberation.",
  "Ganpati Bappa Morya! Celebrating the joy of new beginnings with devotion."
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, message }) => {
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);

  useEffect(() => {
    // Quote rotation with smooth crossfade
    const quoteTimer = setInterval(() => {
      setQuoteFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % BLESSING_QUOTES.length);
        setQuoteFade(true);
      }, 250);
    }, 3200);

    // Progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          clearInterval(quoteTimer);
          if (!completedRef.current) {
            completedRef.current = true;
            setTimeout(() => {
              onCompleteRef.current();
            }, 300);
          }
          return 100;
        }
        return prev + 5;
      });
    }, 75);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  const handleInstantEnter = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    audioManager.init();
    audioManager.playTempleBell();
    onCompleteRef.current();
  };

  return (
    <div
      onClick={handleInstantEnter}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#0E021C] text-center select-none cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Background Ambience Glow & Rays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/15 to-purple-600/20 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0,transparent_70%)] pointer-events-none" />

      {/* Top Auspicious Header */}
      <div className="pt-4 flex items-center gap-2 text-amber-300/90 font-festive text-sm uppercase tracking-widest animate-fade-in">
        <span className="text-amber-400">॥</span>
        <span>श्री गणेशाय नमः</span>
        <span className="text-amber-400">॥</span>
      </div>

      {/* Centerpiece: Lord Ganesha & Spinner */}
      <div className="flex flex-col items-center max-w-sm mx-auto my-auto space-y-4">
        <div className="relative">
          <div className="animate-scale-pulse">
            <BappaMurti size={230} className="scale-100 sm:scale-105 filter drop-shadow-[0_0_25px_rgba(245,158,11,0.35)]" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <FestivalSpinner size="sm" />
          </div>
        </div>

        <div className="pt-2">
          <h1 className="text-3xl sm:text-4xl font-festive font-black tracking-wider text-amber-100 drop-shadow-[0_4px_16px_rgba(245,158,11,0.6)]">
            BAPPA UTSAV
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-amber-300/90 tracking-widest uppercase mt-1">
            Play • Celebrate • Create • Morya!
          </p>
        </div>

        {/* Dynamic Blessing Quote with Smooth Fade */}
        <div className="h-14 flex items-center justify-center px-4">
          <p 
            className={`text-xs text-amber-200/85 italic font-medium leading-relaxed transition-opacity duration-300 ${
              quoteFade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            "{BLESSING_QUOTES[quoteIndex]}"
          </p>
        </div>

        {/* Progress Bar with Shimmer */}
        <div className="w-64 sm:w-80 space-y-2">
          <div className="h-2.5 w-full bg-purple-950/80 rounded-full p-0.5 border border-amber-500/40 overflow-hidden shadow-inner relative">
            <div
              className="h-full rounded-full festive-gold-gradient transition-all duration-150 relative overflow-hidden shadow-[0_0_12px_#F59E0B]"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 progress-bar-shimmer" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] text-amber-400/80 font-mono tracking-wide">
            <span>{message || 'Opening Sanctum Gate...'}</span>
            <span className="font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Footer Callout */}
      <div className="pb-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-300/70 hover:text-amber-200 animate-pulse font-medium">
          Tap anywhere to enter Sanctum <span className="text-sm">🪔</span>
        </span>
      </div>
    </div>
  );
};
