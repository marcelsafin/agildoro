import React from 'react';
import { TimerViewProps } from '../types';

export const TimerView: React.FC<TimerViewProps> = ({
  activeTask,
  timeLeft,
  isActive,
  mode,
  totalDuration,
  onToggleTimer,
  onToggleSubtask,
  onClearActiveTask,
  onClose,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Prevent division by zero if totalDuration is somehow 0
  const validDuration = totalDuration || 1;
  const progress = (validDuration - timeLeft) / validDuration;
  const offset = circumference - progress * circumference;

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-[77px] flex-shrink-0 flex items-center px-8 relative">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`flex flex-col transition-opacity duration-300 ${activeTask ? 'opacity-100' : 'opacity-0'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-0.5">
                Current Task
              </span>
              <span className="text-xs font-semibold text-blue-500 truncate max-w-[400px]">
                {activeTask?.title || 'None'}
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-zinc-500 hover:text-white transition-all hover:rotate-90 duration-500"
              title="Back to board"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex w-full max-w-6xl mx-auto px-8 overflow-hidden relative">
        {/* Left Side: Subtask List */}
        <div
          className={`hidden lg:flex flex-col w-64 pt-8 pb-12 flex-shrink-0 transition-all duration-700 ${activeTask ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Checklist
            </span>
          </div>

          <div className="relative space-y-4 overflow-y-auto custom-scrollbar-subtle pb-4 pr-4">
            {activeTask?.subtasks.map((st) => (
              <button
                key={st.id}
                onClick={() =>
                  onToggleSubtask && activeTask && onToggleSubtask(activeTask.id, st.id)
                }
                className="group flex items-center gap-4 text-left w-full relative"
              >
                <div
                  className={`w-2 h-2 rounded-full border transition-all flex-shrink-0 ${st.completed ? 'bg-blue-600 border-blue-600' : 'bg-zinc-950 border-zinc-800 group-hover:border-zinc-500'}`}
                />
                <span
                  className={`text-[12px] font-medium transition-all duration-300 ${st.completed ? 'text-zinc-600 line-through' : 'text-zinc-400 group-hover:text-zinc-200'}`}
                >
                  {st.title}
                </span>
              </button>
            ))}
            {activeTask && (!activeTask.subtasks || activeTask.subtasks.length === 0) && (
              <p className="text-[11px] text-zinc-700 italic">No subtasks defined</p>
            )}
          </div>
        </div>

        {/* Center: Hero Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="relative w-80 h-80 flex items-center justify-center mb-12 flex-shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#18181b"
                strokeWidth="0.5"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="1"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`${mode === 'work' ? 'text-blue-500' : 'text-emerald-500'} transition-all duration-1000 ease-linear`}
              />
            </svg>

            <div className="text-center z-10 select-none">
              <div className="text-[80px] font-extralight tabular-nums text-white leading-none tracking-tighter">
                {formatTime(timeLeft)}
              </div>
              <div
                className={`text-[10px] font-bold uppercase tracking-[0.4em] mt-6 transition-colors duration-500 ${mode === 'work' ? 'text-blue-500/40' : 'text-emerald-500/40'}`}
              >
                {isActive ? (mode === 'work' ? 'Focusing' : 'Resting') : 'Paused'}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={onToggleTimer}
              className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all duration-300 active:scale-95"
            >
              {isActive ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Balancing Spacer */}
        <div className="hidden lg:block w-64 flex-shrink-0" />
      </div>

      {/* Bottom Footer Area */}
      <div className="h-[81px] flex-shrink-0 flex items-center justify-center relative">
        <div className="w-full max-w-6xl mx-auto flex justify-center">
          {onClearActiveTask && activeTask && (
            <button onClick={onClearActiveTask} className="group flex flex-col items-center">
              <span className="text-zinc-600 group-hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-[0.2em] py-1">
                Stop Session
              </span>
              <div className="h-px w-0 bg-red-500 group-hover:w-full transition-all duration-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
