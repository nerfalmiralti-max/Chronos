'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerPreference = window.matchMedia('(pointer: coarse)');
    let lenis: Lenis | null = null;

    const onScroll = () => ScrollTrigger.update();
    const onTick = (time: number) => lenis?.raf(time * 1000);
    const onVisibility = () => {
      if (!lenis) return;
      if (document.hidden) lenis.stop();
      else lenis.start();
    };

    const destroy = () => {
      if (!lenis) return;
      gsap.ticker.remove(onTick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      lenis = null;
    };

    const syncWithPreferences = () => {
      if (motionPreference.matches || pointerPreference.matches) {
        destroy();
        return;
      }
      if (lenis) return;
      lenis = new Lenis({ lerp: 0.075, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', onScroll);
      gsap.ticker.add(onTick);
      onVisibility();
    };

    gsap.ticker.lagSmoothing(0);
    motionPreference.addEventListener('change', syncWithPreferences);
    pointerPreference.addEventListener('change', syncWithPreferences);
    document.addEventListener('visibilitychange', onVisibility);
    syncWithPreferences();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      motionPreference.removeEventListener('change', syncWithPreferences);
      pointerPreference.removeEventListener('change', syncWithPreferences);
      destroy();
    };
  }, []);

  return null;
}
