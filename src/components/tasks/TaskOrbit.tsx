'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { animate } from 'motion';
import { Check, Orbit } from 'lucide-react';
import { usePublicTasks } from '@/hooks/usePublicTasks';

type TaskStyle = CSSProperties & { '--orbit-x': string; '--orbit-y': string; '--task-size': string };

export function TaskOrbit({ compact = false }: { compact?: boolean }) {
  const { tasks, complete } = usePublicTasks();
  const reduced = useReducedMotion();
  const [message, setMessage] = useState('');

  const completeTask = (id: string, title: string) => {
    complete(id);
    setMessage(`${title} returned to the timeline.`);
    if (!reduced) {
      const pulse = document.querySelector('.timeline-signal');
      if (pulse) void animate(pulse, { opacity: [0, 1, 0], transform: ['scaleX(.05)', 'scaleX(1)', 'scaleX(1)'] }, { duration: 0.82 });
    }
  };

  return (
    <div className={`task-orbit ${compact ? 'task-orbit-compact' : ''}`}>
      <div className="orbit-rings" aria-hidden="true"><i /><i /><i /></div>
      <div className="timeline-signal" aria-hidden="true" />
      <div className="orbit-origin" aria-hidden="true"><Orbit size={22} strokeWidth={1.2} /></div>
      {tasks.map((task, index) => {
        const angle = task.orbit * Math.PI * 2 - Math.PI / 2;
        const radiusX = compact ? 34 : 39;
        const radiusY = compact ? 33 : 37;
        const style: TaskStyle = {
          '--orbit-x': `${50 + Math.cos(angle) * radiusX}%`,
          '--orbit-y': `${50 + Math.sin(angle) * radiusY}%`,
          '--task-size': `${Math.min(124, 66 + task.duration * 0.45)}px`,
        };
        return (
          <AnimatePresence key={task.id} mode="popLayout">
            <motion.button
              className="task-matter"
              style={style}
              data-complete={task.completed}
              data-cursor={task.completed ? 'Complete' : 'Resolve'}
              disabled={task.completed}
              onClick={() => completeTask(task.id, task.title)}
              initial={reduced ? false : { opacity: 0, scale: 0.5 }}
              whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-10%' }}
              whileTap={reduced ? undefined : { scale: 0.94 }}
              transition={reduced ? { duration: 0 } : { delay: index * 0.08, type: 'spring', stiffness: 180, damping: 22 }}
              aria-label={task.completed ? `${task.title}, completed` : `Complete ${task.title}`}
            >
              <span className="task-core" aria-hidden="true" />
              <span className="task-time">{task.time}</span>
              <strong>{task.title}</strong>
              <span className="task-duration">{task.completed ? <><Check size={13} /> returned</> : `${task.duration} min`}</span>
            </motion.button>
          </AnimatePresence>
        );
      })}
      <p className="sr-only" aria-live="polite">{message}</p>
    </div>
  );
}
