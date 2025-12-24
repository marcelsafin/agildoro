import React, { useState } from 'react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, days: number, hours: number) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [days, setDays] = useState('0');
  const [hours, setHours] = useState('0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate(title, parseInt(days) || 0, parseInt(hours) || 0);

    // Reset
    setTitle('');
    setDays('0');
    setHours('0');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-white">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">
              Project Name
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              placeholder="e.g. Portfolio"
            />
          </div>

          {/* Time Budget Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">
                Est. Days
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-600">8h/d</span>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
