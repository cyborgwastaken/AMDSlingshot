export type HeroClass = 'Warrior' | 'Mage' | 'Ranger' | 'Healer';

export interface HeroStats {
  STR: number; // Strength → Protein
  VIT: number; // Vitality → Vitamins & minerals
  AGI: number; // Agility → Calorie balance & healthy fats
  INT: number; // Intelligence → Omega-3s, hydration, antioxidants
  END: number; // Endurance → Fiber, complex carbs, consistency
}

export interface Buff {
  id: string;
  name: string;
  description: string;
  stat: keyof HeroStats;
  modifier: number; // positive = buff, negative = debuff
  durationMinutes: number;
  appliedAt: number; // timestamp ms
  icon: string;
  type: 'buff' | 'debuff';
}

export interface Hero {
  id: string;
  userId: string;
  name: string;
  heroClass: HeroClass;
  level: number;
  xp: number;
  xpToNextLevel: number;
  baseStats: HeroStats;
  activeBuffs: Buff[];
  streakDays: number;
  lastLogDate: string; // YYYY-MM-DD
  totalMealsLogged: number;
  createdAt: number;
}

export type StatKey = keyof HeroStats;

export interface ClassConfig {
  class: HeroClass;
  description: string;
  lore: string;
  primaryStat: StatKey;
  statWeights: HeroStats;
  color: string;
  emoji: string;
}

export const CLASS_CONFIGS: Record<HeroClass, ClassConfig> = {
  Warrior: {
    class: 'Warrior',
    description: 'Muscle gain & high protein',
    lore: 'You forge your body into a weapon. Every gram of protein is steel for your soul.',
    primaryStat: 'STR',
    statWeights: { STR: 2.0, VIT: 1.2, AGI: 1.0, INT: 0.8, END: 1.0 },
    color: '#FF4444',
    emoji: '⚔️',
  },
  Mage: {
    class: 'Mage',
    description: 'Mental clarity & brain foods',
    lore: 'Your mind is your greatest weapon. Feed it well and bend reality to your will.',
    primaryStat: 'INT',
    statWeights: { STR: 0.8, VIT: 1.2, AGI: 1.0, INT: 2.0, END: 1.0 },
    color: '#8B5CF6',
    emoji: '🔮',
  },
  Ranger: {
    class: 'Ranger',
    description: 'Weight loss & endurance',
    lore: 'Swift as the wind, light as a feather. You outrun your past self every single day.',
    primaryStat: 'AGI',
    statWeights: { STR: 1.0, VIT: 1.0, AGI: 2.0, INT: 0.8, END: 1.2 },
    color: '#00FF88',
    emoji: '🏹',
  },
  Healer: {
    class: 'Healer',
    description: 'Gut health & immunity',
    lore: 'You are the fortress. Nourish your inner ecosystem and become unbreakable.',
    primaryStat: 'VIT',
    statWeights: { STR: 0.8, VIT: 2.0, AGI: 1.0, INT: 1.2, END: 1.0 },
    color: '#00BFFF',
    emoji: '💚',
  },
};
