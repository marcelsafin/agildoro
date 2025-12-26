import React from 'react';
import { TaskStatus, KanbanViewProps } from '../types';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'Active' },
  { id: 'done', label: 'Done' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  project,
  onAddTask,

  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartFocus,
  onMoveTask,
  onUpdateTaskTitle,
  onUpdateSubtaskTitle,
  currentSessionMinutes,
  activeTaskId,
}) => {
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  // Inline editing state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');
  const [addingSubtaskId, setAddingSubtaskId] = React.useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = React.useState('');

  // For Drag and Drop
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<TaskStatus | null>(null);
  const [dropIndicator, setDropIndicator] = React.useState<{
    taskId: string;
    position: 'before' | 'after';
  } | null>(null);

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
    setAddingSubtaskId(null);
  };

  const saveEditing = (taskId: string, subtaskId?: string) => {
    if (subtaskId) {
      if (editValue.trim()) onUpdateSubtaskTitle(taskId, subtaskId, editValue);
    } else {
      if (editValue.trim()) onUpdateTaskTitle(taskId, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleSubtaskSubmit = (taskId: string) => {
    if (subtaskTitle.trim()) {
      onAddSubtask(taskId, subtaskTitle);
      setSubtaskTitle('');
      setAddingSubtaskId(null);
    }
  };

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

  const handleTaskDragOver = (e: React.DragEvent, task: { id: string }, status: TaskStatus) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling to column
    setDragOverColumn(status);

    if (draggedTaskId === task.id) {
      setDropIndicator(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';
    setDropIndicator({ taskId: task.id, position });
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const indicator = dropIndicator;
    setDropIndicator(null);

    if (draggedTaskId) {
      // Calculate new index based on indicator
      let targetIndex = -1; // Default append
      if (indicator) {
        const targetTask = project.tasks.find((t) => t.id === indicator.taskId);
        if (targetTask) {
          // We need the index within the specific column
          const columnTasks = project.tasks.filter((t) => t.status === status);
          const indexInColumn = columnTasks.findIndex((t) => t.id === indicator.taskId);
          if (indexInColumn !== -1) {
            targetIndex = indicator.position === 'before' ? indexInColumn : indexInColumn + 1;
          }
        }
      }

      onMoveTask(draggedTaskId, status, targetIndex);
      setDraggedTaskId(null);
    }
  };

  const { statsString, percentUsed } = React.useMemo(() => {
    const spentMinutes = project.timeSpentMinutes + (currentSessionMinutes || 0);
    const totalMinutes = project.totalTimeMinutes;

    const formatTime = (minutes: number) => {
      const d = Math.floor(minutes / (24 * 60));
      const h = Math.floor((minutes % (24 * 60)) / 60);
      if (d > 0) return `${d}d ${h}h`;
      return `${Math.round(h * 10) / 10}h`;
    };

    const spentStr = formatTime(spentMinutes);
    const totalStr = formatTime(totalMinutes);

    const percent = Math.min(100, (spentMinutes / totalMinutes) * 100);
    return { statsString: `${spentStr} / ${totalStr}`, percentUsed: percent };
  }, [project.timeSpentMinutes, project.totalTimeMinutes, currentSessionMinutes]);

  return (
    <div className="h-full flex flex-col p-6">
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
            <span className="text-xs text-zinc-500 font-mono">{statsString}</span>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const tasks = project.tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`flex-1 min-w-[320px] flex flex-col rounded-lg bg-zinc-900/50 border transition-colors ${dragOverColumn === col.id ? 'border-blue-500/30 bg-blue-500/5' : 'border-zinc-800/50'}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-3 border-b border-zinc-800/50 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {col.label}
                </h3>
                <span className="text-xs text-zinc-600 font-mono">{tasks.length}</span>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto relative">
                {tasks.length === 0 && draggedTaskId && (
                  <div
                    className={`h-24 border-2 border-dashed rounded flex items-center justify-center text-sm transition-all duration-300 ${dragOverColumn === col.id ? 'border-blue-500/50 bg-blue-500/5 text-blue-400' : 'border-zinc-800/50 text-zinc-700'}`}
                  >
                    Drop me here
                  </div>
                )}

                {tasks.map((task) => (
                  <React.Fragment key={task.id}>
                    {/* Drop Indicator Before */}
                    {dropIndicator?.taskId === task.id && dropIndicator.position === 'before' && (
                      <div className="h-0.5 w-full bg-blue-500 rounded-full my-1 animate-pulse" />
                    )}

                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onDragOver={(e) => handleTaskDragOver(e, task, col.id)}
                      className={`group bg-zinc-900 border border-zinc-800 p-3 rounded hover:border-zinc-700 cursor-move shadow-sm active:cursor-grabbing relative transition-all duration-300 ${draggedTaskId === task.id ? 'opacity-20 scale-95' : 'opacity-100'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        {editingId === task.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEditing(task.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(task.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="text-sm bg-zinc-950 text-white w-full border border-blue-500 rounded px-1 outline-none"
                          />
                        ) : (
                          <p
                            onClick={() => startEditing(task.id, task.title)}
                            className="text-sm text-zinc-200 leading-snug cursor-text hover:text-white"
                          >
                            {task.title}
                          </p>
                        )}

                        <button
                          onClick={() => onDelete(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 ml-2"
                        >
                          &times;
                        </button>
                      </div>

                      {/* Subtasks */}
                      {(task.subtasks.length > 0 || addingSubtaskId === task.id) && (
                        <div className="space-y-1 mt-3 pl-0.5">
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

                              {editingId === st.id ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => saveEditing(task.id, st.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditing(task.id, st.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                  className="flex-1 bg-zinc-950 text-white border border-blue-500 rounded px-1 outline-none"
                                />
                              ) : (
                                <span
                                  onClick={() => startEditing(st.id, st.title)}
                                  className={`flex-1 truncate cursor-text hover:text-zinc-300 ${st.completed ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}
                                >
                                  {st.title}
                                </span>
                              )}

                              <button
                                onClick={() => onDeleteSubtask(task.id, st.id)}
                                className="opacity-0 group-hover/sub:opacity-100 text-[10px] text-zinc-600 hover:text-red-400"
                              >
                                x
                              </button>
                            </div>
                          ))}

                          {addingSubtaskId === task.id && (
                            <div className="flex items-center gap-2 mt-1 animate-in fade-in zoom-in-95 duration-200">
                              <div className="w-3 h-3 border border-zinc-700 rounded-sm border-dashed"></div>
                              <input
                                autoFocus
                                type="text"
                                placeholder="Subtask..."
                                value={subtaskTitle}
                                onChange={(e) => setSubtaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSubtaskSubmit(task.id);
                                  if (e.key === 'Escape') setAddingSubtaskId(null);
                                }}
                                onBlur={() => setAddingSubtaskId(null)}
                                className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-600 outline-none"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/50">
                        <div className="flex gap-2">
                          {col.id === 'in-progress' && (
                            <button
                              onClick={() => !activeTaskId && onStartFocus(task.id)}
                              disabled={!!activeTaskId && activeTaskId !== task.id}
                              title={
                                activeTaskId && activeTaskId !== task.id
                                  ? 'Complete current session first'
                                  : 'Start Focus Session'
                              }
                              className={`text-[10px] uppercase font-bold flex items-center gap-1 ${
                                activeTaskId && activeTaskId !== task.id
                                  ? 'text-zinc-600 cursor-not-allowed'
                                  : 'text-blue-500 hover:text-blue-400'
                              }`}
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
                              {activeTaskId === task.id ? 'Active' : 'Focus'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setAddingSubtaskId(task.id);
                              setSubtaskTitle('');
                            }}
                            className="text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300"
                          >
                            + Sub
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Drop Indicator After */}
                    {dropIndicator?.taskId === task.id && dropIndicator.position === 'after' && (
                      <div className="h-0.5 w-full bg-blue-500 rounded-full my-1 animate-pulse" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Add Task Button at Bottom of To Do */}
              {col.id === 'todo' && (
                <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/30">
                  {isAdding ? (
                    <form onSubmit={handleSubmit} className="space-y-2">
                      <input
                        autoFocus
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Task title..."
                        className="w-full bg-zinc-950 border border-blue-500/50 rounded p-2 text-sm text-white outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-xs text-white py-1.5 rounded hover:bg-blue-500 font-medium"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAdding(false)}
                          className="flex-1 bg-zinc-800 text-xs text-zinc-400 py-1.5 rounded hover:bg-zinc-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="w-full py-2 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded hover:border-zinc-700 hover:text-zinc-400 hover:bg-zinc-900 transition-all"
                    >
                      + Add Task
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
