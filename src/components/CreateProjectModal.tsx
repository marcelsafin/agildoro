import React, { useState } from 'react';
import { CreateProjectModalProps } from '../types';

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [days, setDays] = useState('');
  const [hours, setHours] = useState('');
  const [errors, setErrors] = useState<{ title: boolean; time: boolean }>({
    title: false,
    time: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseInt(days) || 0;
    const h = parseInt(hours) || 0;
    const totalMinutes = (d * 24 + h) * 60;

    const newErrors = {
      title: !title.trim(),
      time: totalMinutes <= 0,
    };

    setErrors(newErrors);

    if (!newErrors.title && !newErrors.time) {
      onCreate(title, d, h);
      setTitle('');
      setDays('');
      setHours('');
      setErrors({ title: false, time: false });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-black border border-zinc-800/50 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-[380px] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
            New Project
          </h2>
          <button
            onClick={onClose}
            className="p-1 -mr-1 text-zinc-600 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
          <div>
            <label className="block text-[10px] uppercase text-zinc-600 font-bold tracking-[0.2em] mb-3">
              Project Name
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
              }}
              className={`w-full bg-zinc-950 border ${errors.title ? 'border-red-900' : 'border-zinc-900'} rounded-xl p-4 text-sm text-white focus:border-zinc-700 outline-none transition-all placeholder:text-zinc-800`}
              placeholder="e.g. Website Redesign"
            />
            {errors.title && (
              <span className="text-[10px] text-red-500/50 mt-2 block">
                Project name is required
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase text-zinc-600 font-bold tracking-[0.2em] mb-3">
                Est. Days
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => {
                    setDays(e.target.value);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: false }));
                  }}
                  className={`w-full bg-zinc-950 border ${errors.time ? 'border-red-900' : 'border-zinc-900'} rounded-xl p-4 pr-12 text-sm text-white focus:border-zinc-700 outline-none transition-all`}
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-zinc-700 font-bold uppercase tracking-wider">
                  h/d
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-zinc-600 font-bold tracking-[0.2em] mb-3">
                Est. Hours
              </label>
              <input
                type="number"
                min="-1"
                value={hours}
                onChange={(e) => {
                  let val = parseInt(e.target.value) || 0;
                  let currentDays = parseInt(days) || 0;

                  if (val >= 24) {
                    val = 0;
                    currentDays += 1;
                    setDays(currentDays.toString());
                  } else if (val < 0) {
                    if (currentDays > 0) {
                      val = 23;
                      currentDays -= 1;
                      setDays(currentDays.toString());
                    } else {
                      val = 0;
                    }
                  }
                  setHours(val.toString());
                  if (errors.time) setErrors((prev) => ({ ...prev, time: false }));
                }}
                className={`w-full bg-zinc-950 border ${errors.time ? 'border-red-900' : 'border-zinc-900'} rounded-xl p-4 text-sm text-white focus:border-zinc-700 outline-none transition-all`}
                placeholder="0"
              />
            </div>
          </div>
          {errors.time && (
            <span className="text-[10px] text-red-500/50 block">
              Total time must be greater than 0
            </span>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 font-bold text-[11px] uppercase tracking-[0.3em] py-5 rounded-xl transition-all active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
