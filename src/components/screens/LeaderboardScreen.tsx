import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Crown,
  Flame,
  Users,
  Star,
  Clock,
  TrendingUp,
  Wifi,
  WifiOff,
  ShieldCheck,
  ShieldAlert,
  Settings2,
  Trash2,
  Lock,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { ScreenType, PlayerProfile, LeaderboardEntry } from '../../types';
import { leaderboardService } from '../../services/leaderboardService';
import { authService, AuthUser } from '../../services/authService';
import { audioManager } from '../../services/audioService';
import { getLevelInfo } from '../../utils/scoring';
import { getAvatarEmoji } from '../../utils/avatar';

type TabId = 'daily' | 'weekly' | 'allTime';

interface LeaderboardScreenProps {
  onNavigate: (screen: ScreenType) => void;
  profile: PlayerProfile;
  onOpenProfile?: () => void;
  onOpenAuth?: () => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'daily',
    label: 'Daily',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    description: 'Today’s top devotees',
  },
  {
    id: 'weekly',
    label: 'Weekly',
    icon: <Trophy className="w-3.5 h-3.5" />,
    description: 'This week’s rankings',
  },
  {
    id: 'allTime',
    label: 'All-Time',
    icon: <Crown className="w-3.5 h-3.5" />,
    description: 'Legendary devotees',
  },
];

// Rank badge for top 3
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-base sm:text-lg shadow-[0_0_16px_rgba(250,204,21,0.8)] flex-shrink-0 bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-yellow-200">
        🥇
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-base sm:text-lg shadow-[0_0_10px_rgba(203,213,225,0.5)] flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-400 border-2 border-slate-200">
        🥈
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-base sm:text-lg shadow-[0_0_8px_rgba(180,83,9,0.5)] flex-shrink-0 bg-gradient-to-br from-amber-700 to-orange-800 border-2 border-amber-600">
        🥉
      </div>
    );
  }
  return (
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 font-mono flex-shrink-0">
      {rank}
    </div>
  );
}

// Single leaderboard row
function LeaderboardRow({
  entry,
  rank,
  isCurrentPlayer,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentPlayer: boolean;
}) {
  const avatar = getAvatarEmoji(entry.avatarId);
  const levelInfo = getLevelInfo(entry.score);
  const isTopThree = rank <= 3;

  return (
    <div
      className={`relative p-3 sm:p-4 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
        isCurrentPlayer
          ? 'bg-gradient-to-r from-amber-500/25 via-orange-500/15 to-amber-500/25 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50 scale-[1.01]'
          : isTopThree
          ? 'bg-black/40 border-amber-500/30 hover:border-amber-500/50 hover:bg-black/50'
          : 'bg-black/25 border-amber-500/15 hover:border-amber-500/30 hover:bg-black/35'
      }`}
    >
      {/* YOU badge — absolutely positioned */}
      {isCurrentPlayer && (
        <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 shadow-md">
          ✨ YOU
        </span>
      )}

      {/* Rank Badge */}
      <RankBadge rank={rank} />

      {/* Avatar */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${
          isCurrentPlayer
            ? 'bg-gradient-to-tr from-amber-500 to-orange-600 border-amber-300/60 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
            : 'bg-gradient-to-tr from-slate-700 to-slate-600 border-slate-600/50'
        }`}
      >
        {avatar}
      </div>

      {/* Name & Badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs sm:text-sm font-bold truncate max-w-[130px] sm:max-w-none ${
              isCurrentPlayer ? 'text-amber-100' : 'text-amber-200'
            }`}
          >
            {entry.nickname}
          </span>

          {/* Verified Badge */}
          {entry.isVerified && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs border border-yellow-200"
              title="Verified Devotee Account"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" />
              VERIFIED
            </span>
          )}

          {isCurrentPlayer && (
            <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-1.5 rounded-full hidden sm:inline">
              Level {entry.level}
            </span>
          )}
        </div>
        <span className="text-[10px] sm:text-xs text-amber-400/70 font-medium truncate block">
          {entry.badge || `${levelInfo.badge} Lv.${entry.level} ${levelInfo.title.split(' ')[0]}`}
        </span>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0 ml-1">
        <span
          className={`text-sm sm:text-base font-extrabold block ${
            isCurrentPlayer ? 'festive-text-gold' : 'text-amber-300'
          }`}
        >
          {entry.score.toLocaleString()}
        </span>
        <span className="text-[9px] sm:text-[10px] text-amber-500/60 font-medium">
          pts
        </span>
      </div>
    </div>
  );
}

