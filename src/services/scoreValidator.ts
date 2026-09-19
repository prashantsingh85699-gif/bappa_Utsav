/**
 * Score Validator & Anti-Cheat Guard
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates client-side score submissions before accepting them into
 * Daily Challenges or Group Festival Rooms.
 *
 * Designed to be modular so this exact logic can be ported to Firebase Cloud
 * Functions or a Node.js backend.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { MiniGameId } from '../types';

export interface ScoreValidationResult {
  valid: boolean;
  sanitizedScore: number;
  reason?: string;
}

// Maximum theoretical score thresholds per mini-game session
const MAX_THEORETICAL_SCORES: Record<MiniGameId, number> = {
  dhol: 14000,    // 60s rhythm chart with max 5.0x combo multiplier
  modak: 11000,   // 60s arcade catching with golden modak bonuses
  quiz: 3000,     // 10 questions with quick-answer & streak bonuses
  mandap: 6000,   // 25 items max placed with harmony bonuses
};

export class ScoreValidator {
  /**
   * Validates a game score submission against physical and mathematical limits.
   */
  public static validate(gameType: MiniGameId, rawScore: unknown): ScoreValidationResult {
    // 1. Basic Type and Range Checks
    if (typeof rawScore !== 'number' || !Number.isFinite(rawScore) || Number.isNaN(rawScore)) {
      return { valid: false, sanitizedScore: 0, reason: 'Invalid score value: must be a finite number' };
    }

    const score = Math.floor(rawScore);

    if (score < 0) {
      return { valid: false, sanitizedScore: 0, reason: 'Negative scores are not permitted' };
    }

    // 2. Maximum Theoretical Score Checks
    const maxAllowed = MAX_THEORETICAL_SCORES[gameType] || 15000;
    if (score > maxAllowed) {
      return {
        valid: false,
        sanitizedScore: 0,
        reason: `Score exceeds theoretical maximum limit (${maxAllowed}) for ${gameType}`,
      };
    }

    return {
      valid: true,
      sanitizedScore: score,
    };
  }

  /**
   * Sanitizes a devotee nickname (trims, enforces length, strips dangerous chars).
   */
  public static sanitizeNickname(rawNickname: string): string {
    if (!rawNickname || typeof rawNickname !== 'string') {
      return 'Bappa Devotee';
    }
    const clean = rawNickname
      .replace(/[<>{}[\]\\]/g, '')
      .trim()
      .slice(0, 20);
    return clean || 'Bappa Devotee';
  }

  /**
   * Sanitizes a room code to uppercase alphanumeric (e.g. "BAPPA27").
   */
  public static sanitizeRoomCode(rawCode: string): string {
    if (!rawCode || typeof rawCode !== 'string') return '';
    return rawCode
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);
  }
}

export default ScoreValidator;
