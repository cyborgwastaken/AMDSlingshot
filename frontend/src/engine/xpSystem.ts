/**
 * XP & Leveling formulas for NutriQuest
 * Level 1-100, exponential curve
 */

/** XP required to reach a given level */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

/** Total XP required from level 1 to reach given level */
export function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += xpForLevel(l);
  }
  return total;
}

/** XP needed for next level given current level */
export function xpToNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1);
}

/** Compute level from total XP (binary search) */
export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  while (level < 100) {
    const needed = xpForLevel(level + 1);
    if (accumulated + needed > totalXp) break;
    accumulated += needed;
    level++;
  }
  return level;
}

/** XP gained from logging a meal */
export function mealXp(params: {
  isHealthy: boolean;
  isPerfectCombo: boolean;
  streakDays: number;
  rarityBonus: number; // 0-50 based on food rarity
}): number {
  let base = params.isHealthy ? 50 : 15;

  if (params.isPerfectCombo) base *= 1.5;

  // Streak multiplier: 7-day streak = 2x, caps at 3x on day 21+
  const streakMultiplier = Math.min(3, 1 + params.streakDays * 0.05);
  base *= streakMultiplier;

  base += params.rarityBonus;

  return Math.round(base);
}

/** XP gained from completing a quest */
export function questXp(baseReward: number, streakDays: number): number {
  const bonus = Math.min(2, 1 + streakDays * 0.03);
  return Math.round(baseReward * bonus);
}

/** Progress percentage within current level (0-100) */
export function levelProgress(currentXp: number, currentLevel: number): number {
  const needed = xpToNextLevel(currentLevel);
  if (needed === 0) return 100;
  return Math.min(100, Math.round((currentXp / needed) * 100));
}
