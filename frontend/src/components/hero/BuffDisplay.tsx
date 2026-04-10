import { motion, AnimatePresence } from 'framer-motion';
import type { Buff } from '../../types/hero.types';
import { formatBuffDuration } from '../../engine/buffSystem';

interface Props {
  buffs: Buff[];
}

export default function BuffDisplay({ buffs }: Props) {
  if (buffs.length === 0) return null;

  const activeBuffs = buffs.filter((b) => b.type === 'buff');
  const activeDebuffs = buffs.filter((b) => b.type === 'debuff');

  return (
    <div className="space-y-2" aria-label="Active effects">
      {activeBuffs.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Active Buffs</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {activeBuffs.map((buff) => (
                <BuffPill key={buff.id} buff={buff} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      {activeDebuffs.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Active Debuffs</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {activeDebuffs.map((buff) => (
                <BuffPill key={buff.id} buff={buff} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function BuffPill({ buff }: { buff: Buff }) {
  const isDebuff = buff.type === 'debuff';
  const remaining = formatBuffDuration(buff);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: isDebuff ? 'rgba(255,68,68,0.15)' : 'rgba(0,255,136,0.12)',
        border: `1px solid ${isDebuff ? '#FF444466' : '#00FF8866'}`,
        color: isDebuff ? '#FF6B6B' : '#00FF88',
      }}
      title={buff.description}
      aria-label={`${buff.name}: ${buff.description}, expires in ${remaining}`}
    >
      <span aria-hidden="true">{buff.icon}</span>
      <span>{buff.name}</span>
      <span className="opacity-60">{remaining}</span>
    </motion.div>
  );
}
