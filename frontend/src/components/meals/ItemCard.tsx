import { motion } from 'framer-motion';
import type { FoodItem } from '../../types/meal.types';
import { RARITY_COLORS, RARITY_LABELS } from '../../types/item.types';

interface Props {
  item: FoodItem;
  compact?: boolean;
  showLore?: boolean;
}

export default function ItemCard({ item, compact, showLore }: Props) {
  const color = RARITY_COLORS[item.rarity];
  const label = RARITY_LABELS[item.rarity];

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 glass rounded-xl p-3"
        style={{ borderLeft: `3px solid ${color}` }}
        role="listitem"
        aria-label={`${item.name}, ${label} rarity`}
      >
        <span className="text-2xl" aria-hidden="true">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm truncate">{item.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${color}22`, color }}>
              {label}
            </span>
            {!item.isHealthy && (
              <span className="text-xs text-red-400">⚠️ debuff</span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {item.macros.calories} kcal · {item.macros.protein}g protein · {item.macros.carbs}g carbs
          </div>
        </div>
        <div className="text-right">
          <div className="text-yellow-400 text-xs font-bold">+{item.xpValue} XP</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="glass rounded-2xl p-4 space-y-3"
      style={{ border: `1px solid ${color}44` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      role="article"
      aria-label={`${item.name} food item card`}
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl" aria-hidden="true">{item.icon}</span>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white">{item.name}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
            >
              {label}
            </span>
          </div>
          {showLore && (
            <p className="text-xs text-gray-500 italic mt-1">{item.lore}</p>
          )}
        </div>
      </div>

      {/* Macros grid */}
      <div className="grid grid-cols-5 gap-2 text-center">
        {[
          { label: 'Cal', value: item.macros.calories, unit: '' },
          { label: 'Protein', value: item.macros.protein, unit: 'g' },
          { label: 'Carbs', value: item.macros.carbs, unit: 'g' },
          { label: 'Fat', value: item.macros.fat, unit: 'g' },
          { label: 'Fiber', value: item.macros.fiber, unit: 'g' },
        ].map((m) => (
          <div key={m.label}>
            <div className="text-white font-bold text-sm">{m.value}{m.unit}</div>
            <div className="text-gray-500 text-xs">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={item.isHealthy ? 'text-green-400' : 'text-red-400'}>
          {item.isHealthy ? '✅ Healthy' : '⚠️ Junk food — debuff incoming'}
        </span>
        <span className="text-yellow-400 font-bold">+{item.xpValue} XP</span>
      </div>
    </motion.div>
  );
}
