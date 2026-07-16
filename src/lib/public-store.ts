import type {
  TemporalGoal,
  TemporalMemory,
  TemporalTask,
  TemporalTaskDetails,
  TemporalTaskPatch,
} from '@/types/kronos';

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
  dailyMinutes: [0, 0, 0, 0, 0, 0, 0],
  sessionCount: 0,
  resolvedCount: 0,
  coherence: 0,
};

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidTaskTitle(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 2;
}

export function isValidTaskTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

export function isValidTaskDuration(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 5 && value <= 480;
}

export function isValidTaskDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return false;
  const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

function isValidTaskDetails(details: TemporalTaskDetails) {
  return (details.date === undefined || isValidTaskDate(details.date))
    && (details.time === undefined || isValidTaskTime(details.time))
    && (details.duration === undefined || isValidTaskDuration(details.duration));
}

export function normalizeTasks(value: unknown): TemporalTask[] {
  if (!Array.isArray(value)) return initialTasks;
  return value.flatMap((item): TemporalTask[] => {
    if (!item || typeof item !== 'object') return [];
    const task = item as Partial<TemporalTask>;
    if (typeof task.id !== 'string'
      || !isValidTaskTitle(task.title)
      || !isValidTaskTime(task.time)
      || !isValidTaskDuration(task.duration)
      || typeof task.orbit !== 'number'
      || !Number.isFinite(task.orbit)
      || typeof task.completed !== 'boolean'
      || (task.date !== undefined && !isValidTaskDate(task.date))) return [];
    const normalized: TemporalTask = {
      id: task.id,
      title: task.title.trim(),
      time: task.time,
      duration: task.duration,
      orbit: task.orbit,
      completed: task.completed,
    };
    if (task.date !== undefined) normalized.date = task.date;
    return [normalized];
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

export function applyTaskPatch(task: TemporalTask, patch: TemporalTaskPatch): TemporalTask | null {
  if ((patch.title !== undefined && !isValidTaskTitle(patch.title)) || !isValidTaskDetails(patch)) return null;
  return {
    ...task,
    title: patch.title === undefined ? task.title : patch.title.trim(),
    time: patch.time ?? task.time,
    duration: patch.duration ?? task.duration,
    ...(patch.date === undefined ? {} : { date: patch.date }),
  };
}

export function shiftTaskTime(time: string, minutes = 30): string | null {
  if (!isValidTaskTime(time) || !Number.isFinite(minutes)) return null;
  const [hours, currentMinutes] = time.split(':').map(Number);
  const minutesInDay = 24 * 60;
  const shifted = ((hours * 60 + currentMinutes + Math.round(minutes)) % minutesInDay + minutesInDay) % minutesInDay;
  return `${Math.floor(shifted / 60).toString().padStart(2, '0')}:${(shifted % 60).toString().padStart(2, '0')}`;
}

export function shiftTaskSchedule(task: Pick<TemporalTask, 'date' | 'time'>, minutes = 30): Pick<TemporalTask, 'date' | 'time'> | null {
  if (!isValidTaskTime(task.time) || !Number.isFinite(minutes) || (task.date !== undefined && !isValidTaskDate(task.date))) return null;
  const [hours, currentMinutes] = task.time.split(':').map(Number);
  const rawMinutes = hours * 60 + currentMinutes + Math.round(minutes);
  const minutesInDay = 24 * 60;
  const dayDelta = Math.floor(rawMinutes / minutesInDay);
  const shiftedTime = shiftTaskTime(task.time, minutes);
  if (!shiftedTime) return null;
  if (!task.date || dayDelta === 0) return { ...(task.date ? { date: task.date } : {}), time: shiftedTime };
  const [year, month, day] = task.date.split('-').map(Number);
  const shiftedDate = new Date(Date.UTC(year, month - 1, day + dayDelta));
  const date = `${shiftedDate.getUTCFullYear()}-${(shiftedDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${shiftedDate.getUTCDate().toString().padStart(2, '0')}`;
  return { date, time: shiftedTime };
}

export function makeTask(title: string, details: TemporalTaskDetails = {}): TemporalTask | null {
  if (!isValidTaskTitle(title) || !isValidTaskDetails(details)) return null;
  const now = new Date();
  const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    title: title.trim(),
    ...(details.date === undefined ? {} : { date: details.date }),
    time: details.time ?? defaultTime,
    duration: details.duration ?? 45,
    orbit: 0.36 + Math.random() * 0.45,
    completed: false,
  };
}
