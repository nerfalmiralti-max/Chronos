'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { MagneticCursor } from '@/components/motion/MagneticCursor';
import { WorldNav } from '@/components/navigation/WorldNav';
import { SceneStage } from '@/components/scene/SceneStage';
import { TaskOrbit } from '@/components/tasks/TaskOrbit';
import { usePublicGoals, usePublicMemory } from '@/hooks/usePublicField';
import { usePublicTasks } from '@/hooks/usePublicTasks';
import type { WorldMode } from '@/types/kronos';

type ProductMode = Exclude<WorldMode, 'home'>;
type PositionedStyle = CSSProperties & { '--x': string; '--y': string; '--delay'?: string };

const worldCopy: Record<ProductMode, { index: string; eyebrow: string; title: string; lead: string }> = {
  today: {
    index: 'WORLD 01 / NOW',
    eyebrow: 'THE PRESENT HAS GRAVITY',
    title: 'Now Field',
    lead: 'Your day is not a column of obligations. It is a living field of mass, energy, and available attention.',
  },
  goals: {
    index: 'WORLD 02 / ARC',
    eyebrow: 'AMBITION HAS DISTANCE',
    title: 'Long Arc',
    lead: 'A goal is a gravitational anchor in the future. Every protected hour bends the present toward it.',
  },
  calendar: {
    index: 'WORLD 03 / ORBIT',
    eyebrow: 'A MONTH IS A CONSTELLATION',
    title: 'Time Orbit',
    lead: 'Dates stop behaving like boxes. They become a navigable topology of rhythm, density, and possibility.',
  },
  analytics: {
    index: 'WORLD 04 / MEMORY',
    eyebrow: 'COMPLETED TIME BECOMES LIGHT',
    title: 'Memory Field',
    lead: 'Your history is not reduced to a chart. Every focused moment remains visible as a trace through space.',
  },
  timer: {
    index: 'WORLD 05 / FOCUS',
    eyebrow: 'ONE MOMENT. FULLY PROTECTED.',
    title: 'Temporal Chamber',
    lead: 'The world recedes. One interval becomes the only material that matters.',
  },
};

function TodayField() {
  const { add } = usePublicTasks();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!add(title)) {
      setMessage('Give the object a name of at least two characters.');
      return;
    }
    setMessage(`${title.trim()} entered the field.`);
    setTitle('');
  };
  return (
    <div className="today-field world-composition">
      <TaskOrbit compact />
      <form className="object-composer" onSubmit={submit}>
        <label htmlFor="temporal-object">Materialize a task</label>
        <div>
          <input id="temporal-object" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Name the next meaningful object" autoComplete="off" />
          <button type="submit" data-cursor="Create"><Plus size={18} /><span>Add to now</span></button>
        </div>
        <p aria-live="polite">{message}</p>
      </form>
    </div>
  );
}

function GoalsField() {
  const { goals, advance } = usePublicGoals();
  const [selectedId, setSelectedId] = useState(goals[0].id);
  const selected = goals.find((goal) => goal.id === selectedId) ?? goals[0];
  return (
    <div className="goal-field world-composition">
      <div className="goal-filament" aria-hidden="true" />
      {goals.map((goal, index) => (
        <button
          key={goal.id}
          className="goal-anchor"
          style={{ '--x': `${goal.x}%`, '--y': `${goal.y}%`, '--delay': `${index * 0.12}s` } as PositionedStyle}
          aria-pressed={selected.id === goal.id}
          onClick={() => setSelectedId(goal.id)}
          data-cursor="Inspect"
        >
          <span aria-hidden="true" />
          <strong>{goal.progress}%</strong>
          <small>{goal.label}</small>
        </button>
      ))}
      <div key={selected.id} className="goal-reading reading-materialize">
        <p>SELECTED ARC</p>
        <h2>{selected.label}</h2>
        <div><span aria-live="polite">{selected.progress}% aligned</span><span>{selected.horizon} to horizon</span></div>
        <button className="arc-action" onClick={() => advance(selected.id)} disabled={selected.progress >= 100} data-cursor="Advance">
          <Plus size={15} /> {selected.progress >= 100 ? 'Arc aligned' : 'Advance arc'}
        </button>
      </div>
    </div>
  );
}

function currentDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}

function subscribeCalendar(callback: () => void) {
  const interval = window.setInterval(callback, 60_000);
  window.addEventListener('focus', callback);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener('focus', callback);
  };
}

