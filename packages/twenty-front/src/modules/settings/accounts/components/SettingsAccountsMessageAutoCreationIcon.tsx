import { styled } from '@linaria/react';

import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsMessageAutoCreationIconProps = {
  className?: string;
  isSentActive?: boolean;
  isReceivedActive?: boolean;
};

const StyledIconContainer = styled.div`
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

const StyledDirectionSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? odelzaThemeCssVariables.accent.accent4060
      : odelzaThemeCssVariables.background.quaternary};
  border-radius: 1px;
  height: 24px;
`;

export const SettingsAccountsMessageAutoCreationIcon = ({
  className,
  isSentActive,
  isReceivedActive,
}: SettingsAccountsMessageAutoCreationIconProps) => (
  <StyledIconContainer className={className}>
    <StyledDirectionSkeleton isActive={isSentActive} />
    <StyledDirectionSkeleton isActive={isReceivedActive} />
  </StyledIconContainer>
);
