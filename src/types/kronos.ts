export type WorldMode = 'home' | 'today' | 'goals' | 'calendar' | 'analytics' | 'timer';

export type TemporalTask = {
  id: string;
  title: string;
  time: string;
  duration: number;
  orbit: number;
  completed: boolean;
};

export type TemporalGoal = {
  id: string;
  label: string;
  progress: number;
  horizon: string;
  x: number;
  y: number;
};

export type TemporalMemory = {
  dailyMinutes: number[];
  sessionCount: number;
  resolvedCount: number;
  coherence: number;
};
