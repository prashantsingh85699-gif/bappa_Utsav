import React from 'react';
import { Play, Grid, Trophy, HelpCircle, Settings, Volume2, VolumeX, Music, Sparkles } from 'lucide-react';
import { ScreenType, PlayerProfile } from '../../types';
import { BappaMurti } from '../common/BappaMurti';
import { DiyaVector } from '../common/DiyaVector';
import { AnimatedLogo } from '../common/AnimatedLogo';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioManager } from '../../services/audioService';
import { authService } from '../../services/authService';
import { getLevelInfo } from '../../utils/scoring';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

import { getAvatarEmoji } from '../../utils/avatar';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  profile: PlayerProfile;
  onOpenProfile: () => void;
  onOpenSettings: (tab?: 'settings' | 'howToPlay' | 'about') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled?: boolean;
  onToggleMusic?: () => void;
  onOpenAuth?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  profile,
  onOpenProfile,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  musicEnabled = true,
  onToggleMusic,
  onOpenAuth,
}) => {
  const levelInfo = getLevelInfo(profile.totalPoints);

  const handleStartUtsav = () => {
    audioManager.init();
    audioManager.playTempleBell();
    onNavigate('hub');
  };

  const handleMusicToggleClick = () => {
    audioManager.init();
    if (onToggleMusic) {
      onToggleMusic();
    } else {
      onToggleSound();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between items-center px-4 py-3 sm:py-5 max-w-4xl mx-auto text-center select-none">
      {/* Top Banner: Devotee Profile Pill & Interactive Music Toggle */}
      <div className="w-full flex items-center justify-between gap-2 max-w-lg mx-auto mb-2 animate-fade-in">
        {/* Devotee Profile Pill */}
        <button
          onClick={() => {
            audioManager.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-black/50 border border-amber-500/30 hover:border-amber-400 text-left active-press transition-all shadow-sm group touch-target flex-shrink min-w-0"
          title="Edit Devotee Name & Avatar"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-base sm:text-lg shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform border border-amber-300/40">
            {getAvatarEmoji(profile.avatarId)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-amber-200 truncate max-w-[85px] sm:max-w-[130px] group-hover:text-yellow-200 transition-colors">
                {profile.nickname}
              </span>
              {authService.isVerified() && (
                <span title="Verified Devotee">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                </span>
              )}
            </div>
            <div className="text-[9px] sm:text-[10px] text-amber-400 font-medium leading-none truncate">
              {levelInfo.badge} Lv.{levelInfo.level} • {levelInfo.title.split(' ')[0]}
            </div>
          </div>
        </button>

        {/* Auth Quick Action if unverified */}
        {!authService.isVerified() && onOpenAuth && (
          <button
            onClick={() => { audioManager.playClick(); onOpenAuth(); }}
            className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold transition-all shadow-xs animate-pulse"
            title="Authenticate with credentials for Official Leaderboard"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Verify</span>
          </button>
        )}

        {/* Music & Sound Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleMusicToggleClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border active:scale-95 transition-all shadow-sm ${
              musicEnabled
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-black/50 border-zinc-700/60 text-zinc-400 hover:text-zinc-300'
            }`}
            title={musicEnabled ? 'Pause Festive Music' : 'Play Festive Music'}
            aria-label="Toggle Music"
          >
            <div className="relative flex items-center justify-center">
              <Music className={`w-4 h-4 ${musicEnabled ? 'text-amber-300 animate-pulse' : 'text-zinc-500'}`} />
              {musicEnabled && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>

            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {musicEnabled ? 'Music On' : 'Music Off'}
              </span>
              <span className="text-[9px] text-amber-400/70 hidden sm:inline">
                {musicEnabled ? 'Ganesh Aarti' : 'Muted'}
              </span>
            </div>

            {/* Equalizer animation bars when active */}
            {musicEnabled && (
              <div className="flex items-end gap-0.5 h-3 ml-1">
                <span className="w-0.5 h-2 bg-amber-400 animate-pulse" />
                <span className="w-0.5 h-3 bg-amber-300 animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse delay-150" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Center Sanctum: Lord Ganesha Murti & Animated Logo */}
      <div className="flex flex-col items-center my-auto py-2 w-full max-w-lg">
        {/* Lord Ganesha Murti with Flanking Floating Diyas */}
        <div className="relative my-2 sm:my-3">
          <BappaMurti size={180} className="scale-100 sm:scale-110 md:scale-125 transition-transform" />

          {/* Flanking Floating Diyas */}
          <div className="absolute -left-5 sm:-left-12 bottom-3 animate-diya-flicker">
            <DiyaVector size={52} />
          </div>
          <div className="absolute -right-5 sm:-right-12 bottom-3 animate-diya-flicker">
            <DiyaVector size={52} />
          </div>

          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-8 bg-amber-500/20 rounded-full blur-md -z-10" />
        </div>

        {/* Animated BAPPA UTSAV Logo */}
        <div className="mt-2 mb-4 w-full">
          <AnimatedLogo size="lg" />
        </div>

        {/* Start Utsav CTA - Primary Prominent 3D Button */}
        <div className="w-full max-w-xs px-2 animate-slide-up">
          <Button
            variant="primary-gold"
            size="xl"
            fullWidth
            shine
            glow
            onClick={handleStartUtsav}
            icon={<Play className="w-6 h-6 fill-slate-950" />}
            className="text-base sm:text-lg tracking-wider font-extrabold shadow-[0_6px_0_#B45309,0_12px_24px_rgba(245,158,11,0.5)]"
          >
            START UTSAV
          </Button>
        </div>
      </div>

      {/* Secondary Actions Grid: Mini Games, Leaderboard, How to Play, Settings */}
      <div className="w-full max-w-md mt-4 mb-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Mini Games Card */}
        <Card
          variant="glass"
          padding="sm"
          interactive
          onClick={() => {
            audioManager.playClick();
            onNavigate('hub');
          }}
          className="flex flex-col items-center justify-center gap-1.5 text-center group border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 transition-all animate-slide-up"
          style={{ animationDelay: '50ms' }}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Grid className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-200 group-hover:text-yellow-200">Mini Games</span>
          <span className="text-[10px] text-amber-400/70 -mt-1 font-medium">4 Activities</span>
        </Card>

        {/* Leaderboard Card */}
        <Card
          variant="glass"
          padding="sm"
          interactive
          onClick={() => {
            audioManager.playClick();
            onNavigate('leaderboard');
          }}
          className="flex flex-col items-center justify-center gap-1.5 text-center group border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 transition-all animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-200 group-hover:text-yellow-200">Leaderboard</span>
          <span className="text-[10px] text-amber-400/70 -mt-1 font-medium">Hall of Ranks</span>
        </Card>

        {/* How to Play Card */}
        <Card
          variant="glass"
          padding="sm"
          interactive
          onClick={() => {
            audioManager.playClick();
            onOpenSettings('howToPlay');
          }}
          className="flex flex-col items-center justify-center gap-1.5 text-center group border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 transition-all animate-slide-up"
          style={{ animationDelay: '150ms' }}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-200 group-hover:text-yellow-200">How to Play</span>
          <span className="text-[10px] text-amber-400/70 -mt-1 font-medium">Guide & Lore</span>
        </Card>

        {/* Settings Card */}
        <Card
          variant="glass"
          padding="sm"
          interactive
          onClick={() => {
            audioManager.playClick();
            onOpenSettings('settings');
          }}
          className="flex flex-col items-center justify-center gap-1.5 text-center group border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 transition-all animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          </div>
          <span className="text-xs font-bold text-amber-200 group-hover:text-yellow-200">Settings</span>
          <span className="text-[10px] text-amber-400/70 -mt-1 font-medium">Audio & UI</span>
        </Card>
      </div>

      {/* Footer Sacred Shloka */}
      <div className="mt-2 text-[11px] sm:text-xs text-amber-400/70 font-medium px-2 leading-relaxed font-shloka animate-fade-in">
        🙏 वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ • निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा
      </div>
    </div>
  );
};
