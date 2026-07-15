import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { shouldPlaySceneVideo, syncSceneVideoPlayback } from './scene-video-playback';

const VIDEO_SRC = '/media/Scene.mp4';
const POSTER_SRC = '/media/scene-poster.png';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return true;
}

const styles = `
  .chronos-scene-tab {
    position: relative;
    display: block;
    width: clamp(58px, 18vw, 76px);
    aspect-ratio: 4 / 3;
    flex: 0 0 auto;
    overflow: hidden;
    border: 0;
    border-radius: 17px;
    background:
      radial-gradient(circle at 28% 16%, rgba(120, 175, 255, 0.2), transparent 46%),
      rgba(3, 7, 17, 0.88);
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.16),
      inset 0 -1px 0 rgba(120, 175, 255, 0.08),
      0 13px 30px rgba(0, 0, 0, 0.35),
      0 0 28px rgba(40, 109, 255, 0.1);
    isolation: isolate;
    pointer-events: none;
  }

  .chronos-scene-tab::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 34%),
      radial-gradient(circle at 72% 82%, rgba(138, 124, 255, 0.12), transparent 46%);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.055);
    pointer-events: none;
  }

  .chronos-scene-media {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: inherit;
    object-fit: contain;
    object-position: center;
    filter: invert(1) grayscale(1) contrast(1.06) brightness(0.9);
    transform: scale(1.7);
    transform-origin: center;
    mix-blend-mode: screen;
    -webkit-mask-image: radial-gradient(ellipse 91% 84% at 50% 47%, #000 58%, rgba(0, 0, 0, 0.88) 78%, transparent 100%);
    mask-image: radial-gradient(ellipse 91% 84% at 50% 47%, #000 58%, rgba(0, 0, 0, 0.88) 78%, transparent 100%);
    user-select: none;
    pointer-events: none;
  }

  .chronos-scene-video {
    z-index: 1;
  }

  .chronos-scene-poster {
    z-index: 0;
  }

  .chronos-scene-status {
    position: absolute;
    right: 7px;
    bottom: 6px;
    z-index: 3;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.34);
    transition: background-color 180ms ease, box-shadow 180ms ease;
  }

  .chronos-scene-tab[data-active="true"] .chronos-scene-status {
    background: #78afff;
    box-shadow: 0 0 11px rgba(120, 175, 255, 0.9);
  }

  @media (min-width: 768px) {
    .chronos-scene-tab {
      width: 82px;
      border-radius: 20px;
    }

    .chronos-scene-media {
      transform: scale(1.55);
    }
  }

  @media (min-width: 1200px) {
    .chronos-scene-tab {
      width: 92px;
      border-radius: 22px;
    }

    .chronos-scene-media {
      transform: scale(1.45);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chronos-scene-status {
      transition: none;
    }
  }
`;

export function FloatingSceneNavigation({ focused = false }: { focused?: boolean }) {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [saveData] = useState(() => typeof navigator !== 'undefined'
    && Boolean((navigator as NavigatorWithConnection).connection?.saveData));

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      const timer = globalThis.setTimeout(() => {
        setHasEnteredViewport(true);
        setInViewport(true);
      }, 0);
      return () => globalThis.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(([entry]) => {
      const visible = Boolean(entry?.isIntersecting);
      setInViewport(visible);
      if (visible) setHasEnteredViewport(true);
    }, { rootMargin: '72px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const canRenderVideo = hasEnteredViewport && !reducedMotion && !saveData && !videoError;

  useEffect(() => {
    const syncPlayback = () => {
      const video = videoRef.current;
      if (!video) return;
      syncSceneVideoPlayback(video, shouldPlaySceneVideo({
        enabled: canRenderVideo,
        inViewport,
        pageHidden: document.hidden,
      }));
    };

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [canRenderVideo, inViewport, videoReady]);

  return <>
    <style>{styles}</style>
    <motion.span
        ref={rootRef}
        aria-hidden="true"
        className="chronos-scene-tab"
        data-active={focused}
        data-testid="floating-scene-navigation"
        initial={reducedMotion ? false : { opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          alt=""
          aria-hidden="true"
          className="chronos-scene-media chronos-scene-poster"
          data-testid="scene-poster"
          src={POSTER_SRC}
          width={960}
          height={720}
          decoding="async"
          draggable={false}
        />
        <AnimatePresence initial={false}>
          {canRenderVideo ? <motion.video
            key="scene-video"
            ref={videoRef}
            aria-hidden="true"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={POSTER_SRC}
            className="chronos-scene-media chronos-scene-video"
            data-testid="scene-video"
            src={VIDEO_SRC}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoReady ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.24, ease: 'easeOut' }}
            onLoadedData={() => setVideoReady(true)}
            onError={() => {
              setVideoReady(false);
              setVideoError(true);
            }}
          /> : null}
        </AnimatePresence>
        <span className="chronos-scene-status" aria-hidden="true" />
    </motion.span>
  </>;
}
