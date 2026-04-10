import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signInWithGoogle, loading, error } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #1A1A3E 0%, #0F0F1A 70%)' }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="text-7xl mb-4" aria-hidden>⚔️</div>
        <h1
          className="text-5xl font-black tracking-tight mb-3"
          style={{
            background: 'linear-gradient(135deg, #00FF88, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          NutriQuest
        </h1>
        <p className="text-gray-400 text-lg">Your health is your superpower</p>
        <p className="text-gray-600 text-sm mt-2">
          The RPG where food is your power system
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2 justify-center mb-10 max-w-sm"
      >
        {['⚔️ Hero Classes', '🍽️ AI Meal Scanner', '📜 Quests', '🔮 Oracle Coach', '📖 Foodex'].map((f) => (
          <span
            key={f}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#A78BFA' }}
          >
            {f}
          </span>
        ))}
      </motion.div>

      {/* Sign-in card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-8 w-full max-w-sm text-center"
      >
        <h2 className="text-white font-bold text-xl mb-2">Begin Your Adventure</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to save your hero's progress</p>

        <motion.button
          onClick={signInWithGoogle}
          disabled={loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-gray-900 transition-all disabled:opacity-60"
          style={{ background: 'white' }}
          aria-label="Sign in with Google"
        >
          {/* Google SVG icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </motion.button>

        {error && (
          <p className="text-red-400 text-xs mt-3" role="alert">
            {error.includes('popup-closed') ? 'Sign-in cancelled.' : error}
          </p>
        )}

        <p className="text-gray-600 text-xs mt-4">
          Your progress is saved to your account
        </p>
      </motion.div>
    </div>
  );
}
