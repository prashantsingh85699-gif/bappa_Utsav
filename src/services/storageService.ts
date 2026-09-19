import { PlayerProfile, GameSettings, PlayerStatistics } from '../types';

export const PROFILE_KEY = 'bappa_utsav_profile_v1';
export const SETTINGS_KEY = 'bappa_utsav_settings_v1';

/**
 * Pluggable Storage Backend Interface.
 * Allows replacing localStorage with REST API, IndexedDB, Firebase, or Supabase.
 */
export interface IStorageBackend {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

/**
 * Reliable LocalStorage Backend with in-memory fallback for restricted/incognito environments.
 */
export class LocalStorageBackend implements IStorageBackend {
  private memoryFallback: Map<string, string> = new Map();
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.testAvailability();
  }

  private testAvailability(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public getItem(key: string): string | null {
    if (this.isLocalStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fallback to memory
      }
    }
    return this.memoryFallback.get(key) || null;
  }

  public setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memoryFallback.set(key, value);
  }

  public removeItem(key: string): void {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fallback to memory
      }
    }
    this.memoryFallback.delete(key);
  }
}

export const DEFAULT_STATISTICS: PlayerStatistics = {
  totalGamesPlayed: 0,
  gamesPlayedByType: {
    dhol: 0,
    mandap: 0,
    modak: 0,
    quiz: 0,
  },
  perfectHits: 0,
  highestCombo: 0,
  totalModaksCaught: 0,
  totalDecorationsPlaced: 0,
  quizQuestionsAnswered: 0,
  quizCorrectAnswers: 0,
  utsavCyclesCompleted: 0,
  firstPlayedTimestamp: Date.now(),
  lastPlayedTimestamp: Date.now(),
};

export const DEFAULT_UNLOCKED_DECORATIONS = [
  'clay_diya',
  'marigold_single',
  'yellow_curtain',
  'simple_rangoli',
  'modak_plate',
  'flower_petals',
];

export const DEFAULT_PROFILE: PlayerProfile = {
  nickname: 'Bappa Devotee',
  avatarId: 'bappa',
  totalScore: 0,
  totalPoints: 0,
  level: 1,
  xp: 0,
  gameBestScores: {
    dhol: 0,
    mandap: 0,
    modak: 0,
    quiz: 0,
  },
  bestScores: {
    dhol: 0,
    mandap: 0,
    modak: 0,
    quiz: 0,
  },
  unlockedDecorations: [...DEFAULT_UNLOCKED_DECORATIONS],
  unlockedItemIds: [...DEFAULT_UNLOCKED_DECORATIONS],
  statistics: { ...DEFAULT_STATISTICS },
  unlockedAchievements: [],
  completedActivities: {
    dhol: false,
    mandap: false,
    modak: false,
    quiz: false,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  reducedMotion: false,
  highContrast: false,
  sound: {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    masterVolume: 1.0,
    volume: 0.8,
  },
};

/**
 * Storage Service with pluggable backend adapter.
 */
export class StorageService {
  private backend: IStorageBackend;

  constructor(backend: IStorageBackend = new LocalStorageBackend()) {
    this.backend = backend;
  }

  /**
   * Switch backend at runtime (e.g. to connect to a cloud backend or test mock).
   */
  public setBackend(backend: IStorageBackend): void {
    this.backend = backend;
  }

  public getBackend(): IStorageBackend {
    return this.backend;
  }

  public loadProfile(): PlayerProfile {
    try {
      const stored = this.backend.getItem(PROFILE_KEY);
      if (stored) {
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        
        // Synchronize and migrate all fields safely
        const total = parsed.totalScore ?? parsed.totalPoints ?? 0;
        const bestScores = {
          ...DEFAULT_PROFILE.bestScores,
          ...(parsed.gameBestScores || parsed.bestScores || {}),
        };
        const unlocked = parsed.unlockedDecorations || parsed.unlockedItemIds || DEFAULT_UNLOCKED_DECORATIONS;

        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          totalScore: total,
          totalPoints: total,
          level: parsed.level || 1,
          xp: parsed.xp ?? total,
          gameBestScores: bestScores,
          bestScores: bestScores,
          unlockedDecorations: unlocked,
          unlockedItemIds: unlocked,
          statistics: {
            ...DEFAULT_STATISTICS,
            ...(parsed.statistics || {}),
            gamesPlayedByType: {
              ...DEFAULT_STATISTICS.gamesPlayedByType,
              ...(parsed.statistics?.gamesPlayedByType || {}),
            },
          },
          unlockedAchievements: parsed.unlockedAchievements || [],
          completedActivities: {
            ...DEFAULT_PROFILE.completedActivities,
            ...(parsed.completedActivities || {}),
          },
        };
      }
    } catch {
      // Fallback on parse failure
    }
    return { ...DEFAULT_PROFILE };
  }

  public saveProfile(profile: PlayerProfile): void {
    try {
      // Keep aliases in sync before storing
      const normalized: PlayerProfile = {
        ...profile,
        totalPoints: profile.totalScore,
        totalScore: profile.totalScore,
        bestScores: profile.gameBestScores,
        gameBestScores: profile.gameBestScores,
        unlockedItemIds: profile.unlockedDecorations,
        unlockedDecorations: profile.unlockedDecorations,
      };
      this.backend.setItem(PROFILE_KEY, JSON.stringify(normalized));
    } catch {
      // Error writing to backend
    }
  }

  public loadSettings(): GameSettings {
    try {
      const stored = this.backend.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          sound: {
            ...DEFAULT_SETTINGS.sound,
            ...(parsed.sound || {}),
            musicVolume: parsed.sound?.musicVolume ?? parsed.sound?.volume ?? DEFAULT_SETTINGS.sound.musicVolume,
            sfxVolume: parsed.sound?.sfxVolume ?? parsed.sound?.volume ?? DEFAULT_SETTINGS.sound.sfxVolume,
            masterVolume: parsed.sound?.masterVolume ?? 1.0,
          },
        };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_SETTINGS };
  }

  public saveSettings(settings: GameSettings): void {
    try {
      this.backend.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }

  public resetAll(): void {
    try {
      this.backend.removeItem(PROFILE_KEY);
      this.backend.removeItem(SETTINGS_KEY);
    } catch {
      // Ignore
    }
  }
}

// Singleton storage instance
export const storageService = new StorageService();
export default storageService;
