import type { TemporalGoal, TemporalMemory, TemporalTask } from '@/types/kronos';

const STORAGE_KEY = 'kronos.public-field.v2';
const GOALS_KEY = 'kronos.public-goals.v1';
const MEMORY_KEY = 'kronos.public-memory.v1';
let taskCache: TemporalTask[] | null = null;
let goalCache: TemporalGoal[] | null = null;
let memoryCache: TemporalMemory | null = null;

export const initialTasks: TemporalTask[] = [
  { id: 'shape-the-launch', title: 'Shape the launch narrative', time: '09:30', duration: 50, orbit: 0.18, completed: false },
  { id: 'protect-deep-work', title: 'Protect a deep work window', time: '12:40', duration: 90, orbit: 0.52, completed: false },
  { id: 'review-the-horizon', title: 'Review the horizon', time: '17:20', duration: 25, orbit: 0.81, completed: false },
];

export const initialGoals: TemporalGoal[] = [
  { id: 'craft', label: 'Ship the defining work', progress: 68, horizon: '42 days', x: 18, y: 68 },
  { id: 'depth', label: 'Build a deeper practice', progress: 41, horizon: '11 weeks', x: 57, y: 28 },
  { id: 'space', label: 'Create a spacious year', progress: 27, horizon: '8 months', x: 82, y: 64 },
];

export const initialMemory: TemporalMemory = {
  dailyMinutes: [240, 180, 310, 420, 270, 360, 302],
  sessionCount: 18,
  resolvedCount: 18,
  coherence: 87,
};

export function normalizeTasks(value: unknown): TemporalTask[] {
  if (!Array.isArray(value)) return initialTasks;
  return value.filter((item): item is TemporalTask => {
    if (!item || typeof item !== 'object') return false;
    const task = item as Partial<TemporalTask>;
    return typeof task.id === 'string'
      && typeof task.title === 'string'
      && typeof task.time === 'string'
      && typeof task.duration === 'number'
      && typeof task.orbit === 'number'
      && typeof task.completed === 'boolean';
  });
}

export function normalizeGoals(value: unknown): TemporalGoal[] {
  if (!Array.isArray(value)) return initialGoals;
  const goals = value.filter((item): item is TemporalGoal => {
    if (!item || typeof item !== 'object') return false;
    const goal = item as Partial<TemporalGoal>;
    return typeof goal.id === 'string'
      && typeof goal.label === 'string'
      && typeof goal.progress === 'number'
      && typeof goal.horizon === 'string'
      && typeof goal.x === 'number'
      && typeof goal.y === 'number';
  });
  return goals.length ? goals : initialGoals;
}

export function normalizeMemory(value: unknown): TemporalMemory {
  if (!value || typeof value !== 'object') return initialMemory;
  const memory = value as Partial<TemporalMemory>;
  if (!Array.isArray(memory.dailyMinutes)
    || memory.dailyMinutes.length !== 7
    || memory.dailyMinutes.some((minutes) => typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 0)
    || typeof memory.sessionCount !== 'number'
    || typeof memory.resolvedCount !== 'number'
    || typeof memory.coherence !== 'number') return initialMemory;
  return {
    dailyMinutes: memory.dailyMinutes,
    sessionCount: Math.max(0, Math.round(memory.sessionCount)),
    resolvedCount: Math.max(0, Math.round(memory.resolvedCount)),
    coherence: Math.max(0, Math.min(100, Math.round(memory.coherence))),
  };
}

export function loadTasks() {
  if (typeof window === 'undefined') return initialTasks;
  if (taskCache) return taskCache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    taskCache = raw ? normalizeTasks(JSON.parse(raw)) : initialTasks;
    return taskCache;
  } catch {
    return initialTasks;
  }
}

export function saveTasks(tasks: TemporalTask[]) {
  if (typeof window === 'undefined') return;
  taskCache = tasks;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // The in-memory public field remains functional when storage is unavailable.
  }
  window.dispatchEvent(new Event('kronos:tasks-changed'));
}

export function subscribeTasks(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const refresh = () => {
    taskCache = null;
    callback();
  };
  window.addEventListener('storage', refresh);
  window.addEventListener('kronos:tasks-changed', callback);
  return () => {
    window.removeEventListener('storage', refresh);
    window.removeEventListener('kronos:tasks-changed', callback);
  };
}

export function loadGoals() {
  if (typeof window === 'undefined') return initialGoals;
  if (goalCache) return goalCache;
  try {
    const raw = window.localStorage.getItem(GOALS_KEY);
    goalCache = raw ? normalizeGoals(JSON.parse(raw)) : initialGoals;
  } catch {
    goalCache = initialGoals;
  }
  return goalCache;
}

export function saveGoals(goals: TemporalGoal[]) {
  if (typeof window === 'undefined') return;
  goalCache = goals;
  try {
    window.localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch {
    // Public interactions remain available in memory-only browsing modes.
  }
  window.dispatchEvent(new Event('kronos:goals-changed'));
}

export function subscribeGoals(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const refresh = () => {
    goalCache = null;
    callback();
  };
  window.addEventListener('storage', refresh);
  window.addEventListener('kronos:goals-changed', callback);
  return () => {
    window.removeEventListener('storage', refresh);
    window.removeEventListener('kronos:goals-changed', callback);
  };
}

export function loadMemory() {
  if (typeof window === 'undefined') return initialMemory;
  if (memoryCache) return memoryCache;
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY);
    memoryCache = raw ? normalizeMemory(JSON.parse(raw)) : initialMemory;
  } catch {
    memoryCache = initialMemory;
  }
  return memoryCache;
}

export function saveMemory(memory: TemporalMemory) {
  if (typeof window === 'undefined') return;
  memoryCache = memory;
  try {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {
    // Public interactions remain available in memory-only browsing modes.
  }
  window.dispatchEvent(new Event('kronos:memory-changed'));
}

export function subscribeMemory(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const refresh = () => {
    memoryCache = null;
    callback();
  };
  window.addEventListener('storage', refresh);
  window.addEventListener('kronos:memory-changed', callback);
  return () => {
    window.removeEventListener('storage', refresh);
    window.removeEventListener('kronos:memory-changed', callback);
  };
}

export function recordResolvedObject() {
  const memory = loadMemory();
  saveMemory({ ...memory, resolvedCount: memory.resolvedCount + 1 });
}

export function makeTask(title: string): TemporalTask {
  const now = new Date();
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    title: title.trim(),
    time: new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now),
    duration: 45,
    orbit: 0.36 + Math.random() * 0.45,
    completed: false,
  };
}
