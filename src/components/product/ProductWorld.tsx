'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Pencil,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { MagneticCursor } from '@/components/motion/MagneticCursor';
import { WorldNav } from '@/components/navigation/WorldNav';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { SceneStage } from '@/components/scene/SceneStage';
import { usePublicGoals, usePublicMemory } from '@/hooks/usePublicField';
import { usePublicTasks } from '@/hooks/usePublicTasks';
import type { TemporalTask, WorldMode } from '@/types/kronos';

type ProductMode = Exclude<WorldMode, 'home'>;
type PositionedStyle = CSSProperties & { '--x': string; '--y': string; '--delay'?: string };

const worldCopy: Record<Exclude<ProductMode, 'timer'>, { index: string; eyebrow: string; title: string; lead: string }> = {
  today: {
    index: 'TODAY / LIVE',
    eyebrow: 'YOUR DAY AT A GLANCE',
    title: 'Today',
    lead: 'See what is next, place work into time, and protect one task from distraction.',
  },
  goals: {
    index: 'GOALS / DIRECTION',
    eyebrow: 'KEEP THE HORIZON VISIBLE',
    title: 'Goals',
    lead: 'Connect today’s focused work to the outcomes that matter over weeks and months.',
  },
  calendar: {
    index: 'PLAN / WEEK',
    eyebrow: 'GIVE IMPORTANT WORK A PLACE',
    title: 'Plan',
    lead: 'Choose a day, add a time block, and see the week without calendar clutter.',
  },
  analytics: {
    index: 'ANALYTICS / WEEK',
    eyebrow: 'UNDERSTAND YOUR RHYTHM',
    title: 'Analytics',
    lead: 'See how much time you protected, what moved forward, and when focus came most naturally.',
  },
};

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function minuteOfDay(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

function subscribeClock(callback: () => void) {
  const interval = window.setInterval(callback, 30_000);
  window.addEventListener('focus', callback);
  document.addEventListener('visibilitychange', callback);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener('focus', callback);
    document.removeEventListener('visibilitychange', callback);
  };
}

function clockSnapshot() {
  return Math.floor(Date.now() / 30_000);
}

function useClock() {
  const tick = useSyncExternalStore(subscribeClock, clockSnapshot, () => 0);
  return tick ? new Date(tick * 30_000) : null;
}

function taskDate(task: TemporalTask, today: string) {
  return task.date ?? today;
}

type TaskState = 'Scheduled' | 'Now' | 'Completed' | 'Missed';

function taskState(task: TemporalTask, now: Date | null, today: string): TaskState {
  if (task.completed) return 'Completed';
  const plannedDate = taskDate(task, today);
  if (plannedDate < today) return 'Missed';
  if (plannedDate > today || !now) return 'Scheduled';
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const start = minuteOfDay(task.time);
  if (currentMinute >= start && currentMinute < start + task.duration) return 'Now';
  return currentMinute >= start + task.duration ? 'Missed' : 'Scheduled';
}

function nextRoundedTime(now: Date) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const rounded = Math.min(23 * 60 + 45, Math.ceil(minutes / 15) * 15);
  return `${Math.floor(rounded / 60).toString().padStart(2, '0')}:${(rounded % 60).toString().padStart(2, '0')}`;
}

function TaskComposer({ id, defaultDate, onAdded }: { id: string; defaultDate: string; onAdded?: () => void }) {
  const { add } = usePublicTasks();
  const now = useClock();
  const reduced = useReducedMotion();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('45');
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [invalid, setInvalid] = useState(false);

  const plannedDate = date || defaultDate;
  const plannedTime = time || (now ? nextRoundedTime(now) : '09:00');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const added = add(title, { date: plannedDate || undefined, time: plannedTime, duration: Number(duration) });
    if (!added) {
      setInvalid(true);
      setMessage('Add a task name with at least two characters.');
      return;
    }
    setInvalid(false);
    setMessage(`${title.trim()} is planned for ${plannedTime}.`);
    setTitle('');
    setExpanded(false);
    onAdded?.();
  };

  return (
    <form className="task-composer" onSubmit={submit}>
      <label htmlFor={id}>Add a task</label>
      <div className="composer-primary">
        <input
          id={id}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (invalid) {
              setInvalid(false);
              setMessage('');
            }
          }}
          placeholder="What needs your attention?"
          autoComplete="off"
          aria-invalid={invalid}
          aria-describedby={`${id}-feedback`}
        />
        <button className="primary-button" type="submit" data-cursor="Add task"><Plus size={18} /><span>Add task</span></button>
      </div>
      <button className="disclosure-button" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
        <Clock3 size={15} /> {expanded ? 'Hide details' : 'Set time and duration'} <ChevronDown size={14} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            className="composer-details"
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            <label><span>Date</span><input type="date" value={plannedDate} onChange={(event) => setDate(event.target.value)} /></label>
            <label><span>Start time</span><input type="time" value={plannedTime} onChange={(event) => setTime(event.target.value)} /></label>
            <label><span>Duration</span><select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="25">25 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option><option value="90">1.5 hours</option></select></label>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <p id={`${id}-feedback`} className={invalid ? 'form-feedback form-feedback-error' : 'form-feedback'} aria-live="polite">{message}</p>
    </form>
  );
}

