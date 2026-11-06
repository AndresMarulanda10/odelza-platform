import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Pill } from 'twenty-ui/data-display';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledPillContainer = styled.span`
  position: absolute;
  right: -14px;
  top: -10px;

  > span {
    background: ${odelzaThemeCssVariables.accent.accent3};
    border: 1px solid ${odelzaThemeCssVariables.accent.accent5};
    border-radius: ${odelzaThemeCssVariables.border.radius.pill};
    color: ${odelzaThemeCssVariables.accent.accent9};
    corner-shape: round;
    font-weight: ${odelzaThemeCssVariables.font.weight.semiBold};
    height: ${odelzaThemeCssVariables.spacing[5]};
  }
`;

export const LastUsedPill = () => {
  const { t } = useLingui();

  return (
    <StyledPillContainer>
      <Pill
        label={t({
          message: 'Last',
          comment:
            'Short label (keep brief) indicating the most recently used login method',
        })}
      />
    </StyledPillContainer>
  );
};
