import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledCardBodyContainer = styled.div<{ padding?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${odelzaThemeCssVariables.spacing['0.5']};
  padding: ${({ padding }) =>
    padding ??
    `0 ${odelzaThemeCssVariables.spacing[2]} ${odelzaThemeCssVariables.spacing[2]} 10px`};
  span {
    align-items: center;
    display: flex;
    flex-direction: row;
    svg {
      color: ${odelzaThemeCssVariables.font.color.tertiary};
      margin-right: ${odelzaThemeCssVariables.spacing[2]};
    }
  }
`;

export { StyledCardBodyContainer as RecordCardBodyContainer };
