import { describe, expect, it } from 'vitest';
import {
  applyTaskPatch,
  initialGoals,
  initialMemory,
  initialTasks,
  makeTask,
  normalizeGoals,
  normalizeMemory,
  normalizeTasks,
  shiftTaskSchedule,
  shiftTaskTime,
} from './public-store';

describe('public temporal field', () => {
  it('does not invent an identity when data is missing', () => {
    expect(normalizeTasks(null)).toEqual(initialTasks);
    expect('userId' in normalizeTasks(null)[0]).toBe(false);
  });

  it('drops malformed device records', () => {
    expect(normalizeTasks([{ id: 'broken' }])).toEqual([]);
  });

  it('keeps legacy task records without a date and strips unrelated identity fields', () => {
    const legacy = { ...initialTasks[0], userId: 'should-not-survive', token: 'secret' };
    expect(normalizeTasks([legacy])).toEqual([initialTasks[0]]);
    expect('userId' in normalizeTasks([legacy])[0]).toBe(false);
    expect('token' in normalizeTasks([legacy])[0]).toBe(false);
  });

  it('accepts valid optional scheduling details at their boundaries', () => {
    expect(makeTask('  Deep work  ', { date: '2028-02-29', time: '00:00', duration: 5 })).toMatchObject({
      title: 'Deep work',
      date: '2028-02-29',
      time: '00:00',
      duration: 5,
      completed: false,
    });
    expect(makeTask('Long session', { time: '23:59', duration: 480 })).toMatchObject({
      time: '23:59',
      duration: 480,
    });
  });

  it('rejects invalid task titles, dates, times, and durations', () => {
    expect(makeTask(' ', { time: '09:00', duration: 45 })).toBeNull();
    expect(makeTask('Task', { date: '2026-02-29' })).toBeNull();
    expect(makeTask('Task', { date: '2026-13-01' })).toBeNull();
    expect(makeTask('Task', { time: '24:00' })).toBeNull();
    expect(makeTask('Task', { time: '9:00' })).toBeNull();
    expect(makeTask('Task', { duration: 4 })).toBeNull();
    expect(makeTask('Task', { duration: 481 })).toBeNull();
    expect(makeTask('Task', { duration: Number.NaN })).toBeNull();
  });

  it('applies only valid editable task fields', () => {
    const updated = applyTaskPatch(initialTasks[0], {
      title: '  Refine the launch  ',
      date: '2026-07-17',
      time: '23:50',
      duration: 120,
    });
    expect(updated).toEqual({
      ...initialTasks[0],
      title: 'Refine the launch',
      date: '2026-07-17',
      time: '23:50',
      duration: 120,
    });
    expect(applyTaskPatch(initialTasks[0], { title: 'x' })).toBeNull();
    expect(applyTaskPatch(initialTasks[0], { time: '25:10' })).toBeNull();
    expect(applyTaskPatch(initialTasks[0], { duration: Infinity })).toBeNull();
  });

  it('reschedules across day boundaries in either direction', () => {
    expect(shiftTaskTime('23:50', 30)).toBe('00:20');
    expect(shiftTaskTime('00:10', -30)).toBe('23:40');
    expect(shiftTaskTime('12:00', 24 * 60 + 45)).toBe('12:45');
    expect(shiftTaskTime('invalid', 30)).toBeNull();
    expect(shiftTaskTime('09:00', Number.POSITIVE_INFINITY)).toBeNull();
    expect(shiftTaskSchedule({ date: '2026-12-31', time: '23:50' }, 30)).toEqual({ date: '2027-01-01', time: '00:20' });
    expect(shiftTaskSchedule({ date: '2026-03-01', time: '00:10' }, -30)).toEqual({ date: '2026-02-28', time: '23:40' });
    expect(shiftTaskSchedule({ time: '23:50' }, 30)).toEqual({ time: '00:20' });
  });

  it('keeps goal and memory data identity-free', () => {
    expect(normalizeGoals(null)).toEqual(initialGoals);
    expect(normalizeMemory(null)).toEqual(initialMemory);
    expect('userId' in normalizeGoals(null)[0]).toBe(false);
    expect('session' in normalizeMemory(null)).toBe(false);
  });

  it('rejects malformed public memory snapshots', () => {
    expect(normalizeMemory({ dailyMinutes: [10], sessionCount: 1, resolvedCount: 1, coherence: 90 })).toEqual(initialMemory);
  });
});
