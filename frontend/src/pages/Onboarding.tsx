import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CLASS_CONFIGS, type HeroClass } from '../types/hero.types';
import { useGameStore } from '../store/gameStore';

const STEPS = ['class', 'name', 'done'] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const [step, setStep] = useState<Step>('class');
  const [selectedClass, setSelectedClass] = useState<HeroClass | null>(null);
  const [heroName, setHeroName] = useState('');
  const createHero = useGameStore((s) => s.createHero);

  const classes = Object.values(CLASS_CONFIGS);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #1A1A3E 0%, #0F0F1A 70%)' }}>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl font-black tracking-tight mb-2"
          style={{ background: 'linear-gradient(135deg, #00FF88, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NutriQuest
        </h1>
        <p className="text-gray-400 text-lg">Your health is your superpower</p>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* Step 1: Class Selection */}
        {step === 'class' && (
          <motion.div key="class"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-center text-white mb-2">Choose Your Class</h2>
            <p className="text-gray-400 text-center mb-6">Your class determines your primary stats and quest bonuses</p>

            <div className="grid grid-cols-2 gap-4">
              {classes.map((cfg) => (
                <motion.button
                  key={cfg.class}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedClass(cfg.class)}
                  className={`glass rounded-2xl p-5 text-left transition-all border-2 ${
                    selectedClass === cfg.class
                      ? 'border-opacity-100'
                      : 'border-transparent hover:border-opacity-50'
                  }`}
                  style={{
                    borderColor: selectedClass === cfg.class ? cfg.color : 'transparent',
                    boxShadow: selectedClass === cfg.class ? `0 0 25px ${cfg.color}40` : 'none',
                  }}
                  aria-pressed={selectedClass === cfg.class}
                  aria-label={`Select ${cfg.class} class`}
                >
                  <div className="text-4xl mb-3">{cfg.emoji}</div>
                  <div className="font-bold text-white text-xl mb-1">{cfg.class}</div>
                  <div className="text-sm mb-3" style={{ color: cfg.color }}>{cfg.description}</div>
                  <div className="text-xs text-gray-500 italic">{cfg.lore}</div>

                  {/* Stat weights preview */}
                  <div className="mt-3 space-y-1">
                    {(Object.entries(cfg.statWeights) as [string, number][]).map(([stat, weight]) => (
                      <div key={stat} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-8">{stat}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{
                            width: `${(weight / 2) * 100}%`,
                            backgroundColor: cfg.color,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.button
              className="w-full mt-6 py-4 rounded-xl font-bold text-lg text-black transition-all disabled:opacity-40"
              style={{ background: selectedClass ? CLASS_CONFIGS[selectedClass].color : '#4B5563' }}
              disabled={!selectedClass}
              onClick={() => setStep('name')}
              whileHover={selectedClass ? { scale: 1.02 } : {}}
              whileTap={selectedClass ? { scale: 0.98 } : {}}
            >
              Choose {selectedClass ?? 'a Class'} →
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Name */}
        {step === 'name' && selectedClass && (
          <motion.div key="name"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md text-center">

            <div className="text-6xl mb-4">{CLASS_CONFIGS[selectedClass].emoji}</div>
            <h2 className="text-2xl font-bold text-white mb-2">Name Your Hero</h2>
            <p className="text-gray-400 mb-6">What shall the legends call you?</p>

            <input
              type="text"
              placeholder="Enter hero name..."
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              maxLength={24}
              className="w-full px-4 py-3 rounded-xl text-white text-center text-xl font-semibold glass outline-none focus:ring-2 mb-6"
              style={{ '--tw-ring-color': CLASS_CONFIGS[selectedClass].color } as React.CSSProperties}
              aria-label="Hero name"
              onKeyDown={(e) => e.key === 'Enter' && heroName.trim() && createHero(heroName.trim(), selectedClass)}
            />

            <div className="flex gap-3">
              <button onClick={() => setStep('class')}
                className="flex-1 py-3 rounded-xl glass text-gray-400 hover:text-white transition-colors"
                aria-label="Go back to class selection">
                ← Back
              </button>
              <motion.button
                className="flex-2 flex-grow py-3 rounded-xl font-bold text-black"
                style={{ background: CLASS_CONFIGS[selectedClass].color }}
                disabled={!heroName.trim()}
                onClick={() => createHero(heroName.trim(), selectedClass)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Begin your adventure"
              >
                Begin Adventure! ⚡
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
