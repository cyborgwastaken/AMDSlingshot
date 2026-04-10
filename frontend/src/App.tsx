import { Suspense, lazy } from 'react';
import { useGameStore } from './store/gameStore';
import { useAuth } from './hooks/useAuth';
import './index.css';

const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0F0F1A' }}
      aria-label="Loading NutriQuest"
    >
      <div className="text-center">
        <div className="text-6xl mb-4" aria-hidden>⚔️</div>
        <div className="text-white font-bold text-xl">NutriQuest</div>
        <div className="text-gray-500 text-sm mt-1">Loading your adventure...</div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const onboardingComplete = useGameStore((s) => s.onboardingComplete);
  const hero = useGameStore((s) => s.hero);

  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      {!user && <Login />}
      {user && (!onboardingComplete || !hero) && <Onboarding />}
      {user && onboardingComplete && hero && <Dashboard />}
    </Suspense>
  );
}
