import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getEffectiveStats, computeHealthScore } from '../engine/statCalculator';
import { levelProgress } from '../engine/xpSystem';
import HeroAvatar from '../components/hero/HeroAvatar';
import StatBar from '../components/hero/StatBar';
import BuffDisplay from '../components/hero/BuffDisplay';
import QuestTracker from '../components/quests/QuestTracker';
import MealLogger from '../components/meals/MealLogger';
import FoodexPage from './Foodex';
import OracleChat from '../components/oracle/OracleChat';
import RecentMeals from '../components/meals/RecentMeals';
import type { Hero, HeroStats } from '../types/hero.types';

type Tab = 'hero' | 'meals' | 'quests' | 'foodex' | 'oracle';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'hero', label: 'Hero', icon: '⚔️' },
  { id: 'meals', label: 'Log', icon: '🍽️' },
  { id: 'quests', label: 'Quests', icon: '📜' },
  { id: 'foodex', label: 'Foodex', icon: '📖' },
  { id: 'oracle', label: 'Oracle', icon: '🔮' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const hero = useGameStore((s) => s.hero)!;
  const mealLogs = useGameStore((s) => s.mealLogs);
  const totalXp = useGameStore((s) => s.totalXp);
  const gold = useGameStore((s) => s.gold);

  const stats = getEffectiveStats(hero);
  const healthScore = computeHealthScore(stats);
  const xpProgress = levelProgress(hero.xp, hero.level);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F0F1A' }}>
      {/* Top bar */}
      <header className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black"
            style={{ background: 'linear-gradient(135deg, #00FF88, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NutriQuest
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-yellow-400 font-bold" aria-label={`${gold} gold`}>💰 {gold}</span>
          <span className="text-green-400 font-bold" aria-label={`Health score ${healthScore}`}>❤️ {healthScore}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'hero' && (
              <HeroPanel hero={hero} stats={stats} xpProgress={xpProgress} healthScore={healthScore} />
            )}
            {activeTab === 'meals' && <MealLogger />}
            {activeTab === 'quests' && <QuestTracker />}
            {activeTab === 'foodex' && <FoodexPage />}
            {activeTab === 'oracle' && <OracleChat />}
          </motion.div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-50 flex" aria-label="Main navigation">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
              activeTab === tab.id ? 'text-white' : 'text-gray-500'
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            aria-label={tab.label}
          >
            <span className="text-xl" aria-hidden="true">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 w-8 h-0.5 rounded-full bg-green-400"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

function HeroPanel({ hero, stats, xpProgress, healthScore }: {
  hero: Hero;
  stats: HeroStats;
  xpProgress: number;
  healthScore: number;
}) {
  const mealLogs = useGameStore((s) => s.mealLogs);

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <HeroAvatar hero={hero} />
          <div className="flex-1 min-w-0">
            {/* XP Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>XP Progress</span>
                <span>{hero.xp} / {hero.xpToNextLevel} XP</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden"
                role="progressbar" aria-valuenow={xpProgress} aria-valuemin={0} aria-valuemax={100}
                aria-label={`XP: ${xpProgress}% to next level`}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ background: 'linear-gradient(90deg, #8B5CF6, #00FF88)' }}
                />
              </div>
            </div>

            {/* Active buffs */}
            <BuffDisplay buffs={hero.activeBuffs} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-white text-sm uppercase tracking-wider">Character Stats</h2>
        {(Object.keys(stats) as Array<keyof typeof stats>).map((stat) => (
          <StatBar key={stat} stat={stat} value={stats[stat]} showDelta />
        ))}
      </div>

      {/* Today's summary */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Today's Battle Log</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-black text-green-400">
              {mealLogs.filter((m) => new Date(m.loggedAt).toDateString() === new Date().toDateString()).length}
            </div>
            <div className="text-xs text-gray-500">Meals</div>
          </div>
          <div>
            <div className="text-2xl font-black text-yellow-400">
              {mealLogs
                .filter((m) => new Date(m.loggedAt).toDateString() === new Date().toDateString())
                .reduce((a, m) => a + m.xpGained, 0)}
            </div>
            <div className="text-xs text-gray-500">XP Gained</div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-400">{healthScore}</div>
            <div className="text-xs text-gray-500">Health Score</div>
          </div>
        </div>
      </div>

      <RecentMeals />
    </div>
  );
}
