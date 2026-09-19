import React, { useEffect, useState } from 'react';
import { RotateCcw, Home, Sparkles, Award } from 'lucide-react';
import { GameResult } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioManager } from '../../services/audioService';
import { fireFestiveConfetti } from '../../utils/confetti';

interface ResultModalProps {
  isOpen: boolean;
  result: GameResult | null;
  onReplay: () => void;
  onGoToHub: () => void;
  allGamesPlayed?: boolean;
  onGoToCompletion?: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  result,
  onReplay,
  onGoToHub,
  allGamesPlayed = false,
  onGoToCompletion,
}) => {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    if (isOpen && result) {
      audioManager.playFanfare();
      fireFestiveConfetti();

      // Smooth count-up score animation
      const target = result.finalScore;
      const duration = 600; // ms
      const startTime = performance.now();

      const animateScore = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuad
        const ease = 1 - (1 - progress) * (1 - progress);
        setDisplayedScore(Math.floor(ease * target));

        if (progress < 1) {
          requestAnimationFrame(animateScore);
        } else {
          setDisplayedScore(target);
        }
      };

      requestAnimationFrame(animateScore);
    } else {
      setDisplayedScore(0);
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onGoToHub}
      title="Round Completed!"
      subtitle={result.gameName}
      icon={<span className="text-2xl">🏆</span>}
      showCloseButton={false}
    >
      <div className="space-y-3.5 text-center">
        {/* Score Breakdown Card */}
        <Card variant="glass" padding="sm" className="space-y-2 text-left border-amber-500/30">
          <div className="flex justify-between items-center text-xs sm:text-sm text-amber-200/80">
            <span>Base Points</span>
            <span className="font-semibold text-amber-100">{result.baseScore.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm text-amber-200/80">
            <span>Performance / Streak</span>
            <span className="font-semibold text-amber-300">{result.comboOrAccuracy}</span>
          </div>

          {result.bonusScore > 0 && (
            <div className="flex justify-between items-center text-xs sm:text-sm text-emerald-400">
              <span>Festival Bonus</span>
              <span className="font-semibold">+{result.bonusScore.toLocaleString()}</span>
            </div>
          )}

          <div className="pt-2 border-t border-amber-500/30 flex justify-between items-center text-base sm:text-lg font-bold">
            <span className="text-amber-300">Final Points Earned</span>
            <span className="text-xl sm:text-2xl festive-text-gold font-black tracking-wide drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
              +{displayedScore.toLocaleString()}
            </span>
          </div>
        </Card>

        {/* Level Up Announcement */}
        {result.newLevelReached && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-amber-500/30 border border-yellow-400/70 text-xs sm:text-sm font-bold text-amber-100 flex items-center justify-center gap-2 shadow-gold-glow animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
            <span>LEVEL UP! Reached Level {result.newLevelReached}!</span>
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
          </div>
        )}

        {/* New Unlocks List */}
        {result.newUnlocks && result.newUnlocks.length > 0 && (
          <Card variant="glass" padding="sm" className="border-amber-400/40 text-left">
            <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              New Mandap Unlocks!
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {result.newUnlocks.map((item) => (
                <div key={item.id} className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-amber-500/30 text-xs active-press">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-amber-200 font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* All Games Milestone Prompt */}
        {allGamesPlayed && onGoToCompletion && (
          <Button
            variant="primary-gold"
            fullWidth
            shine
            glow
            onClick={onGoToCompletion}
            className="mb-2"
          >
            🌟 Experience Maha Aarti Ceremony
          </Button>
        )}

        {/* Replay & Hub Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary-glass"
            fullWidth
            onClick={onReplay}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Play Again
          </Button>

          <Button
            variant="primary-gold"
            fullWidth
            shine
            onClick={onGoToHub}
            icon={<Home className="w-4 h-4" />}
          >
            Festival Hub
          </Button>
        </div>
      </div>
    </Modal>
  );
};
