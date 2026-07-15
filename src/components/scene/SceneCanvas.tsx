'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor, Preload } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { createParticleCloud, timelinePoint } from '@/lib/scene-math';
import type { WorldMode } from '@/types/kronos';
import {
  atmosphereFragment,
  atmosphereVertex,
  filamentFragment,
  filamentVertex,
  particleFragment,
  particleVertex,
} from '@/shaders/atmosphere';

let scrollFrame = -1;
let scrollValue = 0;

function scrollProgress(frame: number) {
  if (frame === scrollFrame) return scrollValue;
  scrollFrame = frame;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  scrollValue = total <= 0 ? 0 : THREE.MathUtils.clamp(window.scrollY / total, 0, 1);
  return scrollValue;
}

function Atmosphere({ still }: { still: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  useFrame(({ clock }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = still ? 0 : clock.elapsedTime;
    material.current.uniforms.uPointer.value.set(pointer.x, pointer.y);
  });
  return (
    <mesh position={[0, 0, -9]} scale={[2.1, 1.15, 1]} frustumCulled={false}>
      <planeGeometry args={[24, 18, 1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={{ uTime: { value: 0 }, uPointer: { value: new THREE.Vector2() } }}
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        depthWrite={false}
      />
    </mesh>
  );
}

function ParticleField({ count, still }: { count: number; still: boolean }) {
  const positions = useMemo(() => createParticleCloud(count), [count]);
  const material = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = still ? 0 : clock.elapsedTime;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function TemporalFilament({ still }: { still: boolean }) {
  const lead = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uReveal: { value: still ? 1 : 0.01 }, uIntensity: { value: 1.2 } },
    vertexShader: filamentVertex,
    fragmentShader: filamentFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [still]);
  const curve = useMemo(() => {
    const points = Array.from({ length: 18 }, (_, index) => {
      const point = timelinePoint(index / 17);
      return new THREE.Vector3(...point);
    });
    return new THREE.CatmullRomCurve3(points, false, 'centripetal');
  }, []);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ clock, gl }) => {
    const intro = still ? 1 : THREE.MathUtils.clamp((clock.elapsedTime - 0.25) / 3.2, 0.015, 1);
    const reveal = Math.max(intro, scrollProgress(gl.info.render.frame) * 1.2);
    material.uniforms.uReveal.value = reveal;
    material.uniforms.uIntensity.value = 1.05 + Math.sin(clock.elapsedTime * 0.7) * (still ? 0 : 0.12);
    if (lead.current) lead.current.position.copy(curve.getPointAt(Math.min(reveal, 0.999)));
  });
  return (
    <group rotation={[0.08, -0.06, -0.08]}>
      <mesh>
        <tubeGeometry args={[curve, 320, 0.018, 6, false]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh ref={lead}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshBasicMaterial color="#b5d1ff" toneMapped={false} />
      </mesh>
      <pointLight color="#78afff" intensity={2.2} distance={3.5} />
    </group>
  );
}

