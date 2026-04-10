import { describe, it, expect } from 'vitest';
import {
  getEffectiveStats,
  mealToStatDeltas,
  applyStatDeltas,
  computeHealthScore,
  pruneExpiredBuffs,
} from '../statCalculator';
import type { Hero } from '../../types/hero.types';

const BASE_HERO: Hero = {
  id: 'test-hero',
  userId: 'test-user',
  name: 'Test Hero',
  heroClass: 'Warrior',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  baseStats: { STR: 50, VIT: 50, AGI: 50, INT: 50, END: 50 },
  activeBuffs: [],
  streakDays: 0,
  lastLogDate: '',
  totalMealsLogged: 0,
  createdAt: Date.now(),
};

describe('statCalculator', () => {
  describe('getEffectiveStats', () => {
    it('returns base stats when no buffs', () => {
      const stats = getEffectiveStats(BASE_HERO);
      expect(stats).toEqual(BASE_HERO.baseStats);
    });

    it('applies active buff modifier', () => {
      const hero: Hero = {
        ...BASE_HERO,
        activeBuffs: [{
          id: 'b1', name: 'Protein Surge', description: '+STR',
          stat: 'STR', modifier: 10, durationMinutes: 60,
          appliedAt: Date.now(), icon: '💪', type: 'buff',
        }],
      };
      const stats = getEffectiveStats(hero);
      expect(stats.STR).toBe(60);
    });

    it('filters out expired buffs', () => {
      const hero: Hero = {
        ...BASE_HERO,
        activeBuffs: [{
          id: 'b1', name: 'Old Buff', description: 'expired',
          stat: 'STR', modifier: 15, durationMinutes: 1,
          appliedAt: Date.now() - 2 * 60 * 1000, // 2 min ago = expired
          icon: '⚡', type: 'buff',
        }],
      };
      const stats = getEffectiveStats(hero);
      expect(stats.STR).toBe(50); // no change
    });

    it('caps stat at 100', () => {
      const hero: Hero = {
        ...BASE_HERO,
        baseStats: { ...BASE_HERO.baseStats, STR: 95 },
        activeBuffs: [{
          id: 'b1', name: 'Giant', description: '+STR',
          stat: 'STR', modifier: 20, durationMinutes: 60,
          appliedAt: Date.now(), icon: '💪', type: 'buff',
        }],
      };
      const stats = getEffectiveStats(hero);
      expect(stats.STR).toBe(100);
    });

    it('floors stat at 0 for debuffs', () => {
      const hero: Hero = {
        ...BASE_HERO,
        baseStats: { ...BASE_HERO.baseStats, AGI: 5 },
        activeBuffs: [{
          id: 'b1', name: 'Sluggish', description: '-AGI',
          stat: 'AGI', modifier: -20, durationMinutes: 60,
          appliedAt: Date.now(), icon: '🐌', type: 'debuff',
        }],
      };
      const stats = getEffectiveStats(hero);
      expect(stats.AGI).toBe(0);
    });
  });

  describe('mealToStatDeltas', () => {
    it('returns positive STR for high protein meal', () => {
      const macros = { calories: 300, protein: 40, carbs: 20, fat: 10, fiber: 3 };
      const micros = { vitamins: 50, minerals: 50, omega3: 0, antioxidants: 0, hydration: 100 };
      const deltas = mealToStatDeltas(macros, micros);
      expect(deltas.STR).toBeGreaterThan(0);
    });

    it('returns positive END for high fiber meal', () => {
      const macros = { calories: 250, protein: 8, carbs: 45, fat: 5, fiber: 12 };
      const micros = { vitamins: 60, minerals: 60, omega3: 0, antioxidants: 30, hydration: 80 };
      const deltas = mealToStatDeltas(macros, micros);
      expect(deltas.END).toBeGreaterThan(0);
    });

    it('caps STR delta at 20', () => {
      const macros = { calories: 100, protein: 200, carbs: 0, fat: 0, fiber: 0 };
      const micros = { vitamins: 0, minerals: 0, omega3: 0, antioxidants: 0, hydration: 0 };
      const deltas = mealToStatDeltas(macros, micros);
      expect(deltas.STR).toBeLessThanOrEqual(20);
    });
  });

  describe('applyStatDeltas', () => {
    it('adds deltas to current stats', () => {
      const current = { STR: 40, VIT: 40, AGI: 40, INT: 40, END: 40 };
      const deltas = { STR: 10, VIT: 5 };
      const result = applyStatDeltas(current, deltas);
      expect(result.STR).toBe(50);
      expect(result.VIT).toBe(45);
      expect(result.AGI).toBe(40); // unchanged
    });
  });

  describe('computeHealthScore', () => {
    it('returns 0 for all-zero stats', () => {
      const stats = { STR: 0, VIT: 0, AGI: 0, INT: 0, END: 0 };
      expect(computeHealthScore(stats)).toBe(0);
    });

    it('returns 100 for all-100 stats', () => {
      const stats = { STR: 100, VIT: 100, AGI: 100, INT: 100, END: 100 };
      expect(computeHealthScore(stats)).toBe(100);
    });

    it('returns a value between 0-100', () => {
      const stats = { STR: 50, VIT: 60, AGI: 40, INT: 70, END: 55 };
      const score = computeHealthScore(stats);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('pruneExpiredBuffs', () => {
    it('removes expired buffs', () => {
      const buffs = [
        { id: '1', name: 'a', description: '', stat: 'STR' as const, modifier: 5,
          durationMinutes: 1, appliedAt: Date.now() - 120_000, icon: '', type: 'buff' as const },
        { id: '2', name: 'b', description: '', stat: 'VIT' as const, modifier: 5,
          durationMinutes: 60, appliedAt: Date.now(), icon: '', type: 'buff' as const },
      ];
      const result = pruneExpiredBuffs(buffs);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });
});
