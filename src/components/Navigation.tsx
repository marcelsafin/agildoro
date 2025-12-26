import React, { useState } from 'react';
import { Project, NavigationProps } from '../types';
import { ConfirmModal } from './ConfirmModal';

export const Navigation: React.FC<NavigationProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onAddProject,
  currentView,
  onViewChange,
  onDeleteProject,
  onUpdateProjectTitle,
  isOpen,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const startEditing = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditValue(project.title);
  };

  const saveEditing = () => {
    if (editingId && editValue.trim()) {
      onUpdateProjectTitle(editingId, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  return (
    <>
      <ConfirmModal
        isOpen={!!idToDelete}
        onClose={() => setIdToDelete(null)}
        onConfirm={() => idToDelete && onDeleteProject(idToDelete)}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will remove all tasks and session history permanently."
        confirmLabel="Delete Project"
        isDestructive
      />

      {/* Mobile Bottom Navigation - Projects List */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-900 flex items-center overflow-x-auto px-4 gap-4 z-50">
        <button
          onClick={onAddProject}
          className="flex flex-col items-center justify-center min-w-[3rem] text-zinc-500"
        >
          <div className="w-6 h-6 rounded-full border border-dashed border-zinc-600 flex items-center justify-center">
            <span className="text-sm">+</span>
          </div>
          <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">New</span>
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProject(p.id)}
            className={`flex flex-col items-center justify-center whitespace-nowrap px-2 transition-colors ${
              activeProjectId === p.id && currentView === 'kanban'
                ? 'text-blue-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-wider">{p.title}</span>
          </button>
        ))}
        {/* Always show timer if active */}
        <button
          onClick={() => onViewChange('timer')}
          className={`flex flex-col items-center justify-center ml-auto pl-4 border-l border-zinc-900 ${
            currentView === 'timer' ? 'text-blue-500' : 'text-zinc-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-[10px] uppercase font-bold tracking-wider">Timer</span>
        </button>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-500 ease-in-out border-r border-zinc-900 flex-shrink-0 ${
          isOpen ? 'w-64 opacity-100 p-6 pt-0' : 'w-0 opacity-0 p-0 pointer-events-none'
        } bg-black h-full overflow-hidden`}
      >
        <div className="h-[77px] flex items-center justify-between shrink-0">
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
            Agildoro<span className="text-blue-500">.</span>
          </span>
        </div>
        <div className="h-px bg-zinc-900 w-full mb-8" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            My Projects
          </span>
          <button
            onClick={onAddProject}
            className="p-1.5 -mr-1.5 text-zinc-600 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col space-y-1 w-full flex-1 overflow-y-auto custom-scrollbar-subtle">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all w-full text-left cursor-pointer ${
                activeProjectId === p.id && currentView === 'kanban'
                  ? 'bg-zinc-800/50 text-white'
                  : 'text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300'
              }`}
            >
              {editingId === p.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEditing();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-black text-white text-sm border border-zinc-800 rounded-lg px-2 py-1 outline-none focus:border-zinc-600 transition-all font-light"
                />
              ) : (
                <>
                  <div className="flex items-center space-x-3 flex-1 min-w-0 mr-4">
                    <svg
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${activeProjectId === p.id && currentView === 'kanban' ? 'text-blue-500' : 'text-zinc-700 group-hover:text-zinc-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium truncate tracking-tight">{p.title}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => startEditing(e, p)}
                      className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIdToDelete(p.id);
                      }}
                      className="p-1.5 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {projects.length === 0 && (
            <div className="text-[10px] text-zinc-700 text-center py-8 uppercase tracking-[0.2em] font-bold">
              No projects
            </div>
          )}
        </nav>

        <div className="mt-4 pt-4 border-t border-zinc-900">
          <button
            onClick={() => onViewChange('timer')}
            className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all w-full text-left ${
              currentView === 'timer'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/30'
            }`}
          >
            <svg
              className="w-5 h-5 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium tracking-tight">Focus Timer</span>
          </button>
        </div>
      </aside>
    </>
  );
};
