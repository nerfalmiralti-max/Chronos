'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { initialTasks, loadTasks, makeTask, recordResolvedObject, saveTasks, subscribeTasks } from '@/lib/public-store';

export function usePublicTasks() {
  const tasks = useSyncExternalStore(subscribeTasks, loadTasks, () => initialTasks);

  const complete = useCallback((id: string) => {
    const tasks = loadTasks();
    const target = tasks.find((task) => task.id === id);
    if (!target || target.completed) return;
    saveTasks(tasks.map((task) => task.id === id ? { ...task, completed: true } : task));
    recordResolvedObject();
  }, []);

  const add = useCallback((title: string) => {
    if (title.trim().length < 2) return false;
    saveTasks([...loadTasks(), makeTask(title)]);
    return true;
  }, []);

  return { tasks, complete, add };
}
