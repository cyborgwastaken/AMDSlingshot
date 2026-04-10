import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { parseMealText, seedToFoodItem, FOOD_DATABASE } from '../../engine/nutritionParser';
import { parseMealWithGemini } from '../../services/gemini';
import type { FoodItem, MealLog } from '../../types/meal.types';
import { RARITY_COLORS } from '../../types/item.types';
import ItemCard from './ItemCard';
import RecentMeals from './RecentMeals';

type MealType = MealLog['mealType'];

export default function MealLogger() {
  const [text, setText] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [parsedItems, setParsedItems] = useState<FoodItem[]>([]);
  const [lastMeal, setLastMeal] = useState<MealLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logMeal = useGameStore((s) => s.logMeal);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Try Gemini first, fall back to local parser
      let items: FoodItem[];
      try {
        const geminiResult = await parseMealWithGemini(text);
        const parsed = JSON.parse(geminiResult) as Array<{
          name: string; calories: number; protein: number;
          carbs: number; fat: number; fiber: number; isHealthy: boolean;
        }>;
        items = parsed.map((p) => {
          const seed = FOOD_DATABASE.find((f) => f.name.toLowerCase().includes(p.name.toLowerCase()))
            ?? { ...FOOD_DATABASE[0], name: p.name, macros: { calories: p.calories, protein: p.protein, carbs: p.carbs, fat: p.fat, fiber: p.fiber }, isHealthy: p.isHealthy };
          return seedToFoodItem({ ...seed, name: p.name });
        });
      } catch {
        items = parseMealText(text);
      }
      setParsedItems(items);
    } catch {
      setError('Could not parse meal. Try describing it differently.');
    } finally {
      setLoading(false);
    }
  };

  const handleLog = () => {
    if (!parsedItems.length) return;
    const meal = logMeal(parsedItems, text || 'Meal', mealType);
    setLastMeal(meal);
    setText('');
    setParsedItems([]);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <span aria-hidden>🍽️</span> Log a Meal
        </h2>

        {/* Meal type selector */}
        <div className="flex gap-2 mb-4" role="group" aria-label="Meal type">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
            <button key={t} onClick={() => setMealType(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                mealType === t
                  ? 'bg-green-400 text-black'
                  : 'glass text-gray-400 hover:text-white'
              }`}
              aria-pressed={mealType === t}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your meal... e.g. 'grilled chicken with quinoa and spinach salad'"
          className="w-full glass rounded-xl p-3 text-white text-sm resize-none outline-none focus:ring-1 focus:ring-green-400 h-24"
          aria-label="Meal description"
        />

        <div className="flex gap-2 mt-3">
          <motion.button
            onClick={handleParse}
            disabled={!text.trim() || loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-green-400 text-black disabled:opacity-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '⚡ Analyzing...' : '⚡ Analyze Meal'}
          </motion.button>
        </div>

        {error && <p className="text-red-400 text-xs mt-2" role="alert">{error}</p>}
      </div>

      {/* Parsed items preview */}
      <AnimatePresence>
        {parsedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-5 space-y-3"
          >
            <h3 className="font-bold text-white text-sm">Items Detected</h3>
            <div className="space-y-2">
              {parsedItems.map((item) => (
                <ItemCard key={item.id} item={item} compact />
              ))}
            </div>

            <div className="border-t border-gray-700 pt-3">
              <div className="grid grid-cols-5 gap-2 text-center text-xs text-gray-400 mb-3">
                {(['protein', 'carbs', 'fat', 'fiber', 'calories'] as const).map((macro) => (
                  <div key={macro}>
                    <div className="font-bold text-white text-sm">
                      {Math.round(parsedItems.reduce((a, i) => a + i.macros[macro], 0))}
                      {macro === 'calories' ? '' : 'g'}
                    </div>
                    <div className="capitalize">{macro}</div>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleLog}
                className="w-full py-3 rounded-xl font-bold text-black text-sm"
                style={{ background: 'linear-gradient(135deg, #00FF88, #00CC66)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Confirm and log meal"
              >
                ⚔️ Log Battle & Gain XP!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last meal result */}
      <AnimatePresence>
        {lastMeal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl p-5 text-center"
            style={{ border: '1px solid #00FF8844' }}
          >
            <div className="text-4xl mb-2">{lastMeal.isPerfectCombo ? '✨' : '⚡'}</div>
            <h3 className="font-bold text-white text-lg mb-1">
              {lastMeal.isPerfectCombo ? 'Perfect Combo!' : 'Meal Logged!'}
            </h3>
            <p className="text-green-400 font-bold text-2xl">+{lastMeal.xpGained} XP</p>
            {lastMeal.buffsApplied.length > 0 && (
              <p className="text-gray-400 text-sm mt-1">
                {lastMeal.buffsApplied.map((b) => `${b.icon} ${b.name}`).join(' • ')}
              </p>
            )}
            <button
              onClick={() => setLastMeal(null)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <RecentMeals />
    </div>
  );
}
