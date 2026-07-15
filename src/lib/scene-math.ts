export type Point3 = readonly [number, number, number];

export function timelinePoint(value: number): Point3 {
  const t = Math.min(1, Math.max(0, value));
  return [
    (t - 0.5) * 12,
    Math.sin(t * Math.PI * 2.25) * (0.55 + t * 0.8),
    Math.cos(t * Math.PI * 1.55) * 1.35 - t * 2.6,
  ];
}

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createParticleCloud(count: number, seed = 1729) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = 3 + random() * 12;
    const angle = random() * Math.PI * 2;
    const lift = (random() - 0.5) * 9;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = lift;
    positions[index * 3 + 2] = Math.sin(angle) * radius - 4;
  }
  return positions;
}
