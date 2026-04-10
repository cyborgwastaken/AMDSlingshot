import type { Quest } from '../types/quest.types';
import { nanoid } from '../utils/nanoid';

export function DEFAULT_QUESTS(): Quest[] {
  const now = Date.now();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return [
    {
      id: nanoid(),
      title: 'Awaken Your Powers',
      description: 'Log your first meal to begin your journey.',
      lore: 'Every legend starts with a single step. Yours begins at the table.',
      type: 'story',
      status: 'active',
      objectives: [
        { id: nanoid(), description: 'Log your first meal', target: 1, current: 0, unit: 'meals' },
      ],
      reward: { xp: 200, gold: 50, title: 'Awakened' },
      icon: '⚡',
      startedAt: now,
    },
    {
      id: nanoid(),
      title: 'Protein Warrior',
      description: 'Consume 30g of protein before noon.',
      lore: 'The morning battle is won at breakfast. Arm yourself with protein.',
      type: 'daily',
      status: 'active',
      objectives: [
        { id: nanoid(), description: 'Consume 30g protein', target: 30, current: 0, unit: 'g' },
      ],
      reward: { xp: 100, gold: 25 },
      icon: '💪',
      expiresAt: endOfDay.getTime(),
      startedAt: now,
    },
    {
      id: nanoid(),
      title: 'Hydration Ritual',
      description: 'Log 3 hydrating meals or drinks today.',
      lore: 'Water is the essence of life. Drink deeply, hero.',
      type: 'daily',
      status: 'active',
      objectives: [
        { id: nanoid(), description: 'Log hydrating foods/drinks', target: 3, current: 0, unit: 'items' },
      ],
      reward: { xp: 75, gold: 20 },
      icon: '💧',
      expiresAt: endOfDay.getTime(),
      startedAt: now,
    },
    {
      id: nanoid(),
      title: 'The Road to Vitality',
      description: 'Log 30 healthy meals over the next 30 days.',
      lore: 'The greatest journeys are not sprints, but marathons of discipline.',
      type: 'story',
      status: 'active',
      objectives: [
        { id: nanoid(), description: 'Log healthy meals', target: 30, current: 0, unit: 'meals' },
      ],
      reward: { xp: 2000, gold: 500, title: 'Champion of Vitality' },
      icon: '🏆',
      startedAt: now,
    },
    {
      id: nanoid(),
      title: 'Explorer\'s Appetite',
      description: 'Discover 5 different foods in your Foodex.',
      lore: 'The world is full of untasted wonders. Seek them out.',
      type: 'weekly',
      status: 'active',
      objectives: [
        { id: nanoid(), description: 'Discover unique foods', target: 5, current: 0, unit: 'foods' },
      ],
      reward: { xp: 300, gold: 75 },
      icon: '📖',
      startedAt: now,
    },
  ];
}
