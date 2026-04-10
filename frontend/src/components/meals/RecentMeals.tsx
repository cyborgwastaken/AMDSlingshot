import { useGameStore } from '../../store/gameStore';

export default function RecentMeals() {
  const mealLogs = useGameStore((s) => s.mealLogs);
  const recent = mealLogs.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Recent Battles</h3>
      <div className="space-y-2">
        {recent.map((meal) => {
          const time = new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const date = new Date(meal.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
          return (
            <div key={meal.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
              <span className="text-xl" aria-hidden>{meal.items[0]?.icon ?? '🍽️'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{meal.name}</div>
                <div className="text-xs text-gray-500">{date} · {time} · {Math.round(meal.totalMacros.calories)} kcal</div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 text-xs font-bold">+{meal.xpGained} XP</div>
                {meal.isPerfectCombo && <div className="text-green-400 text-xs">✨ Combo!</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
