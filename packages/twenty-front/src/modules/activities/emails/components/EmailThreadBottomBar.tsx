import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconArrowBackUp, IconUserCircle } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledThreadBottomBar = styled.div`
  align-items: center;
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[2]};
  padding-left: ${odelzaThemeCssVariables.spacing[6]};
  padding-right: ${odelzaThemeCssVariables.spacing[6]};
  padding-top: ${odelzaThemeCssVariables.spacing[4]};
`;

export const ThreadBottomBar = () => {
  return (
    <StyledThreadBottomBar>
      <Button
        Icon={IconArrowBackUp}
        title={t`Reply`}
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconArrowBackUp}
        title={t`Reply to all`}
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconUserCircle}
        title={t`Share`}
        variant="secondary"
        accent="default"
      />
    </StyledThreadBottomBar>
  );
};
