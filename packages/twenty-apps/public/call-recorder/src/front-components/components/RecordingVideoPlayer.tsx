import styled from '@emotion/styled';
import { useState, type SyntheticEvent } from 'react';
import { CircularProgressBar } from 'twenty-ui/feedback';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const DEFAULT_VIDEO_ASPECT_RATIO = '16 / 9';

// Forces the browser to decode the first frame under preload="metadata"
// (Safari otherwise paints nothing until play). Fragments stay client-side,
// so the signed file URL is unaffected.
const FIRST_FRAME_SEEK_FRAGMENT = '#t=0.001';

type RecordingVideoLoadState = 'awaiting-first-frame' | 'ready' | 'errored';

const StyledVideoViewport = styled.div`
  aspect-ratio: ${DEFAULT_VIDEO_ASPECT_RATIO};
  background: ${() => odelzaThemeCssVariables.background.primary};
  border-radius: ${() => odelzaThemeCssVariables.border.radius.sm};
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledVideo = styled.video<{ $isFirstFrameReady: boolean }>`
  accent-color: ${() => odelzaThemeCssVariables.accent.accent9};
  background: ${() => odelzaThemeCssVariables.background.primary};
  color-scheme: light dark;
  display: block;
  height: 100%;
  object-fit: contain;
  opacity: ${({ $isFirstFrameReady }) => ($isFirstFrameReady ? 1 : 0)};
  transition: opacity 200ms ease;
  width: 100%;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledBufferingOverlay = styled.div<{ $isVisible: boolean }>`
  align-items: center;
  color: ${() => odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  transition: opacity 150ms ease
    ${({ $isVisible }) => ($isVisible ? '300ms' : '0ms')};

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0ms;
  }
`;

const StyledPlaybackErrorState = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => odelzaThemeCssVariables.spacing[2]};
  height: 100%;
  justify-content: center;
  padding: ${() => odelzaThemeCssVariables.spacing[4]};
`;

const StyledPlaybackErrorTitle = styled.span`
  color: ${() => odelzaThemeCssVariables.font.color.primary};
  font-size: ${() => odelzaThemeCssVariables.font.size.sm};
  font-weight: ${() => odelzaThemeCssVariables.font.weight.medium};
`;

const StyledPlaybackErrorDescription = styled.span`
  color: ${() => odelzaThemeCssVariables.font.color.secondary};
  font-size: ${() => odelzaThemeCssVariables.font.size.xs};
`;

const StyledRetryButton = styled.button`
  background: ${() => odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${() => odelzaThemeCssVariables.border.color.medium};
  border-radius: ${() => odelzaThemeCssVariables.border.radius.sm};
  color: ${() => odelzaThemeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: ${() => odelzaThemeCssVariables.font.family};
  font-size: ${() => odelzaThemeCssVariables.font.size.sm};
  font-weight: ${() => odelzaThemeCssVariables.font.weight.medium};
  margin-top: ${() => odelzaThemeCssVariables.spacing[1]};
  padding: ${() => odelzaThemeCssVariables.spacing[1]}
    ${() => odelzaThemeCssVariables.spacing[3]};

  &:hover {
    background: ${() => odelzaThemeCssVariables.background.tertiary};
  }
`;

type RecordingVideoPlayerProps = {
  src: string;
  onTimeUpdate: (currentTimeSeconds: number) => void;
  onRetry: () => void;
};

export const RecordingVideoPlayer = ({
  src,
  onTimeUpdate,
  onRetry,
}: RecordingVideoPlayerProps) => {
  const [loadState, setLoadState] = useState<RecordingVideoLoadState>(
    'awaiting-first-frame',
  );
  const [isPlaybackStalled, setIsPlaybackStalled] = useState(false);

  const markFirstFrameReady = () => {
    setLoadState((previousLoadState) =>
      previousLoadState === 'awaiting-first-frame'
        ? 'ready'
        : previousLoadState,
    );
    setIsPlaybackStalled(false);
  };

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    markFirstFrameReady();
    onTimeUpdate(event.currentTarget.currentTime);
  };

  const handleWaiting = () => setIsPlaybackStalled(true);

  const handlePause = () => setIsPlaybackStalled(false);

  const handleError = () => setLoadState('errored');

  if (loadState === 'errored') {
    return (
      <StyledVideoViewport>
        <StyledPlaybackErrorState>
          <StyledPlaybackErrorTitle>Playback failed</StyledPlaybackErrorTitle>
          <StyledPlaybackErrorDescription>
            The recording could not be loaded.
          </StyledPlaybackErrorDescription>
          <StyledRetryButton onClick={onRetry}>Retry</StyledRetryButton>
        </StyledPlaybackErrorState>
      </StyledVideoViewport>
    );
  }

  return (
    <StyledVideoViewport>
      <StyledVideo
        $isFirstFrameReady={loadState === 'ready'}
        controls
        playsInline
        preload="metadata"
        src={`${src}${FIRST_FRAME_SEEK_FRAGMENT}`}
        onCanPlay={markFirstFrameReady}
        onError={handleError}
        onLoadedData={markFirstFrameReady}
        onPause={handlePause}
        onSeeked={markFirstFrameReady}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={handleWaiting}
      />
      <StyledBufferingOverlay
        $isVisible={loadState === 'awaiting-first-frame' || isPlaybackStalled}
      >
        <CircularProgressBar barWidth={3} size={24} />
      </StyledBufferingOverlay>
    </StyledVideoViewport>
  );
};