function TimeLattice({ compact, still }: { compact: boolean; still: boolean }) {
  const count = compact ? 48 : 96;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const start = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const blended = useMemo(() => new THREE.Vector3(), []);
  const accent = useMemo(() => new THREE.Color('#b5d1ff'), []);
  const base = useMemo(() => new THREE.Color('#717a89'), []);
  useEffect(() => {
    if (!mesh.current) return;
    mesh.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let index = 0; index < count; index += 1) {
      mesh.current.setColorAt(index, index % 7 === 0 ? accent : base);
    }
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [accent, base, count]);
  useFrame(({ clock, gl }) => {
    if (!mesh.current) return;
    const progress = still ? 0.62 : scrollProgress(gl.info.render.frame);
    const epoch = THREE.MathUtils.smoothstep(progress, 0.08, 0.82);
    for (let index = 0; index < count; index += 1) {
      const unit = index / Math.max(1, count - 1);
      start.set(
        Math.sin(index * 0.47) * (compact ? 1.5 : 2.7),
        (unit - 0.5) * (compact ? 5 : 7.5),
        Math.cos(index * 0.47) * 1.15 - 2.4,
      );
      const arc = (unit - 0.5) * Math.PI * 1.65;
      target.set(
        Math.sin(arc) * (compact ? 2.4 : 5.2),
        Math.cos(arc * 0.72) * 1.4 - 0.6,
        -3.8 - Math.cos(arc) * 2.1,
      );
      blended.lerpVectors(start, target, epoch);
      const breathe = still ? 1 : 1 + Math.sin(clock.elapsedTime * 0.55 + index) * 0.08;
      dummy.position.copy(blended);
      dummy.scale.setScalar((0.026 + (index % 7 === 0 ? 0.035 : 0.012)) * breathe);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial vertexColors transparent opacity={0.84} toneMapped={false} />
    </instancedMesh>
  );
}

function TaskMatter({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || still) return;
    group.current.rotation.y = clock.elapsedTime * 0.08;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.19) * 0.08;
  });
  return (
    <group ref={group} position={[2.4, -0.3, -2.5]}>
      {[
        [-1.3, 0.9, -0.6, 0.5],
        [0.5, -0.7, 0.2, 0.72],
        [1.45, 0.65, -1.1, 0.38],
      ].map(([x, y, z, scale], index) => (
        <mesh key={index} position={[x, y, z]} scale={scale} rotation={[index * 0.7, index, index * 0.4]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#101722" emissive="#234b84" emissiveIntensity={0.22} roughness={0.18} metalness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function CameraDirector({ mode, still }: { mode: WorldMode; still: boolean }) {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const modeOffset = mode === 'home' ? 0 : 0.8;
  useFrame(({ gl }, delta) => {
    const progress = still ? 0.18 : scrollProgress(gl.info.render.frame);
    const mobile = window.innerWidth < 768;
    target.set(
      mobile ? 0 : Math.sin(progress * Math.PI * 2.2) * 1.25 + pointer.x * 0.16,
      mobile ? 0.2 - progress * 0.4 : 0.25 + Math.cos(progress * Math.PI * 1.7) * 0.5 + pointer.y * 0.12,
      7.6 - progress * (mobile ? 1.8 : 4.6) + modeOffset,
    );
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, 2.4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, 2.4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 2.2, delta);
    look.set(0, -progress * 0.45, -2.8 - progress * 2.2);
    camera.lookAt(look);
  });
  return null;
}

function World({ mode, compact, still }: { mode: WorldMode; compact: boolean; still: boolean }) {
  return (
    <>
      <color attach="background" args={['#020306']} />
      <fog attach="fog" args={['#020306', 7, 24]} />
      <Atmosphere still={still} />
      <ParticleField count={compact ? 900 : 4200} still={still} />
      <TemporalFilament still={still} />
      <TimeLattice compact={compact} still={still} />
      <TaskMatter still={still} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[3, 5, 4]} color="#aacbff" intensity={0.62} />
      <CameraDirector mode={mode} still={still} />
      {!compact && !still ? (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.7} luminanceThreshold={0.72} mipmapBlur />
          <Noise opacity={0.025} blendFunction={BlendFunction.SOFT_LIGHT} />
          <Vignette eskil={false} offset={0.22} darkness={0.72} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export function SceneCanvas({ mode, onUnavailable }: { mode: WorldMode; onUnavailable: () => void }) {
  const [compact, setCompact] = useState(() => typeof window === 'undefined' || window.matchMedia('(max-width: 767px), (pointer: coarse)').matches);
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.matchMedia('(max-width: 767px), (pointer: coarse)').matches);
    window.addEventListener('resize', update, { passive: true });
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('resize', update);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const lowFidelity = compact || degraded;

  return (
    <div className="scene-stage" aria-hidden="true">
      <Canvas
        dpr={lowFidelity ? [1, 1.2] : [1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ fov: lowFidelity ? 52 : 45, near: 0.1, far: 60, position: [0, 0.2, 7.6] }}
        gl={{ alpha: false, antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            onUnavailable();
          }, { once: true });
        }}
      >
        <World mode={mode} compact={lowFidelity} still={!visible} />
        <PerformanceMonitor flipflops={1} onDecline={() => setDegraded(true)} />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
    </div>
  );
}