function TaskRow({ task, now, today, onOpen }: { task: TemporalTask; now: Date | null; today: string; onOpen?: () => void }) {
  const { complete, remove, reschedule, update } = usePublicTasks();
  const reduced = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(task.date ?? today);
  const [time, setTime] = useState(task.time);
  const [duration, setDuration] = useState(String(task.duration));
  const [error, setError] = useState('');
  const state = taskState(task, now, today);

  const beginEdit = () => {
    setTitle(task.title);
    setDate(task.date ?? today);
    setTime(task.time);
    setDuration(String(task.duration));
    setError('');
    setEditing(true);
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!update(task.id, { title, date, time, duration: Number(duration) })) {
      setError('Check the task name, time, and duration.');
      return;
    }
    setError('');
    setEditing(false);
  };

  const confirmRemove = () => {
    if (window.confirm(`Delete “${task.title}”? This cannot be undone.`)) remove(task.id);
  };

  return (
    <li>
      <details className="schedule-row" data-state={state.toLowerCase()} onToggle={(event) => { if (event.currentTarget.open) onOpen?.(); }}>
        <summary>
          <time>{task.time}</time>
          <span className="schedule-copy"><strong>{task.title}</strong><small>{task.duration} min · {state}</small></span>
          <span className="schedule-status">{state}</span>
          <ChevronDown size={17} aria-hidden="true" />
        </summary>
        <div className="schedule-detail">
          <div className="task-row-actions">
            {!task.completed ? <Link className="compact-primary" href={`/timer?task=${encodeURIComponent(task.id)}&start=1`}><Play size={15} /> Start focus</Link> : null}
            {!task.completed ? <button type="button" onClick={() => complete(task.id)}><Check size={15} /> Complete</button> : null}
            {!task.completed ? <button type="button" onClick={() => reschedule(task.id, 30)}><Clock3 size={15} /> Move 30 min</button> : null}
            <button type="button" onClick={() => editing ? setEditing(false) : beginEdit()} aria-expanded={editing}><Pencil size={15} /> {editing ? 'Cancel edit' : 'Edit'}</button>
            <button className="destructive-action" type="button" onClick={confirmRemove}><Trash2 size={15} /> Delete</button>
          </div>
          <AnimatePresence initial={false}>
            {editing ? (
              <motion.form className="task-edit-form" onSubmit={save} initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reduced ? 0 : 0.18 }}>
                <label><span>Task</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
                <label><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
                <label><span>Time</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
                <label><span>Minutes</span><input type="number" min="5" max="480" step="5" value={duration} onChange={(event) => setDuration(event.target.value)} /></label>
                <button className="compact-primary" type="submit">Save changes</button>
                <p role="alert">{error}</p>
              </motion.form>
            ) : null}
          </AnimatePresence>
        </div>
      </details>
    </li>
  );
}

