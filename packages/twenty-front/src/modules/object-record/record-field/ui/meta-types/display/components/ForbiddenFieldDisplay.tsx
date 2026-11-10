import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconLock } from 'twenty-ui/icon';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.transparent.light};

  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.regular};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[5]};
  line-height: ${odelzaThemeCssVariables.text.lineHeight.md};
  overflow: hidden;
  padding: 0 ${odelzaThemeCssVariables.spacing[1]};
  user-select: none;
  white-space: nowrap;
`;

export const ForbiddenFieldDisplay = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <IconLock size={theme.icon.size.sm} />
      <Trans>Not shared</Trans>
    </StyledContainer>
  );
};
