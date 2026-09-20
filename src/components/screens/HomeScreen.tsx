import React, { useState } from 'react';
import { Play, Grid, Trophy, HelpCircle, Settings, Volume2, VolumeX, Sparkles, ShieldCheck } from 'lucide-react';
import { ScreenType, PlayerProfile } from '../../types';
import { BappaMurti, BappaSwaroop, BappaSwaroopSelector } from '../common/BappaMurti';
import { DiyaVector } from '../common/DiyaVector';
import { AnimatedLogo } from '../common/AnimatedLogo';
import { DevotionalMusicWidget } from '../common/DevotionalMusicWidget';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioManager } from '../../services/audioService';
import { authService } from '../../services/authService';
import { getLevelInfo } from '../../utils/scoring';
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

  // Preferred Bappa Swaroop state
  const [swaroop, setSwaroop] = useState<BappaSwaroop>(() => {
    try {
      const saved = localStorage.getItem('bappa_preferred_swaroop');
      if (saved && ['lalbaug', 'siddhivinayak', 'dagdusheth', 'bal_ganesha'].includes(saved)) {
        return saved as BappaSwaroop;
      }
    } catch {}
    return 'lalbaug';
  });

  const handleStartUtsav = () => {
    audioManager.init();
    audioManager.playTempleBell();
    onNavigate('hub');
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between items-center px-3 sm:px-4 pt-1.5 pb-24 sm:pb-8 max-w-4xl mx-auto text-center select-none overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP ROW: Devotee Profile Pill + Devotional Music Player
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full flex items-center justify-between gap-2 max-w-lg mx-auto mb-1 sm:mb-2 animate-fade-in flex-wrap sm:flex-nowrap">
        {/* Devotee Profile Pill */}
        <button
          onClick={() => {
            audioManager.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-black/50 border border-amber-500/30 hover:border-amber-400 text-left active-press transition-all shadow-sm group touch-target min-w-0"
          title="Edit Devotee Name & Avatar"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-sm sm:text-base shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform border border-amber-300/40">
            {getAvatarEmoji(profile.avatarId)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-amber-200 truncate max-w-[80px] sm:max-w-[120px] group-hover:text-yellow-200 transition-colors">
                {profile.nickname}
              </span>
              {authService.isVerified() && (
                <span title="Verified Devotee">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                </span>
              )}
            </div>
            <div className="text-[9px] text-amber-400 font-medium leading-none truncate">
              {levelInfo.badge} Lv.{levelInfo.level} • {levelInfo.title.split(' ')[0]}
            </div>
          </div>
        </button>

        {/* Bappa Devotional Aarti / Music Player Widget */}
        <DevotionalMusicWidget className="ml-auto" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CENTER SANCTUM: BAPPA MURTI WITH LIGHTNING & SWAROOP SELECTOR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center my-auto py-1 sm:py-2 w-full max-w-lg">
        {/* Divine Form Swaroop Selector Pills */}
        <div className="mb-2 w-full flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-bold text-amber-300/90 uppercase tracking-widest flex items-center gap-1 mb-1 font-festive">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
            <span>Darshan Swaroop (Choose Form)</span>
          </span>
          <BappaSwaroopSelector currentSwaroop={swaroop} onSelectSwaroop={setSwaroop} />
        </div>

        {/* Lord Ganesha Murti with Divine Lightning & Flanking Floating Diyas */}
        <div className="relative my-1 sm:my-2">
          <BappaMurti
            size={180}
            swaroop={swaroop}
            showLightning={true}
            interactive={true}
            className="scale-95 sm:scale-110 md:scale-120 transition-all duration-300"
          />

          {/* Flanking Floating Diyas */}
          <div className="absolute -left-4 sm:-left-10 bottom-2 animate-diya-flicker pointer-events-none">
            <DiyaVector size={44} />
          </div>
          <div className="absolute -right-4 sm:-right-10 bottom-2 animate-diya-flicker pointer-events-none">
            <DiyaVector size={44} />
          </div>

          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-44 sm:w-60 h-6 bg-amber-500/20 rounded-full blur-md -z-10" />
        </div>

        {/* Interactive Tap Hint */}
        <div className="text-[10px] text-amber-300/80 bg-black/40 px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-2 animate-pulse">
          ⚡ Tap Bappa for Divine Lightning & Blessings!
        </div>

        {/* Animated BAPPA UTSAV Logo */}
        <div className="mt-1 mb-3 w-full">
          <AnimatedLogo size="md" />
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
            icon={<Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />}
            className="text-base sm:text-lg tracking-wider font-extrabold shadow-[0_6px_0_#B45309,0_12px_24px_rgba(245,158,11,0.5)]"
          >
            START UTSAV
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SECONDARY ACTION CARDS: Mini Games, Leaderboard, Help, Settings
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-md mt-2 sm:mt-3 mb-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Mini Games Card */}
        <Card
          variant="glass"
          padding="sm"
          interactive
          onClick={() => {
            audioManager.playClick();
            onNavigate('hub');
          }}
          className="flex flex-col items-center justify-center gap-1 text-center group border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 transition-all animate-slide-up"
          style={{ animationDelay: '50ms' }}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Grid className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-200 group-hover:text-yellow-200">Mini Games</span>
          <span className="text-[9px] text-amber-400/70 -mt-0.5 font-medium">4 Activities</span>
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
          className="flex flex-col items-center justify-center gap-1 text-center group border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 transition-all animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-200 group-hover:text-yellow-200">Leaderboard</span>
          <span className="text-[9px] text-amber-400/70 -mt-0.5 font-medium">Hall of Ranks</span>
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
          className="flex flex-col items-center justify-center gap-1 text-center group border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 transition-all animate-slide-up"
          style={{ animationDelay: '150ms' }}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-200 group-hover:text-yellow-200">How to Play</span>
          <span className="text-[9px] text-amber-400/70 -mt-0.5 font-medium">Guide & Lore</span>
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
          className="flex flex-col items-center justify-center gap-1 text-center group border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 transition-all animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          </div>
          <span className="text-xs font-bold text-amber-200 group-hover:text-yellow-200">Settings</span>
          <span className="text-[9px] text-amber-400/70 -mt-0.5 font-medium">Audio & UI</span>
        </Card>
      </div>

      {/* Footer Sacred Shloka */}
      <div className="mt-1 text-[10px] sm:text-xs text-amber-400/75 font-medium px-2 leading-relaxed font-shloka animate-fade-in">
        🙏 वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ • निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा
      </div>
    </div>
  );
};
