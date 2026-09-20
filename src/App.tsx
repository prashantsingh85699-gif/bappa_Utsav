import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { ScreenType, PlayerProfile, GameSettings, GameResult, MandapItemInstance, ChallengeContext } from './types';
import { storageService, DEFAULT_PROFILE } from './services/storageService';
import { leaderboardService } from './services/leaderboardService';
import { challengeService } from './services/challengeService';
import { audioManager, MusicTrackType } from './services/audioService';

// Layout & Background
import { Header } from './components/common/Header';
import { BottomNav } from './components/layout/BottomNav';
import { FestivalBackground } from './components/layout/FestivalBackground';
import { PageTransition } from './components/layout/PageTransition';
import { FestivalSpinner } from './components/ui/FestivalSpinner';

// Toast System
import { ToastProvider, useToast } from './hooks/useToast';
import { ToastContainer } from './components/ui/Toast';

// Modals
import { ProfileModal } from './components/screens/ProfileModal';
import { SettingsModal } from './components/screens/SettingsModal';
import { ResultModal } from './components/screens/ResultModal';
import { LevelUpModal } from './components/ui/LevelUpModal';
import { AuthModal } from './components/auth/AuthModal';
import { authService, AuthUser } from './services/authService';
import { progressionService } from './services/progressionService';

// Primary Screens
import { LoadingScreen } from './components/ui/LoadingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { HubScreen } from './components/screens/HubScreen';

