/**
 * Leaderboard Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Abstraction layer between UI and storage backends.
 * UI components never import Firebase or localStorage directly.
 *
 * Backend resolution order:
 *   1. Firebase (if VITE_FIREBASE_API_KEY + VITE_FIREBASE_PROJECT_ID are set)
 *   2. LocalStorage (reliable fallback with in-memory guard)
 *   3. Demo seeded data (only when demo mode is explicitly enabled)
 *
 * Controls:
 *   - Verified Only Mode: only authenticated devotees who earned scores appear.
 *   - Mock Leader toggle & purge: removes all unknown/dummy entries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { LeaderboardEntry } from '../types';
import { DEFAULT_DAILY_LEADERS, DEFAULT_WEEKLY_LEADERS, DEFAULT_ALL_TIME_LEADERS } from '../data/defaultLeaders';
import { validateEntry } from './leaderboardValidation';
import { isFirebaseConfigured, FirebaseLeaderboardBackend } from './firebaseLeaderboard';
import { authService } from './authService';

const STORAGE_KEY = 'bappa_utsav_leaderboards_v3';
const STORAGE_VERIFIED_ONLY_KEY = 'bappa_leaderboard_verified_only';
const STORAGE_INCLUDE_MOCK_KEY = 'bappa_leaderboard_include_mock';
const MAX_ENTRIES = 50;

// ─── Backend Interface ────────────────────────────────────────────────────────
export interface ILeaderboardBackend {
  fetchLeaderboard(period: 'daily' | 'weekly' | 'allTime'): Promise<LeaderboardEntry[]>;
  submitEntry(entry: LeaderboardEntry): Promise<void>;
}

// ─── Local Storage Backend ────────────────────────────────────────────────────
interface LocalLeaderboards {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
  lastUpdated: number;
}

class LocalLeaderboardBackend implements ILeaderboardBackend {
  private memoryCache: LocalLeaderboards | null = null;

  public shouldIncludeMock(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const stored = localStorage.getItem(STORAGE_INCLUDE_MOCK_KEY);
      // Default to false so public release has NO unknown dummy users!
      return stored === 'true';
    } catch {
      return false;
    }
  }

  public setIncludeMock(include: boolean): void {
    try {
      localStorage.setItem(STORAGE_INCLUDE_MOCK_KEY, String(include));
      this.clearCache();
    } catch {
      // safe
    }
  }

  private defaultFor(period: 'daily' | 'weekly' | 'allTime'): LeaderboardEntry[] {
    if (!this.shouldIncludeMock()) {
      return [];
    }
    switch (period) {
      case 'daily': return JSON.parse(JSON.stringify(DEFAULT_DAILY_LEADERS));
      case 'weekly': return JSON.parse(JSON.stringify(DEFAULT_WEEKLY_LEADERS));
      case 'allTime': return JSON.parse(JSON.stringify(DEFAULT_ALL_TIME_LEADERS));
    }
  }

  private load(): LocalLeaderboards {
    if (this.memoryCache) return this.memoryCache;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LocalLeaderboards;
        this.memoryCache = {
          daily: Array.isArray(parsed.daily) ? parsed.daily : this.defaultFor('daily'),
          weekly: Array.isArray(parsed.weekly) ? parsed.weekly : this.defaultFor('weekly'),
          allTime: Array.isArray(parsed.allTime) ? parsed.allTime : this.defaultFor('allTime'),
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
        return this.memoryCache;
      }
    } catch {
      // Storage read error — use defaults
    }
    this.memoryCache = {
      daily: this.defaultFor('daily'),
      weekly: this.defaultFor('weekly'),
      allTime: this.defaultFor('allTime'),
      lastUpdated: Date.now(),
    };
    return this.memoryCache;
  }

  private save(data: LocalLeaderboards): void {
    this.memoryCache = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastUpdated: Date.now() }));
    } catch {
      // Quota error or incognito — keep in memory only
    }
  }

  async fetchLeaderboard(period: 'daily' | 'weekly' | 'allTime'): Promise<LeaderboardEntry[]> {
    const data = this.load();
    let list = [...data[period]];

    // If mock data is disabled, filter out entries that are mock seeds
    if (!this.shouldIncludeMock()) {
      list = list.filter((e) => !e.id.startsWith('d') && !e.id.startsWith('w') && !e.id.startsWith('a'));
    }

    return list.sort((a, b) => b.score - a.score);
  }

  async submitEntry(entry: LeaderboardEntry): Promise<void> {
    const data = this.load();

    const upsert = (list: LeaderboardEntry[]): LeaderboardEntry[] => {
      // Key by userId if present, otherwise by lowercase nickname
      const idx = list.findIndex(
        (e) => (entry.userId && e.userId === entry.userId) || e.nickname.toLowerCase() === entry.nickname.toLowerCase()
      );
      if (idx !== -1) {
        // Only update if this is a higher score
        if (entry.score >= list[idx].score) {
          list[idx] = { ...entry, id: list[idx].id };
        }
      } else {
        list.push({ ...entry });
      }
      return list
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);
    };

    this.save({
      daily: upsert(data.daily),
      weekly: upsert(data.weekly),
      allTime: upsert(data.allTime),
      lastUpdated: Date.now(),
    });
  }

  /** Wipe all mock data and reset local storage */
  purgeMockEntries(): void {
    this.setIncludeMock(false);
    const data = this.load();
    const isMock = (e: LeaderboardEntry) =>
      e.id.startsWith('d') || e.id.startsWith('w') || e.id.startsWith('a') || (!e.isVerified && !e.userId);

    this.save({
      daily: data.daily.filter((e) => !isMock(e)),
      weekly: data.weekly.filter((e) => !isMock(e)),
      allTime: data.allTime.filter((e) => !isMock(e)),
      lastUpdated: Date.now(),
    });
  }

  /** Reset all leaderboards completely */
  resetAll(): void {
    this.save({
      daily: [],
      weekly: [],
      allTime: [],
      lastUpdated: Date.now(),
    });
    this.memoryCache = null;
  }

  /** Invalidate in-memory cache */
  clearCache(): void {
    this.memoryCache = null;
  }
}

