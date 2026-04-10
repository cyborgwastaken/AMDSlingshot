import type { FoodItem, Macros, Micros } from '../types/meal.types';
import type { ItemRarity } from '../types/item.types';
import { nanoid } from '../utils/nanoid';

/**
 * Food database — used when Gemini API key is not present.
 * Each entry is a seed for a FoodItem.
 */
interface FoodSeed {
  name: string;
  rarity: ItemRarity;
  lore: string;
  macros: Macros;
  micros: Micros;
  isHealthy: boolean;
  glycemicIndex: number;
  icon: string;
}

export const FOOD_DATABASE: FoodSeed[] = [
  {
    name: 'Grilled Chicken Breast',
    rarity: 'uncommon',
    lore: 'The warrior\'s cornerstone. Lean, clean, and unyielding.',
    macros: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    micros: { vitamins: 55, minerals: 60, omega3: 0.1, antioxidants: 10, hydration: 50 },
    isHealthy: true,
    glycemicIndex: 0,
    icon: '🍗',
  },
  {
    name: 'Quinoa Bowl',
    rarity: 'rare',
    lore: 'Ancient grain of the Inca. Complete protein. Nature\'s perfect fuel.',
    macros: { calories: 222, protein: 8, carbs: 39, fat: 3.5, fiber: 5 },
    micros: { vitamins: 70, minerals: 75, omega3: 0.2, antioxidants: 40, hydration: 60 },
    isHealthy: true,
    glycemicIndex: 53,
    icon: '🥣',
  },
  {
    name: 'Wild Blueberries',
    rarity: 'epic',
    lore: 'Dark orbs of antioxidant power. Mages seek these above all else.',
    macros: { calories: 84, protein: 1.1, carbs: 21, fat: 0.5, fiber: 3.6 },
    micros: { vitamins: 80, minerals: 65, omega3: 0.1, antioxidants: 95, hydration: 85 },
    isHealthy: true,
    glycemicIndex: 40,
    icon: '🫐',
  },
  {
    name: 'Salmon Fillet',
    rarity: 'epic',
    lore: 'River spirit made flesh. Rich in the sacred omega-3s.',
    macros: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
    micros: { vitamins: 75, minerals: 80, omega3: 2.5, antioxidants: 30, hydration: 65 },
    isHealthy: true,
    glycemicIndex: 0,
    icon: '🐟',
  },
  {
    name: 'Turmeric Latte',
    rarity: 'rare',
    lore: 'Golden elixir of the Healer. Anti-inflammatory and ancient.',
    macros: { calories: 120, protein: 4, carbs: 15, fat: 5, fiber: 1 },
    micros: { vitamins: 60, minerals: 55, omega3: 0.1, antioxidants: 85, hydration: 200 },
    isHealthy: true,
    glycemicIndex: 30,
    icon: '☕',
  },
  {
    name: 'Dal Rice',
    rarity: 'uncommon',
    lore: 'The humble champion. Balanced, sustaining, and deeply nourishing.',
    macros: { calories: 350, protein: 14, carbs: 62, fat: 4, fiber: 8 },
    micros: { vitamins: 65, minerals: 70, omega3: 0.2, antioxidants: 35, hydration: 80 },
    isHealthy: true,
    glycemicIndex: 55,
    icon: '🍛',
  },
  {
    name: 'Banana',
    rarity: 'common',
    lore: 'Nature\'s energy bar. Quick fuel for the swift of foot.',
    macros: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    micros: { vitamins: 50, minerals: 55, omega3: 0, antioxidants: 25, hydration: 75 },
    isHealthy: true,
    glycemicIndex: 51,
    icon: '🍌',
  },
  {
    name: 'Avocado Toast',
    rarity: 'uncommon',
    lore: 'Millennial power food. Healthy fats and complex carbs united.',
    macros: { calories: 290, protein: 7, carbs: 30, fat: 15, fiber: 9 },
    micros: { vitamins: 70, minerals: 65, omega3: 0.4, antioxidants: 45, hydration: 40 },
    isHealthy: true,
    glycemicIndex: 45,
    icon: '🥑',
  },
  // Junk food
  {
    name: 'Fried Chicken Burger',
    rarity: 'common',
    lore: 'Temptation given form. Tastes like victory. Feels like defeat.',
    macros: { calories: 520, protein: 24, carbs: 48, fat: 26, fiber: 2 },
    micros: { vitamins: 15, minerals: 20, omega3: 0.1, antioxidants: 5, hydration: 20 },
    isHealthy: false,
    glycemicIndex: 72,
    icon: '🍔',
  },
  {
    name: 'Instant Noodles',
    rarity: 'common',
    lore: 'The dungeon peasant\'s meal. Filling, but your stats will suffer.',
    macros: { calories: 380, protein: 9, carbs: 55, fat: 14, fiber: 2 },
    micros: { vitamins: 10, minerals: 15, omega3: 0, antioxidants: 5, hydration: 300 },
    isHealthy: false,
    glycemicIndex: 68,
    icon: '🍜',
  },
  {
    name: 'Cola Can',
    rarity: 'common',
    lore: 'Liquid sugar wrapped in aluminum. A debuff in disguise.',
    macros: { calories: 140, protein: 0, carbs: 39, fat: 0, fiber: 0 },
    micros: { vitamins: 0, minerals: 5, omega3: 0, antioxidants: 0, hydration: -50 },
    isHealthy: false,
    glycemicIndex: 90,
    icon: '🥤',
  },
  {
    name: 'Greek Yogurt',
    rarity: 'uncommon',
    lore: 'Fermented wisdom. The Healer\'s daily companion for gut harmony.',
    macros: { calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0 },
    micros: { vitamins: 60, minerals: 75, omega3: 0.1, antioxidants: 20, hydration: 85 },
    isHealthy: true,
    glycemicIndex: 36,
    icon: '🫙',
  },
  {
    name: 'Spinach Salad',
    rarity: 'uncommon',
    lore: 'Iron leaves of the forest. Simple, potent, overlooked by the unwise.',
    macros: { calories: 80, protein: 5, carbs: 10, fat: 4, fiber: 4 },
    micros: { vitamins: 90, minerals: 85, omega3: 0.3, antioxidants: 75, hydration: 90 },
    isHealthy: true,
    glycemicIndex: 15,
    icon: '🥗',
  },
  {
    name: 'Dark Chocolate (70%)',
    rarity: 'rare',
    lore: 'The Mage\'s guilty pleasure. Rich in flavonoids that sharpen the mind.',
    macros: { calories: 170, protein: 2, carbs: 13, fat: 12, fiber: 3 },
    micros: { vitamins: 30, minerals: 60, omega3: 0.1, antioxidants: 88, hydration: 0 },
    isHealthy: true,
    glycemicIndex: 23,
    icon: '🍫',
  },
  {
    name: 'Eggs (Boiled x2)',
    rarity: 'common',
    lore: 'Perfect protein sphere. Cheap. Powerful. Timeless.',
    macros: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
    micros: { vitamins: 65, minerals: 70, omega3: 0.2, antioxidants: 15, hydration: 30 },
    isHealthy: true,
    glycemicIndex: 0,
    icon: '🥚',
  },
];