// Empty state
function EmptyState({ tab, isVerifiedFilter }: { tab: TabId; isVerifiedFilter: boolean }) {
  return (
    <div className="py-14 sm:py-20 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl animate-bounce">
        {isVerifiedFilter ? '🛡️' : '🌅'}
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-amber-200 mb-1">
          {isVerifiedFilter ? 'No Verified Devotees Yet' : "Today's Board is Empty"}
        </h3>
        <p className="text-xs sm:text-sm text-amber-400/70 max-w-xs leading-relaxed mx-auto">
          {isVerifiedFilter
            ? 'Be the very first authenticated devotee to play and claim the #1 rank on the Official Global Leaderboard!'
            : 'Play Dhol Beat, Modak Catch, or Bappa Quiz to record your score!'}
        </p>
      </div>
      <span className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold mt-1">
        Log in & Play a game to enter the leaderboard →
      </span>
    </div>
  );
}

// Loading skeleton rows
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-3 sm:p-4 rounded-2xl border border-amber-500/10 bg-black/20 flex items-center gap-3 animate-pulse"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500/10 flex-shrink-0" />
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-amber-500/15 rounded w-32 sm:w-48" />
            <div className="h-2 bg-amber-500/10 rounded w-20" />
          </div>
          <div className="w-16 text-right space-y-1">
            <div className="h-4 bg-amber-500/15 rounded" />
            <div className="h-2 bg-amber-500/10 rounded w-8 ml-auto" />
          </div>
        </div>
      ))}
    </>
  );
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  onNavigate,
  profile,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('allTime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [isFirebase, setIsFirebase] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Leaderboard Control: Verified Only Filter
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(() => leaderboardService.isVerifiedOnlyMode());
  const [showControlMenu, setShowControlMenu] = useState(false);
  const isPlayerVerified = authService.isVerified();

  const loadData = useCallback(async (tab: TabId, submitFirst = false) => {
    setIsLoading(true);

    try {
      // Ensure current player's score is submitted with verification status
      if (submitFirst && profile.totalScore > 0) {
        const levelInfo = getLevelInfo(profile.totalScore);
        await leaderboardService.submitScore({
          nickname: profile.nickname,
          avatarId: profile.avatarId,
          score: profile.totalScore,
          level: profile.level,
          badge: `${levelInfo.badge} Lv.${profile.level} ${levelInfo.title.split(' ')[0]}`,
        });
      }

      const [data, rank] = await Promise.all([
        leaderboardService.getLeaderboard(tab, verifiedOnly),
        leaderboardService.getPlayerRank(profile.nickname, tab, verifiedOnly),
      ]);

      setEntries(data);
      setPlayerRank(rank);
      setIsFirebase(leaderboardService.isFirebaseEnabled());
      setLastRefresh(new Date());
    } catch (err) {
      console.warn('[LeaderboardScreen] Load error:', err);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [profile.nickname, profile.totalScore, profile.level, profile.avatarId, verifiedOnly]);

  useEffect(() => {
    loadData(activeTab, true);
  }, [activeTab, verifiedOnly]);

  const handleTabChange = (tab: TabId) => {
    if (tab === activeTab) return;
    audioManager.playClick();
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    audioManager.playClick();
    loadData(activeTab, true);
  };

  const handleToggleVerifiedOnly = () => {
    audioManager.playClick();
    const next = !verifiedOnly;
    setVerifiedOnly(next);
    leaderboardService.setVerifiedOnlyMode(next);
  };

  const handlePurgeMockLeaders = () => {
    audioManager.playClick();
    if (window.confirm('Clear all mock/demo devotees? Only genuine players will remain.')) {
      leaderboardService.purgeMockLeaders();
      setShowControlMenu(false);
      loadData(activeTab, true);
    }
  };

  const handleResetAll = () => {
    audioManager.playClick();
    if (window.confirm('Reset all scores? This will completely clear the board for a fresh launch.')) {
      leaderboardService.resetAllLeaderboards();
      setShowControlMenu(false);
      loadData(activeTab, true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 flex flex-col space-y-4 select-none animate-slide-in-up">
      {/* ─ Header ─ */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => { audioManager.playClick(); onNavigate('hub'); }}
          className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 active-press transition-all touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Festival Hub</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-extrabold font-festive text-amber-100 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Festival Leaderboard</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            {isFirebase ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <Wifi className="w-3 h-3" />
                <span>Live Rankings</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400/60 font-medium">
                <WifiOff className="w-3 h-3" />
                <span>Verified Vault</span>
              </span>
            )}
            <span className="text-[10px] text-amber-400/40">·</span>
            <span className="text-[10px] text-amber-400/50 font-medium">
              {entries.length} {verifiedOnly ? 'verified devotees' : 'devotees'}
            </span>
          </div>
        </div>

        {/* Right buttons: Controls & Refresh */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowControlMenu(!showControlMenu)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
              showControlMenu
                ? 'bg-amber-500/30 text-amber-200 border-amber-400'
                : 'bg-black/40 hover:bg-black/60 text-amber-300 border-amber-500/30'
            }`}
            title="Leaderboard Controls & Clean-up"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-200 active-press transition-all touch-target"
            title="Refresh leaderboard"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─ Leaderboard Control Panel (When toggled) ─ */}
      {showControlMenu && (
        <div className="p-3.5 rounded-2xl bg-black/75 border border-amber-500/40 backdrop-blur-md space-y-2.5 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-amber-400" />
              Leaderboard Host Controls
            </span>
            <span className="text-[10px] text-amber-400/60">Configure public ranking</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={handlePurgeMockLeaders}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Purge Mock / Demo Users</span>
            </button>

            <button
              onClick={handleResetAll}
              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Full Reset for Launch</span>
            </button>
          </div>
        </div>
      )}

      {/* ─ Devotee Verification Prompt Banner (if not authenticated) ─ */}
      {!isPlayerVerified && onOpenAuth && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-400/40 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-amber-200 block truncate">
                Devotee Not Verified
              </span>
              <span className="text-[10px] text-amber-300/70 block leading-tight truncate">
                Log in to earn your Verified Devotee badge & record official rank
              </span>
            </div>
          </div>
          <button
            onClick={() => { audioManager.playClick(); onOpenAuth(); }}
            className="px-3 py-1.5 rounded-xl festive-gold-gradient text-slate-950 text-xs font-bold whitespace-nowrap shadow-md active-press hover:brightness-110 flex-shrink-0"
          >
            Log In
          </button>
        </div>
      )}

      {/* ─ Filter Toggle: Verified Devotees Only ─ */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-2xl bg-black/40 border border-amber-500/20 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${verifiedOnly ? 'text-emerald-400' : 'text-amber-400/50'}`} />
          <span className="text-amber-200 font-medium">Official Verified Devotees Only</span>
        </div>
        <button
          onClick={handleToggleVerifiedOnly}
          className={`px-3 py-1 rounded-xl font-bold transition-all text-xs ${
            verifiedOnly
              ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
              : 'bg-black/50 border border-amber-500/20 text-amber-400/60'
          }`}
        >
          {verifiedOnly ? '✓ ACTIVE' : 'SHOW ALL'}
        </button>
      </div>

      {/* ─ Tab Bar ─ */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-black/50 border border-amber-500/30">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all active-press flex flex-col items-center gap-0.5 ${
              activeTab === tab.id
                ? 'festive-gold-gradient text-slate-950 shadow-md'
                : 'text-amber-300/70 hover:text-amber-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-1">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
            <span className={`text-[9px] font-medium hidden sm:block ${activeTab === tab.id ? 'text-slate-800' : 'text-amber-400/50'}`}>
              {tab.description}
            </span>
          </button>
        ))}
      </div>

      {/* ─ Your Position Card (shown if player has a rank) ─ */}
      {!isLoading && playerRank !== null && (
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 flex items-center justify-between gap-3 shadow-[0_0_18px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-xl">
              {getAvatarEmoji(profile.avatarId)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-100 block">{profile.nickname}</span>
                {isPlayerVerified && (
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full text-[8px] font-black bg-amber-400 text-slate-950">
                    VERIFIED
                  </span>
                )}
              </div>
              <span className="text-[10px] text-amber-400/80">Your current position</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-xs font-bold text-amber-300/70 block">Score</span>
              <span className="text-sm font-black festive-text-gold">{(profile.totalScore || profile.totalPoints).toLocaleString()}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/25 border border-amber-400/50 text-center min-w-[48px]">
              <span className="text-[10px] font-bold text-amber-400/80 block">Rank</span>
              <span className="text-sm font-black text-amber-100">#{playerRank}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─ Leaderboard Table ─ */}
      <div className="festive-glass-glow rounded-3xl p-3 sm:p-4 border border-amber-500/35 shadow-2xl space-y-2">
        {/* Column headers */}
        {!isLoading && entries.length > 0 && (
          <div className="grid grid-cols-[2.5rem_1fr_auto] gap-3 px-1 pb-1 border-b border-amber-500/15">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/60 text-center">#</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/60">Devotee</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/60 text-right">Score</span>
          </div>
        )}

        {isLoading ? (
          <SkeletonRows />
        ) : entries.length === 0 ? (
          <EmptyState tab={activeTab} isVerifiedFilter={verifiedOnly} />
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={idx + 1}
                isCurrentPlayer={entry.nickname.toLowerCase() === profile.nickname.toLowerCase()}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─ Footer info ─ */}
      {!isLoading && entries.length > 0 && (
        <p className="text-center text-[10px] text-amber-400/40 font-medium pb-1">
          Updated {lastRefresh.toLocaleTimeString()} · Showing top {Math.min(entries.length, 50)} {verifiedOnly ? 'verified' : ''} devotees
        </p>
      )}
    </div>
  );
};
