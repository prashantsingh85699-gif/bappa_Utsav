import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, CheckCircle2, ArrowRight, Play, Eye, ArrowLeft, Home, Unlock, Lock, Edit3, Flame, Timer } from 'lucide-react';
import { ScreenType, PlayerProfile, MiniGameId } from '../../types';
import { getLevelInfo, getNextLevelInfo, calculateProgressToNextLevel } from '../../utils/scoring';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioManager } from '../../services/audioService';
import { challengeService } from '../../services/challengeService';
import { getAvatarEmoji } from '../../utils/avatar';

interface HubScreenProps {
  onNavigate: (screen: ScreenType) => void;
  profile: PlayerProfile;
  onOpenProfile: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({ onNavigate, profile, onOpenProfile }) => {
  const levelInfo = getLevelInfo(profile.totalPoints);
  const nextLevel = getNextLevelInfo(levelInfo.level);
  const progressPercent = calculateProgressToNextLevel(profile.totalPoints);

  const todayChallenge = challengeService.getTodayChallenge();
  const [timeLeftMs, setTimeLeftMs] = useState(() => challengeService.getRemainingTimeMs(todayChallenge));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMs(challengeService.getRemainingTimeMs(todayChallenge));
    }, 1000);
    return () => clearInterval(timer);
  }, [todayChallenge]);

  const formattedTime = challengeService.formatCountdown(timeLeftMs);

  const activities = [
    {
      id: 'dhol' as MiniGameId,
      title: 'Dhol Beat',
      subtitle: 'Rhythm & Percussion',
      icon: '🥁',
      description: 'Strike the dhol-tasha beats with perfect timing to build festival energy!',
      screen: 'dhol' as ScreenType,
      bestScore: profile.bestScores.dhol,
      completed: profile.completedActivities.dhol,
      minLevel: 1,
      themeColor: 'from-amber-600/30 to-rose-600/30 border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      playLabel: profile.bestScores.dhol > 0 ? 'Play Again' : 'Play Now',
    },
    {
      id: 'mandap' as MiniGameId,
      title: 'Mandap Designer',
      subtitle: 'Sacred Altar Craft',
      icon: '🌸',
      description: 'Decorate Lord Ganesha’s mandap with diyas, garlands, drapes, and offerings.',
      screen: 'mandap' as ScreenType,
      bestScore: profile.bestScores.mandap,
      completed: profile.completedActivities.mandap,
      minLevel: 1,
      themeColor: 'from-pink-600/30 to-purple-600/30 border-pink-500/40 hover:border-pink-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
      accentBadge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      playLabel: profile.bestScores.mandap > 0 ? 'Edit Mandap' : 'Decorate Now',
    },
    {
      id: 'modak' as MiniGameId,
      title: 'Modak Catch',
      subtitle: 'Festive Arcade Reflex',
      icon: '🍬',
      description: 'Catch delicious steamed and golden modaks in your basket; avoid hazards!',
      screen: 'modak' as ScreenType,
      bestScore: profile.bestScores.modak,
      completed: profile.completedActivities.modak,
      minLevel: 1,
      themeColor: 'from-orange-600/30 to-amber-600/30 border-orange-500/40 hover:border-orange-400 hover:shadow-[0_0_25px_rgba(234,88,12,0.25)]',
      accentBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      playLabel: profile.bestScores.modak > 0 ? 'Play Again' : 'Play Now',
    },
    {
      id: 'quiz' as MiniGameId,
      title: 'Bappa Quiz',
      subtitle: 'Wisdom & Cultural Lore',
      icon: '🧠',
      description: '10 respectful questions on traditions, symbolism, and history of Ganeshotsav.',
      screen: 'quiz' as ScreenType,
      bestScore: profile.bestScores.quiz,
      completed: profile.completedActivities.quiz,
      minLevel: 1,
      themeColor: 'from-purple-600/30 to-indigo-600/30 border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
      accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      playLabel: profile.bestScores.quiz > 0 ? 'Play Again' : 'Start Quiz',
    },
  ];

  const allCompleted = Object.values(profile.completedActivities).every(Boolean);

  const handleLaunchGame = (screen: ScreenType, isLocked: boolean) => {
    if (isLocked) {
      audioManager.playHazardHit();
      return;
    }
    audioManager.init();
    audioManager.playTempleBell();
    onNavigate(screen);
  };

  return (
    <div className="max-w-5xl mx-auto px-3.5 py-3 sm:py-6 space-y-4 sm:space-y-6 select-none animate-fade-in">
      {/* Top Hub Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => {
            audioManager.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Home</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-3xl font-festive font-black tracking-wider text-amber-100 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
            FESTIVAL HUB
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-amber-300/80">
            Choose a sacred game to celebrate & earn festival blessings
          </p>
        </div>

        <button
          onClick={() => {
            audioManager.playClick();
            onNavigate('leaderboard');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-sm"
          title="Festival Rankings"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Rankings</span>
        </button>
      </div>

      {/* Devotee Banner & Progression Header Card */}
      <Card variant="glow" padding="md" className="relative overflow-hidden border-amber-500/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Devotee Profile Info */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => {
                audioManager.playClick();
                onOpenProfile();
              }}
              className="relative group active-press transition-transform"
              title="Change avatar and nickname"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25 border-2 border-yellow-300/50 group-hover:scale-105 transition-transform">
                {getAvatarEmoji(profile.avatarId)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-1 shadow group-hover:rotate-12 transition-transform">
                <Edit3 className="w-3 h-3" />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold font-festive text-amber-100">
                  {profile.nickname}
                </h2>
                <button
                  onClick={() => {
                    audioManager.playClick();
                    onOpenProfile();
                  }}
                  className="text-amber-400/80 hover:text-amber-300 active-press"
                  title="Edit Name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {levelInfo.badge} Level {levelInfo.level}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-300/80 font-medium mt-0.5">
                {levelInfo.title}
              </p>
            </div>
          </div>

          {/* Points & Level Progress */}
          <div className="w-full md:w-80 bg-black/50 p-3.5 rounded-2xl border border-amber-500/30 shadow-inner">
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Total Score</span>
              </span>
              <span className="festive-text-gold font-black text-base">
                {profile.totalPoints.toLocaleString()} <span className="text-xs text-amber-400 font-normal">pts</span>
              </span>
            </div>

            {/* Animated Progress Bar with Shimmer */}
            <div className="w-full h-3 bg-purple-950/80 rounded-full overflow-hidden border border-amber-500/30 p-0.5 shadow-inner relative">
              <div
                className="h-full rounded-full festive-gold-gradient transition-all duration-500 relative overflow-hidden shadow-[0_0_10px_#F59E0B]"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 progress-bar-shimmer" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-amber-400/90 mt-1.5 font-medium">
              <span>
                {nextLevel
                  ? `Next: Level ${nextLevel.level} (${nextLevel.minPoints - profile.totalPoints} pts needed)`
                  : 'Supreme Devotion Reached! 🌟'}
              </span>
              <span className="font-bold text-amber-200">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Milestone Callout / Maha Aarti Alert */}
        {allCompleted && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-amber-500/25 border border-amber-400/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse-glow">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="text-2xl">🌟</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-200">
                  Maha Utsav Blessed! All 4 Activities Completed!
                </h4>
                <p className="text-[11px] text-amber-300/80">
                  You have experienced the rhythm, mandap art, modaks, and sacred wisdom.
                </p>
              </div>
            </div>
            <Button
              variant="primary-gold"
              size="sm"
              shine
              onClick={() => {
                audioManager.playClick();
                onNavigate('completion');
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="whitespace-nowrap w-full sm:w-auto"
            >
              View Maha Aarti
            </Button>
          </div>
        )}
      </Card>

      {/* Featured Daily Challenge Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950/80 via-amber-950/60 to-purple-950/80 border-2 border-orange-500/50 p-4 sm:p-5 shadow-[0_0_30px_rgba(249,115,22,0.2)] animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-yellow-200/40 flex-shrink-0 animate-bounce-gentle">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/30 text-orange-300 border border-orange-400/50">
                  Day {todayChallenge.dayNumber} • Daily Utsav
                </span>
                <span className="text-[11px] font-bold text-amber-300/80 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 text-orange-400" />
                  Ends in {formattedTime.hours}:{formattedTime.minutes}:{formattedTime.seconds}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-festive text-amber-100 mt-1">
                {todayChallenge.title}
              </h3>
              <p className="text-xs text-amber-200/80 hidden sm:block mt-0.5">
                Target Score: <strong className="text-amber-300">{todayChallenge.targetScore.toLocaleString()} pts</strong> • Compete on the daily leaderboard!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="primary-gold"
              size="sm"
              shine
              glow
              onClick={() => {
                audioManager.playClick();
                onNavigate('challenge');
              }}
              icon={<Flame className="w-4 h-4 text-slate-950 fill-orange-500" />}
              iconPosition="right"
              className="w-full sm:w-auto font-bold px-4 py-2"
            >
              Enter Challenge
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {activities.map((act, index) => {
          const isLocked = profile.level < act.minLevel;

          return (
            <Card
              key={act.id}
              variant="glass"
              padding="md"
              interactive={!isLocked}
              className={`border transition-all duration-300 flex flex-col justify-between group animate-slide-up ${act.themeColor} ${
                isLocked ? 'opacity-70 grayscale-[30%]' : ''
              }`}
              style={{ animationDelay: `${index * 80 + 50}ms` }}
            >
              <div>
                {/* Card Header: Icon, Titles & Status Pill */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-md flex-shrink-0">
                      {act.icon}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold font-festive text-amber-100 group-hover:text-yellow-200 transition-colors leading-tight">
                        {act.title}
                      </h3>
                      <span className="text-xs font-semibold text-amber-400/90 block mt-0.5">
                        {act.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Locked / Unlocked / Blessed State Badge */}
                  <div className="flex flex-col items-end gap-1">
                    {isLocked ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-zinc-800/80 text-zinc-400 border border-zinc-600/40 shadow-sm">
                        <Lock className="w-3 h-3 text-zinc-400" />
                        <span>Locked (Lv. {act.minLevel})</span>
                      </span>
                    ) : act.completed ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        <span>Blessed</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm">
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        <span>Unlocked</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-amber-200/85 leading-relaxed mb-4">
                  {act.description}
                </p>
              </div>

              {/* Card Footer: Best Score & Play Button */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-amber-400/70">
                    Best Score
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-amber-200">
                    {act.bestScore > 0 ? (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 inline" />
                        {act.bestScore.toLocaleString()} pts
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs font-medium">Not played yet</span>
                    )}
                  </span>
                </div>

                <Button
                  variant={isLocked ? 'secondary-glass' : 'primary-gold'}
                  size="sm"
                  shine={!isLocked}
                  disabled={isLocked}
                  onClick={() => handleLaunchGame(act.screen, isLocked)}
                  icon={
                    isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                    )
                  }
                  className="px-4 py-2 font-bold"
                >
                  {isLocked ? 'Locked' : act.playLabel}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Footnote Actions & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
        <Button
          variant="secondary-glass"
          size="sm"
          onClick={() => {
            audioManager.playClick();
            onNavigate('home');
          }}
          icon={<Home className="w-4 h-4 text-amber-400" />}
        >
          Return to Sanctum (Home)
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary-glass"
            size="sm"
            onClick={() => {
              audioManager.playClick();
              onNavigate('mandap');
            }}
            icon={<Eye className="w-4 h-4 text-amber-400" />}
          >
            Saved Mandap
          </Button>

          <Button
            variant="secondary-glass"
            size="sm"
            onClick={() => {
              audioManager.playClick();
              onNavigate('leaderboard');
            }}
            icon={<Trophy className="w-4 h-4 text-amber-400" />}
          >
            Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
};
