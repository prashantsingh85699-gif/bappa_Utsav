/**
 * Challenge Service — 🔥 Festival Challenge & Group Rooms
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages:
 * - Rotating Daily Festival Challenges with live midnight countdowns.
 * - Daily Challenge Leaderboards with devotee rankings.
 * - Group Festival Rooms with shareable codes (e.g. BAPPA27).
 * - Asynchronous score submissions with ScoreValidator protection.
 * - Pluggable backend: Firestore if configured, local storage with in-memory guard.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  FestivalChallenge,
  FestivalRoom,
  ChallengeSubmission,
  MiniGameId,
  ChallengeDifficulty,
} from '../types';
import { ScoreValidator } from './scoreValidator';
import { isFirebaseConfigured } from './firebaseLeaderboard';

const STORAGE_CHALLENGES_KEY = 'bappa_challenge_submissions_v2';
const STORAGE_ROOMS_KEY = 'bappa_festival_rooms_v2';

// ─── 4-DAY ROTATING DAILY CHALLENGES TEMPLATE ─────────────────────────────────
const ROTATING_CHALLENGES: Array<{
  title: string;
  gameType: MiniGameId;
  difficulty: ChallengeDifficulty;
  description: string;
  targetScore: number;
  icon: string;
  accentColor: string;
}> = [
  {
    title: 'Nashik Dhol Mahotsav Rhythm',
    gameType: 'dhol',
    difficulty: 'hard',
    description: 'Build supreme festive energy! Strike the Dhol-Tasha rhythms with precision and sustain a 25+ combo.',
    targetScore: 7500,
    icon: '🥁',
    accentColor: 'from-amber-500/30 to-orange-600/30 border-amber-500/40 text-amber-300',
  },
  {
    title: 'Sacred Altar Divine Harmony',
    gameType: 'mandap',
    difficulty: 'medium',
    description: 'Craft an auspicious Mandap for Lord Ganesha using layered garlands, glowing diyas, and sacred prasad.',
    targetScore: 4200,
    icon: '🌸',
    accentColor: 'from-rose-500/30 to-pink-600/30 border-rose-500/40 text-rose-300',
  },
  {
    title: 'Golden Modak Sacred Rush',
    gameType: 'modak',
    difficulty: 'hard',
    description: 'Catch delicious steamed and shimmering golden modaks while dodging firecrackers to offer 50+ sweets to Bappa!',
    targetScore: 6000,
    icon: '🥟',
    accentColor: 'from-yellow-500/30 to-amber-600/30 border-yellow-500/40 text-yellow-300',
  },
  {
    title: 'Vedic Lore & Wisdom Trial',
    gameType: 'quiz',
    difficulty: 'legendary',
    description: 'Test your devotion and knowledge of Ganesh Chaturthi traditions, symbolism, and mythology with high accuracy.',
    targetScore: 2200,
    icon: '📜',
    accentColor: 'from-purple-500/30 to-indigo-600/30 border-purple-500/40 text-purple-300',
  },
];

// Seeded competitors for demo/offline daily competition
const SEEDED_DEVOTEES = [
  { nickname: 'Aarav Sharma', avatarId: 'dhol', scoreOffset: 450, level: 4, badge: '🥁 Dhol Master' },
  { nickname: 'Ananya Deshmukh', avatarId: 'mandap', scoreOffset: 200, level: 4, badge: '🌸 Sacred Altar' },
  { nickname: 'Rohan Kulkarni', avatarId: 'modak', scoreOffset: -120, level: 3, badge: '🥟 Modak Seeker' },
  { nickname: 'Tanvi Joshi', avatarId: 'quiz', scoreOffset: -380, level: 3, badge: '📜 Vedic Scholar' },
  { nickname: 'Devendra Patil', avatarId: 'murti', scoreOffset: -650, level: 2, badge: '🪔 Diya Bearer' },
  { nickname: 'Priya Mahajan', avatarId: 'flower', scoreOffset: -900, level: 2, badge: '🌺 Pushpa Devotee' },
];

export class ChallengeService {
  private memorySubmissions: Map<string, ChallengeSubmission[]> = new Map();
  private memoryRooms: Map<string, FestivalRoom> = new Map();

  constructor() {
    this.seedDefaultRoomsIfEmpty();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. TODAY'S DAILY CHALLENGE GENERATOR
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Derives today's active challenge based on current date.
   * Auto-rotates at midnight local time.
   */
  public getTodayChallenge(): FestivalChallenge {
    const now = new Date();
    // Midnight start timestamp
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    // Midnight end timestamp (23:59:59.999)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

    // Deterministic index from days since epoch
    const dayNumber = Math.floor(start / (24 * 60 * 60 * 1000));
    const template = ROTATING_CHALLENGES[dayNumber % ROTATING_CHALLENGES.length];

    const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;
    const id = `challenge_${dateStr}_${template.gameType}`;

    return {
      id,
      title: template.title,
      gameType: template.gameType,
      difficulty: template.difficulty,
      description: template.description,
      targetScore: template.targetScore,
      startTime: start,
      endTime: end,
      icon: template.icon,
      accentColor: template.accentColor,
      dayNumber: (dayNumber % 10) + 1, // Day 1 to 10 of Ganeshotsav
    };
  }

  /**
   * Returns remaining milliseconds until challenge concludes.
   */
  public getRemainingTimeMs(challenge: FestivalChallenge): number {
    return Math.max(0, challenge.endTime - Date.now());
  }

  /**
   * Formats remaining ms into HH:MM:SS format.
   */
  public formatCountdown(ms: number): { hours: string; minutes: string; seconds: string; isEnded: boolean } {
    if (ms <= 0) {
      return { hours: '00', minutes: '00', seconds: '00', isEnded: true };
    }
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    return {
      hours: String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0'),
      isEnded: false,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. CHALLENGE LEADERBOARDS & SUBMISSIONS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Fetches the ranked submissions for a specific challenge.
   */
  public async getChallengeLeaderboard(challengeId: string): Promise<ChallengeSubmission[]> {
    const all = this.loadSubmissions(challengeId);
    return all.sort((a, b) => b.score - a.score);
  }

  /**
   * Gets the player's personal best submission for a specific challenge.
   */
  public async getPlayerSubmission(challengeId: string, playerId: string): Promise<ChallengeSubmission | null> {
    const all = this.loadSubmissions(challengeId);
    return all.find((s) => s.playerId === playerId) || null;
  }

  /**
   * Submits a player's score to today's daily challenge.
   */
  public async submitChallengeScore(
    submission: Omit<ChallengeSubmission, 'id' | 'submittedAt'>,
    gameType: MiniGameId
  ): Promise<{ success: boolean; rank: number; isNewBest: boolean; error?: string }> {
    // 1. Anti-cheat score validation
    const validation = ScoreValidator.validate(gameType, submission.score);
    if (!validation.valid) {
      return { success: false, rank: -1, isNewBest: false, error: validation.reason };
    }

    const cleanNickname = ScoreValidator.sanitizeNickname(submission.nickname);
    const sanitizedScore = validation.sanitizedScore;

    const list = this.loadSubmissions(submission.challengeId);
    const existingIndex = list.findIndex((s) => s.playerId === submission.playerId);

    let isNewBest = false;

    if (existingIndex >= 0) {
      if (sanitizedScore > list[existingIndex].score) {
        list[existingIndex] = {
          ...list[existingIndex],
          score: sanitizedScore,
          nickname: cleanNickname,
          avatarId: submission.avatarId,
          level: submission.level,
          badge: submission.badge,
          submittedAt: Date.now(),
          stats: submission.stats,
        };
        isNewBest = true;
      }
    } else {
      list.push({
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        playerId: submission.playerId,
        nickname: cleanNickname,
        avatarId: submission.avatarId,
        challengeId: submission.challengeId,
        score: sanitizedScore,
        submittedAt: Date.now(),
        level: submission.level,
        badge: submission.badge,
        stats: submission.stats,
      });
      isNewBest = true;
    }

    this.saveSubmissions(submission.challengeId, list);

    // Compute player's new rank
    const sorted = list.sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((s) => s.playerId === submission.playerId) + 1;

    return { success: true, rank, isNewBest };
  }

  private loadSubmissions(challengeId: string): ChallengeSubmission[] {
    if (this.memorySubmissions.has(challengeId)) {
      return this.memorySubmissions.get(challengeId)!;
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(`${STORAGE_CHALLENGES_KEY}_${challengeId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as ChallengeSubmission[];
          this.memorySubmissions.set(challengeId, parsed);
          return parsed;
        }
      }
    } catch {
      // Memory fallback
    }

    // Seed realistic competitors around target score for demo engagement
    const today = this.getTodayChallenge();
    const seededList: ChallengeSubmission[] = SEEDED_DEVOTEES.map((dev, i) => ({
      id: `seed_${challengeId}_${i}`,
      playerId: `bot_${i}`,
      nickname: dev.nickname,
      avatarId: dev.avatarId,
      challengeId,
      score: Math.max(800, today.targetScore + dev.scoreOffset),
      submittedAt: today.startTime + (i * 3600000) + 1800000,
      level: dev.level,
      badge: dev.badge,
    }));

    this.saveSubmissions(challengeId, seededList);
    return seededList;
  }

  private saveSubmissions(challengeId: string, submissions: ChallengeSubmission[]) {
    this.memorySubmissions.set(challengeId, submissions);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`${STORAGE_CHALLENGES_KEY}_${challengeId}`, JSON.stringify(submissions));
      }
    } catch {
      // Safe fallback
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. GROUP FESTIVAL ROOMS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Creates a new Festival Room with a unique, memorable short code (e.g. BAPPA27).
   */
  public async createRoom(
    name: string,
    hostId: string,
    hostName: string,
    avatarId: string,
    challengeId: string
  ): Promise<FestivalRoom> {
    const cleanName = ScoreValidator.sanitizeNickname(name) || 'Ganesh Festival Mandal';
    const cleanHostName = ScoreValidator.sanitizeNickname(hostName);
    const roomCode = this.generateRoomCode();

    const room: FestivalRoom = {
      roomId: roomCode,
      name: cleanName,
      hostId,
      hostName: cleanHostName,
      challengeId,
      createdAt: Date.now(),
      participantsCount: 1,
      participants: [
        {
          playerId: hostId,
          nickname: cleanHostName,
          avatarId,
          joinedAt: Date.now(),
        },
      ],
    };

    const rooms = this.loadAllRooms();
    rooms.set(roomCode, room);
    this.saveAllRooms(rooms);

    return room;
  }

  /**
   * Joins an existing Festival Room by its room code.
   */
  public async joinRoom(
    roomCodeInput: string,
    playerId: string,
    nickname: string,
    avatarId: string
  ): Promise<{ success: boolean; room?: FestivalRoom; error?: string }> {
    const code = ScoreValidator.sanitizeRoomCode(roomCodeInput);
    if (!code) {
      return { success: false, error: 'Please enter a valid room code (e.g. BAPPA27)' };
    }

    const rooms = this.loadAllRooms();
    const room = rooms.get(code);

    if (!room) {
      return { success: false, error: `Room code "${code}" not found. Verify with room host.` };
    }

    const cleanNickname = ScoreValidator.sanitizeNickname(nickname);
    const alreadyParticipant = room.participants?.some((p) => p.playerId === playerId);

    if (!alreadyParticipant) {
      if (!room.participants) room.participants = [];
      room.participants.push({
        playerId,
        nickname: cleanNickname,
        avatarId,
        joinedAt: Date.now(),
      });
      room.participantsCount = room.participants.length;
      rooms.set(code, room);
      this.saveAllRooms(rooms);
    }

    return { success: true, room };
  }

  /**
   * Retrieves a Festival Room by its code.
   */
  public async getRoom(roomCodeInput: string): Promise<FestivalRoom | null> {
    const code = ScoreValidator.sanitizeRoomCode(roomCodeInput);
    const rooms = this.loadAllRooms();
    return rooms.get(code) || null;
  }

  /**
   * Retrieves the ranked leaderboard for a specific room.
   */
  public async getRoomLeaderboard(roomCodeInput: string): Promise<ChallengeSubmission[]> {
    const code = ScoreValidator.sanitizeRoomCode(roomCodeInput);
    const raw = this.loadRoomSubmissions(code);
    return raw.sort((a, b) => b.score - a.score);
  }

  /**
   * Submits a score inside a group room.
   */
  public async submitRoomScore(
    roomCodeInput: string,
    submission: Omit<ChallengeSubmission, 'id' | 'submittedAt'>,
    gameType: MiniGameId
  ): Promise<{ success: boolean; rank: number; isNewBest: boolean; error?: string }> {
    const validation = ScoreValidator.validate(gameType, submission.score);
    if (!validation.valid) {
      return { success: false, rank: -1, isNewBest: false, error: validation.reason };
    }

    const code = ScoreValidator.sanitizeRoomCode(roomCodeInput);
    const list = this.loadRoomSubmissions(code);
    const existingIndex = list.findIndex((s) => s.playerId === submission.playerId);

    let isNewBest = false;
    const cleanNickname = ScoreValidator.sanitizeNickname(submission.nickname);

    if (existingIndex >= 0) {
      if (validation.sanitizedScore > list[existingIndex].score) {
        list[existingIndex] = {
          ...list[existingIndex],
          score: validation.sanitizedScore,
          nickname: cleanNickname,
          avatarId: submission.avatarId,
          level: submission.level,
          badge: submission.badge,
          submittedAt: Date.now(),
          stats: submission.stats,
        };
        isNewBest = true;
      }
    } else {
      list.push({
        id: `room_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        playerId: submission.playerId,
        nickname: cleanNickname,
        avatarId: submission.avatarId,
        challengeId: submission.challengeId,
        roomId: code,
        score: validation.sanitizedScore,
        submittedAt: Date.now(),
        level: submission.level,
        badge: submission.badge,
        stats: submission.stats,
      });
      isNewBest = true;
    }

    this.saveRoomSubmissions(code, list);

    const sorted = list.sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((s) => s.playerId === submission.playerId) + 1;

    return { success: true, rank, isNewBest };
  }

  private generateRoomCode(): string {
    const prefixes = ['BAPPA', 'UTSAV', 'MORYA', 'PRASAD', 'AARTI'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 89); // 2-digit number
    return `${prefix}${num}`;
  }

  private loadAllRooms(): Map<string, FestivalRoom> {
    if (this.memoryRooms.size > 0) return this.memoryRooms;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_ROOMS_KEY);
        if (raw) {
          const list = JSON.parse(raw) as FestivalRoom[];
          list.forEach((r) => this.memoryRooms.set(r.roomId, r));
          return this.memoryRooms;
        }
      }
    } catch {
      // Memory fallback
    }

    return this.memoryRooms;
  }

  private saveAllRooms(rooms: Map<string, FestivalRoom>) {
    this.memoryRooms = rooms;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const array = Array.from(rooms.values());
        localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(array));
      }
    } catch {
      // Safe fallback
    }
  }

  private loadRoomSubmissions(roomCode: string): ChallengeSubmission[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(`bappa_room_subs_${roomCode}`);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private saveRoomSubmissions(roomCode: string, list: ChallengeSubmission[]) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`bappa_room_subs_${roomCode}`, JSON.stringify(list));
      }
    } catch {
      // Fallback
    }
  }

  /**
   * Pre-seeds 2 featured group rooms so users can explore group challenges immediately.
   */
  private seedDefaultRoomsIfEmpty() {
    const rooms = this.loadAllRooms();
    if (rooms.size === 0) {
      const today = this.getTodayChallenge();

      const sampleRoom1: FestivalRoom = {
        roomId: 'BAPPA27',
        name: 'CSE 2nd Year Bappa Utsav',
        hostId: 'host_aarav',
        hostName: 'Aarav Sharma',
        challengeId: today.id,
        createdAt: Date.now() - 3600000 * 4,
        participantsCount: 4,
        participants: [
          { playerId: 'host_aarav', nickname: 'Aarav Sharma', avatarId: 'dhol', joinedAt: Date.now() - 3600000 * 4 },
          { playerId: 'p2', nickname: 'Piyush Verma', avatarId: 'mandap', joinedAt: Date.now() - 3600000 * 3 },
          { playerId: 'p3', nickname: 'Rohan Mehta', avatarId: 'modak', joinedAt: Date.now() - 3600000 * 2 },
          { playerId: 'p4', nickname: 'Sneha Patel', avatarId: 'quiz', joinedAt: Date.now() - 3600000 * 1 },
        ],
      };

      const sampleRoom2: FestivalRoom = {
        roomId: 'PUNE108',
        name: 'Pune Ganesh Mitra Mandal',
        hostId: 'host_ananya',
        hostName: 'Ananya Deshmukh',
        challengeId: today.id,
        createdAt: Date.now() - 3600000 * 8,
        participantsCount: 3,
        participants: [
          { playerId: 'host_ananya', nickname: 'Ananya Deshmukh', avatarId: 'mandap', joinedAt: Date.now() - 3600000 * 8 },
          { playerId: 'p5', nickname: 'Kunal Shinde', avatarId: 'dhol', joinedAt: Date.now() - 3600000 * 5 },
          { playerId: 'p6', nickname: 'Pooja Gaikwad', avatarId: 'flower', joinedAt: Date.now() - 3600000 * 4 },
        ],
      };

      rooms.set('BAPPA27', sampleRoom1);
      rooms.set('PUNE108', sampleRoom2);
      this.saveAllRooms(rooms);

      // Seed initial room scores
      this.saveRoomSubmissions('BAPPA27', [
        { id: 'rs1', playerId: 'host_aarav', nickname: 'Aarav Sharma', avatarId: 'dhol', challengeId: today.id, roomId: 'BAPPA27', score: 8420, submittedAt: Date.now() - 3600000 * 2, level: 4, badge: '🥇 Rank #1' },
        { id: 'rs2', playerId: 'p2', nickname: 'Piyush Verma', avatarId: 'mandap', challengeId: today.id, roomId: 'BAPPA27', score: 8170, submittedAt: Date.now() - 3600000 * 1.5, level: 3, badge: '🥈 Rank #2' },
        { id: 'rs3', playerId: 'p3', nickname: 'Rohan Mehta', avatarId: 'modak', challengeId: today.id, roomId: 'BAPPA27', score: 7990, submittedAt: Date.now() - 3600000 * 1, level: 3, badge: '🥉 Rank #3' },
      ]);
    }
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
