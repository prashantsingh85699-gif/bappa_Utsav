import React from 'react';
import { Home, Trophy, Settings, Sparkles, Grid } from 'lucide-react';
import { ScreenType } from '../../types';
import { audioManager } from '../../services/audioService';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, onOpenSettings }) => {
  if (currentScreen === 'splash' || ['dhol', 'modak', 'mandap'].includes(currentScreen)) {
    // Hide bottom nav during active arcade/creative games to avoid accidental touches and maximize stage space
    return null;
  }

  const handleNav = (screen: ScreenType) => {
    audioManager.playClick();
    onNavigate(screen);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, screen: 'home' as ScreenType },
    { id: 'mandap', label: 'Mandap', icon: Sparkles, screen: 'mandap' as ScreenType },
    { id: 'hub', label: 'Play Utsav', icon: Grid, screen: 'hub' as ScreenType, isCenter: true },
    { id: 'leaderboard', label: 'Rankings', icon: Trophy, screen: 'leaderboard' as ScreenType },
    { id: 'settings', label: 'Settings', icon: Settings, isAction: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-[#18042B]/95 backdrop-blur-xl border-t border-amber-500/25 shadow-[0_-8px_25px_rgba(0,0,0,0.4)] pb-safe select-none animate-slide-in-up">
      <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.screen!)}
                className="relative -top-4 flex flex-col items-center group active-press touch-target"
                aria-label={item.label}
              >
                <div className="w-14 h-14 rounded-full btn-3d-gold flex items-center justify-center text-slate-950 shadow-gold-glow border-2 border-yellow-200 animate-scale-pulse">
                  <span className="text-2xl filter drop-shadow">🥁</span>
                </div>
                <span className="text-[10px] font-extrabold text-amber-300 mt-0.5 uppercase tracking-wider">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isAction) {
                  audioManager.playClick();
                  onOpenSettings();
                } else if (item.screen) {
                  handleNav(item.screen);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all active-press min-h-[48px] ${
                isActive ? 'text-amber-300 font-bold' : 'text-amber-200/60 hover:text-amber-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 text-amber-300' : ''}`} />
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] transition-all" />
                )}
              </div>
              <span className="text-[10px] mt-1.5 truncate leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
