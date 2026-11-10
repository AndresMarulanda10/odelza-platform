import { styled } from '@linaria/react';

import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type VisibilityElementState = 'active' | 'inactive';

type SettingsAccountsVisibilityIconProps = {
  className?: string;
  metadata?: VisibilityElementState;
  subject?: VisibilityElementState;
  body?: VisibilityElementState;
};

const StyledCardMedia = styled.div`
  align-items: stretch;
  border: 2px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing['0.5']};
  height: ${odelzaThemeCssVariables.spacing[8]};
  justify-content: center;
  padding: ${odelzaThemeCssVariables.spacing['0.5']};
  width: ${odelzaThemeCssVariables.spacing[6]};
`;

const StyledSubjectSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.accent.accent4060
      : odelzaThemeCssVariables.background.quaternary};
  border-radius: 1px;
  height: 3px;
`;

const StyledMetadataSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.accent.accent4060
      : odelzaThemeCssVariables.background.quaternary};
  border-radius: 1px;
  height: 3px;
  margin-right: ${odelzaThemeCssVariables.spacing[2]};
`;

const StyledBodySkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.accent.accent4060
      : odelzaThemeCssVariables.background.quaternary};
  border-radius: ${odelzaThemeCssVariables.border.radius.xs};
  flex: 1 0 auto;
  height: 3px;
`;

export const SettingsAccountsVisibilityIcon = ({
  className,
  metadata,
  subject,
  body,
}: SettingsAccountsVisibilityIconProps) => (
  <StyledCardMedia className={className}>
    {!!metadata && <StyledMetadataSkeleton isActive={metadata === 'active'} />}
    {!!subject && <StyledSubjectSkeleton isActive={subject === 'active'} />}
    {!!body && <StyledBodySkeleton isActive={body === 'active'} />}
  </StyledCardMedia>
);
