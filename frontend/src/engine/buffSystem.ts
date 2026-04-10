import type { Buff, StatKey } from '../types/hero.types';
import type { FoodItem } from '../types/meal.types';
import { nanoid } from '../utils/nanoid';

/** Generate a unique id (lightweight, no dep needed) */

interface BuffTemplate {
  name: string;
  description: string;
  stat: StatKey;
  modifier: number;
  durationMinutes: number;
  icon: string;
  type: 'buff' | 'debuff';
}

const HEALTHY_BUFFS: BuffTemplate[] = [
  { name: 'Protein Surge', description: '+STR for 6h', stat: 'STR', modifier: 15, durationMinutes: 360, icon: '💪', type: 'buff' },
  { name: 'Vitality Bloom', description: '+VIT for 6h', stat: 'VIT', modifier: 12, durationMinutes: 360, icon: '🌿', type: 'buff' },
  { name: 'Quick Energy', description: '+AGI for 4h', stat: 'AGI', modifier: 10, durationMinutes: 240, icon: '⚡', type: 'buff' },
  { name: 'Mind Clarity', description: '+INT for 8h', stat: 'INT', modifier: 14, durationMinutes: 480, icon: '🧠', type: 'buff' },
  { name: 'Iron Will', description: '+END for 8h', stat: 'END', modifier: 12, durationMinutes: 480, icon: '🔥', type: 'buff' },
  { name: 'Hydration Boost', description: '+INT +AGI for 3h', stat: 'INT', modifier: 8, durationMinutes: 180, icon: '💧', type: 'buff' },
];

const JUNK_DEBUFFS: BuffTemplate[] = [
  { name: 'Sugar Crash', description: '-AGI for 3h', stat: 'AGI', modifier: -10, durationMinutes: 180, icon: '🍬', type: 'debuff' },
  { name: 'Sluggish', description: '-AGI for 4h', stat: 'AGI', modifier: -12, durationMinutes: 240, icon: '🐌', type: 'debuff' },
  { name: 'Brain Fog', description: '-INT for 4h', stat: 'INT', modifier: -10, durationMinutes: 240, icon: '🌫️', type: 'debuff' },
  { name: 'Sodium Overload', description: '-VIT for 6h', stat: 'VIT', modifier: -8, durationMinutes: 360, icon: '🧂', type: 'debuff' },
];

const PERFECT_COMBO_BUFFS: BuffTemplate[] = [
  { name: 'Harmonized', description: 'Balanced meal: +all stats for 4h', stat: 'END', modifier: 10, durationMinutes: 240, icon: '✨', type: 'buff' },
];

export function generateBuffsForMeal(items: FoodItem[], isPerfectCombo: boolean): Buff[] {
  const now = Date.now();
  const buffs: Buff[] = [];

  const allHealthy = items.every((i) => i.isHealthy);
  const anyJunk = items.some((i) => !i.isHealthy);

  if (isPerfectCombo) {
    for (const t of PERFECT_COMBO_BUFFS) {
      buffs.push({ ...t, id: nanoid(), appliedAt: now });
    }
  }

  if (allHealthy && !isPerfectCombo) {
    const template = HEALTHY_BUFFS[Math.floor(Math.random() * HEALTHY_BUFFS.length)];
    buffs.push({ ...template, id: nanoid(), appliedAt: now });
  }

  if (anyJunk) {
    const template = JUNK_DEBUFFS[Math.floor(Math.random() * JUNK_DEBUFFS.length)];
    buffs.push({ ...template, id: nanoid(), appliedAt: now });
  }

  // Also include any item-specific buffs
  for (const item of items) {
    for (const b of item.buffsGranted) {
      buffs.push({ ...b, id: nanoid(), appliedAt: now });
    }
  }

  return buffs;
}

export function getRemainingMinutes(buff: Buff): number {
  const expiresAt = buff.appliedAt + buff.durationMinutes * 60_000;
  return Math.max(0, Math.round((expiresAt - Date.now()) / 60_000));
}

export function formatBuffDuration(buff: Buff): string {
  const mins = getRemainingMinutes(buff);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${mins}m`;
}

export function isBuffExpired(buff: Buff): boolean {
  return getRemainingMinutes(buff) <= 0;
}
