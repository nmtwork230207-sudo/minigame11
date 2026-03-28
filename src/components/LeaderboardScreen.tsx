import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Medal } from 'lucide-react';
import { Team } from '../types';
import { cn } from '../utils';

interface LeaderboardScreenProps {
  teams: Team[];
  onRestart: () => void;
}

export function LeaderboardScreen({ teams, onRestart }: LeaderboardScreenProps) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-6"
          >
            <Trophy size={80} className="text-yellow-400 mx-auto drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm mb-4">
            CHÚC MỪNG
          </h1>
          <p className="text-3xl font-bold text-white">
            {winner.name} đã giành chiến thắng!
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 mb-12">
          <div className="space-y-4">
            {sortedTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn(
                  'flex items-center gap-6 p-6 rounded-2xl border',
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                    : 'bg-slate-900/50 border-slate-700/50'
                )}
              >
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  {index === 0 ? (
                    <Medal size={48} className="text-yellow-400" />
                  ) : index === 1 ? (
                    <Medal size={40} className="text-slate-300" />
                  ) : index === 2 ? (
                    <Medal size={40} className="text-amber-600" />
                  ) : (
                    <span className="text-3xl font-black text-slate-500">#{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={cn(
                    'text-2xl font-bold',
                    index === 0 ? 'text-yellow-400' : 'text-white'
                  )}>
                    {team.name}
                  </h3>
                </div>

                <div className="text-right">
                  <div className={cn(
                    'text-4xl font-black',
                    index === 0 ? 'text-yellow-400' : 'text-white'
                  )}>
                    {team.score}
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Điểm</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl rounded-full transition-colors border border-slate-600"
          >
            <RotateCcw size={24} />
            CHƠI LẠI TỪ ĐẦU
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
