import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkipButton = styled.button`
  background-color: transparent;
  border: 1px solid ${odelzaThemeCssVariables.border.color.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.md};
  color: ${odelzaThemeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: ${odelzaThemeCssVariables.font.family};
  font-size: ${odelzaThemeCssVariables.font.size.md};
  font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
  height: ${odelzaThemeCssVariables.spacing[8]};
  padding: 0 ${odelzaThemeCssVariables.spacing[5]};
`;

type OnboardingSkipButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const OnboardingSkipButton = ({
  onClick,
  disabled,
}: OnboardingSkipButtonProps) => {
  const { t } = useLingui();

  return (
    <StyledSkipButton type="button" onClick={onClick} disabled={disabled}>
      {t`Skip`}
    </StyledSkipButton>
  );
};
