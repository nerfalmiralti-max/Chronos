import { describe, expect, it } from 'vitest';
import { createParticleCloud, timelinePoint } from './scene-math';

describe('temporal geometry', () => {
  it('clamps the filament to its authored endpoints', () => {
    expect(timelinePoint(-1)).toEqual(timelinePoint(0));
    expect(timelinePoint(2)).toEqual(timelinePoint(1));
  });

  it('creates a deterministic GPU particle buffer', () => {
    const first = createParticleCloud(8, 42);
    const second = createParticleCloud(8, 42);
    expect(first).toHaveLength(24);
    expect(Array.from(first)).toEqual(Array.from(second));
  });
});
