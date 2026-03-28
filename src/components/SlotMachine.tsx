import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils';

type WheelItem = { label: string, value: number, type: 'points' | 'action' };

interface SlotMachineProps {
  items: WheelItem[];
  onFinish: (result: WheelItem) => void;
  type: 'reward' | 'penalty';
  title: string;
}

export function SlotMachine({ items, onFinish, type, title }: SlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<WheelItem | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first interaction or mount
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playTickSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const playResultSound = (isReward: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = isReward ? 'triangle' : 'sawtooth';
    
    if (isReward) {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.4);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
    }
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const spin = () => {
    if (isSpinning || result) return;
    setIsSpinning(true);
    
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    const prizeIndex = Math.floor(Math.random() * items.length);
    const totalSpins = 30 + prizeIndex; // Spin at least 30 times
    let currentSpin = 0;

    const spinInterval = setInterval(() => {
      currentSpin++;
      setCurrentIndex(prev => (prev + 1) % items.length);
      playTickSound();
      
      if (currentSpin >= totalSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setResult(items[prizeIndex]);
        playResultSound(type === 'reward');
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 bg-slate-800 p-12 rounded-3xl border-4 border-slate-700 shadow-2xl w-full max-w-2xl mx-auto">
      <h2 className={cn("text-4xl font-black uppercase tracking-wider", type === 'reward' ? 'text-yellow-400' : 'text-red-500')}>
        {title}
      </h2>
      
      <div className="relative w-full h-40 bg-slate-900 rounded-2xl border-4 border-slate-600 overflow-hidden flex items-center justify-center shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900 z-10 pointer-events-none"></div>
        <div className="text-3xl md:text-4xl font-black text-center z-0 px-4">
          <span className={cn(type === 'reward' ? 'text-emerald-400' : 'text-red-400')}>
            {items[currentIndex].label}
          </span>
        </div>
      </div>

      {!result ? (
        <div className="flex gap-4">
          <button 
            onClick={spin} 
            disabled={isSpinning}
            className={cn(
              "px-10 py-5 font-black text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100",
              type === 'reward' ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900" : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
            )}
          >
            {isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY!'}
          </button>
          {!isSpinning && (
            <button
              onClick={() => onFinish({ label: 'Bỏ qua', value: 0, type: 'action' })}
              className="px-6 py-5 font-bold text-xl bg-slate-700 hover:bg-slate-600 text-white rounded-2xl shadow-lg transition-colors"
            >
              Bỏ qua
            </button>
          )}
        </div>
      ) : (
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
          <div className="text-3xl font-bold text-white">
            Kết quả: <span className={cn(type === 'reward' ? 'text-emerald-400' : 'text-red-400')}>{result.label}</span>
          </div>
          <button
            onClick={() => onFinish(result)}
            className="px-8 py-4 font-bold text-xl bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg transition-colors"
          >
            Tiếp tục
          </button>
        </motion.div>
      )}
    </div>
  );
}
