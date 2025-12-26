import React from 'react';
import { MiniTimerProps } from '../types';

export const MiniTimer: React.FC<MiniTimerProps> = ({ timeLeft, mode, isActive, onClick }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <button
      onClick={onClick}
      className="fixed top-6 right-8 z-50 flex items-center space-x-4 px-5 py-2.5 rounded-full border border-zinc-800 bg-black/60 backdrop-blur-xl transition-all duration-500 hover:border-zinc-700 hover:bg-zinc-900/50 group active:scale-95 cursor-pointer"
    >
      <div
        className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'animate-pulse' : ''} ${mode === 'work' ? 'bg-blue-500' : 'bg-emerald-500'}`}
      />
      <span className="font-light text-base tabular-nums text-white tracking-tight">
        {formatTime(timeLeft)}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 group-hover:text-zinc-400 transition-colors">
        {mode === 'work' ? 'Focus' : 'Break'}
      </span>
    </button>
  );
};
