export interface LevelInfo {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  badge: string;
}

export const LEVEL_TIERS: LevelInfo[] = [
  { level: 1, title: 'Aagman (Arrival)', minPoints: 0, maxPoints: 999, badge: '🌱' },
  { level: 2, title: 'Sthapana (Installation)', minPoints: 1000, maxPoints: 2499, badge: '🪔' },
  { level: 3, title: 'Aarti Bhakt (Devotee)', minPoints: 2500, maxPoints: 4999, badge: '🌸' },
  { level: 4, title: 'Dhol Master (Celebrant)', minPoints: 5000, maxPoints: 8999, badge: '🥁' },
  { level: 5, title: 'Maha Utsav King/Queen', minPoints: 9000, maxPoints: 14999, badge: '👑' },
  { level: 6, title: 'Morya Legend (Infinite)', minPoints: 15000, maxPoints: 999999, badge: '✨' },
];

export function getLevelInfo(totalPoints: number): LevelInfo {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_TIERS[i].minPoints) {
      return LEVEL_TIERS[i];
    }
  }
  return LEVEL_TIERS[0];
}

export function getNextLevelInfo(currentLevel: number): LevelInfo | null {
  const next = LEVEL_TIERS.find(tier => tier.level === currentLevel + 1);
  return next || null;
}

export function calculateProgressToNextLevel(totalPoints: number): number {
  const currentTier = getLevelInfo(totalPoints);
  const nextTier = getNextLevelInfo(currentTier.level);
  if (!nextTier) return 100;

  const pointsInCurrentTier = totalPoints - currentTier.minPoints;
  const tierSpan = nextTier.minPoints - currentTier.minPoints;
  return Math.min(100, Math.max(0, Math.round((pointsInCurrentTier / tierSpan) * 100)));
}

/** Calculate Mandap Decoration Creative Score based on variety, balance, and item count */
export function calculateMandapScore(
  itemCount: number,
  categoryCounts: Record<string, number>
): { score: number; rating: string; breakdown: { items: number; variety: number; sacred: number } } {
  if (itemCount === 0) {
    return {
      score: 100,
      rating: 'Serene Empty Mandap',
      breakdown: { items: 100, variety: 0, sacred: 0 },
    };
  }

  // 1. Base score per decoration placed
  const itemsScore = Math.min(1000, itemCount * 70);

  // 2. Category variety bonus (each active category adds +160 pts)
  const activeCategories = Object.values(categoryCounts).filter((c) => c > 0).length;
  const varietyScore = activeCategories * 160;

  // 3. Sacred arrangement & completeness bonuses
  let sacredBonus = 0;
  // Diya glow bonus
  if ((categoryCounts['diyas'] || 0) >= 2) sacredBonus += 250;
  // Floral / Garland elegance bonus
  if ((categoryCounts['flowers'] || 0) + (categoryCounts['garlands'] || 0) >= 2) sacredBonus += 250;
  // Lights & festive shimmer bonus
  if ((categoryCounts['lights'] || 0) >= 1) sacredBonus += 180;
  // Rangoli welcome blessing
  if ((categoryCounts['rangoli'] || 0) >= 1) sacredBonus += 200;
  // Sacred offerings placed (Modaks / Kalash / Durva)
  if ((categoryCounts['offerings'] || 0) >= 1) sacredBonus += 300;
  // Curtains / Backdrop majesty
  if ((categoryCounts['curtains'] || 0) + (categoryCounts['banners'] || 0) + (categoryCounts['backgrounds'] || 0) >= 1) {
    sacredBonus += 200;
  }

  const rawTotal = itemsScore + varietyScore + sacredBonus;
  const finalScore = Math.min(3000, Math.max(350, rawTotal));

  let rating = 'Gracefully Decorated 🪔';
  if (finalScore >= 2400) rating = 'Divinely Majestic! 👑';
  else if (finalScore >= 1700) rating = 'Radiant & Auspicious! 🌟';
  else if (finalScore >= 1100) rating = 'Vibrant & Sacred! 🌸';

  return {
    score: finalScore,
    rating,
    breakdown: {
      items: itemsScore,
      variety: varietyScore,
      sacred: sacredBonus,
    },
  };
}