function DayTimeline({ tasks, now, today, showCurrent = true, onAdd, onTaskOpen }: { tasks: TemporalTask[]; now: Date | null; today: string; showCurrent?: boolean; onAdd: () => void; onTaskOpen?: () => void }) {
  const sorted = useMemo(() => [...tasks].sort((a, b) => minuteOfDay(a.time) - minuteOfDay(b.time)), [tasks]);
  const currentMinute = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const progress = showCurrent && now ? Math.round(currentMinute / 1440 * 100) : 0;

  return (
    <section className="day-timeline" aria-labelledby="timeline-title">
      <div className="timeline-heading">
        <div><p className="plain-eyebrow">DAY TIMELINE</p><h2 id="timeline-title">Your time blocks</h2></div>
        {showCurrent ? <div className="day-progress-label"><span>Day progress</span><strong>{progress}%</strong></div> : <span className="block-count">{sorted.length} {sorted.length === 1 ? 'block' : 'blocks'}</span>}
      </div>
      {showCurrent ? (
        <div className="day-progress-track" role="progressbar" aria-label="Day progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ width: `${progress}%` }} /><b style={{ left: `${progress}%` }} /></div>
      ) : null}
      {sorted.length ? (
        <>
          <div className="day-map" role="img" aria-label={`A 24-hour map with ${sorted.length} planned ${sorted.length === 1 ? 'block' : 'blocks'}`}>
            <div className="day-map-track" aria-hidden="true">
              {sorted.map((task) => {
                const start = minuteOfDay(task.time) / 1440 * 100;
                const width = Math.max(0.5, task.duration / 1440 * 100);
                return <span key={task.id} data-state={taskState(task, now, today).toLowerCase()} style={{ left: `${start}%`, width: `${Math.min(width, 100 - start)}%` }} title={`${task.title}, ${task.time}, ${task.duration} minutes`} />;
              })}
              {showCurrent ? <b style={{ left: `${progress}%` }} /> : null}
            </div>
            <div className="day-map-labels" aria-hidden="true"><span>00:00</span><span>12:00</span><span>24:00</span></div>
          </div>
          <ol className="schedule-list">{sorted.map((task) => <TaskRow key={task.id} task={task} now={now} today={today} onOpen={onTaskOpen} />)}</ol>
        </>
      ) : (
        <div className="empty-day">
          <h3>Nothing planned yet.</h3>
          <p>Add one task and give it a place in your day.</p>
          <button className="primary-button" type="button" onClick={onAdd}><Plus size={18} /> Add first task</button>
        </div>
      )}
    </section>
  );
}

function TodayField() {
  const now = useClock();
  const { tasks, complete } = usePublicTasks();
  const [showHint, setShowHint] = useState(false);
  const today = now ? dateKey(now) : '';
  const todayTasks = useMemo(() => today ? tasks.filter((task) => taskDate(task, today) === today) : tasks, [tasks, today]);
  const pending = todayTasks.filter((task) => !task.completed).sort((a, b) => minuteOfDay(a.time) - minuteOfDay(b.time));
  const primary = pending.find((task) => taskState(task, now, today) === 'Now')
    ?? pending.find((task) => taskState(task, now, today) === 'Scheduled')
    ?? pending[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try { setShowHint(window.localStorage.getItem('kronos.timeline-tip.v1') !== 'done'); } catch { setShowHint(true); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const focusComposer = () => document.getElementById('today-task-title')?.focus();
  const dismissHint = () => {
    setShowHint(false);
    try { window.localStorage.setItem('kronos.timeline-tip.v1', 'done'); } catch { /* The hint can remain session-only. */ }
  };

  const dateLabel = now ? new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(now) : 'Loading today';
  const timeLabel = now ? new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(now) : '—';

  return (
    <div className="today-field world-composition">
      <OnboardingGuide />
      <section className="today-overview" aria-labelledby="today-status-title">
        <div className="today-clock"><div><span>{dateLabel}</span><strong>{timeLabel}</strong></div><p>Stored privately on this device</p></div>
        <div className="next-task-card">
          <p className="plain-eyebrow">{primary ? taskState(primary, now, today) === 'Now' ? 'ACTIVE NOW' : 'NEXT TIME BLOCK' : 'YOUR NEXT STEP'}</p>
          <h2 id="today-status-title">{primary?.title ?? 'Plan your first task'}</h2>
          <p>{primary ? `${primary.time} · ${primary.duration} minutes` : 'Today is open. Add one meaningful task to begin.'}</p>
          <div className="primary-action-row">
            {primary ? <Link className="primary-button" href={`/timer?task=${encodeURIComponent(primary.id)}&start=1`}><Play size={18} /> Start focus <ArrowRight size={17} /></Link> : <button className="primary-button" type="button" onClick={focusComposer}><Plus size={18} /> Add first task</button>}
            {primary ? <button className="secondary-button" type="button" onClick={() => complete(primary.id)}><Check size={17} /> Mark complete</button> : null}
          </div>
        </div>
        <TaskComposer key={today || 'today-pending'} id="today-task-title" defaultDate={today} onAdded={dismissHint} />
      </section>
      {showHint ? <div className="context-hint" role="note"><span>Tip</span><p>Add a task, then open its details to move, edit, or start focus.</p><button type="button" onClick={dismissHint}>Got it</button></div> : null}
      <DayTimeline tasks={todayTasks} now={now} today={today} onAdd={focusComposer} onTaskOpen={dismissHint} />
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
          style={{ '--x': `${goal.x}%`, '--y': `${goal.y}%`, '--delay': `${index * 0.08}s` } as PositionedStyle}
          aria-pressed={selected.id === goal.id}
          onClick={() => setSelectedId(goal.id)}
          data-cursor="View goal"
        >
          <span aria-hidden="true" />
          <strong>{goal.progress}%</strong>
          <small>{goal.label}</small>
        </button>
      ))}
      <div key={selected.id} className="goal-reading reading-materialize">
        <p>SELECTED GOAL</p>
        <h2>{selected.label}</h2>
        <div><span aria-live="polite">{selected.progress}% complete</span><span>{selected.horizon} remaining</span></div>
        <button className="arc-action" onClick={() => advance(selected.id)} disabled={selected.progress >= 100} data-cursor="Record progress">
          <Plus size={15} /> {selected.progress >= 100 ? 'Goal complete' : 'Record 5% progress'}
        </button>
      </div>
    </div>
  );
}

