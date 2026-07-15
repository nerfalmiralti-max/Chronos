'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, MoveRight } from 'lucide-react';
import { SceneStage } from '@/components/scene/SceneStage';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { MagneticCursor } from '@/components/motion/MagneticCursor';
import { WorldNav } from '@/components/navigation/WorldNav';
import { TaskOrbit } from '@/components/tasks/TaskOrbit';

gsap.registerPlugin(ScrollTrigger);

export function HomeExperience() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!root.current || reduced) return;
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(element, { y: 72, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: { trigger: element, start: 'top 86%', once: true },
        });
      });
      gsap.to('[data-hero-copy]', {
        yPercent: -18,
        opacity: 0.18,
        ease: 'none',
        scrollTrigger: { trigger: '#origin', start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
      gsap.to('[data-epoch]', {
        opacity: 1,
        stagger: 0.18,
        duration: 0.8,
        delay: 0.8,
        ease: 'power2.out',
      });
    }, root);
    return () => context.revert();
  }, [reduced]);

  return (
    <main id="main-content" ref={root} className="experience-shell">
      <SmoothScroll />
      <MagneticCursor />
      <SceneStage mode="home" />
      <WorldNav home />

      <section id="origin" className="hero-stage" aria-labelledby="hero-title">
        <div className="hero-sticky">
          <div className="epoch-scale" aria-hidden="true">
            {['DAYS', 'WEEKS', 'MONTHS', 'YEARS'].map((label, index) => <span key={label} data-epoch style={{ '--epoch': index } as CSSProperties}>{label}</span>)}
          </div>
          <div className="hero-copy intro-materialize" data-hero-copy>
            <p className="eyebrow">A SPATIAL OPERATING SYSTEM FOR TIME</p>
            <h1 id="hero-title">TIME IS NOT SPENT.<br /><em>TIME IS DESIGNED.</em></h1>
            <div className="hero-footer">
              <p>Move beyond schedules. Shape days, focus, and ambition as one continuous living material.</p>
              <Link className="text-link" href="/today" data-cursor="Enter">Enter the timeline <ArrowDownRight size={18} /></Link>
            </div>
          </div>
          <div className="scroll-cue" aria-hidden="true"><span>Travel through time</span><i /></div>
        </div>
      </section>

      <section id="scale" className="scale-stage section-stage" aria-labelledby="scale-title">
        <div className="section-index">01 / SCALE</div>
        <div className="scale-copy" data-reveal>
          <p className="eyebrow">THE TEMPORAL FILAMENT</p>
          <h2 id="scale-title">One material.<br />Four dimensions.</h2>
          <p className="lead">A day begins as a point. Seven points find rhythm. Months become constellations. Years become horizons.</p>
        </div>
        <div className="scale-notations" aria-label="Time scales">
          <div><span>01</span><strong>Day</strong><small>A point of intent</small></div>
          <div><span>07</span><strong>Week</strong><small>A connected rhythm</small></div>
          <div><span>12</span><strong>Month</strong><small>A field of gravity</small></div>
          <div><span>∞</span><strong>Year</strong><small>A visible horizon</small></div>
        </div>
      </section>

      <section id="matter" className="matter-stage section-stage" aria-labelledby="matter-title">
        <div className="matter-copy" data-reveal>
          <div className="section-index">02 / MATTER</div>
          <p className="eyebrow">TASKS HAVE MASS</p>
          <h2 id="matter-title">Your work should never feel like a list.</h2>
          <p className="lead">Every task occupies time. Duration defines its mass. Urgency shapes its orbit. Completion sends its energy back through the timeline.</p>
          <p className="microcopy">Select an object to resolve it.</p>
        </div>
        <TaskOrbit />
      </section>

      <section id="focus" className="focus-stage section-stage" aria-labelledby="focus-title">
        <div className="focus-aperture" aria-hidden="true"><i /><i /><i /></div>
        <div className="focus-copy" data-reveal>
          <div className="section-index">03 / FOCUS</div>
          <p className="eyebrow">THE TEMPORAL CHAMBER</p>
          <h2 id="focus-title">Protect one moment from everything else.</h2>
          <div className="focus-time" aria-label="Twenty-five minute focus duration">25<span>:</span>00</div>
          <Link className="glass-action" href="/timer" data-cursor="Focus">Open the chamber <MoveRight size={18} /></Link>
        </div>
      </section>

      <section className="memory-stage section-stage" aria-labelledby="memory-title">
        <div className="memory-copy" data-reveal>
          <div className="section-index">04 / MEMORY</div>
          <p className="eyebrow">TIME LEAVES A TRACE</p>
          <h2 id="memory-title">Progress is not a chart.<br />It is accumulated light.</h2>
        </div>
        <div className="memory-measures" data-reveal>
          <div><strong>34.7</strong><span>hours protected</span></div>
          <div><strong>18</strong><span>objects resolved</span></div>
          <div><strong>6</strong><span>arcs in motion</span></div>
        </div>
        <Link className="text-link memory-link" href="/analytics" data-cursor="Trace">Read the memory field <ArrowDownRight size={18} /></Link>
      </section>

      <section className="horizon-stage" aria-labelledby="horizon-title">
        <div className="horizon-line" aria-hidden="true" />
        <div data-reveal>
          <p className="eyebrow">THE HORIZON IS YOURS</p>
          <h2 id="horizon-title">Design what<br />comes next.</h2>
          <Link className="horizon-entry" href="/today" data-cursor="Begin"><span>Begin with now</span><MoveRight size={22} /></Link>
        </div>
        <footer><span>KRONOS / MMXXVI</span><span>TIME, MADE PHYSICAL</span></footer>
      </section>
    </main>
  );
}
