import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

export const StyledBoardCardHeaderContainer = styled.div<{
  isCompact: boolean;
  padding?: string;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${odelzaThemeCssVariables.font.weight.medium};
  height: 32px;
  justify-content: space-between;
  padding: ${({ padding, isCompact }) =>
    padding ??
    `${odelzaThemeCssVariables.spacing[2]} ${odelzaThemeCssVariables.spacing[2]} ${isCompact ? odelzaThemeCssVariables.spacing[2] : odelzaThemeCssVariables.spacing[1]} ${odelzaThemeCssVariables.spacing[2]}`};
  transition: padding ease-in-out 160ms;

  img {
    height: ${odelzaThemeCssVariables.icon.size.md}px;
    object-fit: cover;
    width: ${odelzaThemeCssVariables.icon.size.md}px;
  }
`;

export { StyledBoardCardHeaderContainer as RecordCardHeaderContainer };
