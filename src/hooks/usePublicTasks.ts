'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  applyTaskPatch,
  initialTasks,
  loadTasks,
  makeTask,
  recordResolvedObject,
  saveTasks,
  shiftTaskSchedule,
  subscribeTasks,
} from '@/lib/public-store';
import type { TemporalTaskDetails, TemporalTaskPatch } from '@/types/kronos';

export function usePublicTasks() {
  const tasks = useSyncExternalStore(subscribeTasks, loadTasks, () => initialTasks);

  const complete = useCallback((id: string) => {
    const tasks = loadTasks();
    const target = tasks.find((task) => task.id === id);
    if (!target || target.completed) return;
    saveTasks(tasks.map((task) => task.id === id ? { ...task, completed: true } : task));
    recordResolvedObject();
  }, []);

  const add = useCallback((title: string, details: TemporalTaskDetails = {}) => {
    const task = makeTask(title, details);
    if (!task) return false;
    saveTasks([...loadTasks(), task]);
    return true;
  }, []);

  const update = useCallback((id: string, patch: TemporalTaskPatch) => {
    const tasks = loadTasks();
    const target = tasks.find((task) => task.id === id);
    if (!target) return false;
    const updated = applyTaskPatch(target, patch);
    if (!updated) return false;
    saveTasks(tasks.map((task) => task.id === id ? updated : task));
    return true;
  }, []);

  const remove = useCallback((id: string) => {
    const tasks = loadTasks();
    if (!tasks.some((task) => task.id === id)) return;
    saveTasks(tasks.filter((task) => task.id !== id));
  }, []);

  const reschedule = useCallback((id: string, minutes = 30) => {
    const tasks = loadTasks();
    const target = tasks.find((task) => task.id === id);
    if (!target) return false;
    const schedule = shiftTaskSchedule(target, minutes);
    if (!schedule) return false;
    saveTasks(tasks.map((task) => task.id === id ? { ...task, ...schedule } : task));
    return true;
  }, []);

  return { tasks, complete, add, update, remove, reschedule };
}
