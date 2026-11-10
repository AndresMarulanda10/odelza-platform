import { styled } from '@linaria/react';
import { useState } from 'react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type SettingsApplicationScreenshotGalleryProps = {
  screenshots: string[];
  displayName: string;
};

const StyledGalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  margin-bottom: ${odelzaThemeCssVariables.spacing[6]};
  min-width: 0;
  width: 100%;
`;

const StyledScreenshotsContainer = styled.div`
  align-items: center;
  aspect-ratio: 8 / 5;
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  display: flex;
  justify-content: center;
  overflow: hidden;
`;

const StyledScreenshotImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const StyledScreenshotThumbnails = styled.div`
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  min-width: 0;
  overflow-x: auto;
`;

const StyledThumbnail = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  aspect-ratio: 8 / 5;
  background-color: ${odelzaThemeCssVariables.background.secondary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? odelzaThemeCssVariables.color.primary
        : odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex: 0 0 96px;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: ${odelzaThemeCssVariables.color.primary};
  }
`;

const StyledThumbnailImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

export const SettingsApplicationScreenshotGallery = ({
  screenshots,
  displayName,
}: SettingsApplicationScreenshotGalleryProps) => {
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);

  if (screenshots.length === 0) {
    return null;
  }

  const safeIndex = Math.min(selectedScreenshotIndex, screenshots.length - 1);

  return (
    <StyledGalleryContainer>
      <StyledScreenshotsContainer>
        <StyledScreenshotImage
          src={screenshots[safeIndex]}
          alt={`${displayName} screenshot ${safeIndex + 1}`}
        />
      </StyledScreenshotsContainer>
      <StyledScreenshotThumbnails>
        {screenshots.slice(0, 6).map((screenshot, index) => (
          <StyledThumbnail
            key={index}
            isSelected={index === selectedScreenshotIndex}
            onClick={() => setSelectedScreenshotIndex(index)}
          >
            <StyledThumbnailImage
              src={screenshot}
              alt={`${displayName} thumbnail ${index + 1}`}
            />
          </StyledThumbnail>
        ))}
      </StyledScreenshotThumbnails>
    </StyledGalleryContainer>
  );
};
