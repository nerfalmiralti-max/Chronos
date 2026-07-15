type PlayableVideo = Pick<HTMLVideoElement, 'pause' | 'play'>;

export function shouldPlaySceneVideo({
  enabled,
  inViewport,
  pageHidden,
}: {
  enabled: boolean;
  inViewport: boolean;
  pageHidden: boolean;
}) {
  return enabled && inViewport && !pageHidden;
}

export function syncSceneVideoPlayback(video: PlayableVideo, shouldPlay: boolean) {
  if (!shouldPlay) {
    video.pause();
    return;
  }
  void video.play().catch(() => undefined);
}
