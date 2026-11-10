import { styled } from '@linaria/react';
import { useContext, useState } from 'react';

import { IconBrain, IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { t } from '@lingui/core/macro';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  margin-bottom: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledThinkingText = styled.div`
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
`;

const StyledReasoningContainer = styled.div`
  background: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  padding: ${odelzaThemeCssVariables.spacing[3]};
`;

const StyledReasoningText = styled.div`
  color: ${odelzaThemeCssVariables.font.color.secondary};
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  line-height: ${odelzaThemeCssVariables.text.lineHeight.lg};
  white-space: pre-wrap;
`;

const StyledToggleButton = styled.div`
  align-items: center;
  background: none;
  border: none;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  padding: ${odelzaThemeCssVariables.spacing[1]} 0;
  transition: color
    calc(${odelzaThemeCssVariables.animation.duration.normal} * 1s);

  &:hover {
    color: ${odelzaThemeCssVariables.font.color.secondary};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

export const ReasoningSummaryDisplay = ({
  content,
  isThinking = false,
}: {
  content: string;
  isThinking?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = content.trim().length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <StyledContainer>
      {isThinking && (
        <>
          <ShimmeringText>
            <StyledIconContainer>
              <IconBrain size={theme.icon.size.sm} />
              <StyledThinkingText>{t`Thinking...`}</StyledThinkingText>
            </StyledIconContainer>
          </ShimmeringText>
          <StyledReasoningContainer>
            <StyledReasoningText>{content}</StyledReasoningText>
          </StyledReasoningContainer>
        </>
      )}

      {hasContent && !isThinking && (
        <>
          <StyledToggleButton onClick={() => setIsExpanded(!isExpanded)}>
            <StyledIconContainer>
              <IconBrain size={theme.icon.size.sm} />
              <span>{t`Finished thinking`}</span>
            </StyledIconContainer>
            {isExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            )}
          </StyledToggleButton>

          <AnimatedExpandableContainer isExpanded={isExpanded}>
            <StyledReasoningContainer>
              <StyledReasoningText>{content}</StyledReasoningText>
            </StyledReasoningContainer>
          </AnimatedExpandableContainer>
        </>
      )}
    </StyledContainer>
  );
};
