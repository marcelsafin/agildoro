import React, { useState, Suspense } from 'react';
import { useProjectData } from './hooks/useProjectData';
import { useTimer } from './hooks/useTimer';
import { Navigation } from './components/Navigation';
import { CreateProjectModal } from './components/CreateProjectModal';
import { MiniTimer } from './components/MiniTimer';
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
    updateTaskTitle,
    updateSubtaskTitle,
    moveTask,
    setActiveTaskId,
    addTimeBudget,
    updateProjectTitle,
  } = useProjectData();

  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sidebar is open in kanban mode, closed in timer mode
  const isSidebarOpen = currentView === 'kanban';

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const handleSequenceComplete = () => {
    if (activeTaskId) {
      updateTaskStatus(activeTaskId, 'done');
      setActiveTaskId(null);
      setCurrentView('kanban');
    }
  };

  const timer = useTimer({
    onSessionComplete: (mins) => addTimeBudget(mins),
    onSequenceComplete: handleSequenceComplete,
  });

  const handleStartFocus = (taskId: string) => {
    setActiveTaskId(taskId);
    setCurrentView('timer');
    timer.resetTimer(true);
  };

  const activeTask = projects.flatMap((p) => p.tasks).find((t) => t.id === activeTaskId);

  return (
    <div className="flex h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
      <Navigation
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          setCurrentView('kanban');
        }}
        onAddProject={() => setIsModalOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onDeleteProject={deleteProject}
        onUpdateProjectTitle={updateProjectTitle}
        isOpen={isSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
        {/* Mini Timer Overlay */}
        {currentView !== 'timer' && timer.isActive && (
          <MiniTimer
            timeLeft={timer.timeLeft}
            mode={timer.mode}
            isActive={timer.isActive}
            onClick={() => setCurrentView('timer')}
          />
        )}

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-zinc-500">Loading...</div>
          }
        >
          {currentView === 'kanban' ? (
            activeProject ? (
              <KanbanView
                project={activeProject}
                onAddTask={addTask}
                onDelete={deleteTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                onUpdateTaskTitle={updateTaskTitle}
                onUpdateSubtaskTitle={updateSubtaskTitle}
                onStartFocus={handleStartFocus}
                onMoveTask={(taskId, newStatus, targetIndex) => {
                  if (taskId === activeTaskId && newStatus === 'done') {
                    timer.resetTimer();
                    setActiveTaskId(null);
                  }
                  moveTask(taskId, newStatus, targetIndex);
                }}
                currentSessionMinutes={
                  timer.mode === 'work' && activeTask
                    ? Math.max(0, (timer.totalDuration - timer.timeLeft) / 60)
                    : 0
                }
                activeTaskId={activeTaskId}
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
            )
          ) : currentView === 'timer' ? (
            <TimerView
              activeTask={activeTask}
              timeLeft={timer.timeLeft}
              isActive={timer.isActive}
              mode={timer.mode}
              totalDuration={timer.totalDuration}
              onToggleTimer={timer.toggleTimer}
              onToggleSubtask={toggleSubtask}
              onClearActiveTask={() => {
                timer.resetTimer();
                setActiveTaskId(null);
                setCurrentView('kanban');
              }}
              onClose={() => setCurrentView('kanban')}
            />
          ) : null}
        </Suspense>
      </main>

      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
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
