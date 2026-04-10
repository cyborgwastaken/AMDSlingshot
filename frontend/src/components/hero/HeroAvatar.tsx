import { motion } from 'framer-motion';
import type { Hero } from '../../types/hero.types';
import { CLASS_CONFIGS } from '../../types/hero.types';
import { computeHealthScore, getEffectiveStats } from '../../engine/statCalculator';

interface Props {
  hero: Hero;
}

export default function HeroAvatar({ hero }: Props) {
  const config = CLASS_CONFIGS[hero.heroClass];
  const stats = getEffectiveStats(hero);
  const healthScore = computeHealthScore(stats);

  // Avatar transforms based on health score
  const glowIntensity = Math.floor(healthScore / 20); // 0-5
  const glowColor = config.color;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar SVG — CSS art hero, no external assets */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          filter: [
            `drop-shadow(0 0 ${glowIntensity * 4}px ${glowColor})`,
            `drop-shadow(0 0 ${glowIntensity * 8}px ${glowColor})`,
            `drop-shadow(0 0 ${glowIntensity * 4}px ${glowColor})`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        aria-label={`${hero.name}, Level ${hero.level} ${hero.heroClass}`}
        role="img"
      >
        <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <rect x="35" y="55" width="50" height="55" rx="8" fill={config.color} opacity="0.9"/>
          {/* Head */}
          <circle cx="60" cy="38" r="22" fill={config.color} opacity="0.95"/>
          {/* Eyes */}
          <circle cx="52" cy="35" r="4" fill="#0F0F1A"/>
          <circle cx="68" cy="35" r="4" fill="#0F0F1A"/>
          <circle cx="53" cy="34" r="1.5" fill="white"/>
          <circle cx="69" cy="34" r="1.5" fill="white"/>
          {/* Smile (more pronounced at higher health) */}
          <path
            d={healthScore > 50 ? "M52 44 Q60 50 68 44" : "M52 44 Q60 42 68 44"}
            stroke="#0F0F1A" strokeWidth="2" strokeLinecap="round" fill="none"/>
          {/* Arms */}
          <rect x="15" y="58" width="20" height="10" rx="5" fill={config.color} opacity="0.8"/>
          <rect x="85" y="58" width="20" height="10" rx="5" fill={config.color} opacity="0.8"/>
          {/* Legs */}
          <rect x="38" y="105" width="17" height="25" rx="6" fill={config.color} opacity="0.8"/>
          <rect x="65" y="105" width="17" height="25" rx="6" fill={config.color} opacity="0.8"/>
          {/* Class icon */}
          <text x="60" y="90" textAnchor="middle" fontSize="18" fill="#0F0F1A" fontWeight="bold">
            {config.emoji}
          </text>
          {/* Level badge */}
          <circle cx="95" cy="20" r="14" fill="#FFD700"/>
          <text x="95" y="25" textAnchor="middle" fontSize="11" fill="#0F0F1A" fontWeight="bold">
            {hero.level}
          </text>
        </svg>
      </motion.div>

      {/* Name + class */}
      <div className="text-center">
        <div className="font-bold text-white text-lg">{hero.name}</div>
        <div className="text-sm font-medium" style={{ color: config.color }}>
          Level {hero.level} {hero.heroClass}
        </div>
      </div>

      {/* Streak badge */}
      {hero.streakDays >= 3 && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          style={{ background: `${glowColor}22`, border: `1px solid ${glowColor}`, color: glowColor }}
          aria-label={`${hero.streakDays} day streak`}
        >
          🔥 {hero.streakDays}-day streak
          {hero.streakDays >= 7 && ' • On Fire!'}
        </motion.div>
      )}
    </div>
  );
}
