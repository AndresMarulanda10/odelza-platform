import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/icon';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledEmailBodyNotSharedContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.spacing[1]};
  color: ${odelzaThemeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;

  font-size: ${odelzaThemeCssVariables.font.size.sm};
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};

  gap: ${odelzaThemeCssVariables.spacing[3]};
  height: 80px;
  justify-content: center;
  width: 100%;
`;

const StyledEmailBodyNotSharedIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: calc(${odelzaThemeCssVariables.icon.size.sm} * 1px);
  justify-content: center;
  width: calc(${odelzaThemeCssVariables.icon.size.sm} * 1px);
`;

const StyledEmailBodyNotShared = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
`;

export const EventCardMessageBodyNotShared = ({
  notSharedByFullName,
}: {
  notSharedByFullName: string;
}) => {
  return (
    <StyledEmailBodyNotSharedContainer>
      <StyledEmailBodyNotShared>
        <StyledEmailBodyNotSharedIconContainer>
          <IconLock />
        </StyledEmailBodyNotSharedIconContainer>
        <span>
          <Trans>Not shared by {notSharedByFullName}</Trans>
        </span>
      </StyledEmailBodyNotShared>
    </StyledEmailBodyNotSharedContainer>
  );
};
