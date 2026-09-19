import {
  PlayerProfile,
  GameResult,
  DecorationDef,
  AchievementDef,
  MiniGameId
} from '../types';
import { getLevelInfo, getNextLevelInfo } from '../utils/scoring';
import { getNewlyUnlockedItems } from '../data/unlocks';
import { checkNewAchievements } from '../data/achievements';
import { storageService } from './storageService';

export interface ProgressionOutcome {
  updatedProfile: PlayerProfile;
  levelUpOccurred: boolean;
  oldLevel: number;
  newLevel: number;
  newLevelTitle: string;
  pointsAwarded: number;
  newUnlocks: DecorationDef[];
  newAchievements: AchievementDef[];
  isPersonalBest: boolean;
}

/**
 * Unified Progression Service
 * Orchestrates scoring, XP/festival points, personal bests, level progression,
 * decoration unlocks, achievements, and persistent storage.
 */
export class ProgressionService {
  /**
   * Processes a completed mini-game session according to the 6 core progression rules.
   */
  public processGameCompletion(
    currentProfile: PlayerProfile,
    result: GameResult
  ): ProgressionOutcome {
    // 1. Calculate Score
    const pointsAwarded = Math.max(0, result.finalScore || 0);

    // 2. Award Festival Points / XP
    const oldScore = currentProfile.totalScore || currentProfile.totalPoints || 0;
    const newTotalScore = oldScore + pointsAwarded;
    const oldLevel = currentProfile.level || getLevelInfo(oldScore).level;

    // 3. Update Personal Best
    const existingBest = currentProfile.gameBestScores[result.gameId] || 0;
    const isPersonalBest = pointsAwarded > existingBest;
    const updatedBestScores = {
      ...currentProfile.gameBestScores,
      [result.gameId]: Math.max(existingBest, pointsAwarded),
    };

    // 4. Check Level Progression
    const levelDetails = getLevelInfo(newTotalScore);
    const newLevel = levelDetails.level;
    const levelUpOccurred = newLevel > oldLevel;

    // 5. Check Decoration Unlocks
    const newUnlocks = getNewlyUnlockedItems(oldLevel, newLevel);
    const updatedUnlockedDecorations = [
      ...new Set([
        ...currentProfile.unlockedDecorations,
        ...newUnlocks.map((u) => u.id),
      ]),
    ];

    // Mark current activity completed for utsav cycle
    const updatedCompletedActivities = {
      ...currentProfile.completedActivities,
      [result.gameId]: true,
    };

    // Update Statistics
    const currentStats = currentProfile.statistics;
    const gamesByType = { ...currentStats.gamesPlayedByType };
    gamesByType[result.gameId] = (gamesByType[result.gameId] || 0) + 1;

    // Extract telemetry if provided by the game
    const payload = result.statsPayload;
    let perfectHits = currentStats.perfectHits;
    if (payload?.perfectCount) perfectHits += payload.perfectCount;
    if (payload?.isFlawless) perfectHits += 1;

    const highestCombo = Math.max(currentStats.highestCombo, payload?.maxCombo || 0);

    let totalModaks = currentStats.totalModaksCaught;
    if (result.gameId === 'modak' && payload?.itemsCount) {
      totalModaks += payload.itemsCount;
    }

    let totalDecorsPlaced = currentStats.totalDecorationsPlaced;
    if (result.gameId === 'mandap' && payload?.itemsCount) {
      totalDecorsPlaced += payload.itemsCount;
    }

    let quizAnswered = currentStats.quizQuestionsAnswered;
    let quizCorrect = currentStats.quizCorrectAnswers;
    if (result.gameId === 'quiz') {
      quizAnswered += 10;
      if (payload?.itemsCount !== undefined) {
        quizCorrect += payload.itemsCount;
      } else if (result.comboOrAccuracy) {
        const match = result.comboOrAccuracy.match(/(\d+)\/10/);
        if (match) quizCorrect += parseInt(match[1], 10);
      }
    }

    const updatedStats = {
      ...currentStats,
      totalGamesPlayed: currentStats.totalGamesPlayed + 1,
      gamesPlayedByType: gamesByType,
      perfectHits,
      highestCombo,
      totalModaksCaught: totalModaks,
      totalDecorationsPlaced: totalDecorsPlaced,
      quizQuestionsAnswered: quizAnswered,
      quizCorrectAnswers: quizCorrect,
      lastPlayedTimestamp: Date.now(),
    };

    // Construct preliminary profile for achievement evaluation
    const intermediateProfile: PlayerProfile = {
      ...currentProfile,
      totalScore: newTotalScore,
      totalPoints: newTotalScore,
      level: newLevel,
      xp: newTotalScore,
      gameBestScores: updatedBestScores,
      bestScores: updatedBestScores,
      unlockedDecorations: updatedUnlockedDecorations,
      unlockedItemIds: updatedUnlockedDecorations,
      statistics: updatedStats,
      completedActivities: updatedCompletedActivities,
    };

    // Check & Award Achievements
    const newAchievements = checkNewAchievements(intermediateProfile, result);
    const updatedAchievementsList = [
      ...intermediateProfile.unlockedAchievements,
      ...newAchievements.map((a) => a.id),
    ];

    const finalUpdatedProfile: PlayerProfile = {
      ...intermediateProfile,
      unlockedAchievements: updatedAchievementsList,
    };

    // 6. Save Progress Reliably to Storage
    storageService.saveProfile(finalUpdatedProfile);

    return {
      updatedProfile: finalUpdatedProfile,
      levelUpOccurred,
      oldLevel,
      newLevel,
      newLevelTitle: levelDetails.title,
      pointsAwarded,
      newUnlocks,
      newAchievements,
      isPersonalBest,
    };
  }
}

export const progressionService = new ProgressionService();
export default progressionService;
