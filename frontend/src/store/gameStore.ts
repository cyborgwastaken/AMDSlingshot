import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hero, HeroClass, HeroStats } from '../types/hero.types';
import type { MealLog, FoodItem } from '../types/meal.types';
import type { Quest } from '../types/quest.types';
import { CLASS_CONFIGS } from '../types/hero.types';
import { mealToStatDeltas, applyClassWeights, applyStatDeltas, pruneExpiredBuffs } from '../engine/statCalculator';
import { generateBuffsForMeal } from '../engine/buffSystem';
import { aggregateMacros, isPerfectCombo } from '../engine/nutritionParser';
import { mealXp, xpToNextLevel, levelFromTotalXp } from '../engine/xpSystem';
import { nanoid } from '../utils/nanoid';
import { DEFAULT_QUESTS } from '../data/defaultQuests';
import { FOOD_DATABASE, seedToFoodItem } from '../engine/nutritionParser';

interface GameState {
  hero: Hero | null;
  mealLogs: MealLog[];
  quests: Quest[];
  discoveredFoods: Set<string>;
  totalXp: number;
  gold: number;
  onboardingComplete: boolean;

  // Actions
  createHero: (name: string, heroClass: HeroClass) => void;
  logMeal: (items: FoodItem[], mealName: string, mealType: MealLog['mealType']) => MealLog;
  completeQuest: (questId: string) => void;
  updateQuestProgress: (questId: string, objectiveId: string, amount: number) => void;
  pruneBuffs: () => void;
  resetGame: () => void;
}