function PlanField() {
  const now = useClock();
  const { tasks } = usePublicTasks();
  const [selectedOffset, setSelectedOffset] = useState(0);
  if (!now) return <div className="plan-field plan-pending world-composition" aria-busy="true"><p>Loading your week…</p></div>;

  const today = dateKey(now);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const value = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
    return { value, key: dateKey(value) };
  });
  const selected = dates[selectedOffset];
  const plannedTasks = tasks.filter((task) => taskDate(task, today) === selected.key);
  const focusComposer = () => document.getElementById('plan-task-title')?.focus();

  return (
    <div className="plan-field world-composition">
      <nav className="week-strip" aria-label="Choose a day to plan">
        {dates.map(({ value, key }, index) => (
          <button key={key} type="button" aria-pressed={selectedOffset === index} onClick={() => setSelectedOffset(index)}>
            <span>{index === 0 ? 'Today' : new Intl.DateTimeFormat('en', { weekday: 'short' }).format(value)}</span>
            <strong>{value.getDate()}</strong>
          </button>
        ))}
      </nav>
      <div className="plan-layout">
        <section className="plan-composer-panel">
          <p className="plain-eyebrow">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(selected.value)}</p>
          <h2>Plan one clear block.</h2>
          <p>Start with the task name. Time and duration stay optional until you need them.</p>
          <TaskComposer key={selected.key} id="plan-task-title" defaultDate={selected.key} />
        </section>
        <DayTimeline tasks={plannedTasks} now={now} today={today} showCurrent={selectedOffset === 0} onAdd={focusComposer} />
      </div>
    </div>
  );
}

function AnalyticsField() {
  const { memory } = usePublicMemory();
  const peak = Math.max(1, ...memory.dailyMinutes);
  const totalMinutes = memory.dailyMinutes.reduce((sum, minutes) => sum + minutes, 0);
  const bestIndex = memory.dailyMinutes.indexOf(Math.max(...memory.dailyMinutes));
  const average = Math.round(totalMinutes / Math.max(1, memory.dailyMinutes.filter(Boolean).length));
  const bestDay = totalMinutes > 0 ? dayNames[bestIndex] : '—';

  return (
    <div className="analytics-field world-composition">
      <section className="analytics-summary" aria-labelledby="weekly-focus-title">
        <p className="plain-eyebrow">FOCUS THIS WEEK</p>
        <h2 id="weekly-focus-title">{Math.floor(totalMinutes / 60)}<em>h</em> {totalMinutes % 60}<em>m</em></h2>
        <p>{totalMinutes > 0 ? `You protected an average of ${average} minutes on active days.` : 'Complete a focus session to begin seeing your weekly rhythm.'}</p>
        <div className="analytics-metrics">
          <div><strong>{memory.resolvedCount}</strong><span>Tasks completed</span></div>
          <div><strong>{bestDay}</strong><span>Most productive day</span></div>
          <div><strong>{memory.coherence}%</strong><span>Plan consistency</span></div>
        </div>
      </section>
      <figure className="weekly-chart" aria-labelledby="weekly-chart-title">
        <figcaption id="weekly-chart-title"><span>Daily focused time</span><strong>Minutes</strong></figcaption>
        <div className="weekly-bars">
          {memory.dailyMinutes.map((minutes, index) => (
            <div key={dayNames[index]} className="weekly-bar" aria-label={`${dayNames[index]}: ${minutes} minutes`}>
              <span className="bar-value">{minutes}</span>
              <i style={{ height: `${minutes === 0 ? 0 : Math.max(6, minutes / peak * 100)}%` }} />
              <small>{dayNames[index].slice(0, 3)}</small>
            </div>
          ))}
        </div>
      </figure>
      <p className="analytics-insight"><span>Weekly insight</span>{totalMinutes > 0 ? `Your strongest focus appeared on ${dayNames[bestIndex]}. Protect a similar block next week.` : 'Your first completed session will reveal where focused time begins to gather.'}</p>
    </div>
  );
}

