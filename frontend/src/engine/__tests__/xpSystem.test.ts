import { describe, it, expect } from 'vitest';
import {
  xpForLevel,
  cumulativeXpForLevel,
  xpToNextLevel,
  levelFromTotalXp,
  mealXp,
  levelProgress,
} from '../xpSystem';

describe('xpSystem', () => {
  describe('xpForLevel', () => {
    it('returns 0 for level 1', () => {
      expect(xpForLevel(1)).toBe(0);
    });

    it('increases with level', () => {
      expect(xpForLevel(5)).toBeGreaterThan(xpForLevel(3));
      expect(xpForLevel(10)).toBeGreaterThan(xpForLevel(5));
    });

    it('level 2 requires 100 XP', () => {
      expect(xpForLevel(2)).toBe(100);
    });
  });

  describe('levelFromTotalXp', () => {
    it('returns level 1 for 0 XP', () => {
      expect(levelFromTotalXp(0)).toBe(1);
    });

    it('returns level 2 after earning enough XP', () => {
      const needed = cumulativeXpForLevel(2);
      expect(levelFromTotalXp(needed)).toBe(2);
    });

    it('returns correct level for progressive XP', () => {
      const xpForLvl5 = cumulativeXpForLevel(5);
      expect(levelFromTotalXp(xpForLvl5)).toBe(5);
    });

    it('does not exceed level 100', () => {
      expect(levelFromTotalXp(10_000_000)).toBe(100);
    });
  });

  describe('mealXp', () => {
    it('awards more XP for healthy meals', () => {
      const healthy = mealXp({ isHealthy: true, isPerfectCombo: false, streakDays: 0, rarityBonus: 0 });
      const junk = mealXp({ isHealthy: false, isPerfectCombo: false, streakDays: 0, rarityBonus: 0 });
      expect(healthy).toBeGreaterThan(junk);
    });

    it('awards bonus for perfect combo', () => {
      const normal = mealXp({ isHealthy: true, isPerfectCombo: false, streakDays: 0, rarityBonus: 0 });
      const combo = mealXp({ isHealthy: true, isPerfectCombo: true, streakDays: 0, rarityBonus: 0 });
      expect(combo).toBeGreaterThan(normal);
    });

    it('streak multiplier increases XP', () => {
      const noStreak = mealXp({ isHealthy: true, isPerfectCombo: false, streakDays: 0, rarityBonus: 0 });
      const streak7 = mealXp({ isHealthy: true, isPerfectCombo: false, streakDays: 7, rarityBonus: 0 });
      expect(streak7).toBeGreaterThan(noStreak);
    });

    it('rarity bonus is added', () => {
      const base = mealXp({ isHealthy: true, isPerfectCombo: false, streakDays: 0, rarityBonus: 0 });
      const withBonus = mealXp({ isHealthy: true, isPerfectCombo: false, streakDays: 0, rarityBonus: 30 });
      expect(withBonus).toBe(base + 30);
    });
  });

  describe('levelProgress', () => {
    it('returns 0 when no XP earned in level', () => {
      expect(levelProgress(0, 1)).toBe(0);
    });

    it('returns 100 when XP equals required', () => {
      const needed = xpToNextLevel(1);
      expect(levelProgress(needed, 1)).toBe(100);
    });

    it('returns value between 0-100', () => {
      const pct = levelProgress(50, 1);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  });
});
