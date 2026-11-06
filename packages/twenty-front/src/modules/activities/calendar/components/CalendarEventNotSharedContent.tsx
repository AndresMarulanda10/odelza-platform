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
  background: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[6]};
  padding: ${odelzaThemeCssVariables.spacing[0]}
    ${odelzaThemeCssVariables.spacing[1]};
  width: 100%;
`;

export const CalendarEventNotSharedContent = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <IconLock size={theme.icon.size.sm} />
      <Trans>Not shared</Trans>
    </StyledContainer>
  );
};
