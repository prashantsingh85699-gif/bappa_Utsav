import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Settings, ArrowLeft, Home, Trophy, Flame, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ScreenType, PlayerProfile } from '../../types';
import { getLevelInfo } from '../../utils/scoring';
import { audioManager } from '../../services/audioService';
import { authService } from '../../services/authService';
import { getAvatarEmoji } from '../../utils/avatar';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  profile: PlayerProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  profile,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenProfile,
  onOpenAuth,
}) => {
  const levelInfo = getLevelInfo(profile.totalPoints);
  const [scorePulsing, setScorePulsing] = useState(false);
  const prevScoreRef = useRef(profile.totalPoints);

  useEffect(() => {
    if (profile.totalPoints !== prevScoreRef.current) {
      prevScoreRef.current = profile.totalPoints;
      setScorePulsing(true);
      const timer = setTimeout(() => setScorePulsing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [profile.totalPoints]);

  if (currentScreen === 'splash') return null;

  const handleBack = () => {
    audioManager.playClick();
    if (currentScreen === 'home') return;
    if (['dhol', 'mandap', 'modak', 'quiz'].includes(currentScreen)) {
      onNavigate('hub');
    } else if (currentScreen === 'challenge') {
      onNavigate('hub');
    } else {
      onNavigate('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-2 sm:px-6 sm:py-3 bg-[#18042B]/90 backdrop-blur-xl border-b border-amber-500/25 shadow-md select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Back / Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentScreen !== 'home' && (
            <button
              onClick={handleBack}
              className="touch-target rounded-xl bg-black/40 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 active-press transition-all flex items-center justify-center"
              title="Go back"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <button
            onClick={() => { audioManager.playClick(); onNavigate('home'); }}
            className="flex items-center gap-2 text-left group active-press transition-transform"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-xl sm:text-2xl shadow-md border border-amber-300/40 group-hover:scale-105 transition-transform">
              {getAvatarEmoji(profile.avatarId)}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold font-festive text-amber-100 tracking-wider leading-none group-hover:text-yellow-200 transition-colors truncate">
                BAPPA UTSAV
              </h1>
              <span className="text-[10px] text-amber-400/80 font-medium hidden xs:block leading-tight mt-0.5 truncate">
                Play • Celebrate • Morya!
              </span>
            </div>
          </button>
        </div>

        {/* Center / Right: Devotee Stats & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Devotee Profile Pill with Integrated Level & Verified Badge */}
          <button
            onClick={() => { audioManager.playClick(); onOpenProfile(); }}
            className={`flex items-center gap-1 sm:gap-1.5 bg-black/50 hover:bg-black/70 border rounded-2xl px-2 py-1 sm:px-2.5 sm:py-1.5 active-press transition-all ${
              scorePulsing 
                ? 'border-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105' 
                : 'border-amber-500/30 hover:border-amber-400/60'
            }`}
            title="Edit Devotee Profile"
          >
            <span className="text-sm sm:text-base flex-shrink-0" title={levelInfo.title}>{levelInfo.badge}</span>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-amber-300 font-bold uppercase leading-none hidden md:flex items-center justify-end gap-1">
                {authService.isVerified() && (
                  <span title="Verified Devotee">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  </span>
                )}
                Lv.{levelInfo.level} • {profile.nickname}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-200 leading-tight whitespace-nowrap">
                {profile.totalPoints.toLocaleString()} <span className="text-[10px] text-amber-400 font-normal">pts</span>
              </span>
            </div>
          </button>

          {/* Devotee Auth Shield Button (Desktop / Tablet) */}
          {onOpenAuth && (
            <button
              onClick={() => { audioManager.playClick(); onOpenAuth(); }}
              className={`hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold items-center gap-1 transition-all ${
                authService.isVerified()
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/50 text-amber-300 animate-pulse'
              }`}
              title={authService.isVerified() ? 'Verified Devotee Account' : 'Verify Account / Login'}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">
                {authService.isVerified() ? 'Verified' : 'Verify'}
              </span>
            </button>
          )}

          {/* Hub Button (Desktop only) */}
          {currentScreen !== 'hub' && currentScreen !== 'home' && (
            <button
              onClick={() => { audioManager.playClick(); onNavigate('hub'); }}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30 text-xs font-bold active-press transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Hub</span>
            </button>
          )}

          {/* Leaderboard Button (Desktop only) */}
          {currentScreen !== 'leaderboard' && (
            <button
              onClick={() => { audioManager.playClick(); onNavigate('leaderboard'); }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold active-press transition-colors"
              title="Festival Leaderboard"
              aria-label="Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Ranks</span>
            </button>
          )}

          {/* Challenge Button (Desktop only) */}
          {currentScreen !== 'challenge' && (
            <button
              onClick={() => { audioManager.playClick(); onNavigate('challenge'); }}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600/30 to-amber-600/30 hover:from-orange-600/45 hover:to-amber-600/45 text-amber-200 border border-amber-500/40 text-xs font-bold active-press transition-all shadow-[0_0_12px_rgba(249,115,22,0.25)]"
              title="Festival Challenges & Rooms"
              aria-label="Festival Challenge"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>Challenge</span>
            </button>
          )}

          {/* Sound Toggle (Always visible, compact on mobile) */}
          <button
            onClick={onToggleSound}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center active-press transition-all flex-shrink-0 ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'
            }`}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Settings Button (Always visible, compact on mobile) */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 flex items-center justify-center active-press transition-all group flex-shrink-0"
            title="Settings & Guide"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </header>
  );
};