const INITIAL_STATS: HeroStats = { STR: 20, VIT: 20, AGI: 20, INT: 20, END: 20 };

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      hero: null,
      mealLogs: [],
      quests: [],
      discoveredFoods: new Set<string>(),
      totalXp: 0,
      gold: 0,
      onboardingComplete: false,

      createHero: (name, heroClass) => {
        const config = CLASS_CONFIGS[heroClass];
        // Apply class weight bonuses to starting stats
        const baseStats: HeroStats = {
          STR: Math.round(INITIAL_STATS.STR * (config.statWeights.STR / 1.2)),
          VIT: Math.round(INITIAL_STATS.VIT * (config.statWeights.VIT / 1.2)),
          AGI: Math.round(INITIAL_STATS.AGI * (config.statWeights.AGI / 1.2)),
          INT: Math.round(INITIAL_STATS.INT * (config.statWeights.INT / 1.2)),
          END: Math.round(INITIAL_STATS.END * (config.statWeights.END / 1.2)),
        };

        const hero: Hero = {
          id: nanoid(),
          userId: 'local',
          name,
          heroClass,
          level: 1,
          xp: 0,
          xpToNextLevel: xpToNextLevel(1),
          baseStats,
          activeBuffs: [],
          streakDays: 0,
          lastLogDate: '',
          totalMealsLogged: 0,
          createdAt: Date.now(),
        };

        set({
          hero,
          quests: DEFAULT_QUESTS(),
          onboardingComplete: true,
          discoveredFoods: new Set<string>(),
          mealLogs: [],
          totalXp: 0,
          gold: 0,
        });
      },

      logMeal: (items, mealName, mealType) => {
        const { hero, mealLogs, totalXp, quests, discoveredFoods } = get();
        if (!hero) throw new Error('No hero created');

        const macros = aggregateMacros(items);
        const perfect = isPerfectCombo(macros);
        const allHealthy = items.every((i) => i.isHealthy);

        // Discover new foods
        const newDiscoveries = new Set(discoveredFoods);
        items.forEach((item) => newDiscoveries.add(item.name));

        // Generate buffs
        const buffs = generateBuffsForMeal(items, perfect);

        // Calculate XP
        const rarityBonus = items.reduce((acc, item) => {
          const bonuses = { common: 0, uncommon: 5, rare: 15, epic: 30, legendary: 50 };
          return acc + bonuses[item.rarity];
        }, 0);

        const xpGained = mealXp({
          isHealthy: allHealthy,
          isPerfectCombo: perfect,
          streakDays: hero.streakDays,
          rarityBonus,
        });

        // Compute stat deltas
        const micros = {
          vitamins: items.reduce((a, i) => a + i.micros.vitamins, 0) / items.length,
          minerals: items.reduce((a, i) => a + i.micros.minerals, 0) / items.length,
          omega3: items.reduce((a, i) => a + i.micros.omega3, 0),
          antioxidants: items.reduce((a, i) => a + i.micros.antioxidants, 0) / items.length,
          hydration: items.reduce((a, i) => a + i.micros.hydration, 0),
        };
        const config = CLASS_CONFIGS[hero.heroClass];
        const rawDeltas = mealToStatDeltas(macros, micros);
        const weightedDeltas = applyClassWeights(rawDeltas, config.statWeights);
        const newStats = applyStatDeltas(hero.baseStats, weightedDeltas);

        // Streak
        const today = new Date().toISOString().split('T')[0];
        const isNewDay = hero.lastLogDate !== today;
        const streakDays = isNewDay ? hero.streakDays + 1 : hero.streakDays;

        // Level up
        const newTotalXp = totalXp + xpGained;
        const newLevel = levelFromTotalXp(newTotalXp);

        const meal: MealLog = {
          id: nanoid(),
          userId: 'local',
          heroId: hero.id,
          name: mealName,
          items,
          loggedAt: Date.now(),
          totalMacros: macros,
          totalMicros: micros,
          xpGained,
          buffsApplied: buffs,
          isPerfectCombo: perfect,
          mealType,
          inputMethod: 'text',
        };

        // Update quest progress
        const updatedQuests = quests.map((q) => {
          const updated = { ...q, objectives: q.objectives.map((o) => ({ ...o })) };
          if (q.status !== 'active') return updated;
          // protein quest
          updated.objectives = updated.objectives.map((o) => {
            if (o.description.toLowerCase().includes('protein')) {
              return { ...o, current: Math.min(o.target, o.current + macros.protein) };
            }
            if (o.description.toLowerCase().includes('meal') || o.description.toLowerCase().includes('log')) {
              return { ...o, current: Math.min(o.target, o.current + 1) };
            }
            return o;
          });
          // Auto-complete if all objectives met
          const allMet = updated.objectives.every((o) => o.current >= o.target);
          if (allMet && updated.status === 'active') {
            updated.status = 'completed';
            updated.completedAt = Date.now();
          }
          return updated;
        });

        const updatedHero: Hero = {
          ...hero,
          baseStats: newStats,
          activeBuffs: pruneExpiredBuffs([...hero.activeBuffs, ...buffs]),
          xp: hero.xp + xpGained,
          xpToNextLevel: xpToNextLevel(newLevel),
          level: newLevel,
          streakDays,
          lastLogDate: today,
          totalMealsLogged: hero.totalMealsLogged + 1,
        };

        set({
          hero: updatedHero,
          mealLogs: [meal, ...mealLogs].slice(0, 100),
          totalXp: newTotalXp,
          quests: updatedQuests,
          discoveredFoods: newDiscoveries,
        });

        return meal;
      },

      completeQuest: (questId) => {
        const { quests, gold } = get();
        const quest = quests.find((q) => q.id === questId);
        if (!quest) return;
        set({
          quests: quests.map((q) =>
            q.id === questId ? { ...q, status: 'completed', completedAt: Date.now() } : q
          ),
          gold: gold + quest.reward.gold,
        });
      },

      updateQuestProgress: (questId, objectiveId, amount) => {
        set((state) => ({
          quests: state.quests.map((q) => {
            if (q.id !== questId) return q;
            const updated = {
              ...q,
              objectives: q.objectives.map((o) =>
                o.id === objectiveId
                  ? { ...o, current: Math.min(o.target, o.current + amount) }
                  : o
              ),
            };
            const done = updated.objectives.every((o) => o.current >= o.target);
            if (done) updated.status = 'completed';
            return updated;
          }),
        }));
      },

      pruneBuffs: () => {
        const { hero } = get();
        if (!hero) return;
        set({ hero: { ...hero, activeBuffs: pruneExpiredBuffs(hero.activeBuffs) } });
      },

      resetGame: () => {
        set({
          hero: null,
          mealLogs: [],
          quests: [],
          discoveredFoods: new Set(),
          totalXp: 0,
          gold: 0,
          onboardingComplete: false,
        });
      },
    }),
    {
      name: 'nutriquest-save',
      partialize: (state) => ({
        hero: state.hero,
        mealLogs: state.mealLogs,
        quests: state.quests,
        discoveredFoods: Array.from(state.discoveredFoods),
        totalXp: state.totalXp,
        gold: state.gold,
        onboardingComplete: state.onboardingComplete,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<GameState>),
        // Restore Set from array
        discoveredFoods: new Set(
          Array.isArray((persisted as { discoveredFoods?: string[] }).discoveredFoods)
            ? (persisted as { discoveredFoods: string[] }).discoveredFoods
            : []
        ),
      }),
    }
  )
);
