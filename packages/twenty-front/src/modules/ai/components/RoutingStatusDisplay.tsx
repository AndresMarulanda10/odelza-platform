import { RoutingDebugDisplay } from '@/ai/components/RoutingDebugDisplay';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { type DataMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronUp, IconCpu } from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledToggleButton = styled.div<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'auto')};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding: ${odelzaThemeCssVariables.spacing[1]} 0;
  transition: color
    calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s);

  &:hover {
    color: ${({ isExpandable }) =>
      isExpandable
        ? odelzaThemeCssVariables.font.color.secondary
        : odelzaThemeCssVariables.font.color.tertiary};
  }
`;

const StyledDisplayMessage = styled.span`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledIconTextContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};

  svg {
    min-width: calc(${odelzaThemeCssVariables.icon.size.sm} * 1px);
  }
`;

const StyledContentContainer = styled.div`
  background: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  min-width: 0;
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;

export const RoutingStatusDisplay = ({
  data,
}: {
  data: DataMessagePart['routing-status'];
}) => {
  const { theme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const isLoading = data.state === 'loading';
  const isDebugMode = process.env.IS_DEBUG_MODE === 'true';
  const isExpandable =
    isDebugMode && data.state === 'routed' && isDefined(data.debug);

  if (data.state === 'error') {
    return null;
  }

  if (isLoading) {
    return (
      <StyledContainer>
        <StyledIconTextContainer>
          <IconCpu size={theme.icon.size.sm} />
          <ShimmeringText>
            <StyledDisplayMessage>{data.text}</StyledDisplayMessage>
          </ShimmeringText>
        </StyledIconTextContainer>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledToggleButton
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
        isExpandable={!!isExpandable}
      >
        <StyledIconTextContainer>
          <IconCpu size={theme.icon.size.sm} />
          <StyledDisplayMessage>{data.text}</StyledDisplayMessage>
        </StyledIconTextContainer>
        {isExpandable &&
          (isExpanded ? (
            <IconChevronUp size={theme.icon.size.sm} />
          ) : (
            <IconChevronDown size={theme.icon.size.sm} />
          ))}
      </StyledToggleButton>

      {isExpandable && (
        <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
          <StyledContentContainer>
            <RoutingDebugDisplay debug={data.debug!} />
          </StyledContentContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledContainer>
  );
};