// ─── Leaderboard Service ──────────────────────────────────────────────────────
class LeaderboardService {
  private localBackend = new LocalLeaderboardBackend();
  private firebaseBackend: FirebaseLeaderboardBackend | null = null;
  private useFirebase: boolean;

  constructor() {
    this.useFirebase = isFirebaseConfigured();
    if (this.useFirebase) {
      this.firebaseBackend = new FirebaseLeaderboardBackend();
    }
  }

  /** Whether Firebase is configured in environment variables */
  public isFirebaseEnabled(): boolean {
    return this.useFirebase;
  }

  /** Whether verified-only filter is active (default: true for genuine boards) */
  public isVerifiedOnlyMode(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return true;
      const stored = localStorage.getItem(STORAGE_VERIFIED_ONLY_KEY);
      // Default to true so real authenticated users are prioritized
      return stored !== 'false';
    } catch {
      return true;
    }
  }

  public setVerifiedOnlyMode(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_VERIFIED_ONLY_KEY, String(enabled));
    } catch {
      // safe
    }
  }

  public shouldIncludeMock(): boolean {
    return this.localBackend.shouldIncludeMock();
  }

  public setIncludeMock(include: boolean): void {
    this.localBackend.setIncludeMock(include);
  }

  /**
   * Fetch leaderboard for a given period.
   * Can filter for verified devotees only.
   */
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'allTime',
    verifiedOnly?: boolean
  ): Promise<LeaderboardEntry[]> {
    const onlyVerified = verifiedOnly !== undefined ? verifiedOnly : this.isVerifiedOnlyMode();
    let entries: LeaderboardEntry[] = [];

    if (this.useFirebase && this.firebaseBackend) {
      try {
        const results = await this.firebaseBackend.fetchLeaderboard(period);
        if (results.length > 0) {
          entries = results;
        }
      } catch {
        // Firebase unavailable — fall through to local
      }
    }

    if (entries.length === 0) {
      entries = await this.localBackend.fetchLeaderboard(period);
    }

    if (onlyVerified) {
      entries = entries.filter((e) => e.isVerified);
    }

    return entries;
  }

  /**
   * Submit a score entry.
   * Automatically stamps entry with authenticated player verification status.
   */
  async submitScore(
    entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>
  ): Promise<{ success: boolean; error?: string }> {
    // Validation guard — prevents negative scores and garbage data
    const validationError = validateEntry({
      nickname: entry.nickname,
      score: entry.score,
      level: entry.level,
    });
    if (validationError) {
      console.warn('[Leaderboard] Submission rejected:', validationError);
      return { success: false, error: validationError };
    }

    const currentUser = authService.getCurrentUser();
    const isVerified = Boolean(currentUser && currentUser.isVerified);

    const fullEntry: LeaderboardEntry = {
      ...entry,
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      isVerified,
      userId: currentUser?.uid || entry.userId || '',
      authProvider: currentUser?.provider || (isVerified ? 'local' : 'guest'),
      badge: isVerified && !entry.badge?.includes('Verified')
        ? `✓ ${entry.badge || 'Verified Devotee'}`
        : entry.badge,
    };

    // Always write locally first (instant, reliable)
    await this.localBackend.submitEntry(fullEntry);

    // Attempt Firebase submit if configured (non-blocking, best effort)
    if (this.useFirebase && this.firebaseBackend) {
      this.firebaseBackend.submitEntry(fullEntry).catch(() => {
        // Silently ignore Firebase failures
      });
    }

    return { success: true };
  }

  /** Find the current player's rank in a period */
  async getPlayerRank(
    nickname: string,
    period: 'daily' | 'weekly' | 'allTime',
    verifiedOnly?: boolean
  ): Promise<number | null> {
    const entries = await this.getLeaderboard(period, verifiedOnly);
    const currentUser = authService.getCurrentUser();
    const idx = entries.findIndex(
      (e) => (currentUser?.uid && e.userId === currentUser.uid) || e.nickname.toLowerCase() === nickname.toLowerCase()
    );
    return idx === -1 ? null : idx + 1;
  }

  /** Purge all mock/demo devotees so only real players remain */
  purgeMockLeaders(): void {
    this.localBackend.purgeMockEntries();
  }

  /** Full wipe of all leaderboard scores */
  resetAllLeaderboards(): void {
    this.localBackend.resetAll();
  }

  /** Clear local cached data */
  clearLocalCache(): void {
    this.localBackend.clearCache();
  }
}

// Singleton export
export const leaderboardService = new LeaderboardService();
export default leaderboardService;
