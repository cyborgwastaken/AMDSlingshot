export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#4ADE80',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#FCD34D',
};

export const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};
