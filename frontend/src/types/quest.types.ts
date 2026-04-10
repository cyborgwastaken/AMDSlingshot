export type QuestType = 'daily' | 'weekly' | 'story';
export type QuestStatus = 'active' | 'completed' | 'failed' | 'locked';

export interface QuestReward {
  xp: number;
  gold: number;
  itemDrop?: string; // food item id
  title?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  unit: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  lore: string;
  type: QuestType;
  status: QuestStatus;
  objectives: QuestObjective[];
  reward: QuestReward;
  icon: string;
  expiresAt?: number; // timestamp
  startedAt: number;
  completedAt?: number;
}
