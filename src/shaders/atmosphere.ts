export const atmosphereVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + 17.17;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(1.8, 1.0);
    p += uPointer * 0.035;
    float mist = fbm(p * 2.4 + vec2(uTime * 0.018, -uTime * 0.011));
    float filament = exp(-7.5 * abs(p.y + sin(p.x * 2.2 + uTime * 0.08) * 0.08));
    float halo = 1.0 - smoothstep(0.05, 0.9, length(p - vec2(0.18, -0.08)));
    vec3 voidColor = vec3(0.007, 0.011, 0.021);
    vec3 graphite = vec3(0.025, 0.037, 0.061);
    vec3 blue = vec3(0.12, 0.31, 0.68);
    vec3 color = mix(voidColor, graphite, mist * 0.42 + halo * 0.22);
    color += blue * filament * (0.025 + halo * 0.045);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const filamentVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const filamentFragment = /* glsl */ `
  precision highp float;

  uniform float uReveal;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    if (vUv.x > uReveal) discard;
    float edge = smoothstep(0.0, 0.18, vUv.y) * (1.0 - smoothstep(0.82, 1.0, vUv.y));
    vec3 core = mix(vec3(0.25, 0.54, 1.0), vec3(0.72, 0.86, 1.0), edge);
    gl_FragColor = vec4(core * uIntensity, 0.35 + edge * 0.65);
  }
`;

export const particleVertex = /* glsl */ `
  uniform float uTime;

  void main() {
    vec3 transformed = position;
    transformed.y += sin(position.x * 0.21 + uTime * 0.13) * 0.035;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_PointSize = clamp(10.0 / max(1.0, -mvPosition.z), 0.8, 2.4);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragment = /* glsl */ `
  precision highp float;

  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float alpha = 1.0 - smoothstep(0.02, 0.5, distanceToCenter);
    gl_FragColor = vec4(0.58, 0.73, 1.0, alpha * 0.42);
  }
`;
