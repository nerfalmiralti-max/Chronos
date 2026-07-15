'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState, useSyncExternalStore } from 'react';
import type { WorldMode } from '@/types/kronos';

type Connection = EventTarget & { saveData?: boolean };
type ConnectionNavigator = Navigator & { connection?: Connection };

let webglSupported: boolean | undefined;

function supportsWebGL() {
  if (webglSupported !== undefined) return webglSupported;
  const probe = document.createElement('canvas');
  const context = probe.getContext('webgl2') || probe.getContext('webgl');
  webglSupported = Boolean(context);
  context?.getExtension('WEBGL_lose_context')?.loseContext();
  probe.width = 0;
  probe.height = 0;
  return webglSupported;
}

function canRenderScene() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if ((navigator as ConnectionNavigator).connection?.saveData) return false;
  return supportsWebGL();
}

function subscribeCapabilities(callback: () => void) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as ConnectionNavigator).connection;
  motion.addEventListener('change', callback);
  connection?.addEventListener('change', callback);
  return () => {
    motion.removeEventListener('change', callback);
    connection?.removeEventListener('change', callback);
  };
}

const SceneCanvas = dynamic(
  () => import('./SceneCanvas').then((module) => module.SceneCanvas),
  { ssr: false, loading: () => <div className="static-world" aria-hidden="true" /> },
);

export function SceneStage({ mode = 'home' }: { mode?: WorldMode }) {
  const capable = useSyncExternalStore(subscribeCapabilities, canRenderScene, () => false);
  const [failed, setFailed] = useState(false);
  const handleUnavailable = useCallback(() => setFailed(true), []);

  if (!capable || failed) return <div className="static-world" aria-hidden="true" />;
  return <SceneCanvas mode={mode} onUnavailable={handleUnavailable} />;
}
