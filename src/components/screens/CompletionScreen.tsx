import React, { useEffect } from 'react';
import { Sparkles, Trophy, Home, Eye, RotateCcw, Award } from 'lucide-react';
import { ScreenType, PlayerProfile } from '../../types';
import { BappaMurti } from '../common/BappaMurti';
import { DiyaVector } from '../common/DiyaVector';
import { audioManager } from '../../services/audioService';
import { fireFestiveConfetti, fireGoldenShower } from '../../utils/confetti';
import { getLevelInfo } from '../../utils/scoring';
import { Button } from '../ui/Button';

interface CompletionScreenProps {
  onNavigate: (screen: ScreenType) => void;
  profile: PlayerProfile;
  onResetActivities: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  onNavigate,
  profile,
  onResetActivities,
}) => {
  const levelInfo = getLevelInfo(profile.totalPoints);

  useEffect(() => {
    audioManager.playFanfare();
    fireFestiveConfetti();
    const timer = setTimeout(() => {
      fireGoldenShower();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Determine best game
  const scores = [
    { name: 'Dhol Beat 🥁', score: profile.bestScores.dhol },
    { name: 'Mandap Designer 🌸', score: profile.bestScores.mandap },
    { name: 'Modak Catch 🍬', score: profile.bestScores.modak },
    { name: 'Bappa Quiz 🧠', score: profile.bestScores.quiz },
  ];
  const bestGame = scores.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), scores[0]);

  const handlePlayAgain = () => {
    audioManager.playClick();
    onResetActivities();
    onNavigate('hub');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center text-center select-none space-y-6 animate-slide-in-up">
      {/* Auspicious Banner */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-widest animate-pulse-glow shadow-gold-glow">
        <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
        <span>Maha Aarti Divine Darshan</span>
        <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
      </div>

      {/* Center Murti with Flanking Diyas */}
      <div className="relative my-2">
        <div className="animate-scale-pulse">
          <BappaMurti size={260} className="scale-100 sm:scale-110 filter drop-shadow-[0_0_30px_rgba(245,158,11,0.45)]" />
        </div>

        {/* Floating Sacred Aarti Diyas */}
        <div className="absolute -left-6 sm:-left-14 bottom-2 animate-diya-flicker">
          <DiyaVector size={56} />
        </div>
        <div className="absolute -right-6 sm:-right-14 bottom-2 animate-diya-flicker" style={{ animationDelay: '0.6s' }}>
          <DiyaVector size={56} />
        </div>
      </div>

      {/* Celebration Heading */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-5xl font-festive font-black tracking-wide text-amber-100 drop-shadow-[0_4px_16px_rgba(245,158,11,0.7)]">
          BAPPA UTSAV COMPLETE!
        </h1>
        <p className="text-sm sm:text-base font-semibold text-amber-300">
          May Lord Ganesha bestow divine wisdom, prosperity, and joyous beginnings upon you! 🙏
        </p>
      </div>

      {/* Devotee Summary Card */}
      <div className="w-full max-w-lg festive-glass-glow rounded-3xl p-6 border border-amber-500/40 shadow-2xl text-left space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400/70 block">Devotee</span>
            <span className="text-lg font-bold text-amber-100">{profile.nickname}</span>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold text-amber-400/70 block">Honorary Rank</span>
            <span className="text-sm font-bold text-amber-300">
              {levelInfo.badge} {levelInfo.title}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-400/70 block">Total Points</span>
            <span className="text-base sm:text-lg font-extrabold festive-text-gold">
              {profile.totalPoints.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-400/70 block">Best Mini-Game</span>
            <span className="text-xs sm:text-sm font-bold text-amber-200 truncate block">
              {bestGame.name}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-amber-400/70 block">Decor Unlocked</span>
            <span className="text-base sm:text-lg font-extrabold text-amber-200">
              {profile.unlockedItemIds.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        <Button
          variant="primary-gold"
          size="sm"
          shine
          glow
          onClick={handlePlayAgain}
          icon={<RotateCcw className="w-4 h-4" />}
          className="flex-col py-3 h-auto min-h-[56px] text-xs font-bold"
        >
          Play Again
        </Button>

        <Button
          variant="secondary-glass"
          size="sm"
          onClick={() => { audioManager.playClick(); onNavigate('mandap'); }}
          icon={<Eye className="w-4 h-4 text-amber-400" />}
          className="flex-col py-3 h-auto min-h-[56px] text-xs font-bold"
        >
          View Mandap
        </Button>

        <Button
          variant="secondary-glass"
          size="sm"
          onClick={() => { audioManager.playClick(); onNavigate('leaderboard'); }}
          icon={<Trophy className="w-4 h-4 text-amber-400" />}
          className="flex-col py-3 h-auto min-h-[56px] text-xs font-bold"
        >
          Leaderboard
        </Button>

        <Button
          variant="secondary-glass"
          size="sm"
          onClick={() => { audioManager.playClick(); onNavigate('home'); }}
          icon={<Home className="w-4 h-4 text-amber-400" />}
          className="flex-col py-3 h-auto min-h-[56px] text-xs font-bold"
        >
          Sanctum Home
        </Button>
      </div>

      <div className="text-xs text-amber-400/80 font-medium pt-3 animate-pulse">
        Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya! 🌸✨
      </div>
    </div>
  );
};
