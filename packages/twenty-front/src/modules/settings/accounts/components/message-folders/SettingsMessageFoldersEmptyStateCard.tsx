import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconFolder } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { useContext } from 'react';
import {
  ThemeContext,
  odelzaThemeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding: ${odelzaThemeCssVariables.spacing[8]};
  text-align: center;
`;

export const SettingsMessageFoldersEmptyStateCard = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Section>
      <StyledEmptyState>
        <IconFolder size={theme.icon.size.md} />
        <div>{t`No folders found for this account`}</div>
      </StyledEmptyState>
    </Section>
  );
};
