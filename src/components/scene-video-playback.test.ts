import { describe, expect, it, vi } from 'vitest';
import { shouldPlaySceneVideo, syncSceneVideoPlayback } from './scene-video-playback';

describe('scene video playback policy', () => {
  it('pauses when the page is hidden', () => {
    const pause = vi.fn();
    const play = vi.fn(() => Promise.resolve());
    const shouldPlay = shouldPlaySceneVideo({ enabled: true, inViewport: true, pageHidden: true });

    syncSceneVideoPlayback({ pause, play }, shouldPlay);

    expect(shouldPlay).toBe(false);
    expect(pause).toHaveBeenCalledOnce();
    expect(play).not.toHaveBeenCalled();
  });

  it('plays only when enabled, visible, and near the viewport', () => {
    const pause = vi.fn();
    const play = vi.fn(() => Promise.resolve());
    const shouldPlay = shouldPlaySceneVideo({ enabled: true, inViewport: true, pageHidden: false });

    syncSceneVideoPlayback({ pause, play }, shouldPlay);

    expect(shouldPlay).toBe(true);
    expect(play).toHaveBeenCalledOnce();
    expect(pause).not.toHaveBeenCalled();
  });
});
