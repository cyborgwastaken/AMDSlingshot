import type { Hero, HeroStats, Buff, StatKey } from '../types/hero.types';
import type { Macros, Micros } from '../types/meal.types';

/** Maximum raw stat value before class weight scaling */
const STAT_CAP = 100;

/**
 * Compute effective stats = base + active buff modifiers, capped at STAT_CAP
 */
export function getEffectiveStats(hero: Hero): HeroStats {
  const now = Date.now();
  const activeBuffs = hero.activeBuffs.filter(
    (b) => b.appliedAt + b.durationMinutes * 60_000 > now
  );

  const result: HeroStats = { ...hero.baseStats };

  for (const buff of activeBuffs) {
    result[buff.stat] = Math.max(
      0,
      Math.min(STAT_CAP, result[buff.stat] + buff.modifier)
    );
  }

  return result;
}

/**
 * Map a meal's nutritional content to stat deltas.
 * Returns a partial HeroStats with the raw delta for each stat.
 */
export function mealToStatDeltas(macros: Macros, micros: Micros): Partial<HeroStats> {
  return {
    // STR: protein (30g = +10 STR, diminishing)
    STR: Math.min(20, Math.round((macros.protein / 30) * 10)),
    // VIT: vitamins + minerals average
    VIT: Math.min(20, Math.round(((micros.vitamins + micros.minerals) / 2) * 0.2)),
    // AGI: inversely scaled with excess calories, fat quality matters
    AGI: Math.min(20, Math.max(-15, Math.round(10 - (macros.calories - 500) / 100))),
    // INT: omega3 + antioxidants + hydration
    INT: Math.min(20, Math.round((micros.omega3 * 2 + micros.antioxidants * 0.1 + micros.hydration * 0.02))),
    // END: fiber + complex carbs proxy
    END: Math.min(20, Math.round(macros.fiber * 1.5)),
  };
}

/**
 * Apply class weight multipliers to raw stat deltas
 */
export function applyClassWeights(
  deltas: Partial<HeroStats>,
  weights: HeroStats
): Partial<HeroStats> {
  const result: Partial<HeroStats> = {};
  for (const key of Object.keys(deltas) as StatKey[]) {
    const delta = deltas[key] ?? 0;
    result[key] = Math.round(delta * weights[key]);
  }
  return result;
}

/**
 * Apply stat deltas to hero base stats (in-place-safe, returns new stats)
 */
export function applyStatDeltas(
  current: HeroStats,
  deltas: Partial<HeroStats>
): HeroStats {
  const result: HeroStats = { ...current };
  for (const key of Object.keys(deltas) as StatKey[]) {
    result[key] = Math.max(0, Math.min(STAT_CAP, result[key] + (deltas[key] ?? 0)));
  }
  return result;
}

/**
 * Filter expired buffs from hero's active buff list
 */
export function pruneExpiredBuffs(buffs: Buff[]): Buff[] {
  const now = Date.now();
  return buffs.filter((b) => b.appliedAt + b.durationMinutes * 60_000 > now);
}

/**
 * Health score: weighted average of all stats (0-100)
 */
export function computeHealthScore(stats: HeroStats): number {
  const weights = { STR: 0.2, VIT: 0.25, AGI: 0.2, INT: 0.15, END: 0.2 };
  return Math.round(
    stats.STR * weights.STR +
    stats.VIT * weights.VIT +
    stats.AGI * weights.AGI +
    stats.INT * weights.INT +
    stats.END * weights.END
  );
}
