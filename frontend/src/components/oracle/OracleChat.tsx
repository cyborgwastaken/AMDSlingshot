import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { askOracle } from '../../services/gemini';
import { getEffectiveStats } from '../../engine/statCalculator';

interface Message {
  role: 'user' | 'oracle';
  text: string;
  ts: number;
}

const SUGGESTIONS = [
  'What should I eat to level up fastest today?',
  'My STR is low — help me fix it!',
  'What\'s my biggest stat weakness?',
  'Give me a meal plan for today',
];

export default function OracleChat() {
  const hero = useGameStore((s) => s.hero)!;
  const mealLogs = useGameStore((s) => s.mealLogs);
  const quests = useGameStore((s) => s.quests);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'oracle',
      text: `Greetings, ${hero.name}. The Oracle has been expecting you. Ask me anything about your health journey, and I shall reveal the path to greatness. What wisdom do you seek?`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const stats = getEffectiveStats(hero);
      const recentMeals = mealLogs.slice(0, 5).map((m) => m.name);
      const activeQuestTitles = quests.filter((q) => q.status === 'active').map((q) => q.title);

      const response = await askOracle({
        userMessage: text,
        heroClass: hero.heroClass,
        heroLevel: hero.level,
        stats: stats as unknown as Record<string, number>,
        activeQuests: activeQuestTitles,
        recentMeals,
      });

      setMessages((m) => [...m, { role: 'oracle', text: response, ts: Date.now() }]);
    } catch {
      setMessages((m) => [...m, {
        role: 'oracle',
        text: 'The Oracle\'s vision clouds... Add your Gemini API key to VITE_GEMINI_API_KEY to unlock the full prophecy.',
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Oracle header */}
      <div className="glass rounded-t-2xl p-4 flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-3xl" aria-hidden
        >
          🔮
        </motion.div>
        <div>
          <div className="font-bold text-purple-400">The Oracle</div>
          <div className="text-xs text-gray-500">AI Diet Coach — Powered by Gemini</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 glass rounded-none border-t-0 border-b-0"
        role="log" aria-label="Oracle conversation" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'oracle' && (
                <span className="text-xl shrink-0 mt-1" aria-hidden>🔮</span>
              )}
              <div
                className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-400 text-black rounded-tr-none'
                    : 'glass text-gray-200 rounded-tl-none border border-purple-900'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <span className="text-xl" aria-hidden>🔮</span>
              <div className="glass px-4 py-3 rounded-2xl rounded-tl-none" aria-label="Oracle is thinking">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 glass flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full glass text-purple-400 hover:text-white border border-purple-800 hover:border-purple-500 transition-all whitespace-nowrap">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass rounded-b-2xl p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask the Oracle..."
          className="flex-1 glass rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-purple-400"
          aria-label="Message to Oracle"
          disabled={loading}
        />
        <motion.button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded-xl font-bold text-sm bg-purple-600 text-white disabled:opacity-40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Send message"
        >
          Send
        </motion.button>
      </div>
    </div>
  );
}
