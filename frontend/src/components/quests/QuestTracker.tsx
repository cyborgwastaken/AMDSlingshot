import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { Quest } from '../../types/quest.types';

const TYPE_COLORS = { daily: '#60A5FA', weekly: '#8B5CF6', story: '#FFD700' };
const STATUS_LABEL: Record<Quest['status'], string> = {
  active: 'In Progress',
  completed: '✅ Complete',
  failed: '❌ Failed',
  locked: '🔒 Locked',
};

export default function QuestTracker() {
  const quests = useGameStore((s) => s.quests);
  const active = quests.filter((q) => q.status === 'active');
  const completed = quests.filter((q) => q.status === 'completed');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-white uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
          <span aria-hidden>📜</span> Active Quests
        </h2>
        {active.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-gray-500">
            No active quests. Log a meal to trigger new quests!
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((q) => <QuestCard key={q.id} quest={q} />)}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-500 uppercase tracking-wider text-sm mb-3">
            Completed ({completed.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {completed.map((q) => <QuestCard key={q.id} quest={q} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const color = TYPE_COLORS[quest.type];
  const isComplete = quest.status === 'completed';

  return (
    <motion.div
      className="glass rounded-2xl p-4"
      style={{ borderLeft: `3px solid ${color}` }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      role="article"
      aria-label={`${quest.title}: ${STATUS_LABEL[quest.status]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>{quest.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-bold text-white">{quest.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
              style={{ background: `${color}22`, color }}>
              {quest.type}
            </span>
          </div>
          <p className="text-xs text-gray-400 italic mb-2">{quest.lore}</p>

          {/* Objectives */}
          <div className="space-y-1.5">
            {quest.objectives.map((obj) => {
              const pct = Math.min(100, (obj.current / obj.target) * 100);
              return (
                <div key={obj.id}>
                  <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                    <span>{obj.description}</span>
                    <span>{Math.round(obj.current)}/{obj.target} {obj.unit}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5"
                    role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reward */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="text-yellow-400">⚡ {quest.reward.xp} XP</span>
            <span className="text-yellow-600">💰 {quest.reward.gold} gold</span>
            {quest.reward.title && <span className="text-purple-400">🏆 "{quest.reward.title}"</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
