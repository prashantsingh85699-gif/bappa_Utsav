import React, { useEffect, useState } from 'react';
import { Sparkles, Crown, Award, ChevronRight } from 'lucide-react';
import { DecorationDef } from '../../types';
import { audioManager } from '../../services/audioService';
import { fireFestiveConfetti } from '../../utils/confetti';
import { DecorItemVector } from '../common/DecorItemVector';
import { Button } from './Button';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  levelTitle: string;
  unlockedItems: DecorationDef[];
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  level,
  levelTitle,
  unlockedItems,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      audioManager.playFanfare();
      fireFestiveConfetti();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    audioManager.playTempleBell();
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none transition-opacity duration-200 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'animate-fade-in'
      }`}
    >
      {/* Radiant Golden Backdrop Glow */}
      <div className="absolute w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Main Modal Card */}
      <div 
        className={`relative w-full max-w-md festive-glass-glow rounded-3xl p-6 sm:p-8 border-2 border-amber-400/60 shadow-2xl text-center overflow-hidden will-change-transform ${
          isClosing ? 'animate-modal-exit' : 'animate-modal-pop'
        }`}
      >
        {/* Rotating Sunburst Accent behind the badge */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />

        {/* Level Badge with majestic breathing glow */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-orange-500 p-1 shadow-[0_0_40px_rgba(245,158,11,0.65)] animate-scale-pulse">
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border-2 border-amber-300">
              <Crown className="w-6 h-6 text-amber-300 mb-0.5" />
              <span className="text-2xl font-black festive-text-gold leading-none">
                Lv.{level}
              </span>
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-300 animate-spin-slow" />
        </div>

        {/* Level Up Headline */}
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/50 inline-block mb-2 shadow-sm">
          🌟 Level Up! 🌟
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-festive text-amber-100 mb-1">
          {levelTitle}
        </h2>
        <p className="text-xs text-amber-300/80 mb-6 font-medium leading-relaxed">
          Your devotion and festival spirit have elevated your sacred devotee rank!
        </p>

        {/* Unlocked Decorations Showcase */}
        {unlockedItems.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-black/50 border border-amber-500/30 text-left animate-slide-up">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Newly Unlocked Mandap Decorations</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {unlockedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 flex flex-col items-center text-center group hover:bg-amber-500/20 transition-all card-hover-lift"
                >
                  <div className="w-10 h-10 mb-1 flex items-center justify-center">
                    <DecorItemVector svgType={item.svgType} width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-bold text-amber-200 line-clamp-1">
                    {item.name}
                  </span>
                  <span className="text-[8px] text-amber-400/60 uppercase font-semibold">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue CTA */}
        <Button
          variant="primary-gold"
          size="lg"
          fullWidth
          shine
          glow
          onClick={handleClose}
          icon={<ChevronRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Receive Blessings & Continue
        </Button>
      </div>
    </div>
  );
};
