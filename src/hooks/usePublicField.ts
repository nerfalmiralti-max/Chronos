'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  initialGoals,
  initialMemory,
  loadGoals,
  loadMemory,
  saveGoals,
  saveMemory,
  subscribeGoals,
  subscribeMemory,
} from '@/lib/public-store';

export function usePublicGoals() {
  const goals = useSyncExternalStore(subscribeGoals, loadGoals, () => initialGoals);
  const advance = useCallback((id: string) => {
    saveGoals(loadGoals().map((goal) => goal.id === id
      ? { ...goal, progress: Math.min(100, goal.progress + 5) }
      : goal));
  }, []);
  return { goals, advance };
}

export function usePublicMemory() {
  const memory = useSyncExternalStore(subscribeMemory, loadMemory, () => initialMemory);
  const recordFocus = useCallback((minutes: number) => {
    const current = loadMemory();
    const dailyMinutes = [...current.dailyMinutes];
    const mondayFirstDay = (new Date().getDay() + 6) % 7;
    dailyMinutes[mondayFirstDay] += Math.max(0, minutes);
    saveMemory({ ...current, dailyMinutes, sessionCount: current.sessionCount + 1 });
  }, []);
  return { memory, recordFocus };
}
