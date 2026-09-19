import { DECORATION_CATALOG } from './decorations';
import { DecorationDef } from '../types';

export interface UnlockMilestone {
  level: number;
  pointsRequired: number;
  title: string;
  unlockedItemIds: string[];
  description: string;
}

export const UNLOCK_MILESTONES: UnlockMilestone[] = [
  {
    level: 1,
    pointsRequired: 0,
    title: "Aagman Starter Kit",
    unlockedItemIds: ['clay_diya', 'marigold_single', 'yellow_curtain', 'simple_rangoli', 'modak_plate', 'flower_petals', 'durva_bunch', 'marigold_yellow'],
    description: "Traditional Mitti Diyas, Marigold Malas, and Sweet Modaks to begin your mandap."
  },
  {
    level: 2,
    pointsRequired: 1000,
    title: "Sthapana Splendor",
    unlockedItemIds: ['brass_samai', 'royal_toran', 'crimson_curtain', 'panchamrit_kalash', 'brass_ghanti'],
    description: "Royal Brass Samai, Mango leaf toran, and holy kalash unlocked!"
  },
  {
    level: 3,
    pointsRequired: 2500,
    title: "Aarti Grandeur",
    unlockedItemIds: ['hanging_lantern', 'lotus_pair', 'peacock_rangoli'],
    description: "Kandil festive lanterns, Sacred Pink Lotuses, and Imperial Peacock Rangoli!"
  },
  {
    level: 4,
    pointsRequired: 5000,
    title: "Dhol Master Sanctum",
    unlockedItemIds: ['akhand_jyot', 'temple_arch'],
    description: "Golden Akhand Jyot and Royal Makhar Arch Banner unlocked for your majestic pavilion!"
  },
  {
    level: 5,
    pointsRequired: 9000,
    title: "Maha Utsav Crown",
    unlockedItemIds: [],
    description: "Maximum devotion achieved! Gold festival crest and supreme blessings unlocked!"
  }
];

export function getUnlockedItemsForLevel(level: number): DecorationDef[] {
  return DECORATION_CATALOG.filter(item => item.requiredLevel <= level);
}

export function getNewlyUnlockedItems(prevLevel: number, newLevel: number): DecorationDef[] {
  if (newLevel <= prevLevel) return [];
  return DECORATION_CATALOG.filter(
    item => item.requiredLevel > prevLevel && item.requiredLevel <= newLevel
  );
}