function TimerField() {
  const defaultFocusSeconds = 25 * 60;
  const { tasks, complete } = usePublicTasks();
  const { recordFocus } = usePublicMemory();
  const reduced = useReducedMotion();
  const initialized = useRef(false);
  const resultRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState('');
  const [total, setTotal] = useState(defaultFocusSeconds);
  const [remaining, setRemaining] = useState(defaultFocusSeconds);
  const [running, setRunning] = useState(false);
  const [sessionKind, setSessionKind] = useState<'focus' | 'break'>('focus');
  const [finishedMinutes, setFinishedMinutes] = useState(0);
  const availableTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? availableTasks[0];
  const selectableTasks = useMemo(() => {
    const selected = tasks.find((task) => task.id === selectedId);
    return selected?.completed ? [selected, ...availableTasks] : availableTasks;
  }, [availableTasks, selectedId, tasks]);

  useEffect(() => {
    if (initialized.current) return;
    const frame = window.requestAnimationFrame(() => {
      if (initialized.current) return;
      initialized.current = true;
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('task');
      const requested = queryId ? tasks.find((task) => task.id === queryId && !task.completed) : undefined;
      const target = requested ?? availableTasks[0];
      const seconds = (target?.duration ?? 25) * 60;
      setSelectedId(target?.id ?? '');
      setTotal(seconds);
      setRemaining(seconds);
      setRunning(params.get('start') === '1');
    });
    return () => window.cancelAnimationFrame(frame);
  }, [availableTasks, tasks]);

  useEffect(() => {
    if (!running) return;
    const timeout = window.setTimeout(() => {
      if (remaining <= 1) {
        setRemaining(0);
        setRunning(false);
        const minutes = Math.max(1, Math.round(total / 60));
        setFinishedMinutes(minutes);
        if (sessionKind === 'focus') recordFocus(minutes);
      } else {
        setRemaining(remaining - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [recordFocus, remaining, running, sessionKind, total]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setRunning(false); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (remaining === 0) resultRef.current?.focus();
  }, [remaining]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');
  const progress = 1 - remaining / total;
  const resultDuration = `${finishedMinutes} ${finishedMinutes === 1 ? 'minute' : 'minutes'} of focus.`;
  const completeSession = () => {
    const elapsed = total - remaining;
    if (elapsed <= 0) return;
    const minutesSpent = Math.max(1, Math.round(elapsed / 60));
    setRunning(false);
    setRemaining(0);
    setFinishedMinutes(minutesSpent);
    if (sessionKind === 'focus') recordFocus(minutesSpent);
  };
  const chooseTask = (id: string) => {
    const task = tasks.find((candidate) => candidate.id === id && !candidate.completed);
    const secondsForTask = (task?.duration ?? 25) * 60;
    setSelectedId(task?.id ?? '');
    setSessionKind('focus');
    setTotal(secondsForTask);
    setRemaining(secondsForTask);
    setFinishedMinutes(0);
    setRunning(false);
  };
  const beginFocus = () => {
    const target = selectedTask && !selectedTask.completed ? selectedTask : availableTasks[0];
    const secondsForTask = (target?.duration ?? 25) * 60;
    setSelectedId(target?.id ?? '');
    setSessionKind('focus');
    setTotal(secondsForTask);
    setRemaining(secondsForTask);
    setFinishedMinutes(0);
    setRunning(true);
  };
  const beginBreak = () => {
    setSessionKind('break');
    setTotal(5 * 60);
    setRemaining(5 * 60);
    setFinishedMinutes(0);
    setRunning(true);
  };

  return (
    <div className="timer-field world-composition focus-composition" style={{ '--progress': `${progress * 360}deg` } as CSSProperties}>
      <div className="focus-task-select">
        <label htmlFor="focus-task">Focus on</label>
        <select id="focus-task" value={selectedTask?.id ?? ''} disabled={running} onChange={(event) => chooseTask(event.target.value)}>
          {selectableTasks.length ? selectableTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>) : <option value="">Open focus session</option>}
        </select>
      </div>
      <div className="timer-aperture" aria-hidden="true"><i /><i /><i /></div>
      {remaining === 0 ? (
        <motion.section ref={resultRef} className="session-result" tabIndex={-1} role="status" aria-live="polite" initial={reduced ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} aria-labelledby="session-result-title">
          <span className="result-mark"><Check size={22} /></span>
          <p className="plain-eyebrow">{sessionKind === 'focus' ? 'SESSION COMPLETE' : 'BREAK COMPLETE'}</p>
          <h1 id="session-result-title">{sessionKind === 'focus' ? resultDuration : 'Ready when you are.'}</h1>
          <p>{sessionKind === 'focus' ? selectedTask?.title ?? 'Focused time' : 'Your attention has room again.'}</p>
          <div className="session-actions">
            {sessionKind === 'focus' && selectedTask && !selectedTask.completed ? <button className="primary-button" type="button" onClick={() => complete(selectedTask.id)}><Check size={17} /> Complete task</button> : null}
            <button className={sessionKind === 'break' ? 'primary-button' : 'secondary-button'} type="button" onClick={beginFocus}><Play size={17} /> Continue focus</button>
            {sessionKind === 'focus' ? <button className="secondary-button" type="button" onClick={beginBreak}>Take a 5-minute break</button> : null}
          </div>
        </motion.section>
      ) : (
        <motion.div className="timer-reading" animate={running && !reduced ? { scale: [1, 1.006, 1] } : undefined} transition={{ duration: 4, repeat: Infinity }}>
          <span role="status" aria-live="polite" aria-atomic="true">{running ? sessionKind === 'focus' ? 'FOCUS IN PROGRESS' : 'BREAK IN PROGRESS' : 'READY TO BEGIN'}</span>
          <h1>{sessionKind === 'break' ? 'Short break' : selectedTask?.title ?? 'Open focus session'}</h1>
          <strong aria-live="off" aria-label={`${minutes} minutes ${seconds} seconds remaining`}>{minutes}<em>:</em>{seconds}</strong>
          <p>{running ? 'Everything else can wait.' : 'One task. One protected interval.'}</p>
        </motion.div>
      )}
      {remaining > 0 ? (
        <div className="timer-controls">
          <button className="focus-toggle" onClick={() => setRunning((value) => !value)} data-cursor={running ? 'Pause' : 'Start'}><span>{running ? <Pause /> : <Play />}</span>{running ? 'Pause' : 'Start focus'}</button>
          <button onClick={() => { setRunning(false); setRemaining(total); setFinishedMinutes(0); }} data-cursor="Reset"><RotateCcw /> Reset</button>
          <button onClick={completeSession} disabled={remaining === total} data-cursor="Finish"><Check /> Finish</button>
        </div>
      ) : null}
    </div>
  );
}

function WorldComposition({ mode }: { mode: ProductMode }) {
  if (mode === 'today') return <TodayField />;
  if (mode === 'goals') return <GoalsField />;
  if (mode === 'calendar') return <PlanField />;
  if (mode === 'analytics') return <AnalyticsField />;
  return <TimerField />;
}

export function ProductWorld({ mode }: { mode: ProductMode }) {
  const focusMode = mode === 'timer';
  const copy = focusMode ? null : worldCopy[mode];
  return (
    <main id="main-content" className={`product-world product-world-${mode} ${focusMode ? 'product-world-focus-mode' : ''}`}>
      {!focusMode ? <MagneticCursor /> : null}
      <SceneStage mode={mode} />
      <WorldNav focus={focusMode} />
      {copy ? (
        <section className="product-intro">
          <div className="intro-materialize">
            <span className="section-index">{copy.index}</span>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="lead">{copy.lead}</p>
          </div>
        </section>
      ) : null}
      <WorldComposition mode={mode} />
      {!focusMode ? <footer className="product-footer"><span>KRONOS / PUBLIC MODE</span><span><Check size={13} /> Saved on this device</span></footer> : null}
    </main>
  );
}
