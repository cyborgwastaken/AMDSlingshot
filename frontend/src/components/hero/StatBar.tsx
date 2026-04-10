import { motion } from 'framer-motion';
import type { StatKey } from '../../types/hero.types';

const STAT_META: Record<StatKey, { label: string; icon: string; color: string; desc: string }> = {
  STR: { label: 'STR', icon: '💪', color: '#FF6B6B', desc: 'Strength — Protein intake' },
  VIT: { label: 'VIT', icon: '🌿', color: '#00FF88', desc: 'Vitality — Vitamins & minerals' },
  AGI: { label: 'AGI', icon: '⚡', color: '#FFD700', desc: 'Agility — Calorie balance' },
  INT: { label: 'INT', icon: '🧠', color: '#8B5CF6', desc: 'Intelligence — Omega-3s & antioxidants' },
  END: { label: 'END', icon: '🔥', color: '#60A5FA', desc: 'Endurance — Fiber & consistency' },
};

interface Props {
  stat: StatKey;
  value: number; // 0-100
  previousValue?: number;
  showDelta?: boolean;
}

export default function StatBar({ stat, value, previousValue, showDelta }: Props) {
  const meta = STAT_META[stat];
  const delta = previousValue !== undefined ? value - previousValue : 0;
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="flex flex-col gap-1" role="group" aria-label={meta.desc}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
          <span aria-hidden="true">{meta.icon}</span>
          <span>{meta.label}</span>
        </span>
        <div className="flex items-center gap-2">
          {showDelta && delta !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: delta > 0 ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-bold"
              style={{ color: delta > 0 ? '#00FF88' : '#FF4444' }}
              aria-live="polite"
              aria-label={`${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`}
            >
              {delta > 0 ? '+' : ''}{delta}
            </motion.span>
          )}
          <span className="text-sm font-bold text-white" aria-label={`${value} out of 100`}>
            {Math.round(value)}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden" role="progressbar"
        aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})`,
            boxShadow: `0 0 8px ${meta.color}66`,
          }}
        />
      </div>
    </div>
  );
}
