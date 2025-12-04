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


// Types WIP