import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledControlContainer = styled.div<{ cursor: string }>`
  align-items: center;
  background-color: ${odelzaThemeCssVariables.background.transparent.lighter};
  border: 1px solid ${odelzaThemeCssVariables.border.color.medium};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${odelzaThemeCssVariables.font.color.primary};
  cursor: ${({ cursor }) => cursor};
  display: flex;
  gap: ${odelzaThemeCssVariables.spacing[1]};
  height: ${odelzaThemeCssVariables.spacing[8]};
  justify-content: space-between;
  padding: 0 ${odelzaThemeCssVariables.spacing[2]};
  width: 100%;
`;

export const SubMatchingSelectControlContainer = StyledControlContainer;