function CalendarField() {
  const dateKey = useSyncExternalStore(subscribeCalendar, currentDateKey, () => '');
  const [selected, setSelected] = useState(0);

  if (!dateKey) {
    return (
      <div className="calendar-field calendar-pending world-composition" aria-busy="true">
        <p className="month-label">Locating current orbit</p>
        <div className="constellation-ring" aria-hidden="true" />
      </div>
    );
  }

  const [year, month, today] = dateKey.split('-').map(Number);
  const orbitDate = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const activeDay = Math.min(selected || today, daysInMonth);
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(orbitDate);
  const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(orbitDate);
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const angle = index / daysInMonth * Math.PI * 2 - Math.PI / 2;
    const wave = Math.sin(index * 1.7) * 5;
    return {
      day: index + 1,
      x: 50 + Math.cos(angle) * (35 + wave),
      y: 50 + Math.sin(angle) * (34 + wave * 0.45),
    };
  });
  return (
    <div className="calendar-field world-composition">
      <p className="month-label">{monthLabel}</p>
      <div className="constellation-ring" aria-hidden="true" />
      <div className="day-constellation" role="group" aria-label="Select a day">
        {days.map(({ day, x, y }) => (
          <button
            key={day}
            className="day-node"
            style={{ '--x': `${x}%`, '--y': `${y}%` } as PositionedStyle}
            aria-pressed={activeDay === day}
            aria-label={`${day} ${monthName}`}
            onClick={() => setSelected(day)}
            data-cursor={`${day}`}
          >
            <span>{day}</span>
          </button>
        ))}
      </div>
      <div className="calendar-reading"><span>ACTIVE COORDINATE</span><strong>{activeDay.toString().padStart(2, '0')}</strong><p>{activeDay === today ? 'The present point' : 'Open spatial capacity'}</p></div>
    </div>
  );
}

function AnalyticsField() {
  const { memory } = usePublicMemory();
  const peak = Math.max(1, ...memory.dailyMinutes);
  const traces = memory.dailyMinutes.map((minutes) => Math.round(30 + minutes / peak * 66));
  const total = (memory.dailyMinutes.reduce((sum, minutes) => sum + minutes, 0) / 60).toFixed(1);
  const [hours, fraction] = total.split('.');
  return (
    <div className="analytics-field world-composition">
      <div className="trace-field" aria-hidden="true">
        {traces.map((height, index) => <i key={height + index} style={{ '--trace': `${height}%`, '--delay': `${index * 0.08}s` } as CSSProperties} />)}
      </div>
      <div className="memory-primary"><span>PROTECTED THIS CYCLE</span><strong>{hours}<em>.{fraction}</em></strong><small>hours of designed time</small></div>
      <div className="memory-secondary"><div><strong>{memory.resolvedCount}</strong><span>objects resolved</span></div><div><strong>{(peak / 60).toFixed(1)}h</strong><span>deepest current</span></div><div><strong>{memory.coherence}%</strong><span>intent held</span></div></div>
      <p className="memory-summary">Your most coherent rhythm appeared on Thursday between 09:00 and 12:20.</p>
    </div>
  );
}

function TimerField() {
  const total = 25 * 60;
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const reduced = useReducedMotion();
  const { recordFocus } = usePublicMemory();
  useEffect(() => {
    if (!running) return;
    const timeout = window.setTimeout(() => {
      if (remaining <= 1) {
        setRemaining(0);
        setRunning(false);
        recordFocus(total / 60);
      } else {
        setRemaining(remaining - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [recordFocus, remaining, running, total]);
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setRunning(false); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');
  const progress = 1 - remaining / total;
  return (
    <div className="timer-field world-composition" style={{ '--progress': `${progress * 360}deg` } as CSSProperties}>
      <div className="timer-aperture" aria-hidden="true"><i /><i /><i /></div>
      <motion.div className="timer-reading" animate={running && !reduced ? { scale: [1, 1.008, 1] } : undefined} transition={{ duration: 4, repeat: Infinity }}>
        <span role="status" aria-live="polite" aria-atomic="true">{running ? 'CHAMBER ACTIVE' : remaining === 0 ? 'INTERVAL COMPLETE' : 'READY WHEN YOU ARE'}</span>
        <strong aria-live="off" aria-label={`${minutes} minutes ${seconds} seconds remaining`}>{minutes}<em>:</em>{seconds}</strong>
        <p>Shape the defining work</p>
      </motion.div>
      <div className="timer-controls">
        <button onClick={() => {
          if (remaining === 0) setRemaining(total);
          setRunning((value) => !value);
        }} data-cursor={running ? 'Pause' : 'Begin'} aria-label={running ? 'Pause timer' : 'Start timer'}>{running ? <Pause /> : <Play />}</button>
        <button onClick={() => { setRunning(false); setRemaining(total); }} data-cursor="Reset" aria-label="Reset timer"><RotateCcw /></button>
      </div>
    </div>
  );
}

function WorldComposition({ mode }: { mode: ProductMode }) {
  if (mode === 'today') return <TodayField />;
  if (mode === 'goals') return <GoalsField />;
  if (mode === 'calendar') return <CalendarField />;
  if (mode === 'analytics') return <AnalyticsField />;
  return <TimerField />;
}

export function ProductWorld({ mode }: { mode: ProductMode }) {
  const copy = worldCopy[mode];
  return (
    <main id="main-content" className={`product-world product-world-${mode}`}>
      <MagneticCursor />
      <SceneStage mode={mode} />
      <WorldNav />
      <section className="product-intro">
        <div className="intro-materialize">
          <span className="section-index">{copy.index}</span>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>
      </section>
      <WorldComposition mode={mode} />
      <footer className="product-footer"><span>KRONOS / PUBLIC FIELD</span><span><Check size={13} /> Stored on this device</span></footer>
    </main>
  );
}
