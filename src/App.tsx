import React, { useState, Suspense } from 'react';
import { useProjectData } from './hooks/useProjectData';
import { Navigation } from './components/Navigation';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ViewType } from './types';

// Lazy load views for performance
const KanbanView = React.lazy(() =>
  import('./components/KanbanView').then((module) => ({ default: module.KanbanView }))
);
const TimerView = React.lazy(() =>
  import('./components/TimerView').then((module) => ({ default: module.TimerView }))
);

function App() {
  const {
    projects,
    activeProjectId,
    activeTaskId,
    setActiveProjectId,
    createProject,
    deleteProject,
    addTask,
    updateTaskStatus,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    moveTask,
    setActiveTaskId,
    addTimeBudget,
  } = useProjectData();

  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;
  const activeTaskObj = projects.flatMap((p) => p.tasks).find((t) => t.id === activeTaskId);

  const handleStartFocus = (taskId: string) => {
    setActiveTaskId(taskId);
    setCurrentView('timer');
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
      <Navigation
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onAddProject={() => setIsModalOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-zinc-500">Loading...</div>
          }
        >
          {currentView === 'kanban' && activeProject ? (
            <KanbanView
              project={activeProject}
              onAddTask={addTask}
              onUpdateStatus={updateTaskStatus}
              onDelete={deleteTask}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
              onStartFocus={handleStartFocus}
              onMoveTask={moveTask}
              onDeleteProject={() => deleteProject(activeProject.id)}
            />
          ) : currentView === 'timer' ? (
            <TimerView
              activeTask={activeTaskObj}
              onSessionComplete={(mins) => addTimeBudget(mins)}
              onToggleSubtask={toggleSubtask}
              onClearActiveTask={() => setActiveTaskId(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
              <p className="text-zinc-400">Select a project to get started</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white text-sm"
              >
                Create Project
              </button>
            </div>
          )}
        </Suspense>
      </main>

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
          onCreate={(title, days, hours) => {
            createProject(title, days, hours);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
