import { Suspense, lazy } from 'react';
import { useGameStore } from './store/gameStore';
import './index.css';

const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#0F0F1A' }}
      aria-label="Loading NutriQuest">
      <div className="text-center">
        <div className="text-6xl mb-4" style={{ animation: 'pulse 2s infinite' }} aria-hidden>⚔️</div>
        <div className="text-white font-bold text-xl">NutriQuest</div>
        <div className="text-gray-500 text-sm mt-1">Loading your adventure...</div>
      </div>
    </div>
  );
}

export default function App() {
  const onboardingComplete = useGameStore((s) => s.onboardingComplete);
  const hero = useGameStore((s) => s.hero);

  return (
    <Suspense fallback={<LoadingScreen />}>
      {onboardingComplete && hero ? <Dashboard /> : <Onboarding />}
    </Suspense>
  );
}
