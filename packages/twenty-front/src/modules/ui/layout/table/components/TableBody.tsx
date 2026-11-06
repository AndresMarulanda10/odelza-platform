import { styled } from '@linaria/react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

const StyledTableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${odelzaThemeCssVariables.spacing[2]} 0;
`;

export { StyledTableBody as TableBody };
