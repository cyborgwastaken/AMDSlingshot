import type { HeroStats, Buff } from './hero.types';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Macros {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
}

export interface Micros {
  vitamins: number; // 0-100 score
  minerals: number; // 0-100 score
  omega3: number; // grams
  antioxidants: number; // 0-100 score
  hydration: number; // ml
}

export interface FoodItem {
  id: string;
  name: string;
  rarity: ItemRarity;
  lore: string;
  macros: Macros;
  micros: Micros;
  statEffects: Partial<HeroStats>;
  buffsGranted: Omit<Buff, 'id' | 'appliedAt'>[];
  xpValue: number;
  icon: string;
  discovered: boolean;
  isHealthy: boolean;
  glycemicIndex: number; // 0-100
}

export interface MealLog {
  id: string;
  userId: string;
  heroId: string;
  name: string;
  items: FoodItem[];
  loggedAt: number;
  totalMacros: Macros;
  totalMicros: Micros;
  xpGained: number;
  buffsApplied: Buff[];
  isPerfectCombo: boolean;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  inputMethod: 'text' | 'voice' | 'camera';
}
