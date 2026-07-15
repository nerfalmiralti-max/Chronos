'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

export function MagneticCursor() {
  const reduced = useReducedMotion();
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 520, damping: 42, mass: 0.16 });
  const y = useSpring(rawY, { stiffness: 520, damping: 42, mass: 0.16 });
  const [label, setLabel] = useState('');

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || reduced) return;

    const onMove = (event: PointerEvent) => {
      rawX.set(event.clientX);
      rawY.set(event.clientY);
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
      setLabel(target?.dataset.cursor ?? '');
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [rawX, rawY, reduced]);

  if (reduced) return null;
  return (
    <motion.div className="magnetic-cursor" style={{ x, y }} aria-hidden="true" data-active={Boolean(label)}>
      <span>{label}</span>
    </motion.div>
  );
}
