import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';

const StyledPlaceholderContainer = styled.div`
  background: ${odelzaThemeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${odelzaThemeCssVariables.spacing[2]};
  position: relative;
  width: 100%;
`;

export const StandaloneWidgetPlaceholder = () => {
  return (
    <StyledPlaceholderContainer className="widget">
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="noWidgets" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            <Trans>Nothing to see</Trans>
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            <Trans>This page has no content</Trans>
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </StyledPlaceholderContainer>
  );
};
