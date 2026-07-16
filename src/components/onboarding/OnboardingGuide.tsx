'use client';

import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const STORAGE_KEY = 'kronos.onboarding.v1';

const steps = [
  {
    title: 'See your day',
    description: 'KRONOS brings your date, next task, and available time into one calm view.',
  },
  {
    title: 'Plan one block',
    description: 'Add a task, choose when it belongs, and give it a realistic duration.',
  },
  {
    title: 'Protect your attention',
    description: 'Start a focus session when the block begins. KRONOS keeps the moment clear.',
  },
] as const;

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function OnboardingGuide() {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const restoreFocus = useCallback(() => {
    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }, []);

  const close = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'complete');
    } catch {
      // The guide can still close when storage is unavailable.
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === 'complete') return;
    } catch {
      // Continue with an in-memory first visit when storage is unavailable.
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const frame = window.requestAnimationFrame(() => setOpen(true));

    return () => {
      window.cancelAnimationFrame(frame);
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => primaryRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) return;

    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const advance = () => {
    if (step === steps.length - 1) {
      close();
      return;
    }
    setStep((current) => current + 1);
    window.requestAnimationFrame(() => primaryRef.current?.focus());
  };

  const activeStep = steps[step];

  return (
    <AnimatePresence onExitComplete={restoreFocus}>
      {open ? (
        <motion.div
          className="onboarding-backdrop"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.24 }}
        >
          <motion.div
            ref={dialogRef}
            className="onboarding-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            aria-describedby="onboarding-description"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="onboarding-topline">
              <span>WELCOME TO KRONOS</span>
              <span aria-label={`Step ${step + 1} of ${steps.length}`}>{step + 1} / {steps.length}</span>
            </div>

            <div className="onboarding-progress" aria-hidden="true">
              {steps.map((item, index) => (
                <span key={item.title} data-active={index <= step} />
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeStep.title}
                className="onboarding-copy"
                initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
                transition={{ duration: reducedMotion ? 0 : 0.22 }}
              >
                <h2 id="onboarding-title">{activeStep.title}</h2>
                <p id="onboarding-description">{activeStep.description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="onboarding-actions">
              <button className="onboarding-skip" type="button" onClick={close}>Skip</button>
              <button ref={primaryRef} className="onboarding-primary" type="button" onClick={advance}>
                {step === steps.length - 1 ? 'Open Today' : 'Next'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
