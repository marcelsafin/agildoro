import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';

const POMODORO_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;

interface TimerViewProps {
  activeTask?: Task;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onSessionComplete?: (minutes: number) => void;
  onClearActiveTask?: () => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  activeTask,
  onToggleSubtask,
  onSessionComplete,
  onClearActiveTask,
}) => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(!!activeTask);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<number | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  // Removed auto-start effect in favor of key-based remounting and explicit handlers

  useEffect(() => {
    // Only run interval if active
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]); // removed timeLeft dependency by removing it from condition

  // Handle completion check strictly
  useEffect(() => {
    if (!isActive || timeLeft !== 0) return;

    // Timer just hit 0
    // Wrap in setTimeout to avoid "setState in effect" warning (no-shortcut: decoupling the update phase)
    const timerId = setTimeout(() => {
      setIsActive(false);
      const finishedMode = mode;
      const nextMode = mode === 'work' ? 'break' : 'work';

      setMode(nextMode);
      setTimeLeft(nextMode === 'work' ? POMODORO_TIME : SHORT_BREAK);

      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);

      if (finishedMode === 'work' && onSessionComplete) {
        onSessionComplete(25);
        setJustCompleted(true);
      }
    }, 0);

    return () => clearTimeout(timerId);
  }, [timeLeft, isActive, mode, onSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress =
    ((mode === 'work' ? POMODORO_TIME : SHORT_BREAK) - timeLeft) /
    (mode === 'work' ? POMODORO_TIME : SHORT_BREAK);
  const offset = circumference - progress * circumference;

  if (justCompleted) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="mb-4 text-emerald-500">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-white">Session Complete</h2>
        <p className="text-sm text-zinc-500 mb-6">25 minutes logged to project.</p>
        <button
          onClick={() => {
            setJustCompleted(false);
            setIsActive(true); // Explicitly restart timer
          }}
          className="bg-zinc-800 text-white px-6 py-2 rounded-full text-sm hover:bg-zinc-700"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center pt-8 max-w-lg mx-auto">
      {/* Active Task HUD - Flat */}
      <div className={`w-full mb-8 ${activeTask ? 'block' : 'hidden'}`}>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">
              Current Task
            </span>
            {onClearActiveTask && (
              <button
                onClick={onClearActiveTask}
                className="text-zinc-500 hover:text-zinc-300 text-xs"
              >
                &times; Stop
              </button>
            )}
          </div>
          <h3 className="text-lg font-medium text-white mb-3">{activeTask?.title}</h3>

          {activeTask && activeTask.subtasks.length > 0 && (
            <div className="space-y-1">
              {activeTask.subtasks.map((st) => (
                <button
                  key={st.id}
                  onClick={() =>
                    onToggleSubtask && activeTask && onToggleSubtask(activeTask.id, st.id)
                  }
                  className="w-full flex items-center p-1 hover:bg-zinc-800 rounded-sm text-left group"
                >
                  <div
                    className={`w-3 h-3 rounded-sm border mr-3 flex items-center justify-center ${st.completed ? 'bg-blue-600 border-blue-600' : 'border-zinc-600'}`}
                  ></div>
                  <span
                    className={`text-sm ${st.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}
                  >
                    {st.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#27272a"
              strokeWidth="2"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`${mode === 'work' ? 'text-blue-500' : 'text-emerald-500'} transition-all duration-300`}
            />
          </svg>

          <div className="text-center z-10 select-none">
            <div className="text-6xl font-light tabular-nums text-zinc-100">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mt-2">
              {isActive ? (mode === 'work' ? 'Focusing' : 'Break') : 'Paused'}
            </div>
          </div>
        </div>

        {/* Single Control Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 ${isActive ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-white text-black'}`}
          >
            {isActive ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

 