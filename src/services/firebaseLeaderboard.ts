/**
 * Firebase Leaderboard Backend
 * ─────────────────────────────────────────────────────────────────────────────
 * This module is the ONLY place that knows about Firebase.
 * All Firebase imports are done at runtime via Function constructor so that
 * TypeScript never needs the firebase package to be installed.
 *
 * To connect a real Firebase project:
 *   1. npm install firebase
 *   2. Add to .env:
 *        VITE_FIREBASE_API_KEY=...
 *        VITE_FIREBASE_AUTH_DOMAIN=...
 *        VITE_FIREBASE_PROJECT_ID=...
 *        VITE_FIREBASE_STORAGE_BUCKET=...
 *        VITE_FIREBASE_MESSAGING_SENDER_ID=...
 *        VITE_FIREBASE_APP_ID=...
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { LeaderboardEntry } from '../types';
import { ILeaderboardBackend } from './leaderboardService';

/** Check whether all required Firebase environment variables are present. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/**
 * Firebase Firestore backend.
 * Uses dynamic import() with explicit `any` typings so firebase package
 * is not required at build time.
 */
export class FirebaseLeaderboardBackend implements ILeaderboardBackend {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any = null;
  private initialized = false;
  private initError: Error | null = null;

  async ensureInit(): Promise<boolean> {
    if (this.initialized) return true;
    if (this.initError) return false;

    try {
      const _fbApp = 'firebase' + '/app';
      const _fbFs = 'firebase' + '/firestore';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firebaseApp: any = await import(/* @vite-ignore */ _fbApp as string);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firestore: any = await import(/* @vite-ignore */ _fbFs as string);

      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const existingApps = firebaseApp.getApps();
      const app =
        existingApps.length > 0
          ? existingApps[0]
          : firebaseApp.initializeApp(config);

      this.db = firestore.getFirestore(app);
      this.initialized = true;
      return true;
    } catch (err) {
      this.initError = err as Error;
      console.warn('[Leaderboard] Firebase init failed — using local fallback:', err);
      return false;
    }
  }

  async fetchLeaderboard(period: 'daily' | 'weekly' | 'allTime'): Promise<LeaderboardEntry[]> {
    const ready = await this.ensureInit();
    if (!ready || !this.db) return [];

    try {
      const _fbFs2 = 'firebase' + '/firestore';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { collection, query, where, orderBy, limit, getDocs }: any =
        await import(/* @vite-ignore */ _fbFs2 as string);

      const ref = collection(this.db, 'leaderboard');
      const now = Date.now();

      let q;
      if (period === 'daily') {
        q = query(
          ref,
          where('timestamp', '>=', now - DAY_MS),
          orderBy('timestamp', 'desc'),
          orderBy('score', 'desc'),
          limit(50)
        );
      } else if (period === 'weekly') {
        q = query(
          ref,
          where('timestamp', '>=', now - WEEK_MS),
          orderBy('timestamp', 'desc'),
          orderBy('score', 'desc'),
          limit(50)
        );
      } else {
        q = query(ref, orderBy('score', 'desc'), limit(50));
      }

      const snapshot = await getDocs(q);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as LeaderboardEntry[];
    } catch (err) {
      console.warn('[Leaderboard] Firestore fetch error:', err);
      return [];
    }
  }

  async submitEntry(entry: LeaderboardEntry): Promise<void> {
    const ready = await this.ensureInit();
    if (!ready || !this.db) return;

    try {
      const _fbFs3 = 'firebase' + '/firestore';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { doc, setDoc, collection }: any =
        await import(/* @vite-ignore */ _fbFs3 as string);

      // Deterministic doc ID keyed to nickname — updates overwrite old entry
      const docId = `player_${entry.nickname.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const docRef = doc(collection(this.db, 'leaderboard'), docId);

      await setDoc(
        docRef,
        {
          nickname: entry.nickname,
          avatarId: entry.avatarId,
          score: entry.score,
          level: entry.level,
          badge: entry.badge || '',
          timestamp: entry.timestamp,
          isVerified: Boolean(entry.isVerified),
          userId: entry.userId || '',
          authProvider: entry.authProvider || 'local',
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[Leaderboard] Firestore submit error:', err);
    }
  }
}
