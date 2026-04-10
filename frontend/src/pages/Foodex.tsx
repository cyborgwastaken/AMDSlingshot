import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { FOOD_DATABASE } from '../engine/nutritionParser';
import { RARITY_COLORS, RARITY_LABELS } from '../types/item.types';
import type { ItemRarity } from '../types/item.types';

const RARITY_ORDER: ItemRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

export default function FoodexPage() {
  const discoveredFoods = useGameStore((s) => s.discoveredFoods);
  const [filter, setFilter] = useState<ItemRarity | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const total = FOOD_DATABASE.length;
  const discovered = discoveredFoods.size;
  const pct = Math.round((discovered / total) * 100);

  const filtered = FOOD_DATABASE.filter((f) => {
    if (filter !== 'all' && f.rarity !== filter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedFood = FOOD_DATABASE.find((f) => f.name === selected);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white flex items-center gap-2">
            <span aria-hidden>📖</span> Foodex
          </h2>
          <span className="text-sm text-gray-400" aria-label={`${discovered} of ${total} foods discovered`}>
            {discovered}/{total} discovered
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-2"
          role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
          aria-label="Foodex completion progress">
          <motion.div
            className="h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1 }}
            style={{ background: 'linear-gradient(90deg, #8B5CF6, #FFD700)' }}
          />
        </div>
        <div className="text-right text-xs text-gray-500">{pct}% complete</div>
      </div>

      {/* Search + filter */}
      <div className="space-y-2">
        <input
          type="search"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-purple-400"
          aria-label="Search food database"
        />
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by rarity">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === 'all' ? 'bg-white text-black' : 'glass text-gray-400'
            }`}
            aria-pressed={filter === 'all'}
          >
            All
          </button>
          {RARITY_ORDER.map((r) => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === r ? 'text-black' : 'glass text-gray-400'
              }`}
              style={filter === r ? { background: RARITY_COLORS[r] } : {}}
              aria-pressed={filter === r}
            >
              {RARITY_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3" role="list" aria-label="Food items">
        {filtered.map((food) => {
          const isDiscovered = discoveredFoods.has(food.name);
          const color = RARITY_COLORS[food.rarity];
          return (
            <motion.button
              key={food.name}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(food.name)}
              className="glass rounded-xl p-3 text-center relative"
              style={{ border: isDiscovered ? `1px solid ${color}55` : '1px solid transparent' }}
              role="listitem"
              aria-label={isDiscovered ? `${food.name}, ${RARITY_LABELS[food.rarity]}` : 'Undiscovered food'}
            >
              {isDiscovered ? (
                <>
                  <div className="text-3xl mb-1">{food.icon}</div>
                  <div className="text-xs font-medium text-white leading-tight truncate">{food.name}</div>
                  <div className="text-xs mt-0.5" style={{ color }}>{RARITY_LABELS[food.rarity]}</div>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-1 grayscale opacity-30">❓</div>
                  <div className="text-xs text-gray-600">???</div>
                  <div className="text-xs text-gray-700 mt-0.5">{RARITY_LABELS[food.rarity]}</div>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && selectedFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md"
              style={{ border: `1px solid ${RARITY_COLORS[selectedFood.rarity]}55` }}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedFood.name} details`}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-5xl">{selectedFood.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-xl">{selectedFood.name}</h3>
                  <span className="text-sm font-medium" style={{ color: RARITY_COLORS[selectedFood.rarity] }}>
                    {RARITY_LABELS[selectedFood.rarity]}
                  </span>
                  <p className="text-gray-400 text-sm italic mt-1">{selectedFood.lore}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center mb-4">
                {[
                  { l: 'Cal', v: selectedFood.macros.calories },
                  { l: 'Protein', v: `${selectedFood.macros.protein}g` },
                  { l: 'Carbs', v: `${selectedFood.macros.carbs}g` },
                  { l: 'Fat', v: `${selectedFood.macros.fat}g` },
                  { l: 'Fiber', v: `${selectedFood.macros.fiber}g` },
                ].map((m) => (
                  <div key={m.l}>
                    <div className="text-white font-bold">{m.v}</div>
                    <div className="text-gray-500 text-xs">{m.l}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={selectedFood.isHealthy ? 'text-green-400' : 'text-red-400'}>
                  {selectedFood.isHealthy ? '✅ Healthy food' : '⚠️ Junk food'}
                </span>
                <span className="text-gray-500">GI: {selectedFood.glycemicIndex}</span>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-4 w-full py-2 glass rounded-xl text-gray-400 text-sm hover:text-white"
                aria-label="Close food details"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
