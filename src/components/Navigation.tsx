import React from 'react';
import { Project, ViewType } from '../types';

interface NavigationProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onAddProject,
  currentView,
  onViewChange,
}) => {
  return (
    <>
      {/* Mobile Bottom Navigation - Projects List */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-zinc-800 flex items-center overflow-x-auto px-4 gap-4 z-50">
        <button
          onClick={onAddProject}
          className="flex flex-col items-center justify-center min-w-[3rem] text-zinc-500"
        >
          <div className="w-6 h-6 rounded-full border border-dashed border-zinc-500 flex items-center justify-center">
            <span className="text-sm">+</span>
          </div>
          <span className="text-[10px] mt-1">New</span>
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProject(p.id)}
            className={`flex flex-col items-center justify-center whitespace-nowrap px-2 ${
              activeProjectId === p.id && currentView === 'kanban'
                ? 'text-blue-500'
                : 'text-zinc-500'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <span className="text-[10px] uppercase font-semibold">{p.title}</span>
          </button>
        ))}
        {/* Always show timer if active */}
        <button
          onClick={() => onViewChange('timer')}
          className={`flex flex-col items-center justify-center ml-auto pl-4 border-l border-zinc-800 ${
            currentView === 'timer' ? 'text-red-500' : 'text-zinc-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-[10px] uppercase font-semibold">Timer</span>
        </button>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-zinc-900 border-r border-zinc-800 p-6 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white">FocusLoop</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            My Projects
          </span>
          <button onClick={onAddProject} className="text-zinc-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col space-y-1 w-full flex-1 overflow-y-auto">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors w-full text-left group ${
                activeProjectId === p.id && currentView === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <svg
                  className="w-4 h-4 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium truncate">{p.title}</span>
              </div>
            </button>
          ))}
          {projects.length === 0 && (
            <div className="text-xs text-zinc-600 text-center py-4 italic">No projects yet</div>
          )}
        </nav>

        <div className="mt-4 pt-4 border-t border-zinc-800">
          <button
            onClick={() => onViewChange('timer')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full text-left ${
              currentView === 'timer'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">Focus Timer</span>
          </button>
        </div>

        <div className="mt-auto pt-4">
          <p className="text-xs text-zinc-500">v1.1.0</p>
        </div>
      </aside>
    </>
  );
};
