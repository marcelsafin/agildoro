import React from 'react';
import { Project, TaskStatus } from '../types';

interface KanbanViewProps {
  project: Project;
  onAddTask: (title: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onStartFocus: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus, targetIndex: number) => void;
  onDeleteProject: () => void;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'Active' },
  { id: 'done', label: 'Done' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  project,
  onAddTask,
  onUpdateStatus,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartFocus,
  onMoveTask: _onMoveTask,
  onDeleteProject,
}) => {
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  // For Drag and Drop
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<TaskStatus | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedTaskId) {
      // Basic drop to end of column
      // Ideally we calculate index based on mouse Y
      onUpdateStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const { spentHours, totalHours, percentUsed } = React.useMemo(() => {
    const spent = (project.timeSpentMinutes / 60).toFixed(1);
    const total = (project.totalTimeMinutes / 60).toFixed(1);
    const percent = Math.min(100, (project.timeSpentMinutes / project.totalTimeMinutes) * 100);
    return { spentHours: spent, totalHours: total, percentUsed: percent };
  }, [project.timeSpentMinutes, project.totalTimeMinutes]);

  return (
    <div className="h-full flex flex-col">
      {/* Header / Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">{project.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${percentUsed > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {spentHours} / {totalHours}h
            </span>
          </div>
        </div>
        <button
          onClick={onDeleteProject}
          className="text-xs text-zinc-600 hover:text-red-500 transition-colors"
        >
          Delete Project
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const tasks = project.tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`flex-1 min-w-[280px] flex flex-col rounded-lg bg-zinc-900/50 border ${dragOverColumn === col.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-800/50'}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-3 border-b border-zinc-800/50 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {col.label}
                </h3>
                <span className="text-xs text-zinc-600 font-mono">{tasks.length}</span>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="group bg-zinc-900 border border-zinc-800 p-3 rounded hover:border-zinc-700 cursor-move shadow-sm active:cursor-grabbing"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-zinc-200 leading-snug">{task.title}</p>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400"
                      >
                        &times;
                      </button>
                    </div>

                    {/* Subtasks */}
                    {(task.subtasks.length > 0 || isAdding) && (
                      <div className="space-y-1 mt-3 pl-1 border-l-2 border-zinc-800">
                        {task.subtasks.map((st) => (
                          <div key={st.id} className="flex items-center gap-2 text-xs group/sub">
                            <button
                              onClick={() => onToggleSubtask(task.id, st.id)}
                              className={`w-3 h-3 border rounded-sm flex items-center justify-center ${st.completed ? 'bg-zinc-700 border-zinc-700' : 'border-zinc-600'}`}
                            >
                              {st.completed && (
                                <svg className="w-2 h-2 text-white" viewBox="0 0 24 24">
                                  <path
                                    fill="currentColor"
                                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                  />
                                </svg>
                              )}
                            </button>
                            <span
                              className={`flex-1 truncate ${st.completed ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}
                            >
                              {st.title}
                            </span>
                            <button
                              onClick={() => onDeleteSubtask(task.id, st.id)}
                              className="opacity-0 group-hover/sub:opacity-100 text-[10px] text-zinc-600 hover:text-red-400"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/50">
                      <div className="flex gap-2">
                        {col.id !== 'done' && (
                          <button
                            onClick={() => onStartFocus(task.id)}
                            className="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                            </svg>
                            Focus
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const title = prompt('Subtask title:');
                            if (title) onAddSubtask(task.id, title);
                          }}
                          className="text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300"
                        >
                          + Sub
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {col.id === 'todo' && (
                  <div className="pt-2">
                    {isAdding ? (
                      <form onSubmit={handleSubmit} className="space-y-2">
                        <input
                          autoFocus
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Task title..."
                          className="w-full bg-zinc-900 border border-blue-500/50 rounded p-2 text-sm text-white outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-xs text-white py-1 rounded hover:bg-blue-500"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="flex-1 bg-zinc-800 text-xs text-zinc-400 py-1 rounded hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-2 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded hover:border-zinc-700 hover:text-zinc-400 hover:bg-zinc-900/50 transition-all"
                      >
                        + Add Task
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
