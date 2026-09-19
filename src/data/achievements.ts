import { AchievementDef, PlayerProfile, GameResult } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_game',
    title: 'First Game',
    description: 'Play your very first festival mini-game and receive Bappa’s initial blessing.',
    icon: '🌱',
    category: 'general',
  },
  {
    id: 'first_perfect',
    title: 'First Perfect',
    description: 'Achieve a Perfect beat in Dhol Beat or a flawless 10/10 in Bappa Wisdom Quiz.',
    icon: '✨',
    category: 'general',
  },
  {
    id: 'dhol_champion',
    title: 'Dhol Champion',
    description: 'Score 2,000+ points in Dhol Beat with electrifying rhythm precision.',
    icon: '🥁',
    category: 'dhol',
  },
  {
    id: 'modak_master',
    title: 'Modak Master',
    description: 'Catch 25+ modaks or score 2,000+ points in Modak Catch.',
    icon: '🥟',
    category: 'modak',
  },
  {
    id: 'decoration_expert',
    title: 'Decoration Expert',
    description: 'Design a magnificent festival mandap with at least 8 sacred items and score 1,800+.',
    icon: '🌸',
    category: 'mandap',
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Demonstrate supreme wisdom by scoring 10/10 in a round of Bappa Wisdom Quiz.',
    icon: '🧠',
    category: 'quiz',
  },
  {
    id: 'utsav_complete',
    title: 'Utsav Complete',
    description: 'Complete all four sacred festival activities (Dhol, Mandap, Modak, Quiz) in one cycle.',
    icon: '🪔',
    category: 'general',
  },
  {
    id: 'rhythm_king',
    title: 'Maha Rhythm King',
    description: 'Reach a thunderous 15x or higher combo multiplier in Dhol Beat or Modak Catch.',
    icon: '🔥',
    category: 'general',
  },
  {
    id: 'devotee_scholar',
    title: 'Aarti Devotee',
    description: 'Reach Devotee Level 3 (Aarti Bhakt) by gathering 2,500+ festival points.',
    icon: '👑',
    category: 'general',
  },
  {
    id: 'morya_legend',
    title: 'Morya Legend',
    description: 'Reach Level 5 (Maha Utsav King/Queen) through tireless devotion and gameplay.',
    icon: '🌟',
    category: 'general',
  },
];

/**
 * Checks which achievements should be unlocked based on profile and recent game result.
 * Returns array of newly unlocked achievement IDs.
 */
export function checkNewAchievements(
  profile: PlayerProfile,
  result?: GameResult
): AchievementDef[] {
  const currentUnlocked = new Set(profile.unlockedAchievements || []);
  const newlyUnlocked: AchievementDef[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (currentUnlocked.has(ach.id)) continue;

    let qualifies = false;

    switch (ach.id) {
      case 'first_game':
        if (profile.statistics.totalGamesPlayed >= 1) qualifies = true;
        break;

      case 'first_perfect':
        if (
          profile.statistics.perfectHits > 0 ||
          (result?.statsPayload?.isFlawless) ||
          (result?.statsPayload?.perfectCount && result.statsPayload.perfectCount > 0)
        ) {
          qualifies = true;
        }
        break;

      case 'dhol_champion':
        if ((profile.gameBestScores.dhol || 0) >= 2000 || (result?.gameId === 'dhol' && result.finalScore >= 2000)) {
          qualifies = true;
        }
        break;

      case 'modak_master':
        if (
          (profile.gameBestScores.modak || 0) >= 2000 ||
          profile.statistics.totalModaksCaught >= 25 ||
          (result?.gameId === 'modak' && (result.finalScore >= 2000 || (result.statsPayload?.itemsCount || 0) >= 25))
        ) {
          qualifies = true;
        }
        break;

      case 'decoration_expert':
        if (
          (profile.gameBestScores.mandap || 0) >= 1800 ||
          profile.statistics.totalDecorationsPlaced >= 8 ||
          (result?.gameId === 'mandap' && result.finalScore >= 1800)
        ) {
          qualifies = true;
        }
        break;

      case 'quiz_master':
        if (
          (result?.gameId === 'quiz' && result.statsPayload?.isFlawless) ||
          (result?.gameId === 'quiz' && result.comboOrAccuracy?.includes('10/10')) ||
          (profile.gameBestScores.quiz || 0) >= 1500
        ) {
          qualifies = true;
        }
        break;

      case 'utsav_complete':
        if (
          profile.completedActivities.dhol &&
          profile.completedActivities.mandap &&
          profile.completedActivities.modak &&
          profile.completedActivities.quiz
        ) {
          qualifies = true;
        }
        break;

      case 'rhythm_king':
        if (
          profile.statistics.highestCombo >= 15 ||
          (result?.statsPayload?.maxCombo && result.statsPayload.maxCombo >= 15)
        ) {
          qualifies = true;
        }
        break;

      case 'devotee_scholar':
        if (profile.level >= 3 || profile.totalScore >= 2500) {
          qualifies = true;
        }
        break;

      case 'morya_legend':
        if (profile.level >= 5 || profile.totalScore >= 9000) {
          qualifies = true;
        }
        break;

      default:
        break;
    }

    if (qualifies) {
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}
