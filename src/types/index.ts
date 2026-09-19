export type ScreenType = 
  | 'splash' 
  | 'home' 
  | 'hub' 
  | 'dhol' 
  | 'mandap' 
  | 'modak' 
  | 'quiz' 
  | 'leaderboard' 
  | 'challenge'
  | 'completion'
  | 'presentation';

export type MiniGameId = 'dhol' | 'mandap' | 'modak' | 'quiz';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface FestivalChallenge {
  id: string;
  title: string;
  gameType: MiniGameId;
  difficulty: ChallengeDifficulty;
  description: string;
  targetScore: number;
  startTime: number;
  endTime: number;
  icon: string;
  accentColor: string;
  dayNumber: number;
}

export interface FestivalRoom {
  roomId: string;
  name: string;
  hostId: string;
  hostName: string;
  challengeId: string;
  createdAt: number;
  participantsCount: number;
  participants?: {
    playerId: string;
    nickname: string;
    avatarId: string;
    joinedAt: number;
  }[];
}

export interface ChallengeSubmission {
  id: string;
  playerId: string;
  nickname: string;
  avatarId: string;
  challengeId: string;
  roomId?: string;
  score: number;
  submittedAt: number;
  level: number;
  badge?: string;
  stats?: Record<string, any>;
}

export interface ChallengeContext {
  challengeId: string;
  gameType: MiniGameId;
  roomId?: string;
  targetScore: number;
  title: string;
}

export interface PlayerStatistics {
  totalGamesPlayed: number;
  gamesPlayedByType: Record<MiniGameId, number>;
  perfectHits: number;
  highestCombo: number;
  totalModaksCaught: number;
  totalDecorationsPlaced: number;
  quizQuestionsAnswered: number;
  quizCorrectAnswers: number;
  utsavCyclesCompleted: number;
  firstPlayedTimestamp: number;
  lastPlayedTimestamp: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'general' | 'dhol' | 'mandap' | 'modak' | 'quiz';
  unlockedAt?: number;
}

export interface PlayerProfile {
  nickname: string;
  avatarId: string;
  totalScore: number;
  totalPoints: number; // alias for totalScore
  level: number;
  xp: number; // XP progress in current level
  gameBestScores: Record<MiniGameId, number>;
  bestScores: Record<MiniGameId, number>; // alias
  unlockedDecorations: string[];
  unlockedItemIds: string[]; // alias
  statistics: PlayerStatistics;
  unlockedAchievements: string[];
  completedActivities: Record<MiniGameId, boolean>;
  mandapSaveData?: MandapItemInstance[];
  // Authentication & Verification
  isVerified?: boolean;
  userId?: string;
  email?: string;
  authProvider?: 'email' | 'google' | 'local' | 'guest' | 'firebase';
}

export interface MandapItemInstance {
  instanceId: string;
  itemId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // 0.6 to 2.0
  rotation: number; // -180 to 180 degrees
  zIndex: number;
}

export type DecorationCategory =
  | 'flowers'
  | 'diyas'
  | 'garlands'
  | 'lights'
  | 'rangoli'
  | 'curtains'
  | 'banners'
  | 'backgrounds'
  | 'offerings'
  | 'decorations';

export interface DecorationDef {
  id: string;
  name: string;
  category: DecorationCategory;
  icon: string;
  requiredLevel: number;
  svgType: string;
  width: number;
  height: number;
  description?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatarId: string;
  score: number;
  level: number;
  badge?: string;
  timestamp: number;
  isVerified?: boolean;
  userId?: string;
  authProvider?: 'email' | 'google' | 'local' | 'guest' | 'firebase';
}

export interface GameResult {
  gameId: MiniGameId;
  gameName: string;
  baseScore: number;
  bonusScore: number;
  comboOrAccuracy: string;
  finalScore: number;
  newLevelReached?: number;
  newUnlocks?: DecorationDef[];
  // Extended game telemetry for statistics & achievements
  statsPayload?: {
    perfectCount?: number;
    maxCombo?: number;
    itemsCount?: number;
    accuracyPct?: number;
    isFlawless?: boolean;
  };
}

export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0.0 to 1.0 (default 0.7)
  sfxVolume: number;   // 0.0 to 1.0 (default 0.8)
  masterVolume?: number; // 0.0 to 1.0 (default 1.0)
  volume: number;      // master volume / legacy fallback
}

export interface GameSettings {
  reducedMotion: boolean;
  highContrast: boolean;
  sound: AudioSettings;
}
