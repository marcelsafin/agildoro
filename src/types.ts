export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  subtasks: Subtask[];
}

export interface Project {
  id: string;
  title: string;
  totalTimeMinutes: number;
  timeSpentMinutes: number;
  tasks: Task[];
}

export type ViewType = 'kanban' | 'timer';

export interface AppState {
  projects: Project[];
}

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, days: number, hours: number) => void;
}

export interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
}

export interface KanbanViewProps {
  project: Project;
  onAddTask: (title: string) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onStartFocus: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus, targetIndex: number) => void;
  onUpdateTaskTitle: (taskId: string, newTitle: string) => void;
  onUpdateSubtaskTitle: (taskId: string, subtaskId: string, newTitle: string) => void;
  currentSessionMinutes?: number;
  activeTaskId?: string | null;
}

export interface MiniTimerProps {
  timeLeft: number;
  mode: 'work' | 'break';
  isActive: boolean;
  onClick: () => void;
}

export interface NavigationProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProjectTitle: (id: string, newTitle: string) => void;
  isOpen: boolean;
}

export interface TimerViewProps {
  activeTask?: Task;
  timeLeft: number;
  isActive: boolean;
  mode: 'work' | 'break';
  totalDuration: number;
  onToggleTimer: () => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onClearActiveTask?: () => void;
  onClose?: () => void;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export interface UseTimerProps {
  onSessionComplete?: (minutes: number) => void;
  onSequenceComplete?: () => void;
}
