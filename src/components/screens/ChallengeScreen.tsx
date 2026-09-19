import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flame,
  Clock,
  Trophy,
  Users,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  Play,
  Sparkles,
  Plus,
  LogIn,
  AlertCircle,
  Crown,
  Target,
  ShieldAlert,
} from 'lucide-react';
import {
  ScreenType,
  PlayerProfile,
  FestivalChallenge,
  FestivalRoom,
  ChallengeSubmission,
  ChallengeContext,
} from '../../types';
import { challengeService } from '../../services/challengeService';
import { audioManager } from '../../services/audioService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { getAvatarEmoji } from '../../utils/avatar';
import { useToast } from '../../hooks/useToast';

interface ChallengeScreenProps {
  profile: PlayerProfile;
  onNavigate: (screen: ScreenType) => void;
  onLaunchChallenge: (context: ChallengeContext) => void;
}

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  profile,
  onNavigate,
  onLaunchChallenge,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'daily' | 'rooms'>('daily');
  const [todayChallenge, setTodayChallenge] = useState<FestivalChallenge>(() => challengeService.getTodayChallenge());
  const [remainingMs, setRemainingMs] = useState<number>(() => challengeService.getRemainingTimeMs(todayChallenge));
  const [leaderboard, setLeaderboard] = useState<ChallengeSubmission[]>([]);
  const [playerSubmission, setPlayerSubmission] = useState<ChallengeSubmission | null>(null);

  // Group Rooms State
  const [selectedRoom, setSelectedRoom] = useState<FestivalRoom | null>(null);
  const [roomLeaderboard, setRoomLeaderboard] = useState<ChallengeSubmission[]>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. COUNTDOWN TICKER & REFRESH
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const challenge = challengeService.getTodayChallenge();
      setTodayChallenge(challenge);
      setRemainingMs(challengeService.getRemainingTimeMs(challenge));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    return challengeService.formatCountdown(remainingMs);
  }, [remainingMs]);

  // Load Daily Challenge Leaderboard & Player's Best
  const loadDailyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await challengeService.getChallengeLeaderboard(todayChallenge.id);
      setLeaderboard(list);
      const playerSub = await challengeService.getPlayerSubmission(todayChallenge.id, profile.nickname);
      setPlayerSubmission(playerSub);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [todayChallenge.id, profile.nickname]);

  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  // Load Room Leaderboard when a room is active
  useEffect(() => {
    if (!selectedRoom) return;

    challengeService.getRoomLeaderboard(selectedRoom.roomId).then((subs) => {
      setRoomLeaderboard(subs);
    });
  }, [selectedRoom]);

  // ───────────────────────────────────────────────────────────────────────────
  // 2. ROOM ACTIONS
  // ───────────────────────────────────────────────────────────────────────────
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    audioManager.playButtonClick();
    setIsLoading(true);

    try {
      const room = await challengeService.createRoom(
        newRoomName.trim(),
        profile.nickname,
        profile.nickname,
        profile.avatarId,
        todayChallenge.id
      );
      setSelectedRoom(room);
      setIsCreateModalOpen(false);
      setNewRoomName('');
      showToast({
        title: 'Room Created! 🎊',
        message: `Share code ${room.roomId} with friends to compete!`,
        type: 'success',
      });
      audioManager.playUnlock();
    } catch {
      showToast({ message: 'Could not create room. Try again.', type: 'alert' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (codeToJoin?: string) => {
    const code = codeToJoin || joinCodeInput.trim();
    if (!code) return;

    audioManager.playButtonClick();
    setIsLoading(true);

    try {
      const result = await challengeService.joinRoom(
        code,
        profile.nickname,
        profile.nickname,
        profile.avatarId
      );

      if (result.success && result.room) {
        setSelectedRoom(result.room);
        setJoinCodeInput('');
        showToast({
          title: 'Room Joined! 👥',
          message: `Entered ${result.room.name}`,
          type: 'success',
        });
        audioManager.playLevelUp();
      } else {
        showToast({
          title: 'Join Failed',
          message: result.error || 'Room not found.',
          type: 'alert',
        });
        audioManager.playWrongAnswer();
      }
    } catch {
      showToast({ message: 'Error joining room.', type: 'alert' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    audioManager.playButtonClick();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedCode(true);
      showToast({
        title: 'Code Copied! 📋',
        message: `Share ${code} with your friends or college group!`,
        type: 'info',
      });
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      showToast({ message: `Room Code: ${code}`, type: 'info' });
    }
  };

  const handleShareRoom = async (room: FestivalRoom) => {
    audioManager.playButtonClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${room.name} — Bappa Utsav Challenge`,
          text: `Join our Bappa Utsav festival room "${room.name}"! Use code: ${room.roomId}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    handleCopyCode(room.roomId);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 3. LAUNCH CHALLENGE GAMEPLAY
  // ───────────────────────────────────────────────────────────────────────────
  const handleStartChallenge = (roomId?: string) => {
    audioManager.playGameStart();
    onLaunchChallenge({
      challengeId: todayChallenge.id,
      gameType: todayChallenge.gameType,
      roomId,
      targetScore: todayChallenge.targetScore,
      title: todayChallenge.title,
    });
  };

  // Compute player rank
  const playerRank = useMemo(() => {
    if (!playerSubmission) return null;
    const idx = leaderboard.findIndex((s) => s.playerId === playerSubmission.playerId);
    return idx >= 0 ? idx + 1 : null;
  }, [playerSubmission, leaderboard]);

  return (
    <div className="max-w-4xl mx-auto px-3.5 py-3 sm:py-6 space-y-4 sm:space-y-6 select-none animate-fade-in pb-20 md:pb-6">
      {/* ─ Top Navigation Bar ─ */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <button
          onClick={() => {
            audioManager.playClick();
            onNavigate('hub');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-black/40 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-sm group touch-target flex-shrink-0"
          title="Return to Festival Hub"
          aria-label="Back to Hub"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Festival Hub</span>
        </button>

        <div className="text-center min-w-0 flex-1 px-1">
          <div className="flex items-center justify-center gap-1.5">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 animate-pulse flex-shrink-0" />
            <h1 className="text-base sm:text-2xl font-festive font-black tracking-wider text-amber-100 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] truncate">
              FESTIVAL CHALLENGE
            </h1>
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-amber-300/80 truncate hidden xs:block">
            Asynchronous daily competition & group festival rooms
          </p>
        </div>

        <button
          onClick={() => {
            audioManager.playClick();
            onNavigate('leaderboard');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-sm touch-target flex-shrink-0"
          title="Global Hall of Devotees"
          aria-label="Global Ranks"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Global Ranks</span>
        </button>
      </div>

      {/* ─ Tab Selector: Daily Challenge vs Group Rooms ─ */}
      <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-amber-500/30 max-w-md mx-auto">
        <button
          id="challenge-tab-daily"
          onClick={() => {
            audioManager.playClick();
            setActiveTab('daily');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-gold-glow'
              : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Today’s Challenge</span>
        </button>
        <button
          id="challenge-tab-rooms"
          onClick={() => {
            audioManager.playClick();
            setActiveTab('rooms');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            activeTab === 'rooms'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-gold-glow'
              : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Group Rooms</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: TODAY'S DAILY CHALLENGE
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'daily' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Featured Challenge Hero Card */}
          <Card variant="glow" padding="lg" className="relative overflow-hidden border-amber-500/50">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              {/* Left Details */}
              <div className="space-y-2.5 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    Day {todayChallenge.dayNumber} of Ganeshotsav
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/25 text-red-300 border border-red-500/40 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    {todayChallenge.difficulty.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl filter drop-shadow">{todayChallenge.icon}</span>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black font-festive text-amber-100 tracking-wide">
                      {todayChallenge.title}
                    </h2>
                    <p className="text-xs text-amber-300/80 leading-relaxed mt-0.5">
                      {todayChallenge.description}
                    </p>
                  </div>
                </div>

                {/* Score Target & Current Status */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/25">
                    <span className="text-[10px] font-bold text-amber-400/70 uppercase block">Target Score</span>
                    <span className="text-sm sm:text-base font-extrabold text-amber-200">
                      🎯 {todayChallenge.targetScore.toLocaleString()} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/25">
                    <span className="text-[10px] font-bold text-amber-400/70 uppercase block">Your Best</span>
                    <span className="text-sm sm:text-base font-extrabold text-amber-100">
                      {playerSubmission ? `${playerSubmission.score.toLocaleString()} pts` : '—'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/25 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-amber-400/70 uppercase block">Current Rank</span>
                    <span className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center gap-1">
                      {playerRank ? (
                        <>
                          <Crown className="w-4 h-4 text-yellow-400" />
                          Rank #{playerRank}
                        </>
                      ) : (
                        'Unranked'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Live Countdown & Play Button */}
              <div className="w-full md:w-auto flex flex-col items-center gap-3 p-3 sm:p-4 rounded-2xl bg-black/50 border border-amber-500/30 text-center min-w-[220px]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Challenge Ends In
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-yellow-300 mt-0.5">
                    {countdown.hours}:{countdown.minutes}:{countdown.seconds}
                  </div>
                </div>

                <Button
                  variant="primary-gold"
                  fullWidth
                  glow
                  shine
                  icon={<Play className="w-4 h-4 fill-current" />}
                  onClick={() => handleStartChallenge()}
                  disabled={countdown.isEnded}
                >
                  {countdown.isEnded ? 'Challenge Concluded' : 'Play Today’s Challenge'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Today's Challenge Leaderboard */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Today’s Challenge Board ({todayChallenge.title})</span>
              </h3>
              <span className="text-xs text-amber-400/70">
                {leaderboard.length} Devotees Participating
              </span>
            </div>

            <Card variant="glass" padding="none" className="overflow-hidden border-amber-500/30">
              <div className="divide-y divide-amber-500/15">
                {leaderboard.slice(0, 10).map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrent = entry.nickname.toLowerCase() === profile.nickname.toLowerCase();
                  return (
                    <div
                      key={entry.id}
                      className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/20 border-l-4 border-l-amber-400'
                          : idx % 2 === 0
                          ? 'bg-black/20'
                          : 'bg-transparent'
                      }`}
                    >
                      {/* Rank badge */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-base flex-shrink-0 border border-amber-300/40">
                          {getAvatarEmoji(entry.avatarId)}
                        </div>

                        <div className="min-w-0">
                          <span className={`text-xs sm:text-sm font-bold truncate block ${isCurrent ? 'text-amber-100' : 'text-amber-200'}`}>
                            {entry.nickname} {isCurrent && '(You)'}
                          </span>
                          <span className="text-[10px] text-amber-400/70 truncate block">
                            {entry.badge || `Level ${entry.level} Devotee`}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <span className={`text-sm sm:text-base font-extrabold ${isCurrent ? 'festive-text-gold' : 'text-amber-300'}`}>
                          {entry.score.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-amber-500/60 block">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: GROUP FESTIVAL ROOMS
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'rooms' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Action Bar: Create Room & Join Room Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Create Room Button */}
            <Card variant="glass" padding="md" className="flex items-center justify-between gap-3 border-amber-500/40">
              <div>
                <h3 className="font-bold text-amber-200 text-sm">Create Festival Room</h3>
                <p className="text-xs text-amber-400/70">Compete with college friends, family, or society</p>
              </div>
              <Button
                id="btn-open-create-room"
                variant="primary-gold"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create
              </Button>
            </Card>

            {/* Join Room Input */}
            <Card variant="glass" padding="md" className="border-amber-500/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Room Code (e.g. BAPPA27)"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-amber-500/30 text-amber-100 placeholder-amber-400/40 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Button
                  variant="secondary-glass"
                  size="sm"
                  icon={<LogIn className="w-4 h-4" />}
                  onClick={() => handleJoinRoom()}
                  disabled={!joinCodeInput.trim() || isLoading}
                >
                  Join
                </Button>
              </div>
            </Card>
          </div>

          {/* Active Room View (if a room is selected) */}
          {selectedRoom ? (
            <div className="space-y-4">
              <Card variant="glow" padding="lg" className="border-amber-500/50 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 uppercase">
                        ACTIVE ROOM
                      </span>
                      <span className="text-xs text-amber-400/80">
                        Created by {selectedRoom.hostName}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black font-festive text-amber-100 mt-1">
                      {selectedRoom.name}
                    </h2>

                    <div className="flex items-center gap-2 mt-2">
                      <div
                        id="active-room-code"
                        className="px-3 py-1 rounded-xl bg-black/60 border border-amber-500/40 text-amber-300 font-mono font-black text-sm tracking-widest"
                      >
                        {selectedRoom.roomId}
                      </div>

                      <button
                        onClick={() => handleCopyCode(selectedRoom.roomId)}
                        className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 active-press transition-all"
                        title="Copy Room Code"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleShareRoom(selectedRoom)}
                        className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 active-press transition-all"
                        title="Share Room"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Play Room Challenge Action */}
                  <div className="w-full sm:w-auto flex flex-col items-center gap-2">
                    <Button
                      variant="primary-gold"
                      fullWidth
                      glow
                      shine
                      icon={<Play className="w-4 h-4 fill-current" />}
                      onClick={() => handleStartChallenge(selectedRoom.roomId)}
                    >
                      Play Room Challenge
                    </Button>
                    <span className="text-[10px] text-amber-400/70">
                      Scores sync automatically to room ranks
                    </span>
                  </div>
                </div>
              </Card>

              {/* Room Member Leaderboard */}
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Room Standings ({selectedRoom.name})</span>
                </h3>

                <Card variant="glass" padding="none" className="overflow-hidden border-amber-500/30">
                  {roomLeaderboard.length === 0 ? (
                    <div className="p-6 text-center text-amber-300/70 text-xs">
                      No scores recorded yet in this room. Be the first devotee to set the record!
                    </div>
                  ) : (
                    <div className="divide-y divide-amber-500/15">
                      {roomLeaderboard.map((sub, idx) => {
                        const rank = idx + 1;
                        const isCurrent = sub.nickname.toLowerCase() === profile.nickname.toLowerCase();
                        return (
                          <div
                            key={sub.id}
                            className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 ${
                              isCurrent ? 'bg-amber-500/20 border-l-4 border-l-amber-400' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-center font-bold text-sm">
                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                              </span>
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-base border border-amber-300/40">
                                {getAvatarEmoji(sub.avatarId)}
                              </div>
                              <div>
                                <span className="text-xs sm:text-sm font-bold text-amber-200 block">
                                  {sub.nickname} {isCurrent && '(You)'}
                                </span>
                                <span className="text-[10px] text-amber-400/70 block">
                                  Level {sub.level} Devotee
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-sm sm:text-base font-black text-amber-300">
                                {sub.score.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-amber-500/60 block">pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ) : (
            /* Featured Community Rooms */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Featured Community Rooms</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: 'CSE 2nd Year Bappa Utsav',
                    code: 'BAPPA27',
                    members: 4,
                    host: 'Aarav Sharma',
                    tag: 'Campus Group',
                  },
                  {
                    name: 'Pune Ganesh Mitra Mandal',
                    code: 'PUNE108',
                    members: 3,
                    host: 'Ananya Deshmukh',
                    tag: 'Society Mandal',
                  },
                ].map((room) => (
                  <Card
                    key={room.code}
                    variant="glass"
                    padding="md"
                    className="flex flex-col justify-between gap-3 border-amber-500/30 hover:border-amber-400/60 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                          {room.tag}
                        </span>
                        <span className="text-[10px] text-amber-400/70">👥 {room.members} Devotees</span>
                      </div>
                      <h4 className="font-bold text-amber-100 text-sm">{room.name}</h4>
                      <p className="text-[11px] text-amber-300/70 mt-0.5">Code: <span className="font-mono font-bold text-amber-300">{room.code}</span></p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-500/15">
                      <button
                        onClick={() => handleCopyCode(room.code)}
                        className="text-xs text-amber-300 hover:text-amber-100 flex items-center gap-1 active-press"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>

                      <Button
                        variant="primary-gold"
                        size="sm"
                        onClick={() => handleJoinRoom(room.code)}
                      >
                        Enter Room
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          MODAL: CREATE FESTIVAL ROOM
         ─────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Festival Room"
        subtitle="Host a private asynchronous competition with friends"
        icon={<span>👥</span>}
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
              Room Name
            </label>
            <input
              id="input-room-name"
              type="text"
              required
              maxLength={30}
              placeholder="e.g. CSE 2nd Year Bappa Utsav, Pune Mitra Mandal"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-amber-500/40 text-amber-100 placeholder-amber-400/40 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300/80 leading-relaxed">
            ✨ You will receive a short room code (e.g. <strong>BAPPA27</strong>) to share with your friends. Anyone with the code can join and compete on your room’s private leaderboard!
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary-glass"
              fullWidth
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              id="btn-confirm-create-room"
              type="submit"
              variant="primary-gold"
              fullWidth
              glow
              disabled={!newRoomName.trim() || isLoading}
            >
              Create Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChallengeScreen;
