import React from 'react';
import { ConfirmModalProps } from '../types';

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 animate-in fade-in duration-500">
      <div className="bg-black border border-zinc-800/50 rounded-3xl p-10 flex flex-col items-center animate-in zoom-in-95 duration-500 shadow-2xl">
        <div className="mb-8 select-none text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em] leading-relaxed">
            Do you want to delete your project?
          </p>
        </div>

        <div className="flex items-center gap-16">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="group flex flex-col items-center"
          >
            <span className="text-red-500/70 group-hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-[0.4em] py-2">
              Yes
            </span>
            <div className="h-px w-0 bg-red-500 group-hover:w-full transition-all duration-500" />
          </button>

          <button onClick={onClose} className="group flex flex-col items-center">
            <span className="text-zinc-600 group-hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.4em] py-2">
              No
            </span>
            <div className="h-px w-0 bg-white group-hover:w-full transition-all duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
