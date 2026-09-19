import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  User,
  Trophy,
  Award,
  Flame,
  Star,
  Lock,
  BarChart2,
  Calendar,
  Gamepad2,
  Crown
} from 'lucide-react';
import { PlayerProfile, AchievementDef } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { audioManager } from '../../services/audioService';
import { ACHIEVEMENTS } from '../../data/achievements';
import { getLevelInfo, calculateProgressToNextLevel, getNextLevelInfo } from '../../utils/scoring';
import { authService } from '../../services/authService';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onSave: (newProfile: Partial<PlayerProfile>) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
  onOpenAuth?: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'bappa', icon: '🐘', name: 'Bal Ganesha', bg: 'from-amber-600 to-orange-500' },
  { id: 'dhol', icon: '🥁', name: 'Dhol Master', bg: 'from-rose-600 to-amber-600' },
  { id: 'modak', icon: '🥟', name: 'Modak Chef', bg: 'from-yellow-600 to-amber-500' },
  { id: 'diya', icon: '🪔', name: 'Diya Bearer', bg: 'from-orange-600 to-red-600' },
  { id: 'aarti', icon: '🌸', name: 'Aarti Devotee', bg: 'from-pink-600 to-rose-500' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  onSave,
  onClose,
  isInitialSetup = false,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'achievements'>('profile');
  const [nickname, setNickname] = useState(profile.nickname || 'Bappa Devotee');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId || 'bappa');

  const levelInfo = getLevelInfo(profile.totalScore || profile.totalPoints);
  const nextLevel = getNextLevelInfo(levelInfo.level);
  const xpPercent = calculateProgressToNextLevel(profile.totalScore || profile.totalPoints);
  const unlockedAchSet = new Set(profile.unlockedAchievements || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim() || 'Bappa Devotee';
    audioManager.playTempleBell();
    onSave({
      nickname: cleanNick,
      avatarId: selectedAvatar,
    });
    if (onClose) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      title={isInitialSetup ? 'Welcome to Bappa Utsav!' : 'Devotee Sanctuary'}
      subtitle={
        isInitialSetup
          ? 'Choose your festival identity before entering'
          : `Level ${levelInfo.level} • ${levelInfo.title}`
      }
      icon={<span>{AVATAR_OPTIONS.find((a) => a.id === selectedAvatar)?.icon || '🐘'}</span>}
      showCloseButton={!isInitialSetup}
    >
      <div className="space-y-4">
        {/* Navigation Tabs (if not initial setup) */}
        {!isInitialSetup && (
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-amber-500/20 text-xs font-bold">
            <button
              type="button"
              onClick={() => { audioManager.playClick(); setActiveTab('profile'); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow-sm'
                  : 'text-amber-400/60 hover:text-amber-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Identity</span>
            </button>

            <button
              type="button"
              onClick={() => { audioManager.playClick(); setActiveTab('achievements'); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'achievements'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow-sm'
                  : 'text-amber-400/60 hover:text-amber-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Badges ({unlockedAchSet.size}/{ACHIEVEMENTS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { audioManager.playClick(); setActiveTab('stats'); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow-sm'
                  : 'text-amber-400/60 hover:text-amber-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Statistics</span>
            </button>
          </div>
        )}

        {/* TAB 1: IDENTITY & AVATAR */}
        {(activeTab === 'profile' || isInitialSetup) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Level & XP Banner */}
            {!isInitialSetup && (
              <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{levelInfo.badge}</span>
                    <div>
                      <span className="text-xs font-extrabold text-amber-100">
                        {levelInfo.title}
                      </span>
                      <span className="text-[10px] text-amber-400/70 block">
                        Level {levelInfo.level} Devotee
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black festive-text-gold">
                      {(profile.totalScore || profile.totalPoints).toLocaleString()} pts
                    </span>
                    <span className="text-[10px] text-amber-400/60 block font-mono">
                      {nextLevel ? `${nextLevel.minPoints - (profile.totalScore || profile.totalPoints)} to Lv.${nextLevel.level}` : 'Max Level'}
                    </span>
                  </div>
                </div>

                {/* XP Progress Bar with Shimmer */}
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-amber-500/30 relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400 transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${xpPercent}%` }}
                  >
                    <div className="absolute inset-0 progress-bar-shimmer" />
                  </div>
                </div>
              </div>
            )}

            {/* Devotee Account Verification Status */}
            <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/25 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                {authService.isVerified() ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-400/80 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-200">
                      {authService.isVerified() ? 'Verified Account' : 'Guest Player (Unverified)'}
                    </span>
                    {authService.isVerified() && (
                      <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-amber-400/70 block truncate">
                    {authService.isVerified()
                      ? `${authService.getCurrentUser()?.email} · Ready for Leaderboard`
                      : 'Login with credentials to secure your leaderboard rank'}
                  </span>
                </div>
              </div>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => { audioManager.playClick(); onOpenAuth(); }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-200 text-xs font-bold whitespace-nowrap active-press transition-colors"
                >
                  {authService.isVerified() ? 'Account' : 'Verify'}
                </button>
              )}
            </div>

            {/* Nickname Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Devotee Nickname
              </label>
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Omkar, Aarav, Ananya"
                inputMode="text"
                autoCapitalize="words"
                autoComplete="off"
                enterKeyHint="done"
                className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-amber-500/40 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base font-semibold min-h-[48px]"
                required
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Select Avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        audioManager.playClick();
                        setSelectedAvatar(avatar.id);
                      }}
                      className={`flex flex-col items-center p-2 rounded-2xl border transition-all active-press min-h-[52px] ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/25 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                          : 'border-purple-900/60 bg-black/30 hover:border-amber-500/30'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-1">{avatar.icon}</span>
                      <span className="text-[10px] text-amber-200 font-medium truncate w-full text-center">
                        {avatar.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              {!isInitialSetup && onClose && (
                <Button type="button" variant="secondary-glass" fullWidth onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary-gold"
                fullWidth
                shine
                glow
                icon={<Check className="w-4 h-4" />}
              >
                {isInitialSetup ? 'Begin Utsav 🌟' : 'Save Profile'}
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: ACHIEVEMENTS TROPHY ROOM */}
        {activeTab === 'achievements' && !isInitialSetup && (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = unlockedAchSet.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-3 ${
                      isUnlocked
                        ? 'bg-amber-500/15 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-black/40 border-zinc-800/80 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${
                        isUnlocked
                          ? 'bg-amber-500/25 border-amber-400/50 text-amber-200 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-zinc-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-bold truncate ${isUnlocked ? 'text-amber-100' : 'text-zinc-400'}`}>
                          {ach.title}
                        </span>
                        {isUnlocked && (
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-1.5 py-0.2 rounded-full border border-emerald-400/30">
                            Earned
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-200/70 line-clamp-2 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DEVOTEE STATISTICS & BEST SCORES */}
        {activeTab === 'stats' && !isInitialSetup && (
          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
            {/* Game Best Scores 4-Grid */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 block mb-2">
                Personal Bests (Festival Games)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-between">
                  <span className="text-xs text-amber-200 font-semibold flex items-center gap-1.5">
                    <span>🥁</span> Dhol Beat
                  </span>
                  <span className="text-xs font-bold festive-text-gold">
                    {(profile.gameBestScores.dhol || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-between">
                  <span className="text-xs text-amber-200 font-semibold flex items-center gap-1.5">
                    <span>🌸</span> Mandap
                  </span>
                  <span className="text-xs font-bold festive-text-gold">
                    {(profile.gameBestScores.mandap || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-between">
                  <span className="text-xs text-amber-200 font-semibold flex items-center gap-1.5">
                    <span>🥟</span> Modak Catch
                  </span>
                  <span className="text-xs font-bold festive-text-gold">
                    {(profile.gameBestScores.modak || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-between">
                  <span className="text-xs text-amber-200 font-semibold flex items-center gap-1.5">
                    <span>🧠</span> Bappa Quiz
                  </span>
                  <span className="text-xs font-bold festive-text-gold">
                    {(profile.gameBestScores.quiz || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Lifetime Stats */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 block mb-2">
                Devotional Statistics
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
                  <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Games Played</span>
                  <span className="text-base font-black text-amber-100">
                    {profile.statistics.totalGamesPlayed}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
                  <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Highest Combo</span>
                  <span className="text-base font-black text-orange-400">
                    {profile.statistics.highestCombo}x
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
                  <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Modaks Caught</span>
                  <span className="text-base font-black text-amber-300">
                    {profile.statistics.totalModaksCaught}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
                  <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Quiz Correct</span>
                  <span className="text-base font-black text-emerald-400">
                    {profile.statistics.quizCorrectAnswers} / {profile.statistics.quizQuestionsAnswered}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
                  <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Decorations Unlocked</span>
                  <span className="text-base font-black text-pink-300">
                    {profile.unlockedDecorations.length}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
                  <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Badges Earned</span>
                  <span className="text-base font-black text-yellow-300">
                    {unlockedAchSet.size} / {ACHIEVEMENTS.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