/** Find a food item by name (fuzzy, case-insensitive) */
export function findFoodByName(query: string): FoodSeed | null {
  const q = query.toLowerCase().trim();
  return (
    FOOD_DATABASE.find((f) => f.name.toLowerCase().includes(q)) ?? null
  );
}

/** Convert a FoodSeed to a full FoodItem */
export function seedToFoodItem(seed: FoodSeed): FoodItem {
  return {
    id: nanoid(),
    ...seed,
    statEffects: {},
    buffsGranted: [],
    xpValue: seed.isHealthy
      ? Math.round(seed.macros.protein * 1.5 + seed.micros.antioxidants * 0.3)
      : 10,
    discovered: false,
  };
}

/**
 * Parse a free-text meal description into food items.
 * Falls back to mock parsing when Gemini API is unavailable.
 */
export function parseMealText(text: string): FoodItem[] {
  const words = text.toLowerCase().split(/\s+|,|and/);
  const found: FoodItem[] = [];
  const seen = new Set<string>();

  for (const food of FOOD_DATABASE) {
    const nameParts = food.name.toLowerCase().split(' ');
    const matched = nameParts.some((part) =>
      words.some((w) => w.includes(part) || part.includes(w))
    );
    if (matched && !seen.has(food.name)) {
      seen.add(food.name);
      found.push(seedToFoodItem(food));
    }
  }

  // Default fallback if nothing recognized
  if (found.length === 0) {
    const generic = FOOD_DATABASE.find((f) => f.name === 'Dal Rice')!;
    found.push(seedToFoodItem(generic));
  }

  return found;
}

/** Aggregate macros from multiple food items */
export function aggregateMacros(items: FoodItem[]): Macros {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.macros.calories,
      protein: acc.protein + item.macros.protein,
      carbs: acc.carbs + item.macros.carbs,
      fat: acc.fat + item.macros.fat,
      fiber: acc.fiber + item.macros.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

/** Determine if a meal is a "perfect combo" (balanced macros) */
export function isPerfectCombo(macros: Macros): boolean {
  const total = macros.protein + macros.carbs + macros.fat;
  if (total === 0) return false;
  const pPct = macros.protein / total;
  const cPct = macros.carbs / total;
  const fPct = macros.fat / total;
  // Perfect combo: roughly 30% protein, 40% carbs, 30% fat
  return (
    pPct >= 0.2 && pPct <= 0.4 &&
    cPct >= 0.3 && cPct <= 0.55 &&
    fPct >= 0.15 && fPct <= 0.40
  );
}
