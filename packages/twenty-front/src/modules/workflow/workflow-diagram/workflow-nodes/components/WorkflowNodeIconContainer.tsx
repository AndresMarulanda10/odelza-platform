import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledNodeIconContainer = styled.div`
  align-items: center;
  background: ${odelzaThemeCssVariables.background.transparent.light};
  border-radius: ${odelzaThemeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

export { StyledNodeIconContainer as WorkflowNodeIconContainer };
