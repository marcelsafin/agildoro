import { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, AppState } from '../types';
import { useDebounce } from './useDebounce';

const STORAGE_KEY = 'focusloop_data_v3';

export const useProjectData = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as AppState;
        return parsed.projects || [];
      } catch (e: unknown) {
        console.error('Failed to load data', e);
        return [];
      }
    }
    return [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as AppState;
        return parsed.projects && parsed.projects.length > 0 ? parsed.projects[0].id : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Sync to storage with debounce
  const debouncedProjects = useDebounce(projects, 1000);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects: debouncedProjects }));
  }, [debouncedProjects]);

  // Helpers
  const updateActiveProject = (updater: (p: Project) => Project) => {
    if (!activeProjectId) return;
    setProjects((prev) => prev.map((p) => (p.id === activeProjectId ? updater(p) : p)));
  };

  const updateProjectTitle = (projectId: string, newTitle: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, title: newTitle } : p)));
  };

  const createProject = (title: string, days: number, hours: number) => {
    let totalMinutes = (days * 24 + hours) * 60;
    if (totalMinutes <= 0) totalMinutes = 60;

    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      totalTimeMinutes: totalMinutes,
      timeSpentMinutes: 0,
      tasks: [],
    };

    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    return newProject.id;
  };

  const deleteProject = (projectId: string) => {
    const remaining = projects.filter((p) => p.id !== projectId);
    setProjects(remaining);
    if (activeProjectId === projectId) {
      setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const addTask = (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'todo',
      createdAt: Date.now(),
      subtasks: [],
    };
    updateActiveProject((p) => ({ ...p, tasks: [...p.tasks, newTask] }));
  };

  const updateProjectForTask = (taskId: string, updater: (p: Project) => Project) => {
    const projectWithTask = projects.find((p) => p.tasks.some((t) => t.id === taskId));
    if (!projectWithTask) return;
    setProjects((prev) => prev.map((p) => (p.id === projectWithTask.id ? updater(p) : p)));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    updateProjectForTask(id, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    if (status === 'done' && activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const deleteTask = (id: string) => {
    updateProjectForTask(id, (p) => ({
      ...p,
      tasks: p.tasks.filter((t) => t.id !== id),
    }));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const addSubtask = (taskId: string, title: string) => {
    updateProjectForTask(taskId, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: [...t.subtasks, { id: crypto.randomUUID(), title, completed: false }],
        };
      }),
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    updateProjectForTask(taskId, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      }),
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    updateProjectForTask(taskId, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
        };
      }),
    }));
  };

  const updateTaskTitle = (taskId: string, newTitle: string) => {
    updateProjectForTask(taskId, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t)),
    }));
  };

  const updateSubtaskTitle = (taskId: string, subtaskId: string, newTitle: string) => {
    updateProjectForTask(taskId, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, title: newTitle } : st)),
        };
      }),
    }));
  };

  const moveTask = (taskId: string, newStatus: TaskStatus, targetIndex: number) => {
    updateActiveProject((p) => {
      const prevTasks = p.tasks;
      const taskToMove = prevTasks.find((t) => t.id === taskId);
      if (!taskToMove) return p;

      const sourceStatus = taskToMove.status;
      let finalIndex = targetIndex;

      if (sourceStatus === newStatus) {
        const colTasks = prevTasks.filter((t) => t.status === sourceStatus);
        const sourceIndex = colTasks.findIndex((t) => t.id === taskId);
        if (sourceIndex !== -1 && sourceIndex < targetIndex) {
          finalIndex -= 1;
        }
      }

      const remainingTasks = prevTasks.filter((t) => t.id !== taskId);
      const otherColumnsTasks = remainingTasks.filter((t) => t.status !== newStatus);
      const targetColumnTasks = remainingTasks.filter((t) => t.status === newStatus);

      const updatedTask = { ...taskToMove, status: newStatus };
      const safeIndex = Math.max(0, Math.min(finalIndex, targetColumnTasks.length));
      targetColumnTasks.splice(safeIndex, 0, updatedTask);

      return { ...p, tasks: [...otherColumnsTasks, ...targetColumnTasks] };
    });

    if (newStatus === 'done' && activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  const addTimeBudget = (minutes: number) => {
    updateActiveProject((p) => ({
      ...p,
      timeSpentMinutes: p.timeSpentMinutes + minutes,
    }));
  };

  return {
    projects,
    activeProjectId,
    activeTaskId,
    setActiveProjectId,
    setActiveTaskId,
    createProject,
    deleteProject,
    updateProjectTitle,
    addTask,
    updateTaskStatus,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    updateTaskTitle,
    updateSubtaskTitle,
    moveTask,
    addTimeBudget,
  };
};
