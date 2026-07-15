import { describe, expect, it } from 'vitest';
import { initialGoals, initialMemory, initialTasks, normalizeGoals, normalizeMemory, normalizeTasks } from './public-store';

describe('public temporal field', () => {
  it('does not invent an identity when data is missing', () => {
    expect(normalizeTasks(null)).toEqual(initialTasks);
    expect('userId' in normalizeTasks(null)[0]).toBe(false);
  });

  it('drops malformed device records', () => {
    expect(normalizeTasks([{ id: 'broken' }])).toEqual([]);
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