// Lazy-Loaded Secondary Screens & Heavy Games
const LeaderboardScreen = lazy(() => import('./components/screens/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const ChallengeScreen = lazy(() => import('./components/screens/ChallengeScreen').then(m => ({ default: m.ChallengeScreen })));
const CompletionScreen = lazy(() => import('./components/screens/CompletionScreen').then(m => ({ default: m.CompletionScreen })));
const DholBeatGame = lazy(() => import('./games/dhol/DholBeatGame').then(m => ({ default: m.DholBeatGame })));
const MandapDesignerGame = lazy(() => import('./games/mandap/MandapDesignerGame').then(m => ({ default: m.MandapDesignerGame })));
const ModakCatchGame = lazy(() => import('./games/modak/ModakCatchGame').then(m => ({ default: m.ModakCatchGame })));
const BappaQuizGame = lazy(() => import('./games/quiz/BappaQuizGame').then(m => ({ default: m.BappaQuizGame })));

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [profile, setProfile] = useState<PlayerProfile>(() => storageService.loadProfile());
  const [settings, setSettings] = useState<GameSettings>(() => storageService.loadSettings());

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'howToPlay' | 'about'>('settings');
  const [activeResult, setActiveResult] = useState<GameResult | null>(null);
  const [activeChallengeContext, setActiveChallengeContext] = useState<ChallengeContext | null>(null);
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    levelTitle: string;
    unlockedItems: any[];
  } | null>(null);

  const { showToast } = useToast();

  // Listen to auth changes
  useEffect(() => {
    return authService.subscribe((user) => {
      if (user) {
        setProfile((prev) => {
          const updated = {
            ...prev,
            nickname: user.nickname || prev.nickname,
            avatarId: user.avatarId || prev.avatarId,
            isVerified: user.isVerified,
            userId: user.uid,
            email: user.email,
            authProvider: user.provider,
          };
          storageService.saveProfile(updated);
          return updated;
        });
      }
    });
  }, []);

  const handleAuthSuccess = (user: AuthUser) => {
    updateProfile({
      nickname: user.nickname,
      avatarId: user.avatarId,
      isVerified: user.isVerified,
      userId: user.uid,
      email: user.email,
      authProvider: user.provider,
    });
    showToast({
      title: user.isVerified ? 'Devotee Verified! 🛡️' : 'Welcome Guest Devotee',
      message: user.isVerified
        ? `Auspicious blessings, ${user.nickname}! You are now verified for Official Leaderboards.`
        : `Welcome ${user.nickname}!`,
      type: user.isVerified ? 'achievement' : 'info',
    });
  };

  // Synchronize settings with audio manager
  useEffect(() => {
    audioManager.setMusicEnabled(settings.sound.musicEnabled);
    audioManager.setSfxEnabled(settings.sound.sfxEnabled);
    if (settings.sound.musicVolume !== undefined) {
      audioManager.setMusicVolume(settings.sound.musicVolume);
    }
    if (settings.sound.sfxVolume !== undefined) {
      audioManager.setSfxVolume(settings.sound.sfxVolume);
    }
    if (settings.sound.masterVolume !== undefined) {
      audioManager.setMasterVolume(settings.sound.masterVolume);
    }
  }, [settings.sound]);

  // Seamlessly transition music tracks based on the active screen
  useEffect(() => {
    if (currentScreen === 'splash') return;

    let targetTrack: MusicTrackType = 'home';
    switch (currentScreen) {
      case 'home':
      case 'hub':
      case 'leaderboard':
      case 'challenge':
        targetTrack = 'home'; // Calm festive Mohan Veena & Tanpura
        break;
      case 'dhol':
        targetTrack = 'dhol'; // Energetic Dhol-Tasha festive rhythm
        break;
      case 'mandap':
        targetTrack = 'mandap'; // Peaceful classical Veena & temple ambience
        break;
      case 'modak':
        targetTrack = 'modak'; // Playful classical Sitar & Tabla jugalbandi
        break;
      case 'quiz':
        targetTrack = 'quiz'; // Subtle Raag Kedar meditative drone
        break;
      case 'completion':
        targetTrack = 'celebration'; // Auspicious Raag Hansdhwani & celebration
        break;
      default:
        targetTrack = 'home';
        break;
    }

    audioManager.playMusic(targetTrack, 1.2);
  }, [currentScreen]);

  // Save profile changes
  const updateProfile = useCallback((patch: Partial<PlayerProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...patch };
      storageService.saveProfile(updated);
      return updated;
    });
  }, []);

  // Save settings changes
  const updateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch };
      storageService.saveSettings(updated);
      return updated;
    });
  }, []);

  // Handle launching challenge from ChallengeScreen or Hub
  const handleLaunchChallenge = useCallback((context: ChallengeContext) => {
    setActiveChallengeContext(context);
    setCurrentScreen(context.gameType);
  }, []);

  // Handle Mini-Game Finished
  const handleGameFinished = useCallback((result: GameResult) => {
    const outcome = progressionService.processGameCompletion(profile, result);
    setProfile(outcome.updatedProfile);

    // Level-Up Celebration
    if (outcome.levelUpOccurred) {
      setLevelUpData({
        level: outcome.newLevel,
        levelTitle: outcome.newLevelTitle,
        unlockedItems: outcome.newUnlocks,
      });
    } else {
      showToast({
        title: `${result.gameName} Complete!`,
        message: `Earned +${outcome.pointsAwarded.toLocaleString()} festival points!`,
        type: 'success',
        icon: '✨',
      });
    }

    // Achievement Unlocks
    outcome.newAchievements.forEach((ach) => {
      showToast({
        title: 'Achievement Unlocked! 🏆',
        message: `${ach.icon} ${ach.title}: ${ach.description}`,
        type: 'achievement',
        icon: '🎖️',
      });
    });

    // Personal Record
    if (outcome.isPersonalBest) {
      showToast({
        title: 'New Personal Best! 🌟',
        message: `You set a new record in ${result.gameName}!`,
        type: 'info',
        icon: '⭐',
      });
    }

    // Submit to global leaderboard
    leaderboardService.submitScore({
      nickname: outcome.updatedProfile.nickname,
      avatarId: outcome.updatedProfile.avatarId,
      score: outcome.updatedProfile.totalScore,
      level: outcome.updatedProfile.level,
      badge: `Lv.${outcome.updatedProfile.level} ${outcome.newLevelTitle.split(' ')[0]}`,
    });

    // Submit to Challenge Leaderboard & Group Room if in challenge mode
    if (activeChallengeContext) {
      const challengeSubmission = {
        playerId: outcome.updatedProfile.nickname,
        nickname: outcome.updatedProfile.nickname,
        avatarId: outcome.updatedProfile.avatarId,
        challengeId: activeChallengeContext.challengeId,
        score: result.finalScore,
        level: outcome.updatedProfile.level,
        badge: `Lv.${outcome.updatedProfile.level} Devotee`,
      };

      challengeService.submitChallengeScore(challengeSubmission, activeChallengeContext.gameType);

      if (activeChallengeContext.roomId) {
        challengeService.submitRoomScore(
          activeChallengeContext.roomId,
          challengeSubmission,
          activeChallengeContext.gameType
        );
      }

      showToast({
        title: '🔥 Festival Challenge Ranked!',
        message: `Scored ${result.finalScore.toLocaleString()} pts in ${activeChallengeContext.title}!`,
        type: 'achievement',
        icon: '🔥',
        duration: 4500,
      });
    }

    // Populate active result modal
    setActiveResult({
      ...result,
      newLevelReached: outcome.levelUpOccurred ? outcome.newLevel : undefined,
      newUnlocks: outcome.newUnlocks.length > 0 ? outcome.newUnlocks : undefined,
    });
  }, [profile, showToast, activeChallengeContext]);

  // Reset all activities in current festival cycle
  const handleResetActivities = useCallback(() => {
    updateProfile({
      completedActivities: {
        dhol: false,
        mandap: false,
        modak: false,
        quiz: false,
      },
    });
    showToast({
      title: 'New Utsav Cycle Begun',
      message: 'All activities refreshed for worship!',
      type: 'info',
    });
  }, [updateProfile, showToast]);

  // Master reset of all player data
  const handleMasterReset = useCallback(() => {
    storageService.resetAll();
    setProfile({ ...DEFAULT_PROFILE });
    showToast({
      title: 'Progress Reset',
      message: 'All scores and unlocks have been cleared.',
      type: 'alert',
    });
  }, [showToast]);

  const handleToggleSound = useCallback(() => {
    const nextMusic = !settings.sound.musicEnabled;
    const nextSfx = !settings.sound.sfxEnabled;
    audioManager.setMusicEnabled(nextMusic);
    audioManager.setSfxEnabled(nextSfx);
    updateSettings({
      sound: {
        ...settings.sound,
        musicEnabled: nextMusic,
        sfxEnabled: nextSfx,
      },
    });
    showToast({
      message: nextMusic ? 'Sound & Ambience Enabled 🪔' : 'Audio Muted',
      type: 'info',
      duration: 2000,
    });
  }, [settings.sound, updateSettings, showToast]);

  const handleToggleMusic = useCallback(() => {
    const nextMusic = !settings.sound.musicEnabled;
    audioManager.setMusicEnabled(nextMusic);
    updateSettings({
      sound: {
        ...settings.sound,
        musicEnabled: nextMusic,
      },
    });
    showToast({
      message: nextMusic ? 'Ganesh Aarti & Utsav Music: ON 🪔' : 'Music Ambience Muted',
      type: 'info',
      duration: 2000,
    });
  }, [settings.sound, updateSettings, showToast]);

  const allActivitiesPlayed = Object.values(profile.completedActivities).every(Boolean);

  // Dynamic Live Utsav Stage Intensity based on active screen
  const stageIntensity: 'low' | 'medium' | 'high' = useMemo(() => {
    switch (currentScreen) {
      case 'dhol':
      case 'modak':
        return 'low'; // High-speed arcade gameplay requires minimal visual distraction
      case 'quiz':
      case 'mandap':
      case 'leaderboard':
      case 'challenge':
        return 'medium'; // Balanced celebratory atmosphere
      case 'home':
      case 'hub':
      case 'completion':
      default:
        return 'high'; // Full grand festival stage immersion
    }
  }, [currentScreen]);

  return (
    <div className="min-h-screen bg-[#0E021C] text-white flex flex-col font-sans relative overflow-x-hidden select-none">
      {/* Live Utsav Stage Background with Multi-Layer Mandap & Canvas Engine */}
      <FestivalBackground
        intensity={stageIntensity}
        reducedMotion={settings.reducedMotion}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Global Responsive Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        profile={profile}
        soundEnabled={settings.sound.musicEnabled || settings.sound.sfxEnabled}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => {
          setSettingsInitialTab('settings');
          setIsSettingsModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Screen Router wrapped in PageTransition & Suspense */}
      <main className="flex-1 flex flex-col z-10">
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 animate-fade-in min-h-[50vh]">
              <FestivalSpinner size="lg" />
              <span className="text-xs font-bold text-amber-300/80 font-festive tracking-wider">
                Loading Sacred Experience...
              </span>
            </div>
          }
        >
          {currentScreen === 'splash' && (
            <LoadingScreen onComplete={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'home' && (
            <PageTransition>
              <HomeScreen
                onNavigate={setCurrentScreen}
                profile={profile}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenSettings={(tab) => {
                  setSettingsInitialTab(tab || 'settings');
                  setIsSettingsModalOpen(true);
                }}
                soundEnabled={settings.sound.musicEnabled || settings.sound.sfxEnabled}
                onToggleSound={handleToggleSound}
                musicEnabled={settings.sound.musicEnabled}
                onToggleMusic={handleToggleMusic}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            </PageTransition>
          )}

          {currentScreen === 'hub' && (
            <PageTransition>
              <HubScreen
                onNavigate={setCurrentScreen}
                profile={profile}
                onOpenProfile={() => setIsProfileModalOpen(true)}
              />
            </PageTransition>
          )}

          {currentScreen === 'dhol' && (
            <PageTransition>
              <DholBeatGame
                onFinish={handleGameFinished}
                onExit={() => setCurrentScreen('hub')}
              />
            </PageTransition>
          )}

          {currentScreen === 'mandap' && (
            <PageTransition>
              <MandapDesignerGame
                unlockedItemIds={profile.unlockedItemIds}
                playerLevel={profile.level}
                initialSaveData={profile.mandapSaveData}
                onSaveMandap={(items: MandapItemInstance[]) => {
                  updateProfile({ mandapSaveData: items });
                  showToast({
                    title: 'Mandap Saved! 🌸',
                    message: 'Your beautiful mandap arrangement was saved.',
                    type: 'success',
                  });
                }}
                onFinish={handleGameFinished}
                onExit={() => setCurrentScreen('hub')}
              />
            </PageTransition>
          )}

          {currentScreen === 'modak' && (
            <PageTransition>
              <ModakCatchGame
                onFinish={handleGameFinished}
                onExit={() => setCurrentScreen('hub')}
              />
            </PageTransition>
          )}

          {currentScreen === 'quiz' && (
            <PageTransition>
              <BappaQuizGame
                onFinish={handleGameFinished}
                onExit={() => setCurrentScreen('hub')}
              />
            </PageTransition>
          )}

          {currentScreen === 'leaderboard' && (
            <PageTransition>
              <LeaderboardScreen
                onNavigate={setCurrentScreen}
                profile={profile}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            </PageTransition>
          )}

          {currentScreen === 'challenge' && (
            <PageTransition>
              <ChallengeScreen
                onNavigate={setCurrentScreen}
                profile={profile}
                onLaunchChallenge={handleLaunchChallenge}
              />
            </PageTransition>
          )}

          {currentScreen === 'completion' && (
            <PageTransition>
              <CompletionScreen
                onNavigate={setCurrentScreen}
                profile={profile}
                onResetActivities={handleResetActivities}
              />
            </PageTransition>
          )}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation (Visible on mobile viewports < 768px) */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenSettings={() => {
          setSettingsInitialTab('settings');
          setIsSettingsModalOpen(true);
        }}
      />

      {/* Global Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        profile={profile}
        onSave={(patch) => {
          updateProfile(patch);
          showToast({
            title: 'Profile Updated',
            message: `Devotee name updated to ${patch.nickname || profile.nickname}`,
            type: 'success',
          });
        }}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenAuth={() => {
          setIsProfileModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Devotee Authentication & Verification Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetProgress={handleMasterReset}
        initialTab={settingsInitialTab}
      />

      <ResultModal
        isOpen={Boolean(activeResult)}
        result={activeResult}
        allGamesPlayed={allActivitiesPlayed}
        onReplay={() => {
          const gameScreen = activeResult?.gameId;
          setActiveResult(null);
          if (gameScreen) setCurrentScreen(gameScreen as ScreenType);
        }}
        onGoToHub={() => {
          const wasChallenge = Boolean(activeChallengeContext);
          setActiveResult(null);
          setActiveChallengeContext(null);
          setCurrentScreen(wasChallenge ? 'challenge' : 'hub');
        }}
        onGoToCompletion={() => {
          setActiveResult(null);
          setActiveChallengeContext(null);
          setCurrentScreen('completion');
        }}
      />

      {/* Level-Up Celebration Modal */}
      {levelUpData && (
        <LevelUpModal
          isOpen={Boolean(levelUpData)}
          level={levelUpData.level}
          levelTitle={levelUpData.levelTitle}
          unlockedItems={levelUpData.unlockedItems}
          onClose={() => setLevelUpData(null)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
