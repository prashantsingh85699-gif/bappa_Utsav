import { LeaderboardEntry } from '../types';

/**
 * Validates a score entry before submission.
 * Returns null if valid, or a descriptive error string if invalid.
 */
export function validateEntry(entry: Partial<LeaderboardEntry>): string | null {
  const { nickname, score, level } = entry;

  // Nickname validation
  if (!nickname || typeof nickname !== 'string') {
    return 'Nickname is required.';
  }
  const trimmed = nickname.trim();
  if (trimmed.length < 1) {
    return 'Nickname cannot be empty.';
  }
  if (trimmed.length > 20) {
    return 'Nickname must be 20 characters or fewer.';
  }
  // Allow letters (including Unicode/Devanagari), numbers, spaces, underscores, hyphens
  const validNicknamePattern = /^[\w\s\u0900-\u097F\-\.]{1,20}$/u;
  if (!validNicknamePattern.test(trimmed)) {
    return 'Nickname contains invalid characters. Use letters, numbers, spaces, or underscores.';
  }

  // Score validation — no negative scores allowed client-side
  if (typeof score !== 'number') {
    return 'Score must be a number.';
  }
  if (!Number.isFinite(score)) {
    return 'Score must be a finite number.';
  }
  if (score < 0) {
    return 'Score cannot be negative.';
  }
  if (score > 999_999) {
    return 'Score exceeds maximum allowed value.';
  }

  // Level validation
  if (typeof level !== 'number' || level < 1 || level > 10) {
    return 'Level must be a number between 1 and 10.';
  }

  return null;
}
